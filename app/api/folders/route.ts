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

    const folders = await prisma.folder.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        _count: {
          select: { sheets: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Transform to include sheet count
    const foldersWithCount = folders.map((folder) => ({
      ...folder,
      sheetsCount: folder._count.sheets,
    }));

    return NextResponse.json(foldersWithCount);
  } catch (error) {
    console.error('Folders API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, color } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: '폴더 이름을 입력해주세요' },
        { status: 400 }
      );
    }

    const folder = await prisma.folder.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        color: color || 'blue',
      },
    });

    return NextResponse.json(folder);
  } catch (error) {
    console.error('Create folder error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
