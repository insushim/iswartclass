import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/classes/[id] - 학급 상세 조회
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

    const classData = await prisma.class.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        students: {
          include: {
            _count: {
              select: {
                portfolios: true,
                achievements: true,
              },
            },
          },
          orderBy: { name: 'asc' },
        },
        assignments: {
          include: {
            _count: {
              select: {
                students: true,
              },
            },
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            students: true,
            assignments: true,
            attendance: true,
          },
        },
      },
    });

    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    return NextResponse.json(classData);
  } catch (error) {
    console.error('Error fetching class:', error);
    return NextResponse.json(
      { error: 'Failed to fetch class' },
      { status: 500 }
    );
  }
}

// PUT /api/classes/[id] - 학급 정보 수정
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

    // 본인 학급인지 확인
    const existingClass = await prisma.class.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existingClass) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    const updatedClass = await prisma.class.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        grade: body.grade,
        ageGroup: body.ageGroup,
        color: body.color,
        icon: body.icon,
        maxStudents: body.maxStudents,
        isActive: body.isActive,
      },
    });

    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error('Error updating class:', error);
    return NextResponse.json(
      { error: 'Failed to update class' },
      { status: 500 }
    );
  }
}

// DELETE /api/classes/[id] - 학급 삭제
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

    // 본인 학급인지 확인
    const existingClass = await prisma.class.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existingClass) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    await prisma.class.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting class:', error);
    return NextResponse.json(
      { error: 'Failed to delete class' },
      { status: 500 }
    );
  }
}
