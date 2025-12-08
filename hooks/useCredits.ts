'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface CreditsState {
  credits: number;
  plan: string;
  monthlyLimit: number;
  percentUsed: number;
  isLoading: boolean;
  error: Error | null;
}

export function useCredits() {
  const { data: session, status } = useSession();
  const [creditsState, setCreditsState] = useState<CreditsState>({
    credits: 0,
    plan: 'FREE',
    monthlyLimit: 30,
    percentUsed: 0,
    isLoading: true,
    error: null,
  });

  const fetchCredits = useCallback(async () => {
    if (status !== 'authenticated' || !session?.user) return;

    setCreditsState((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch('/api/user/credits');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch credits');
      }

      setCreditsState({
        credits: data.credits,
        plan: data.plan,
        monthlyLimit: data.monthlyLimit,
        percentUsed: data.percentUsed,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setCreditsState((prev) => ({
        ...prev,
        isLoading: false,
        error: error as Error,
      }));
    }
  }, [session, status]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  const checkCredits = (required: number = 1) => {
    return creditsState.credits >= required;
  };

  const useCredit = async (amount: number = 1) => {
    if (!checkCredits(amount)) {
      return { success: false, error: 'Insufficient credits' };
    }

    // Optimistically update
    setCreditsState((prev) => ({
      ...prev,
      credits: prev.credits - amount,
      percentUsed: Math.round(
        ((prev.monthlyLimit - (prev.credits - amount)) / prev.monthlyLimit) * 100
      ),
    }));

    return { success: true };
  };

  return {
    ...creditsState,
    fetchCredits,
    checkCredits,
    useCredit,
  };
}
