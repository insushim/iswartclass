'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Users, Calendar, Settings, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Mock data - replace with actual API calls
const mockClassrooms: Record<string, { name: string; grade: string; students: number; teacher: string }> = {
  '1': { name: '1학년 1반', grade: '1학년', students: 25, teacher: '김선생' },
  '2': { name: '2학년 3반', grade: '2학년', students: 28, teacher: '이선생' },
  '3': { name: '3학년 2반', grade: '3학년', students: 24, teacher: '박선생' },
  '4': { name: '4학년 1반', grade: '4학년', students: 26, teacher: '최선생' },
};

export default function ClassroomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const classroom = mockClassrooms[id] || { name: `학급 ${id}`, grade: '미지정', students: 0, teacher: '미지정' };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{classroom.name}</h1>
          <p className="text-muted-foreground">{classroom.grade} - {classroom.teacher} 선생님</p>
        </div>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">학생 수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classroom.students}명</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">완료한 활동</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12개</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">평균 참여율</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => router.push(`/classroom/students`)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              학생 관리
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">학생 목록 조회 및 관리</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => router.push(`/classroom/${id}/attendance`)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              출석 관리
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">출석 현황 확인 및 관리</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>최근 활동</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">색칠하기 - 동물 친구들 #{i}</p>
                  <p className="text-sm text-muted-foreground">2024년 12월 {8 - i}일</p>
                </div>
                <Badge variant="secondary">{20 + i}명 완료</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
