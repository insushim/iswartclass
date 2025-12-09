import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/portfolio - 포트폴리오 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    const where: any = {
      userId: session.user.id,
    };

    if (studentId) {
      where.studentId = studentId;
    }

    const portfolios = await prisma.portfolio.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            class: {
              select: {
                name: true,
              },
            },
          },
        },
        items: {
          take: 6,
          orderBy: { completedAt: 'desc' },
          select: {
            id: true,
            artworkUrl: true,
            thumbnailUrl: true,
            title: true,
            technique: true,
            rating: true,
            completedAt: true,
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(portfolios);
  } catch (error) {
    console.error('Error fetching portfolios:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolios' },
      { status: 500 }
    );
  }
}

// POST /api/portfolio - 새 포트폴리오 생성
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { studentId, title, description, isPublic } = body;

    if (!studentId || !title) {
      return NextResponse.json(
        { error: 'Student ID and title are required' },
        { status: 400 }
      );
    }

    // 학생이 본인 소속인지 확인
    const student = await prisma.student.findFirst({
      where: { id: studentId, userId: session.user.id },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // 공유 코드 생성
    const shareCode = isPublic ? `p_${Date.now().toString(36)}` : null;

    const portfolio = await prisma.portfolio.create({
      data: {
        userId: session.user.id,
        studentId,
        title,
        description,
        isPublic: isPublic || false,
        shareCode,
        shareUrl: shareCode ? `/portfolio/view/${shareCode}` : null,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(portfolio, { status: 201 });
  } catch (error) {
    console.error('Error creating portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to create portfolio' },
      { status: 500 }
    );
  }
}
