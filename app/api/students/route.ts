import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/students - 학생 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const search = searchParams.get('search');

    const where: any = {
      userId: session.user.id,
    };

    if (classId) {
      where.classId = classId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nickname: { contains: search, mode: 'insensitive' } },
      ];
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        class: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
        _count: {
          select: {
            portfolios: true,
            achievements: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

// POST /api/students - 새 학생 등록
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, nickname, classId, ageGroup, birthDate, parentEmail, parentPhone, notes } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const student = await prisma.student.create({
      data: {
        userId: session.user.id,
        name,
        nickname,
        classId,
        ageGroup: ageGroup || 'LOWER_ELEM',
        birthDate: birthDate ? new Date(birthDate) : null,
        parentEmail,
        parentPhone,
        notes,
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

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    );
  }
}
