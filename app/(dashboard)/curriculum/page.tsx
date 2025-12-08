'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  Clock,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface CurriculumItem {
  id: string;
  title: string;
  description: string;
  grade: string;
  subject: string;
  weeks: number;
  items: number;
  status: 'draft' | 'active' | 'completed' | 'archived';
  progress: number;
  classes: string[];
  createdAt: string;
  startDate?: string;
  endDate?: string;
}

const mockCurriculums: CurriculumItem[] = [
  {
    id: '1',
    title: '1학기 미술 커리큘럼',
    description: '봄 테마를 중심으로 한 다양한 미술 활동',
    grade: '1학년',
    subject: '미술',
    weeks: 16,
    items: 32,
    status: 'active',
    progress: 45,
    classes: ['1-A', '1-B', '1-C'],
    createdAt: '2024-01-10',
    startDate: '2024-03-01',
    endDate: '2024-06-30',
  },
  {
    id: '2',
    title: '2학년 창의미술 과정',
    description: '창의성 발달을 위한 다양한 표현 기법 학습',
    grade: '2학년',
    subject: '창의미술',
    weeks: 12,
    items: 24,
    status: 'active',
    progress: 30,
    classes: ['2-A', '2-B'],
    createdAt: '2024-01-15',
    startDate: '2024-03-01',
    endDate: '2024-05-31',
  },
  {
    id: '3',
    title: '방과후 미술교실',
    description: '색칠하기와 만다라를 중심으로 한 방과후 프로그램',
    grade: '전학년',
    subject: '방과후',
    weeks: 8,
    items: 16,
    status: 'draft',
    progress: 0,
    classes: [],
    createdAt: '2024-01-20',
  },
  {
    id: '4',
    title: '겨울방학 특강',
    description: '종이접기 마스터 클래스',
    grade: '3-4학년',
    subject: '특강',
    weeks: 2,
    items: 8,
    status: 'completed',
    progress: 100,
    classes: ['3-A', '4-A'],
    createdAt: '2023-12-01',
    startDate: '2024-01-15',
    endDate: '2024-01-26',
  },
];

const statusConfig = {
  draft: { label: '초안', color: 'bg-gray-100 text-gray-700' },
  active: { label: '진행중', color: 'bg-green-100 text-green-700' },
  completed: { label: '완료', color: 'bg-blue-100 text-blue-700' },
  archived: { label: '보관됨', color: 'bg-gray-100 text-gray-500' },
};

export default function CurriculumPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterGrade, setFilterGrade] = useState<string>('all');

  const handleDeleteCurriculum = (id: string) => {
    toast.success('커리큘럼이 삭제되었습니다');
  };

  const handleDuplicateCurriculum = (id: string) => {
    toast.success('커리큘럼이 복제되었습니다');
  };

  const filteredCurriculums = mockCurriculums.filter((curriculum) => {
    const matchesSearch =
      curriculum.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      curriculum.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' || curriculum.status === filterStatus;
    const matchesGrade =
      filterGrade === 'all' || curriculum.grade.includes(filterGrade);
    return matchesSearch && matchesStatus && matchesGrade;
  });

  const activeCurriculums = mockCurriculums.filter((c) => c.status === 'active');
  const totalItems = mockCurriculums.reduce((sum, c) => sum + c.items, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            커리큘럼 관리
          </h1>
          <p className="text-muted-foreground">
            체계적인 미술 교육 과정을 설계하고 관리하세요
          </p>
        </div>
        <Button asChild>
          <Link href="/curriculum/new">
            <Plus className="h-4 w-4 mr-2" />
            새 커리큘럼 만들기
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockCurriculums.length}</p>
                <p className="text-sm text-muted-foreground">전체 커리큘럼</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-100">
                <Play className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeCurriculums.length}</p>
                <p className="text-sm text-muted-foreground">진행중</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalItems}</p>
                <p className="text-sm text-muted-foreground">총 수업 항목</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-100">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {new Set(mockCurriculums.flatMap((c) => c.classes)).size}
                </p>
                <p className="text-sm text-muted-foreground">연결된 학급</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="커리큘럼 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="상태" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모든 상태</SelectItem>
            <SelectItem value="draft">초안</SelectItem>
            <SelectItem value="active">진행중</SelectItem>
            <SelectItem value="completed">완료</SelectItem>
            <SelectItem value="archived">보관됨</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterGrade} onValueChange={setFilterGrade}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="학년" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모든 학년</SelectItem>
            <SelectItem value="1학년">1학년</SelectItem>
            <SelectItem value="2학년">2학년</SelectItem>
            <SelectItem value="3학년">3학년</SelectItem>
            <SelectItem value="4학년">4학년</SelectItem>
            <SelectItem value="5학년">5학년</SelectItem>
            <SelectItem value="6학년">6학년</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Curriculum List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="active">진행중</TabsTrigger>
          <TabsTrigger value="draft">초안</TabsTrigger>
          <TabsTrigger value="completed">완료</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredCurriculums.length > 0 ? (
            <div className="grid gap-4">
              {filteredCurriculums.map((curriculum) => (
                <Card
                  key={curriculum.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Icon */}
                      <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <BookOpen className="h-7 w-7 text-primary" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link
                              href={`/curriculum/${curriculum.id}`}
                              className="font-semibold text-lg hover:text-primary transition-colors"
                            >
                              {curriculum.title}
                            </Link>
                            <p className="text-sm text-muted-foreground mt-1">
                              {curriculum.description}
                            </p>
                          </div>
                          <Badge
                            className={statusConfig[curriculum.status].color}
                          >
                            {statusConfig[curriculum.status].label}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mt-3">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <GraduationCap className="h-4 w-4" />
                            {curriculum.grade}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {curriculum.weeks}주 과정
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <BookOpen className="h-4 w-4" />
                            {curriculum.items}개 항목
                          </div>
                          {curriculum.classes.length > 0 && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />
                              {curriculum.classes.join(', ')}
                            </div>
                          )}
                        </div>

                        {curriculum.status === 'active' && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-muted-foreground">진행률</span>
                              <span className="font-medium">
                                {curriculum.progress}%
                              </span>
                            </div>
                            <Progress value={curriculum.progress} className="h-2" />
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 lg:ml-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/curriculum/${curriculum.id}`}>
                            상세보기
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/curriculum/${curriculum.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                수정
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleDuplicateCurriculum(curriculum.id)
                              }
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              복제
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() =>
                                handleDeleteCurriculum(curriculum.id)
                              }
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              삭제
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 font-medium">커리큘럼이 없습니다</h3>
              <p className="text-sm text-muted-foreground mt-1">
                새 커리큘럼을 만들어 수업을 체계적으로 관리하세요
              </p>
              <Button asChild className="mt-4">
                <Link href="/curriculum/new">
                  <Plus className="h-4 w-4 mr-2" />
                  새 커리큘럼 만들기
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {filteredCurriculums.filter((c) => c.status === 'active').length > 0 ? (
            <div className="grid gap-4">
              {filteredCurriculums
                .filter((c) => c.status === 'active')
                .map((curriculum) => (
                  <Card
                    key={curriculum.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="h-14 w-14 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                          <Play className="h-7 w-7 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <Link
                            href={`/curriculum/${curriculum.id}`}
                            className="font-semibold text-lg hover:text-primary"
                          >
                            {curriculum.title}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {curriculum.description}
                          </p>
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-muted-foreground">
                                진행률
                              </span>
                              <span className="font-medium">
                                {curriculum.progress}%
                              </span>
                            </div>
                            <Progress
                              value={curriculum.progress}
                              className="h-2"
                            />
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/curriculum/${curriculum.id}`}>
                            계속하기
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Play className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 font-medium">진행중인 커리큘럼이 없습니다</h3>
            </div>
          )}
        </TabsContent>

        <TabsContent value="draft" className="space-y-4">
          {filteredCurriculums.filter((c) => c.status === 'draft').length > 0 ? (
            <div className="grid gap-4">
              {filteredCurriculums
                .filter((c) => c.status === 'draft')
                .map((curriculum) => (
                  <Card
                    key={curriculum.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="h-14 w-14 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                          <Edit className="h-7 w-7 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <Link
                            href={`/curriculum/${curriculum.id}`}
                            className="font-semibold text-lg hover:text-primary"
                          >
                            {curriculum.title}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {curriculum.description}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/curriculum/${curriculum.id}/edit`}>
                            편집하기
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Edit className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 font-medium">초안 커리큘럼이 없습니다</h3>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {filteredCurriculums.filter((c) => c.status === 'completed').length >
          0 ? (
            <div className="grid gap-4">
              {filteredCurriculums
                .filter((c) => c.status === 'completed')
                .map((curriculum) => (
                  <Card
                    key={curriculum.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="h-14 w-14 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                          <CheckCircle className="h-7 w-7 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <Link
                            href={`/curriculum/${curriculum.id}`}
                            className="font-semibold text-lg hover:text-primary"
                          >
                            {curriculum.title}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {curriculum.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {curriculum.startDate} ~ {curriculum.endDate}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/curriculum/${curriculum.id}`}>
                            결과 보기
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 font-medium">완료된 커리큘럼이 없습니다</h3>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
