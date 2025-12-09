'use client';

import { useState, useEffect } from 'react';
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
  Loader2,
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
  nickname?: string;
  avatarUrl?: string;
  ageGroup: string;
  parentEmail?: string;
  parentPhone?: string;
  totalActivities: number;
  class?: {
    id: string;
    name: string;
    grade?: string;
  };
  _count?: {
    portfolios: number;
    achievements: number;
  };
  createdAt: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // 학생 목록 로드
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/students');
      if (!res.ok) throw new Error('Failed to fetch students');
      const data = await res.json();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('학생 목록을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectStudent = (id: string) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map((s) => s.id));
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete student');

      setStudents(students.filter(s => s.id !== id));
      setSelectedStudents(selectedStudents.filter(s => s !== id));
      toast.success('학생이 삭제되었습니다');
    } catch (error) {
      toast.error('삭제에 실패했습니다');
    }
  };

  const handleDeleteStudents = async () => {
    if (!confirm(`${selectedStudents.length}명의 학생을 삭제하시겠습니까?`)) return;

    try {
      await Promise.all(
        selectedStudents.map(id => fetch(`/api/students/${id}`, { method: 'DELETE' }))
      );
      setStudents(students.filter(s => !selectedStudents.includes(s.id)));
      setSelectedStudents([]);
      toast.success(`${selectedStudents.length}명의 학생이 삭제되었습니다`);
    } catch (error) {
      toast.error('일부 학생 삭제에 실패했습니다');
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.class?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass =
      filterClass === 'all' || student.class?.id === filterClass;
    return matchesSearch && matchesClass;
  });

  const uniqueClasses = students
    .filter(s => s.class?.id)
    .map(s => s.class!)
    .filter((cls, index, self) => self.findIndex(c => c.id === cls.id) === index);

  const totalAchievements = students.reduce((sum, s) => sum + (s._count?.achievements || 0), 0);
  const totalActivities = students.reduce((sum, s) => sum + (s.totalActivities || 0), 0);

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
                <p className="text-2xl font-bold">{students.length}</p>
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
                <p className="text-2xl font-bold">{uniqueClasses.length}</p>
                <p className="text-sm text-muted-foreground">학급 수</p>
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
                <p className="text-2xl font-bold">{totalAchievements}</p>
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
                <p className="text-2xl font-bold">{totalActivities}</p>
                <p className="text-sm text-muted-foreground">완료 활동</p>
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
            {uniqueClasses.map((cls) => cls && (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.name}
              </SelectItem>
            ))}
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
            checked={selectedStudents.length === filteredStudents.length}
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
                    checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>학생</TableHead>
                <TableHead>학급</TableHead>
                <TableHead className="text-center">활동</TableHead>
                <TableHead className="text-center">배지</TableHead>
                <TableHead className="text-center">포트폴리오</TableHead>
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
                        <AvatarImage src={student.avatarUrl} />
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
                        {student.nickname && (
                          <p className="text-xs text-muted-foreground">
                            {student.nickname}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {student.class ? (
                      <Badge variant="secondary">{student.class.name}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">미배정</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {student.totalActivities || 0}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Award className="h-4 w-4 text-yellow-500" />
                      {student._count?.achievements || 0}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {student._count?.portfolios || 0}
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
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteStudent(student.id)}
                        >
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
