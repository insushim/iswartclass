import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/classes - 학급 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const classes = await prisma.class.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        _count: {
          select: {
            students: true,
            assignments: true,
          },
        },
        students: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}

// POST /api/classes - 새 학급 생성
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, grade, ageGroup, color, icon, maxStudents } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const newClass = await prisma.class.create({
      data: {
        userId: session.user.id,
        name,
        description,
        grade,
        ageGroup: ageGroup || 'LOWER_ELEM',
        color,
        icon,
        maxStudents: maxStudents || 30,
      },
      include: {
        _count: {
          select: {
            students: true,
          },
        },
      },
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error('Error creating class:', error);
    return NextResponse.json(
      { error: 'Failed to create class' },
      { status: 500 }
    );
  }
}
