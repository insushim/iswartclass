import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/achievements - 사용자 업적 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const completed = searchParams.get('completed');

    // 모든 업적 조회
    const achievements = await prisma.achievement.findMany({
      where: {
        isActive: true,
        ...(category && category !== 'all' ? { category } : {}),
      },
      orderBy: [{ category: 'asc' }, { level: 'asc' }],
    });

    // 사용자의 업적 진행 상황 조회
    const userAchievements = await prisma.userAchievement.findMany({
      where: {
        userId: session.user.id,
      },
    });

    // 업적과 진행 상황 매핑
    const achievementsWithProgress = achievements.map(achievement => {
      const userProgress = userAchievements.find(ua => ua.achievementId === achievement.id);
      return {
        ...achievement,
        progress: userProgress?.progress || 0,
        isCompleted: userProgress?.isCompleted || false,
        completedAt: userProgress?.completedAt,
      };
    });

    // 필터링
    let filteredAchievements = achievementsWithProgress;
    if (completed === 'true') {
      filteredAchievements = achievementsWithProgress.filter(a => a.isCompleted);
    } else if (completed === 'false') {
      filteredAchievements = achievementsWithProgress.filter(a => !a.isCompleted);
    }

    // 통계 계산
    const stats = {
      total: achievements.length,
      completed: achievementsWithProgress.filter(a => a.isCompleted).length,
      totalPoints: achievementsWithProgress
        .filter(a => a.isCompleted)
        .reduce((sum, a) => sum + a.points, 0),
      byCategory: {} as Record<string, { total: number; completed: number }>,
    };

    // 카테고리별 통계
    achievements.forEach(achievement => {
      if (!stats.byCategory[achievement.category]) {
        stats.byCategory[achievement.category] = { total: 0, completed: 0 };
      }
      stats.byCategory[achievement.category].total++;
      if (achievementsWithProgress.find(a => a.id === achievement.id)?.isCompleted) {
        stats.byCategory[achievement.category].completed++;
      }
    });

    return NextResponse.json({
      achievements: filteredAchievements,
      stats,
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}

// POST /api/achievements - 업적 진행 상황 업데이트
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { achievementId, progress } = body;

    if (!achievementId) {
      return NextResponse.json(
        { error: 'Achievement ID is required' },
        { status: 400 }
      );
    }

    // 업적 정보 조회
    const achievement = await prisma.achievement.findUnique({
      where: { id: achievementId },
    });

    if (!achievement) {
      return NextResponse.json({ error: 'Achievement not found' }, { status: 404 });
    }

    // 조건 확인 (condition JSON 파싱)
    const condition = achievement.condition as { target: number };
    const targetProgress = condition?.target || 1;
    const newProgress = Math.min(progress, targetProgress);
    const isCompleted = newProgress >= targetProgress;

    // 업적 진행 상황 업데이트
    const userAchievement = await prisma.userAchievement.upsert({
      where: {
        userId_achievementId: {
          userId: session.user.id,
          achievementId,
        },
      },
      update: {
        progress: newProgress,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
      create: {
        userId: session.user.id,
        achievementId,
        progress: newProgress,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
    });

    // 완료된 경우 알림 생성
    if (isCompleted) {
      await prisma.notification.create({
        data: {
          userId: session.user.id,
          type: 'ACHIEVEMENT',
          title: '업적 달성!',
          message: `${achievement.nameKo} 업적을 달성했습니다!`,
          actionUrl: '/achievements',
          metadata: { achievementId, points: achievement.points },
        },
      });
    }

    return NextResponse.json({
      ...userAchievement,
      achievement,
    });
  } catch (error) {
    console.error('Error updating achievement:', error);
    return NextResponse.json(
      { error: 'Failed to update achievement' },
      { status: 500 }
    );
  }
}
