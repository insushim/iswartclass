'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  Phone,
  Users,
  Award,
  Download,
  Upload,
  Filter,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

interface Student {
  id: string;
  name: string;
  className: string;
  grade: string;
  studentNumber: string;
  parentEmail?: string;
  parentPhone?: string;
  completedWorks: number;
  achievements: number;
  avatar?: string;
  status: 'active' | 'inactive';
  joinedAt: string;
}

const mockStudents: Student[] = [
  {
    id: '1',
    name: '김민준',
    className: '1-A반',
    grade: '1학년',
    studentNumber: '1',
    parentEmail: 'parent1@example.com',
    parentPhone: '010-1234-5678',
    completedWorks: 12,
    achievements: 3,
    status: 'active',
    joinedAt: '2024-03-01',
  },
  {
    id: '2',
    name: '이서연',
    className: '1-A반',
    grade: '1학년',
    studentNumber: '2',
    parentEmail: 'parent2@example.com',
    completedWorks: 15,
    achievements: 5,
    status: 'active',
    joinedAt: '2024-03-01',
  },
  {
    id: '3',
    name: '박지호',
    className: '1-B반',
    grade: '1학년',
    studentNumber: '1',
    parentPhone: '010-2345-6789',
    completedWorks: 10,
    achievements: 2,
    status: 'active',
    joinedAt: '2024-03-01',
  },
  {
    id: '4',
    name: '최서아',
    className: '2-A반',
    grade: '2학년',
    studentNumber: '1',
    parentEmail: 'parent4@example.com',
    parentPhone: '010-3456-7890',
    completedWorks: 20,
    achievements: 7,
    status: 'active',
    joinedAt: '2024-03-01',
  },
  {
    id: '5',
    name: '정예준',
    className: '2-A반',
    grade: '2학년',
    studentNumber: '2',
    completedWorks: 8,
    achievements: 1,
    status: 'inactive',
    joinedAt: '2024-03-01',
  },
];

export default function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const handleSelectStudent = (id: string) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === mockStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(mockStudents.map((s) => s.id));
    }
  };

  const handleDeleteStudents = () => {
    toast.success(`${selectedStudents.length}명의 학생이 삭제되었습니다`);
    setSelectedStudents([]);
  };

  const filteredStudents = mockStudents.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.className.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass =
      filterClass === 'all' || student.className === filterClass;
    const matchesStatus =
      filterStatus === 'all' || student.status === filterStatus;
    return matchesSearch && matchesClass && matchesStatus;
  });

  const uniqueClasses = [...new Set(mockStudents.map((s) => s.className))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            학생 관리
          </h1>
          <p className="text-muted-foreground">
            학생 정보를 관리하고 학습 현황을 확인하세요
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            일괄 등록
          </Button>
          <Button asChild>
            <Link href="/classroom/students/new">
              <Plus className="h-4 w-4 mr-2" />
              학생 추가
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockStudents.length}</p>
                <p className="text-sm text-muted-foreground">전체 학생</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-100">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {mockStudents.filter((s) => s.status === 'active').length}
                </p>
                <p className="text-sm text-muted-foreground">활동 학생</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <Award className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {mockStudents.reduce((sum, s) => sum + s.achievements, 0)}
                </p>
                <p className="text-sm text-muted-foreground">총 획득 배지</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-100">
                <GraduationCap className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {mockStudents.reduce((sum, s) => sum + s.completedWorks, 0)}
                </p>
                <p className="text-sm text-muted-foreground">완료 작품</p>
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
            placeholder="학생 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterClass} onValueChange={setFilterClass}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="학급" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모든 학급</SelectItem>
            {uniqueClasses.map((cls) => (
              <SelectItem key={cls} value={cls}>
                {cls}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="상태" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모든 상태</SelectItem>
            <SelectItem value="active">활동</SelectItem>
            <SelectItem value="inactive">비활동</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          내보내기
        </Button>
      </div>

      {/* Selection Bar */}
      {selectedStudents.length > 0 && (
        <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
          <Checkbox
            checked={selectedStudents.length === mockStudents.length}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm font-medium">
            {selectedStudents.length}명 선택됨
          </span>
          <div className="flex-1" />
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Mail className="h-4 w-4 mr-1" />
              이메일 발송
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={handleDeleteStudents}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              삭제
            </Button>
          </div>
        </div>
      )}

      {/* Student Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedStudents.length === mockStudents.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>학생</TableHead>
                <TableHead>학급</TableHead>
                <TableHead className="text-center">완료 작품</TableHead>
                <TableHead className="text-center">배지</TableHead>
                <TableHead className="text-center">상태</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={() => handleSelectStudent(student.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={student.avatar} />
                        <AvatarFallback>
                          {student.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Link
                          href={`/classroom/students/${student.id}`}
                          className="font-medium hover:text-primary"
                        >
                          {student.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          번호: {student.studentNumber}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{student.className}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {student.completedWorks}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Award className="h-4 w-4 text-yellow-500" />
                      {student.achievements}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        student.status === 'active' ? 'default' : 'secondary'
                      }
                    >
                      {student.status === 'active' ? '활동' : '비활동'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/classroom/students/${student.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            상세보기
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/classroom/students/${student.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            수정
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/portfolio?studentId=${student.id}`}>
                            <Award className="h-4 w-4 mr-2" />
                            포트폴리오
                          </Link>
                        </DropdownMenuItem>
                        {student.parentEmail && (
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            학부모 이메일
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 font-medium">학생이 없습니다</h3>
              <p className="text-sm text-muted-foreground mt-1">
                새 학생을 추가하거나 검색어를 변경해보세요
              </p>
              <Button asChild className="mt-4">
                <Link href="/classroom/students/new">
                  <Plus className="h-4 w-4 mr-2" />
                  학생 추가
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
