'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Users,
  Edit,
  Play,
  Pause,
  Plus,
  CheckCircle,
  Clock,
  GraduationCap,
  ChevronRight,
  MoreVertical,
  Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface LessonItem {
  id: string;
  week: number;
  title: string;
  technique: string;
  duration: number;
  completed: boolean;
}

const mockCurriculums: Record<string, {
  title: string;
  description: string;
  grade: string;
  subject: string;
  weeks: number;
  status: 'draft' | 'active' | 'completed';
  progress: number;
  classes: string[];
  startDate?: string;
  endDate?: string;
  lessons: LessonItem[];
}> = {
  '1': {
    title: '1학기 미술 커리큘럼',
    description: '봄 테마를 중심으로 한 다양한 미술 활동',
    grade: '1학년',
    subject: '미술',
    weeks: 16,
    status: 'active',
    progress: 45,
    classes: ['1-A', '1-B', '1-C'],
    startDate: '2024-03-01',
    endDate: '2024-06-30',
    lessons: [
      { id: '1', week: 1, title: '봄꽃 색칠하기', technique: '색칠하기', duration: 40, completed: true },
      { id: '2', week: 2, title: '나비 만들기', technique: '종이접기', duration: 40, completed: true },
      { id: '3', week: 3, title: '무지개 그리기', technique: '수채화', duration: 40, completed: true },
      { id: '4', week: 4, title: '동물 친구들', technique: '색칠하기', duration: 40, completed: false },
      { id: '5', week: 5, title: '봄 풍경 만다라', technique: '만다라', duration: 40, completed: false },
      { id: '6', week: 6, title: '점잇기 - 꽃', technique: '점잇기', duration: 40, completed: false },
    ],
  },
  '2': {
    title: '2학년 창의미술 과정',
    description: '창의성 발달을 위한 다양한 표현 기법 학습',
    grade: '2학년',
    subject: '창의미술',
    weeks: 12,
    status: 'active',
    progress: 30,
    classes: ['2-A', '2-B'],
    startDate: '2024-03-01',
    endDate: '2024-05-31',
    lessons: [
      { id: '1', week: 1, title: '자유 표현', technique: '수채화', duration: 45, completed: true },
      { id: '2', week: 2, title: '패턴 디자인', technique: '만다라', duration: 45, completed: true },
      { id: '3', week: 3, title: '입체 종이접기', technique: '종이접기', duration: 45, completed: false },
      { id: '4', week: 4, title: '색상 조합', technique: '색칠하기', duration: 45, completed: false },
    ],
  },
};

const statusConfig = {
  draft: { label: '초안', color: 'bg-gray-100 text-gray-700' },
  active: { label: '진행중', color: 'bg-green-100 text-green-700' },
  completed: { label: '완료', color: 'bg-blue-100 text-blue-700' },
};

const techniqueEmoji: Record<string, string> = {
  '색칠하기': '🎨',
  '만다라': '🔵',
  '종이접기': '📄',
  '수채화': '💧',
  '점잇기': '✏️',
};

export default function CurriculumDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const curriculum = mockCurriculums[id] || {
    title: `커리큘럼 ${id}`,
    description: '커리큘럼 설명입니다.',
    grade: '미지정',
    subject: '미술',
    weeks: 8,
    status: 'draft' as const,
    progress: 0,
    classes: [],
    lessons: [],
  };

  const completedLessons = curriculum.lessons.filter(l => l.completed).length;
  const totalLessons = curriculum.lessons.length;

  const handleToggleLesson = (lessonId: string) => {
    toast.success('수업 상태가 변경되었습니다');
  };

  const handleStartCurriculum = () => {
    toast.success('커리큘럼이 시작되었습니다');
  };

  const handlePauseCurriculum = () => {
    toast.success('커리큘럼이 일시정지되었습니다');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{curriculum.title}</h1>
            <Badge className={statusConfig[curriculum.status].color}>
              {statusConfig[curriculum.status].label}
            </Badge>
          </div>
          <p className="text-muted-foreground">{curriculum.description}</p>
        </div>
        <div className="flex gap-2">
          {curriculum.status === 'draft' && (
            <Button onClick={handleStartCurriculum}>
              <Play className="h-4 w-4 mr-2" />
              시작하기
            </Button>
          )}
          {curriculum.status === 'active' && (
            <Button variant="outline" onClick={handlePauseCurriculum}>
              <Pause className="h-4 w-4 mr-2" />
              일시정지
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href={`/curriculum/${id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              수정
            </Link>
          </Button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">대상 학년</p>
                <p className="font-semibold">{curriculum.grade}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">수업 기간</p>
                <p className="font-semibold">{curriculum.weeks}주</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">수업 항목</p>
                <p className="font-semibold">{totalLessons}개</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">연결된 학급</p>
                <p className="font-semibold">{curriculum.classes.length > 0 ? curriculum.classes.join(', ') : '없음'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      {curriculum.status !== 'draft' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">진행 현황</span>
              <span className="text-sm text-muted-foreground">
                {completedLessons}/{totalLessons}개 완료 ({curriculum.progress}%)
              </span>
            </div>
            <Progress value={curriculum.progress} className="h-3" />
            {curriculum.startDate && curriculum.endDate && (
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>시작: {curriculum.startDate}</span>
                <span>종료: {curriculum.endDate}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Lessons */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>수업 목록</CardTitle>
          <Button size="sm" asChild>
            <Link href={`/curriculum/${id}/edit`}>
              <Plus className="h-4 w-4 mr-1" />
              수업 추가
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {curriculum.lessons.length > 0 ? (
            <div className="space-y-3">
              {curriculum.lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border ${
                    lesson.completed ? 'bg-green-50 border-green-200' : 'bg-muted/50'
                  }`}
                >
                  <div className="text-3xl">
                    {techniqueEmoji[lesson.technique] || '🖼️'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{lesson.title}</span>
                      {lesson.completed && (
                        <Badge className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          완료
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>{lesson.week}주차</span>
                      <span>{lesson.technique}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {lesson.duration}분
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleToggleLesson(lesson.id)}>
                        {lesson.completed ? (
                          <>
                            <Clock className="h-4 w-4 mr-2" />
                            미완료로 변경
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            완료로 변경
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 font-medium">수업이 없습니다</h3>
              <p className="text-sm text-muted-foreground mt-1">
                커리큘럼에 수업을 추가해보세요
              </p>
              <Button className="mt-4" asChild>
                <Link href={`/curriculum/${id}/edit`}>
                  <Plus className="h-4 w-4 mr-2" />
                  수업 추가
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connected Classes */}
      {curriculum.classes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>연결된 학급</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {curriculum.classes.map((cls) => (
                <div
                  key={cls}
                  className="flex items-center justify-between p-4 rounded-lg border bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium">{cls}</span>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/classroom`}>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
