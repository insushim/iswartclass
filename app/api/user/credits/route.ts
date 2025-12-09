import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    // Get subscription info from database
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'ACTIVE',
      },
    });

    const plan = subscription?.plan || 'FREE';
    const credits = subscription?.credits || 0;
    const monthlyLimit = {
      FREE: 30,
      BASIC: 150,
      PREMIUM: 500,
      UNLIMITED: Infinity,
      ENTERPRISE: Infinity,
    }[plan] || 30;

    return NextResponse.json({
      credits,
      plan,
      monthlyLimit,
      percentUsed: Math.round(((monthlyLimit - credits) / monthlyLimit) * 100),
    });
  } catch (error) {
    console.error('Credits API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
