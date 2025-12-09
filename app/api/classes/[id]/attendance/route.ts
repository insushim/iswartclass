import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/classes/[id]/attendance - 출석 현황 조회
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
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');
    const date = dateStr ? new Date(dateStr) : new Date();

    // 날짜의 시작과 끝
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // 학급 확인
    const classData = await prisma.class.findFirst({
      where: { id, userId: session.user.id },
      include: {
        students: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // 해당 날짜의 출석 기록
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        classId: id,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    // 학생별 출석 상태 매핑
    const studentsWithAttendance = classData.students.map(student => {
      const attendance = attendanceRecords.find(a => a.studentId === student.id);
      return {
        ...student,
        status: attendance?.status || null,
        attendanceId: attendance?.id || null,
        note: attendance?.note || null,
      };
    });

    return NextResponse.json({
      date: startOfDay.toISOString().split('T')[0],
      classId: id,
      className: classData.name,
      students: studentsWithAttendance,
      summary: {
        total: classData.students.length,
        present: attendanceRecords.filter(a => a.status === 'PRESENT').length,
        absent: attendanceRecords.filter(a => a.status === 'ABSENT').length,
        late: attendanceRecords.filter(a => a.status === 'LATE').length,
        excused: attendanceRecords.filter(a => a.status === 'EXCUSED').length,
      },
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance' },
      { status: 500 }
    );
  }
}

// POST /api/classes/[id]/attendance - 출석 기록 저장
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
    const { studentId, date, status, note } = body;

    // 학급 확인
    const classData = await prisma.class.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // 학생이 해당 학급 소속인지 확인
    const student = await prisma.student.findFirst({
      where: { id: studentId, classId: id },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found in this class' }, { status: 404 });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Upsert 출석 기록
    const attendance = await prisma.attendance.upsert({
      where: {
        studentId_date: {
          studentId,
          date: attendanceDate,
        },
      },
      update: {
        status,
        note,
      },
      create: {
        studentId,
        classId: id,
        date: attendanceDate,
        status,
        note,
      },
    });

    return NextResponse.json(attendance);
  } catch (error) {
    console.error('Error saving attendance:', error);
    return NextResponse.json(
      { error: 'Failed to save attendance' },
      { status: 500 }
    );
  }
}

// PUT /api/classes/[id]/attendance - 전체 출석 일괄 저장
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
    const { date, records } = body; // records: [{ studentId, status, note }]

    // 학급 확인
    const classData = await prisma.class.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // 트랜잭션으로 일괄 저장
    const results = await prisma.$transaction(
      records.map((record: { studentId: string; status: string; note?: string }) =>
        prisma.attendance.upsert({
          where: {
            studentId_date: {
              studentId: record.studentId,
              date: attendanceDate,
            },
          },
          update: {
            status: record.status as any,
            note: record.note,
          },
          create: {
            studentId: record.studentId,
            classId: id,
            date: attendanceDate,
            status: record.status as any,
            note: record.note,
          },
        })
      )
    );

    return NextResponse.json({ success: true, count: results.length });
  } catch (error) {
    console.error('Error saving attendance:', error);
    return NextResponse.json(
      { error: 'Failed to save attendance' },
      { status: 500 }
    );
  }
}
