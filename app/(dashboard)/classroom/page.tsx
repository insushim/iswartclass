'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  UserPlus,
  Calendar,
  BookOpen,
  ChevronRight,
  GraduationCap,
  Clock,
  Award,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface ClassRoom {
  id: string;
  name: string;
  grade?: string;
  description?: string;
  ageGroup: string;
  maxStudents: number;
  isActive: boolean;
  inviteCode: string;
  _count?: {
    students: number;
    assignments: number;
  };
  students?: {
    id: string;
    name: string;
    avatarUrl?: string;
  }[];
  createdAt: string;
}

export default function ClassroomPage() {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [isNewClassOpen, setIsNewClassOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState('');
  const [newClassDescription, setNewClassDescription] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/classes');
      if (!res.ok) throw new Error('Failed to fetch classes');
      const data = await res.json();
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('학급 목록을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/classes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete class');

      setClasses(classes.filter(c => c.id !== id));
      toast.success('학급이 삭제되었습니다');
    } catch (error) {
      toast.error('삭제에 실패했습니다');
    }
  };

  const handleCreateClass = async () => {
    if (!newClassName.trim()) {
      toast.error('학급 이름을 입력해주세요');
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newClassName,
          grade: newClassGrade || undefined,
          description: newClassDescription || undefined,
          ageGroup: 'LOWER_ELEM',
        }),
      });

      if (!res.ok) throw new Error('Failed to create class');

      const newClass = await res.json();
      setClasses([newClass, ...classes]);
      toast.success(`'${newClassName}' 학급이 생성되었습니다`);
      setNewClassName('');
      setNewClassGrade('');
      setNewClassDescription('');
      setIsNewClassOpen(false);
    } catch (error) {
      toast.error('학급 생성에 실패했습니다');
    } finally {
      setIsCreating(false);
    }
  };

  const filteredClasses = classes.filter((cls) => {
    const matchesSearch = cls.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = filterGrade === 'all' || (cls.grade && cls.grade.includes(filterGrade));
    return matchesSearch && matchesGrade;
  });

  const totalStudents = classes.reduce((sum, cls) => sum + (cls._count?.students || 0), 0);

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
            <Users className="h-6 w-6 text-primary" />
            학급 관리
          </h1>
          <p className="text-muted-foreground">
            학급을 생성하고 학생들을 관리하세요
          </p>
        </div>
        <Dialog open={isNewClassOpen} onOpenChange={setIsNewClassOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              새 학급 만들기
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 학급 만들기</DialogTitle>
              <DialogDescription>
                새로운 학급을 만들어 학생들을 등록하세요
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="className">학급 이름 *</Label>
                <Input
                  id="className"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="예: 1-A반"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="classGrade">학년</Label>
                <Select value={newClassGrade} onValueChange={setNewClassGrade}>
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
                <Label htmlFor="classDescription">설명</Label>
                <Input
                  id="classDescription"
                  value={newClassDescription}
                  onChange={(e) => setNewClassDescription(e.target.value)}
                  placeholder="학급에 대한 설명 (선택사항)"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewClassOpen(false)}>
                취소
              </Button>
              <Button onClick={handleCreateClass} disabled={isCreating}>
                {isCreating ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> 생성 중...</>
                ) : (
                  '생성'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{classes.length}</p>
                <p className="text-sm text-muted-foreground">전체 학급</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <GraduationCap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStudents}</p>
                <p className="text-sm text-muted-foreground">전체 학생</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-100">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {classes.filter((c) => c.isActive).length}
                </p>
                <p className="text-sm text-muted-foreground">활성 학급</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-100">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {classes.reduce((sum, c) => sum + (c._count?.assignments || 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">총 과제</p>
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
            placeholder="학급 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
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

      {/* Class List */}
      {filteredClasses.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredClasses.map((cls) => (
            <Card
              key={cls.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <Link
                        href={`/classroom/${cls.id}`}
                        className="font-semibold text-lg hover:text-primary transition-colors"
                      >
                        {cls.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        {cls.grade && <Badge variant="secondary">{cls.grade}</Badge>}
                        <Badge variant={cls.isActive ? 'default' : 'outline'}>
                          {cls.isActive ? '활성' : '비활성'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/classroom/${cls.id}`}>
                          <Users className="h-4 w-4 mr-2" />
                          상세보기
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/classroom/${cls.id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          수정
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/classroom/students/new?classId=${cls.id}`}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          학생 추가
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteClass(cls.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      학생 수
                    </span>
                    <span className="font-medium">{cls._count?.students || 0}명</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      과제 수
                    </span>
                    <span className="font-medium">{cls._count?.assignments || 0}개</span>
                  </div>
                  {cls.description && (
                    <p className="text-sm text-muted-foreground pt-2 border-t">
                      {cls.description}
                    </p>
                  )}
                  {cls.students && cls.students.length > 0 && (
                    <div className="flex items-center gap-1 pt-2 border-t">
                      <div className="flex -space-x-2">
                        {cls.students.slice(0, 5).map((student) => (
                          <Avatar key={student.id} className="h-7 w-7 border-2 border-background">
                            <AvatarImage src={student.avatarUrl} />
                            <AvatarFallback className="text-xs">{student.name[0]}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      {(cls._count?.students || 0) > 5 && (
                        <span className="text-xs text-muted-foreground ml-2">
                          +{(cls._count?.students || 0) - 5}명
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/classroom/${cls.id}`}>
                      학급 관리
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/classroom/${cls.id}/attendance`}>
                      출석 관리
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 font-medium">학급이 없습니다</h3>
          <p className="text-sm text-muted-foreground mt-1">
            새 학급을 만들어 학생들을 관리하세요
          </p>
          <Button className="mt-4" onClick={() => setIsNewClassOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            새 학급 만들기
          </Button>
        </div>
      )}
    </div>
  );
}
