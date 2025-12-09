import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/students/[id] - 학생 상세 조회
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

    const student = await prisma.student.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
        portfolios: {
          include: {
            items: {
              take: 5,
              orderBy: { completedAt: 'desc' },
            },
          },
        },
        achievements: {
          include: {
            achievement: true,
          },
          where: {
            isCompleted: true,
          },
        },
        attendance: {
          take: 30,
          orderBy: { date: 'desc' },
        },
        assignments: {
          include: {
            assignment: true,
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student' },
      { status: 500 }
    );
  }
}

// PUT /api/students/[id] - 학생 정보 수정
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

    // 본인 학생인지 확인
    const existingStudent = await prisma.student.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existingStudent) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const student = await prisma.student.update({
      where: { id },
      data: {
        name: body.name,
        nickname: body.nickname,
        classId: body.classId,
        ageGroup: body.ageGroup,
        birthDate: body.birthDate ? new Date(body.birthDate) : null,
        parentEmail: body.parentEmail,
        parentPhone: body.parentPhone,
        notes: body.notes,
        interests: body.interests || [],
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
      },
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json(
      { error: 'Failed to update student' },
      { status: 500 }
    );
  }
}

// DELETE /api/students/[id] - 학생 삭제
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

    // 본인 학생인지 확인
    const existingStudent = await prisma.student.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existingStudent) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    await prisma.student.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    );
  }
}
