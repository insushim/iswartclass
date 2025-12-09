import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/curriculum - 커리큘럼 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const ageGroup = searchParams.get('ageGroup');

    const where: any = {
      userId: session.user.id,
    };

    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    if (ageGroup && ageGroup !== 'all') {
      where.ageGroup = ageGroup;
    }

    const curriculums = await prisma.curriculum.findMany({
      where,
      include: {
        items: {
          orderBy: [{ week: 'asc' }, { day: 'asc' }, { order: 'asc' }],
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 진행률 계산
    const curriculumsWithProgress = curriculums.map(curriculum => {
      const totalItems = curriculum.items.length;
      const completedItems = curriculum.items.filter(item => item.isCompleted).length;
      const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

      return {
        ...curriculum,
        progress,
        completedItems,
        totalItems,
      };
    });

    return NextResponse.json(curriculumsWithProgress);
  } catch (error) {
    console.error('Error fetching curriculums:', error);
    return NextResponse.json(
      { error: 'Failed to fetch curriculums' },
      { status: 500 }
    );
  }
}

// POST /api/curriculum - 새 커리큘럼 생성
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, ageGroup, weeks, startDate, endDate, goals, materials, items } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const curriculum = await prisma.curriculum.create({
      data: {
        userId: session.user.id,
        title,
        description,
        ageGroup: ageGroup || 'LOWER_ELEM',
        weeks: weeks || 4,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        goals: goals || [],
        materials: materials || [],
        status: 'DRAFT',
        items: items ? {
          create: items.map((item: any, index: number) => ({
            week: item.week || 1,
            day: item.day || 1,
            order: item.order || index,
            technique: item.technique || 'COLORING',
            theme: item.theme,
            subTheme: item.subTheme,
            difficulty: item.difficulty || 3,
            title: item.title,
            note: item.note,
            duration: item.duration,
            materials: item.materials || [],
            objectives: item.objectives || [],
          })),
        } : undefined,
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(curriculum, { status: 201 });
  } catch (error) {
    console.error('Error creating curriculum:', error);
    return NextResponse.json(
      { error: 'Failed to create curriculum' },
      { status: 500 }
    );
  }
}
