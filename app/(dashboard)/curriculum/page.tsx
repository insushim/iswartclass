'use client';

import { useState, useEffect } from 'react';
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
  Loader2,
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
  description?: string;
  grade?: string;
  subject?: string;
  weeks?: number;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  progress?: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  _count?: {
    items: number;
    classes: number;
  };
  classes?: Array<{ id: string; name: string }>;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  DRAFT: { label: '초안', color: 'bg-gray-100 text-gray-700' },
  ACTIVE: { label: '진행중', color: 'bg-green-100 text-green-700' },
  COMPLETED: { label: '완료', color: 'bg-blue-100 text-blue-700' },
  ARCHIVED: { label: '보관됨', color: 'bg-gray-100 text-gray-500' },
};

export default function CurriculumPage() {
  const [curriculums, setCurriculums] = useState<CurriculumItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterGrade, setFilterGrade] = useState<string>('all');

  useEffect(() => {
    fetchCurriculums();
  }, []);

  const fetchCurriculums = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/curriculum');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setCurriculums(data);
    } catch (error) {
      console.error('Error fetching curriculums:', error);
      toast.error('커리큘럼을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCurriculum = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/curriculum/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');

      setCurriculums(curriculums.filter(c => c.id !== id));
      toast.success('커리큘럼이 삭제되었습니다');
    } catch (error) {
      toast.error('삭제에 실패했습니다');
    }
  };

  const handleDuplicateCurriculum = async (id: string) => {
    const curriculum = curriculums.find(c => c.id === id);
    if (!curriculum) return;

    try {
      const res = await fetch('/api/curriculum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${curriculum.title} (복사본)`,
          description: curriculum.description,
          grade: curriculum.grade,
          subject: curriculum.subject,
          weeks: curriculum.weeks,
        }),
      });

      if (!res.ok) throw new Error('Failed to duplicate');

      const newCurriculum = await res.json();
      setCurriculums([...curriculums, newCurriculum]);
      toast.success('커리큘럼이 복제되었습니다');
    } catch (error) {
      toast.error('복제에 실패했습니다');
    }
  };

  const filteredCurriculums = curriculums.filter((curriculum) => {
    const matchesSearch =
      curriculum.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (curriculum.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' || curriculum.status === filterStatus.toUpperCase();
    const matchesGrade =
      filterGrade === 'all' || (curriculum.grade || '').includes(filterGrade);
    return matchesSearch && matchesStatus && matchesGrade;
  });

  const activeCurriculums = curriculums.filter((c) => c.status === 'ACTIVE');
  const totalItems = curriculums.reduce((sum, c) => sum + (c._count?.items || 0), 0);
  const totalClasses = curriculums.reduce((sum, c) => sum + (c._count?.classes || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
                <p className="text-2xl font-bold">{curriculums.length}</p>
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
                <p className="text-2xl font-bold">{totalClasses}</p>
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
                              {curriculum.description || '설명 없음'}
                            </p>
                          </div>
                          <Badge
                            className={statusConfig[curriculum.status]?.color || 'bg-gray-100'}
                          >
                            {statusConfig[curriculum.status]?.label || curriculum.status}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mt-3">
                          {curriculum.grade && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <GraduationCap className="h-4 w-4" />
                              {curriculum.grade}
                            </div>
                          )}
                          {curriculum.weeks && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {curriculum.weeks}주 과정
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <BookOpen className="h-4 w-4" />
                            {curriculum._count?.items || 0}개 항목
                          </div>
                          {(curriculum._count?.classes || 0) > 0 && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />
                              {curriculum._count?.classes}개 학급
                            </div>
                          )}
                        </div>

                        {curriculum.status === 'ACTIVE' && curriculum.progress !== undefined && (
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
          {filteredCurriculums.filter((c) => c.status === 'ACTIVE').length > 0 ? (
            <div className="grid gap-4">
              {filteredCurriculums
                .filter((c) => c.status === 'ACTIVE')
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
                          {curriculum.progress !== undefined && (
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
                          )}
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
          {filteredCurriculums.filter((c) => c.status === 'DRAFT').length > 0 ? (
            <div className="grid gap-4">
              {filteredCurriculums
                .filter((c) => c.status === 'DRAFT')
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
          {filteredCurriculums.filter((c) => c.status === 'COMPLETED').length >
          0 ? (
            <div className="grid gap-4">
              {filteredCurriculums
                .filter((c) => c.status === 'COMPLETED')
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
                          {(curriculum.startDate || curriculum.endDate) && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {curriculum.startDate} ~ {curriculum.endDate}
                            </p>
                          )}
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
