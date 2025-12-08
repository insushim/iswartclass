'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Calendar,
  Users,
  Save,
  Eye,
  ChevronDown,
  ChevronUp,
  Wand2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { toast } from 'sonner';
import { ART_TECHNIQUES } from '@/lib/constants/artTechniques';
import { THEMES } from '@/lib/constants/themes';

interface CurriculumWeek {
  id: string;
  weekNumber: number;
  title: string;
  description: string;
  items: CurriculumWeekItem[];
}

interface CurriculumWeekItem {
  id: string;
  title: string;
  technique: string;
  theme: string;
  duration: number;
  sheetId?: string;
}

export default function NewCurriculumPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [grade, setGrade] = useState('');
  const [subject, setSubject] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [weeks, setWeeks] = useState<CurriculumWeek[]>([
    {
      id: '1',
      weekNumber: 1,
      title: '1주차',
      description: '',
      items: [
        {
          id: '1-1',
          title: '',
          technique: '',
          theme: '',
          duration: 40,
        },
      ],
    },
  ]);

  const addWeek = () => {
    const newWeekNumber = weeks.length + 1;
    setWeeks([
      ...weeks,
      {
        id: Date.now().toString(),
        weekNumber: newWeekNumber,
        title: `${newWeekNumber}주차`,
        description: '',
        items: [
          {
            id: `${Date.now()}-1`,
            title: '',
            technique: '',
            theme: '',
            duration: 40,
          },
        ],
      },
    ]);
  };

  const removeWeek = (weekId: string) => {
    if (weeks.length <= 1) {
      toast.error('최소 1주차는 유지해야 합니다');
      return;
    }
    setWeeks(
      weeks
        .filter((w) => w.id !== weekId)
        .map((w, index) => ({
          ...w,
          weekNumber: index + 1,
          title: `${index + 1}주차`,
        }))
    );
  };

  const addItemToWeek = (weekId: string) => {
    setWeeks(
      weeks.map((week) => {
        if (week.id === weekId) {
          return {
            ...week,
            items: [
              ...week.items,
              {
                id: Date.now().toString(),
                title: '',
                technique: '',
                theme: '',
                duration: 40,
              },
            ],
          };
        }
        return week;
      })
    );
  };

  const removeItemFromWeek = (weekId: string, itemId: string) => {
    setWeeks(
      weeks.map((week) => {
        if (week.id === weekId) {
          if (week.items.length <= 1) {
            toast.error('최소 1개의 항목은 유지해야 합니다');
            return week;
          }
          return {
            ...week,
            items: week.items.filter((item) => item.id !== itemId),
          };
        }
        return week;
      })
    );
  };

  const updateWeek = (weekId: string, field: string, value: string) => {
    setWeeks(
      weeks.map((week) => {
        if (week.id === weekId) {
          return { ...week, [field]: value };
        }
        return week;
      })
    );
  };

  const updateItem = (
    weekId: string,
    itemId: string,
    field: string,
    value: string | number
  ) => {
    setWeeks(
      weeks.map((week) => {
        if (week.id === weekId) {
          return {
            ...week,
            items: week.items.map((item) => {
              if (item.id === itemId) {
                return { ...item, [field]: value };
              }
              return item;
            }),
          };
        }
        return week;
      })
    );
  };

  const handleSave = async (asDraft: boolean = true) => {
    if (!title.trim()) {
      toast.error('커리큘럼 제목을 입력해주세요');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: API 호출
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success(
        asDraft ? '초안이 저장되었습니다' : '커리큘럼이 생성되었습니다'
      );
      router.push('/curriculum');
    } catch (error) {
      toast.error('저장에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const totalItems = weeks.reduce((sum, week) => sum + week.items.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/curriculum">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">새 커리큘럼 만들기</h1>
          <p className="text-muted-foreground">
            체계적인 미술 교육 과정을 설계하세요
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSave(true)}
            disabled={isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            초안 저장
          </Button>
          <Button onClick={() => handleSave(false)} disabled={isLoading}>
            커리큘럼 생성
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
              <CardDescription>커리큘럼의 기본 정보를 입력하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">커리큘럼 제목 *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 1학기 미술 커리큘럼"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="커리큘럼에 대한 간단한 설명"
                  rows={3}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="grade">대상 학년</Label>
                  <Select value={grade} onValueChange={setGrade}>
                    <SelectTrigger>
                      <SelectValue placeholder="학년 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1학년</SelectItem>
                      <SelectItem value="2">2학년</SelectItem>
                      <SelectItem value="3">3학년</SelectItem>
                      <SelectItem value="4">4학년</SelectItem>
                      <SelectItem value="5">5학년</SelectItem>
                      <SelectItem value="6">6학년</SelectItem>
                      <SelectItem value="all">전학년</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">과목</Label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="과목 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="art">미술</SelectItem>
                      <SelectItem value="creative-art">창의미술</SelectItem>
                      <SelectItem value="after-school">방과후</SelectItem>
                      <SelectItem value="special">특강</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">시작일</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">종료일</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weeks */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>주차별 수업 계획</CardTitle>
                  <CardDescription>
                    각 주차별 수업 내용을 계획하세요
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={addWeek}>
                  <Plus className="h-4 w-4 mr-1" />
                  주차 추가
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" defaultValue={['1']} className="space-y-4">
                {weeks.map((week) => (
                  <AccordionItem
                    key={week.id}
                    value={week.id}
                    className="border rounded-lg px-4"
                  >
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{week.weekNumber}주차</Badge>
                        <span className="font-medium">
                          {week.description || '수업 계획을 입력하세요'}
                        </span>
                        <Badge variant="secondary" className="ml-2">
                          {week.items.length}개 항목
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-4">
                      <div className="space-y-2">
                        <Label>주차 설명</Label>
                        <Input
                          value={week.description}
                          onChange={(e) =>
                            updateWeek(week.id, 'description', e.target.value)
                          }
                          placeholder="이번 주 학습 목표나 주제"
                        />
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <Label>수업 항목</Label>
                        {week.items.map((item, itemIndex) => (
                          <div
                            key={item.id}
                            className="flex items-start gap-3 p-3 border rounded-lg bg-muted/30"
                          >
                            <div className="flex items-center gap-2 pt-2">
                              <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                              <span className="text-sm font-medium text-muted-foreground w-6">
                                {itemIndex + 1}.
                              </span>
                            </div>
                            <div className="flex-1 grid gap-3 sm:grid-cols-2">
                              <Input
                                value={item.title}
                                onChange={(e) =>
                                  updateItem(
                                    week.id,
                                    item.id,
                                    'title',
                                    e.target.value
                                  )
                                }
                                placeholder="활동 제목"
                              />
                              <Select
                                value={item.technique}
                                onValueChange={(value) =>
                                  updateItem(week.id, item.id, 'technique', value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="기법 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(ART_TECHNIQUES).map(
                                    ([key, tech]) => (
                                      <SelectItem key={key} value={key}>
                                        {tech.icon} {tech.name}
                                      </SelectItem>
                                    )
                                  )}
                                </SelectContent>
                              </Select>
                              <Select
                                value={item.theme}
                                onValueChange={(value) =>
                                  updateItem(week.id, item.id, 'theme', value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="테마 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(THEMES).map(([key, theme]) => (
                                    <SelectItem key={key} value={key}>
                                      {theme.icon} {theme.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  value={item.duration}
                                  onChange={(e) =>
                                    updateItem(
                                      week.id,
                                      item.id,
                                      'duration',
                                      parseInt(e.target.value)
                                    )
                                  }
                                  className="w-20"
                                  min={10}
                                  step={5}
                                />
                                <span className="text-sm text-muted-foreground">
                                  분
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-1 pt-1">
                              <Button variant="ghost" size="icon-sm" asChild>
                                <Link href="/generate">
                                  <Wand2 className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() =>
                                  removeItemFromWeek(week.id, item.id)
                                }
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => addItemToWeek(week.id)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          항목 추가
                        </Button>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeWeek(week.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          주차 삭제
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>요약</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">총 주차</span>
                <Badge variant="secondary">{weeks.length}주</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">총 수업 항목</span>
                <Badge variant="secondary">{totalItems}개</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">예상 소요 시간</span>
                <Badge variant="secondary">
                  {weeks.reduce(
                    (sum, week) =>
                      sum +
                      week.items.reduce((itemSum, item) => itemSum + item.duration, 0),
                    0
                  )}
                  분
                </Badge>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">상태</span>
                <Badge>초안</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card>
            <CardHeader>
              <CardTitle>도움말</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>
                  • 각 주차별로 학습 목표를 명확히 설정하세요
                </li>
                <li>
                  • 다양한 기법과 테마를 조합하여 학생들의 흥미를 유지하세요
                </li>
                <li>
                  • 도안 생성 버튼으로 바로 AI 도안을 만들 수 있어요
                </li>
                <li>
                  • 초안으로 저장 후 언제든 수정할 수 있습니다
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              <Button className="w-full" onClick={() => handleSave(false)}>
                커리큘럼 생성
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSave(true)}
              >
                초안으로 저장
              </Button>
              <Button variant="ghost" className="w-full" asChild>
                <Link href="/curriculum">취소</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
