import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/curriculum/[id] - 커리큘럼 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const curriculum = await prisma.curriculum.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        items: {
          include: {
            sheet: {
              select: {
                id: true,
                title: true,
                thumbnailUrl: true,
                imageUrl: true,
              },
            },
          },
          orderBy: [{ week: 'asc' }, { day: 'asc' }, { order: 'asc' }],
        },
      },
    });

    if (!curriculum) {
      return NextResponse.json({ error: 'Curriculum not found' }, { status: 404 });
    }

    // 진행률 계산
    const totalItems = curriculum.items.length;
    const completedItems = curriculum.items.filter(item => item.isCompleted).length;
    const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    return NextResponse.json({
      ...curriculum,
      progress,
      completedItems,
      totalItems,
    });
  } catch (error) {
    console.error('Error fetching curriculum:', error);
    return NextResponse.json(
      { error: 'Failed to fetch curriculum' },
      { status: 500 }
    );
  }
}

// PUT /api/curriculum/[id] - 커리큘럼 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // 본인 커리큘럼인지 확인
    const existingCurriculum = await prisma.curriculum.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existingCurriculum) {
      return NextResponse.json({ error: 'Curriculum not found' }, { status: 404 });
    }

    // 커리큘럼 기본 정보 업데이트
    const curriculum = await prisma.curriculum.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        ageGroup: body.ageGroup,
        weeks: body.weeks,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        status: body.status,
        goals: body.goals,
        materials: body.materials,
      },
    });

    // 아이템 업데이트 (있는 경우)
    if (body.items) {
      // 기존 아이템 삭제
      await prisma.curriculumItem.deleteMany({
        where: { curriculumId: id },
      });

      // 새 아이템 생성
      await prisma.curriculumItem.createMany({
        data: body.items.map((item: any, index: number) => ({
          curriculumId: id,
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
          isCompleted: item.isCompleted || false,
          sheetId: item.sheetId,
        })),
      });
    }

    // 업데이트된 커리큘럼 반환
    const updatedCurriculum = await prisma.curriculum.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: [{ week: 'asc' }, { day: 'asc' }, { order: 'asc' }],
        },
      },
    });

    return NextResponse.json(updatedCurriculum);
  } catch (error) {
    console.error('Error updating curriculum:', error);
    return NextResponse.json(
      { error: 'Failed to update curriculum' },
      { status: 500 }
    );
  }
}

// DELETE /api/curriculum/[id] - 커리큘럼 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // 본인 커리큘럼인지 확인
    const existingCurriculum = await prisma.curriculum.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existingCurriculum) {
      return NextResponse.json({ error: 'Curriculum not found' }, { status: 404 });
    }

    await prisma.curriculum.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting curriculum:', error);
    return NextResponse.json(
      { error: 'Failed to delete curriculum' },
      { status: 500 }
    );
  }
}

// PATCH /api/curriculum/[id] - 상태 변경 또는 아이템 완료 처리
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // 본인 커리큘럼인지 확인
    const existingCurriculum = await prisma.curriculum.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existingCurriculum) {
      return NextResponse.json({ error: 'Curriculum not found' }, { status: 404 });
    }

    // 상태 변경
    if (body.status) {
      const curriculum = await prisma.curriculum.update({
        where: { id },
        data: { status: body.status },
      });
      return NextResponse.json(curriculum);
    }

    // 아이템 완료 처리
    if (body.itemId) {
      const item = await prisma.curriculumItem.update({
        where: { id: body.itemId },
        data: {
          isCompleted: body.isCompleted,
          completedAt: body.isCompleted ? new Date() : null,
        },
      });
      return NextResponse.json(item);
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Error patching curriculum:', error);
    return NextResponse.json(
      { error: 'Failed to update curriculum' },
      { status: 500 }
    );
  }
}
