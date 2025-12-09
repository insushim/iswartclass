import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/portfolio/[id] - 포트폴리오 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    // 공유 코드로 조회하는 경우 (로그인 불필요)
    let portfolio = await prisma.portfolio.findFirst({
      where: {
        OR: [
          { id, userId: session?.user?.id || '' },
          { shareCode: id, isPublic: true },
        ],
      },
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
          include: {
            sheet: {
              select: {
                id: true,
                title: true,
                technique: true,
                theme: true,
              },
            },
          },
          orderBy: { completedAt: 'desc' },
        },
      },
    });

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    // 평균 평점 계산
    const itemsWithRating = portfolio.items.filter(item => item.rating !== null);
    const averageRating = itemsWithRating.length > 0
      ? itemsWithRating.reduce((sum, item) => sum + (item.rating || 0), 0) / itemsWithRating.length
      : null;

    return NextResponse.json({
      ...portfolio,
      averageRating,
      totalItems: portfolio.items.length,
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 }
    );
  }
}

// PUT /api/portfolio/[id] - 포트폴리오 수정
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

    // 본인 포트폴리오인지 확인
    const existingPortfolio = await prisma.portfolio.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existingPortfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    // 공개 설정 변경 시 공유 코드 업데이트
    let shareCode = existingPortfolio.shareCode;
    let shareUrl = existingPortfolio.shareUrl;

    if (body.isPublic && !existingPortfolio.shareCode) {
      shareCode = `p_${Date.now().toString(36)}`;
      shareUrl = `/portfolio/view/${shareCode}`;
    } else if (!body.isPublic) {
      shareCode = null;
      shareUrl = null;
    }

    const portfolio = await prisma.portfolio.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        isPublic: body.isPublic,
        shareCode,
        shareUrl,
      },
    });

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('Error updating portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to update portfolio' },
      { status: 500 }
    );
  }
}

// DELETE /api/portfolio/[id] - 포트폴리오 삭제
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

    // 본인 포트폴리오인지 확인
    const existingPortfolio = await prisma.portfolio.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existingPortfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    await prisma.portfolio.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to delete portfolio' },
      { status: 500 }
    );
  }
}

// POST /api/portfolio/[id] - 포트폴리오에 작품 추가
export async function POST(
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

    // 본인 포트폴리오인지 확인
    const existingPortfolio = await prisma.portfolio.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existingPortfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    const { sheetId, artworkUrl, thumbnailUrl, title, description, technique, rating, feedback, tags } = body;

    if (!artworkUrl) {
      return NextResponse.json(
        { error: 'Artwork URL is required' },
        { status: 400 }
      );
    }

    const item = await prisma.portfolioItem.create({
      data: {
        portfolioId: id,
        sheetId,
        artworkUrl,
        thumbnailUrl,
        title,
        description,
        technique,
        rating,
        feedback,
        tags: tags || [],
      },
    });

    // 포트폴리오 업데이트 시간 갱신
    await prisma.portfolio.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error adding portfolio item:', error);
    return NextResponse.json(
      { error: 'Failed to add portfolio item' },
      { status: 500 }
    );
  }
}
