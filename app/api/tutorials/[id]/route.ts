import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/tutorials/[id] - 튜토리얼 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const tutorial = await prisma.tutorial.findUnique({
      where: { id },
      include: {
        steps: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!tutorial) {
      return NextResponse.json({ error: 'Tutorial not found' }, { status: 404 });
    }

    // 조회수 증가
    await prisma.tutorial.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json(tutorial);
  } catch (error) {
    console.error('Error fetching tutorial:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tutorial' },
      { status: 500 }
    );
  }
}

// PUT /api/tutorials/[id] - 튜토리얼 수정 (관리자 전용)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();

    const tutorial = await prisma.tutorial.update({
      where: { id },
      data: {
        technique: body.technique,
        title: body.title,
        titleKo: body.titleKo,
        description: body.description,
        descriptionKo: body.descriptionKo,
        difficulty: body.difficulty,
        ageGroups: body.ageGroups,
        thumbnailUrl: body.thumbnailUrl,
        videoUrl: body.videoUrl,
        videoDuration: body.videoDuration,
        materials: body.materials,
        tips: body.tips,
        isPremium: body.isPremium,
        isPublished: body.isPublished,
      },
    });

    return NextResponse.json(tutorial);
  } catch (error) {
    console.error('Error updating tutorial:', error);
    return NextResponse.json(
      { error: 'Failed to update tutorial' },
      { status: 500 }
    );
  }
}

// DELETE /api/tutorials/[id] - 튜토리얼 삭제 (관리자 전용)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    await prisma.tutorial.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tutorial:', error);
    return NextResponse.json(
      { error: 'Failed to delete tutorial' },
      { status: 500 }
    );
  }
}

// PATCH /api/tutorials/[id] - 튜토리얼 완료 기록
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    const body = await request.json();

    // 완료 처리
    if (body.completed) {
      await prisma.tutorial.update({
        where: { id },
        data: { completions: { increment: 1 } },
      });
    }

    // 평점 업데이트
    if (body.rating) {
      const tutorial = await prisma.tutorial.findUnique({
        where: { id },
        select: { rating: true, completions: true },
      });

      if (tutorial) {
        const currentRating = tutorial.rating || 0;
        const completions = tutorial.completions || 1;
        const newRating = ((currentRating * (completions - 1)) + body.rating) / completions;

        await prisma.tutorial.update({
          where: { id },
          data: { rating: newRating },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error patching tutorial:', error);
    return NextResponse.json(
      { error: 'Failed to update tutorial' },
      { status: 500 }
    );
  }
}
