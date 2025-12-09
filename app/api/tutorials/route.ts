import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/tutorials - 튜토리얼 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const technique = searchParams.get('technique');
    const difficulty = searchParams.get('difficulty');
    const ageGroup = searchParams.get('ageGroup');

    const where: any = {
      isPublished: true,
    };

    if (technique && technique !== 'all') {
      where.technique = technique;
    }

    if (difficulty && difficulty !== 'all') {
      where.difficulty = parseInt(difficulty);
    }

    if (ageGroup && ageGroup !== 'all') {
      where.ageGroups = { has: ageGroup };
    }

    const tutorials = await prisma.tutorial.findMany({
      where,
      include: {
        steps: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            order: true,
            title: true,
          },
        },
        _count: {
          select: {
            steps: true,
          },
        },
      },
      orderBy: [{ views: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(tutorials);
  } catch (error) {
    console.error('Error fetching tutorials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tutorials' },
      { status: 500 }
    );
  }
}

// POST /api/tutorials - 새 튜토리얼 생성 (관리자 전용)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 관리자 권한 확인
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      technique,
      title,
      titleKo,
      description,
      descriptionKo,
      difficulty,
      ageGroups,
      thumbnailUrl,
      videoUrl,
      videoDuration,
      materials,
      tips,
      steps,
      isPremium,
    } = body;

    const tutorial = await prisma.tutorial.create({
      data: {
        technique,
        title,
        titleKo,
        description,
        descriptionKo,
        difficulty: difficulty || 3,
        ageGroups: ageGroups || ['ALL'],
        thumbnailUrl,
        videoUrl,
        videoDuration,
        materials: materials || [],
        tips: tips || [],
        isPremium: isPremium || false,
        isPublished: false,
        steps: steps ? {
          create: steps.map((step: any, index: number) => ({
            order: index + 1,
            title: step.title,
            description: step.description,
            imageUrl: step.imageUrl,
            videoUrl: step.videoUrl,
            videoStart: step.videoStart,
            videoEnd: step.videoEnd,
            voiceText: step.voiceText,
            duration: step.duration,
            isInteractive: step.isInteractive || false,
            interactionData: step.interactionData,
          })),
        } : undefined,
      },
      include: {
        steps: true,
      },
    });

    return NextResponse.json(tutorial, { status: 201 });
  } catch (error) {
    console.error('Error creating tutorial:', error);
    return NextResponse.json(
      { error: 'Failed to create tutorial' },
      { status: 500 }
    );
  }
}
