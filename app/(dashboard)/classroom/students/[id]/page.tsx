'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Award,
  TrendingUp,
  Calendar,
  Edit,
  Mail,
  Phone,
  GraduationCap,
  Image,
  Loader2,
  MoreVertical,
  Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  notes?: string;
  class?: {
    id: string;
    name: string;
    grade?: string;
  };
  portfolios?: Array<{
    id: string;
    title: string;
    _count?: {
      items: number;
    };
  }>;
  achievements?: Array<{
    id: string;
    achievement: {
      id: string;
      nameKo: string;
      icon: string;
    };
    completedAt: string;
  }>;
  _count?: {
    portfolios: number;
    achievements: number;
  };
  createdAt: string;
}

interface Activity {
  id: string;
  type: string;
  title: string;
  description?: string;
  completedAt: string;
}

export default function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/students/${id}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setStudent(data);
      // Mock activities for now - could be fetched from a separate endpoint
      setActivities([
        { id: '1', type: '색칠하기', title: '봄 꽃 색칠하기', completedAt: new Date().toISOString() },
        { id: '2', type: '만다라', title: '만다라 패턴', completedAt: new Date(Date.now() - 86400000).toISOString() },
        { id: '3', type: '종이접기', title: '종이학 접기', completedAt: new Date(Date.now() - 172800000).toISOString() },
      ]);
    } catch (error) {
      console.error('Error fetching student:', error);
      toast.error('학생 정보를 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');

      toast.success('학생이 삭제되었습니다');
      router.push('/classroom/students');
    } catch (error) {
      toast.error('삭제에 실패했습니다');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 mx-auto text-muted-foreground" />
        <h3 className="mt-4 font-medium">학생을 찾을 수 없습니다</h3>
        <Button asChild className="mt-4">
          <Link href="/classroom/students">학생 목록으로</Link>
        </Button>
      </div>
    );
  }

  const completionRate = student.totalActivities > 0
    ? Math.round((student._count?.achievements || 0) / student.totalActivities * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={student.avatarUrl} />
            <AvatarFallback className="text-xl">
              {student.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{student.name}</h1>
              {student.nickname && (
                <span className="text-muted-foreground">({student.nickname})</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              {student.class ? (
                <Badge variant="secondary">{student.class.name}</Badge>
              ) : (
                <span className="text-sm">학급 미배정</span>
              )}
              <span className="text-sm">· {student.ageGroup}</span>
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/classroom/students/${id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                수정
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/portfolio?studentId=${id}`}>
                <Image className="h-4 w-4 mr-2" />
                포트폴리오 보기
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={handleDeleteStudent}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              참여 활동
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.totalActivities}개</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              완료율
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Award className="h-4 w-4" />
              획득 배지
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student._count?.achievements || 0}개</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Image className="h-4 w-4" />
              포트폴리오
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student._count?.portfolios || 0}개</div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Info */}
      {(student.parentEmail || student.parentPhone) && (
        <Card>
          <CardHeader>
            <CardTitle>학부모 연락처</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {student.parentEmail && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${student.parentEmail}`} className="hover:text-primary">
                  {student.parentEmail}
                </a>
              </div>
            )}
            {student.parentPhone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${student.parentPhone}`} className="hover:text-primary">
                  {student.parentPhone}
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {student.notes && (
        <Card>
          <CardHeader>
            <CardTitle>메모</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{student.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>획득한 배지</CardTitle>
        </CardHeader>
        <CardContent>
          {student.achievements && student.achievements.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {student.achievements.map((ua) => (
                <Badge key={ua.id} variant="secondary" className="text-sm py-1 px-3">
                  <span className="mr-1">{ua.achievement.icon}</span>
                  {ua.achievement.nameKo}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">아직 획득한 배지가 없습니다</p>
          )}
        </CardContent>
      </Card>

      {/* Portfolios */}
      {student.portfolios && student.portfolios.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>포트폴리오</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {student.portfolios.map((portfolio) => (
                <Link
                  key={portfolio.id}
                  href={`/portfolio/${portfolio.id}`}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Image className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{portfolio.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {portfolio._count?.items || 0}개 작품
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">보기</Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>최근 활동</CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length > 0 ? (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">
                      {activity.type === '색칠하기'
                        ? '🎨'
                        : activity.type === '만다라'
                        ? '🔵'
                        : activity.type === '종이접기'
                        ? '📄'
                        : '🖼️'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(activity.completedAt).toLocaleDateString('ko-KR')} 완료
                    </p>
                  </div>
                  <Badge>완료</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">최근 활동이 없습니다</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
