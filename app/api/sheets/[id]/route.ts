import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const sheet = await prisma.sheet.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!sheet) {
      return NextResponse.json(
        { error: '도안을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    return NextResponse.json(sheet);
  } catch (error) {
    console.error('Get sheet error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, folderId, isFavorite } = body;

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (folderId !== undefined) updateData.folderId = folderId;
    if (isFavorite !== undefined) updateData.isFavorite = isFavorite;

    const sheet = await prisma.sheet.updateMany({
      where: {
        id,
        userId: session.user.id,
      },
      data: updateData,
    });

    if (sheet.count === 0) {
      return NextResponse.json(
        { error: '도안을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    const updatedSheet = await prisma.sheet.findUnique({
      where: { id },
    });

    return NextResponse.json(updatedSheet);
  } catch (error) {
    console.error('Update sheet error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const result = await prisma.sheet.deleteMany({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: '도안을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete sheet error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
