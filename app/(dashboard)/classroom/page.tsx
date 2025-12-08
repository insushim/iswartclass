'use client';

import { useState } from 'react';
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
  grade: string;
  year: number;
  studentCount: number;
  curriculum?: {
    id: string;
    title: string;
    progress: number;
  };
  schedule: string;
  teacher: string;
  createdAt: string;
}

const mockClasses: ClassRoom[] = [
  {
    id: '1',
    name: '1-A반',
    grade: '1학년',
    year: 2024,
    studentCount: 25,
    curriculum: {
      id: '1',
      title: '1학기 미술 커리큘럼',
      progress: 45,
    },
    schedule: '월/수 14:00-14:40',
    teacher: '김선생',
    createdAt: '2024-01-10',
  },
  {
    id: '2',
    name: '1-B반',
    grade: '1학년',
    year: 2024,
    studentCount: 26,
    curriculum: {
      id: '1',
      title: '1학기 미술 커리큘럼',
      progress: 42,
    },
    schedule: '화/목 14:00-14:40',
    teacher: '김선생',
    createdAt: '2024-01-10',
  },
  {
    id: '3',
    name: '2-A반',
    grade: '2학년',
    year: 2024,
    studentCount: 28,
    curriculum: {
      id: '2',
      title: '2학년 창의미술 과정',
      progress: 30,
    },
    schedule: '월/수 15:00-15:40',
    teacher: '김선생',
    createdAt: '2024-01-12',
  },
  {
    id: '4',
    name: '방과후 A반',
    grade: '전학년',
    year: 2024,
    studentCount: 15,
    schedule: '금 15:00-16:00',
    teacher: '김선생',
    createdAt: '2024-01-15',
  },
];

export default function ClassroomPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [isNewClassOpen, setIsNewClassOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState('');

  const handleDeleteClass = (id: string) => {
    toast.success('학급이 삭제되었습니다');
  };

  const handleCreateClass = () => {
    if (!newClassName.trim()) {
      toast.error('학급 이름을 입력해주세요');
      return;
    }
    toast.success(`'${newClassName}' 학급이 생성되었습니다`);
    setNewClassName('');
    setNewClassGrade('');
    setIsNewClassOpen(false);
  };

  const filteredClasses = mockClasses.filter((cls) => {
    const matchesSearch = cls.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = filterGrade === 'all' || cls.grade.includes(filterGrade);
    return matchesSearch && matchesGrade;
  });

  const totalStudents = mockClasses.reduce((sum, cls) => sum + cls.studentCount, 0);

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
                <Label htmlFor="className">학급 이름</Label>
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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewClassOpen(false)}>
                취소
              </Button>
              <Button onClick={handleCreateClass}>생성</Button>
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
                <p className="text-2xl font-bold">{mockClasses.length}</p>
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
                  {mockClasses.filter((c) => c.curriculum).length}
                </p>
                <p className="text-sm text-muted-foreground">커리큘럼 연결됨</p>
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
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-muted-foreground">이번 주 수업</p>
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
                        <Badge variant="secondary">{cls.grade}</Badge>
                        <Badge variant="outline">{cls.year}년</Badge>
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
                    <span className="font-medium">{cls.studentCount}명</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      수업 시간
                    </span>
                    <span className="font-medium">{cls.schedule}</span>
                  </div>
                  {cls.curriculum && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {cls.curriculum.title}
                        </span>
                        <span className="font-medium">
                          {cls.curriculum.progress}%
                        </span>
                      </div>
                      <Progress value={cls.curriculum.progress} className="h-2" />
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
