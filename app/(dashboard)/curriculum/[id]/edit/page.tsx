'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  GripVertical,
  BookOpen,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface LessonItem {
  id: string;
  week: number;
  title: string;
  technique: string;
  duration: number;
}

export default function CurriculumEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [title, setTitle] = useState(id === 'new' ? '' : `커리큘럼 ${id}`);
  const [description, setDescription] = useState('');
  const [grade, setGrade] = useState('');
  const [weeks, setWeeks] = useState('8');
  const [lessons, setLessons] = useState<LessonItem[]>([
    { id: '1', week: 1, title: '', technique: '색칠하기', duration: 40 },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddLesson = () => {
    const newLesson: LessonItem = {
      id: String(Date.now()),
      week: lessons.length + 1,
      title: '',
      technique: '색칠하기',
      duration: 40,
    };
    setLessons([...lessons, newLesson]);
  };

  const handleRemoveLesson = (lessonId: string) => {
    setLessons(lessons.filter(l => l.id !== lessonId));
  };

  const handleLessonChange = (lessonId: string, field: keyof LessonItem, value: string | number) => {
    setLessons(lessons.map(l =>
      l.id === lessonId ? { ...l, [field]: value } : l
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !grade) {
      toast.error('필수 항목을 모두 입력해주세요');
      return;
    }

    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('커리큘럼이 저장되었습니다');
    router.push('/curriculum');
    setIsLoading(false);
  };

  const techniques = [
    '색칠하기',
    '만다라',
    '종이접기',
    '수채화',
    '점잇기',
    '데칼코마니',
    '콜라주',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {id === 'new' ? '새 커리큘럼 만들기' : '커리큘럼 수정'}
          </h1>
          <p className="text-muted-foreground">
            커리큘럼 정보와 수업 내용을 입력하세요
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              기본 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">커리큘럼 제목 *</Label>
              <Input
                id="title"
                placeholder="예: 1학기 미술 커리큘럼"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                placeholder="커리큘럼에 대한 설명을 입력하세요"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="grade">대상 학년 *</Label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger>
                    <SelectValue placeholder="학년 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1학년">1학년</SelectItem>
                    <SelectItem value="2학년">2학년</SelectItem>
                    <SelectItem value="3학년">3학년</SelectItem>
                    <SelectItem value="4학년">4학년</SelectItem>
                    <SelectItem value="5학년">5학년</SelectItem>
                    <SelectItem value="6학년">6학년</SelectItem>
                    <SelectItem value="전학년">전학년</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weeks">수업 기간 (주)</Label>
                <Input
                  id="weeks"
                  type="number"
                  min="1"
                  max="52"
                  value={weeks}
                  onChange={(e) => setWeeks(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lessons */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>수업 목록</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={handleAddLesson}>
              <Plus className="h-4 w-4 mr-1" />
              수업 추가
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {lessons.length > 0 ? (
              lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className="flex items-start gap-4 p-4 rounded-lg border bg-muted/50"
                >
                  <div className="pt-2 text-muted-foreground">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <div className="flex-1 grid gap-4 sm:grid-cols-4">
                    <div className="space-y-2">
                      <Label>주차</Label>
                      <Input
                        type="number"
                        min="1"
                        value={lesson.week}
                        onChange={(e) => handleLessonChange(lesson.id, 'week', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>수업 제목</Label>
                      <Input
                        placeholder="수업 제목을 입력하세요"
                        value={lesson.title}
                        onChange={(e) => handleLessonChange(lesson.id, 'title', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>기법</Label>
                      <Select
                        value={lesson.technique}
                        onValueChange={(value) => handleLessonChange(lesson.id, 'technique', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {techniques.map((tech) => (
                            <SelectItem key={tech} value={tech}>
                              {tech}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleRemoveLesson(lesson.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>수업을 추가해주세요</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            취소
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>저장 중...</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                저장하기
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
