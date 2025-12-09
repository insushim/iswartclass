'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  X,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Save,
  Clock,
  Loader2,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface Student {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface AttendanceRecord {
  id?: string;
  studentId: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  note?: string;
}

interface ClassInfo {
  id: string;
  name: string;
  grade?: string;
  students: Student[];
}

const statusConfig = {
  PRESENT: { label: '출석', color: 'bg-green-100 text-green-700', icon: Check },
  ABSENT: { label: '결석', color: 'bg-red-100 text-red-700', icon: X },
  LATE: { label: '지각', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  EXCUSED: { label: '사유결석', color: 'bg-gray-100 text-gray-700', icon: Calendar },
};

export default function AttendancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchClassInfo();
  }, [id]);

  useEffect(() => {
    if (classInfo) {
      fetchAttendance();
    }
  }, [selectedDate, classInfo]);

  const fetchClassInfo = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/classes/${id}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setClassInfo(data);
    } catch (error) {
      console.error('Error fetching class info:', error);
      toast.error('학급 정보를 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await fetch(`/api/classes/${id}/attendance?date=${selectedDate}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();

      // Convert array to record keyed by studentId
      const attendanceMap: Record<string, AttendanceRecord> = {};
      data.forEach((record: AttendanceRecord & { student?: Student }) => {
        attendanceMap[record.studentId] = {
          id: record.id,
          studentId: record.studentId,
          status: record.status,
          note: record.note,
        };
      });

      // Initialize missing students as PRESENT
      classInfo?.students.forEach((student) => {
        if (!attendanceMap[student.id]) {
          attendanceMap[student.id] = {
            studentId: student.id,
            status: 'PRESENT',
          };
        }
      });

      setAttendance(attendanceMap);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      // Initialize all as PRESENT if fetch fails
      const attendanceMap: Record<string, AttendanceRecord> = {};
      classInfo?.students.forEach((student) => {
        attendanceMap[student.id] = {
          studentId: student.id,
          status: 'PRESENT',
        };
      });
      setAttendance(attendanceMap);
    }
  };

  const handleStatusChange = (studentId: string, status: AttendanceRecord['status']) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        studentId,
        status,
      },
    }));
  };

  const handleSaveAttendance = async () => {
    try {
      setIsSaving(true);
      const records = Object.values(attendance).map((record) => ({
        studentId: record.studentId,
        status: record.status,
        note: record.note,
      }));

      const res = await fetch(`/api/classes/${id}/attendance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, records }),
      });

      if (!res.ok) throw new Error('Failed to save');

      toast.success('출석이 저장되었습니다');
    } catch (error) {
      toast.error('출석 저장에 실패했습니다');
    } finally {
      setIsSaving(false);
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const date = new Date(selectedDate);
    if (direction === 'prev') {
      date.setDate(date.getDate() - 1);
    } else {
      date.setDate(date.getDate() + 1);
    }
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!classInfo) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 mx-auto text-muted-foreground" />
        <h3 className="mt-4 font-medium">학급을 찾을 수 없습니다</h3>
        <Button asChild className="mt-4">
          <Link href="/classroom">학급 목록으로</Link>
        </Button>
      </div>
    );
  }

  const students = classInfo.students || [];
  const presentCount = Object.values(attendance).filter((a) => a.status === 'PRESENT').length;
  const absentCount = Object.values(attendance).filter((a) => a.status === 'ABSENT').length;
  const lateCount = Object.values(attendance).filter((a) => a.status === 'LATE').length;
  const attendanceRate = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">출석 관리</h1>
          <p className="text-muted-foreground">
            {classInfo.name} {classInfo.grade && `(${classInfo.grade})`}
          </p>
        </div>
        <Button onClick={handleSaveAttendance} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          저장
        </Button>
      </div>

      {/* Date Selector */}
      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" size="icon" onClick={() => navigateDate('prev')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Badge variant="outline" className="gap-1 px-4 py-2 text-base">
          <Calendar className="h-4 w-4" />
          {new Date(selectedDate).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'short',
          })}
        </Badge>
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigateDate('next')}
          disabled={selectedDate >= new Date().toISOString().split('T')[0]}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">출석</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{presentCount}명</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">결석</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{absentCount}명</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">지각</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lateCount}명</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">출석률</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Student List */}
      <Card>
        <CardHeader>
          <CardTitle>학생 출석 현황</CardTitle>
        </CardHeader>
        <CardContent>
          {students.length > 0 ? (
            <div className="space-y-2">
              {students.map((student) => {
                const record = attendance[student.id];
                const status = record?.status || 'PRESENT';
                const config = statusConfig[status];

                return (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={student.avatarUrl} />
                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{student.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={status}
                        onValueChange={(value) =>
                          handleStatusChange(student.id, value as AttendanceRecord['status'])
                        }
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusConfig).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              {config.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Badge className={config.color}>
                        <config.icon className="h-3 w-3 mr-1" />
                        {config.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 font-medium">학생이 없습니다</h3>
              <p className="text-sm text-muted-foreground mt-1">
                이 학급에 학생을 추가해주세요
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => {
            const newAttendance: Record<string, AttendanceRecord> = {};
            students.forEach((student) => {
              newAttendance[student.id] = { studentId: student.id, status: 'PRESENT' };
            });
            setAttendance(newAttendance);
            toast.success('전체 출석 처리되었습니다');
          }}
        >
          <Check className="h-4 w-4 mr-2" />
          전체 출석
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => {
            const newAttendance: Record<string, AttendanceRecord> = {};
            students.forEach((student) => {
              newAttendance[student.id] = { studentId: student.id, status: 'ABSENT' };
            });
            setAttendance(newAttendance);
            toast.success('전체 결석 처리되었습니다');
          }}
        >
          <X className="h-4 w-4 mr-2" />
          전체 결석
        </Button>
      </div>
    </div>
  );
}
