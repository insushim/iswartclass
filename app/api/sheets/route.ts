import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const technique = searchParams.get('technique');
    const theme = searchParams.get('theme');
    const folderId = searchParams.get('folderId');
    const sortBy = searchParams.get('sortBy') || 'newest';

    // Build where clause
    const where: Record<string, unknown> = {
      userId: session.user.id,
    };

    if (technique) {
      where.technique = technique;
    }
    if (theme) {
      where.theme = theme;
    }
    if (folderId) {
      where.folderId = folderId;
    }

    // Build orderBy
    let orderBy: Record<string, string> = { createdAt: 'desc' };
    switch (sortBy) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'name':
        orderBy = { title: 'asc' };
        break;
    }

    // Get total count
    const total = await prisma.sheet.count({ where });

    // Get sheets with pagination
    const sheets = await prisma.sheet.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      sheets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Sheets API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids')?.split(',');

    if (!ids || ids.length === 0) {
      return NextResponse.json(
        { error: '삭제할 도안을 선택해주세요' },
        { status: 400 }
      );
    }

    await prisma.sheet.deleteMany({
      where: {
        id: { in: ids },
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete sheets error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
