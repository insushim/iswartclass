import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL || '',
  token: process.env.UPSTASH_REDIS_TOKEN || '',
});

export async function getFromCache<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key);
    return data as T | null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

export async function saveToCache<T>(
  key: string,
  data: T,
  ttlSeconds: number = 86400
): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(data), { ex: ttlSeconds });
  } catch (error) {
    console.error('Cache save error:', error);
  }
}

export async function deleteFromCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    console.error('Cache delete error:', error);
  }
}

export async function incrementCounter(
  key: string,
  ttlSeconds?: number
): Promise<number> {
  try {
    const value = await redis.incr(key);
    if (ttlSeconds) {
      await redis.expire(key, ttlSeconds);
    }
    return value;
  } catch (error) {
    console.error('Cache increment error:', error);
    return 0;
  }
}

export async function decrementCounter(key: string): Promise<number> {
  try {
    const value = await redis.decr(key);
    return Math.max(0, value);
  } catch (error) {
    console.error('Cache decrement error:', error);
    return 0;
  }
}

export async function getCachedOrFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number = 86400
): Promise<T> {
  const cached = await getFromCache<T>(key);
  if (cached) return cached;

  const data = await fetchFn();
  await saveToCache(key, data, ttlSeconds);
  return data;
}

export async function findSimilarCached(params: {
  technique: string;
  theme: string;
  ageGroup: string;
}): Promise<unknown[]> {
  const pattern = `sheet:${params.technique}:${params.theme}:*:${params.ageGroup}:*`;

  try {
    const keys = await redis.keys(pattern);
    if (keys.length === 0) return [];

    const results = await Promise.all(
      keys.slice(0, 5).map(key => redis.get(key))
    );

    return results.filter(Boolean).flat();
  } catch (error) {
    console.error('Similar cache search error:', error);
    return [];
  }
}

// Usage tracking
export async function trackUsage(
  userId: string,
  action: string
): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const key = `usage:${userId}:${today}:${action}`;
  await incrementCounter(key, 86400 * 30); // 30 days retention
}

export async function getUsageStats(
  userId: string,
  action: string,
  days: number = 30
): Promise<Record<string, number>> {
  const stats: Record<string, number> = {};
  const now = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const key = `usage:${userId}:${dateStr}:${action}`;
    const count = await redis.get<number>(key);
    stats[dateStr] = count || 0;
  }

  return stats;
}

// Credit management
export async function getRemainingCredits(userId: string): Promise<number> {
  const key = `credits:${userId}`;
  const credits = await redis.get<number>(key);
  return credits ?? 30; // Default 30 credits
}

export async function useCredit(userId: string, amount: number = 1): Promise<boolean> {
  const key = `credits:${userId}`;
  const current = await getRemainingCredits(userId);

  if (current < amount) return false;

  await redis.set(key, current - amount);
  return true;
}

export async function addCredits(userId: string, amount: number): Promise<number> {
  const key = `credits:${userId}`;
  const current = await getRemainingCredits(userId);
  const newAmount = current + amount;
  await redis.set(key, newAmount);
  return newAmount;
}

export async function resetMonthlyCredits(
  userId: string,
  amount: number
): Promise<void> {
  const key = `credits:${userId}`;
  await redis.set(key, amount);
}

// Rate limiting
export async function checkRateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const key = `ratelimit:${identifier}`;

  try {
    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, windowSeconds);
    }

    const ttl = await redis.ttl(key);

    return {
      allowed: current <= limit,
      remaining: Math.max(0, limit - current),
      resetIn: ttl > 0 ? ttl : windowSeconds
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    return { allowed: true, remaining: limit, resetIn: windowSeconds };
  }
}

// Session/Lock management
export async function acquireLock(
  key: string,
  ttlSeconds: number = 30
): Promise<boolean> {
  const lockKey = `lock:${key}`;
  try {
    const result = await redis.set(lockKey, '1', { nx: true, ex: ttlSeconds });
    return result === 'OK';
  } catch (error) {
    console.error('Lock acquire error:', error);
    return false;
  }
}

export async function releaseLock(key: string): Promise<void> {
  const lockKey = `lock:${key}`;
  try {
    await redis.del(lockKey);
  } catch (error) {
    console.error('Lock release error:', error);
  }
}

// Pub/Sub for real-time features
export async function publishEvent(channel: string, data: unknown): Promise<void> {
  try {
    await redis.publish(channel, JSON.stringify(data));
  } catch (error) {
    console.error('Publish error:', error);
  }
}

export { redis };
