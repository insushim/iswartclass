'use client';

import Link from 'next/link';
import {
  Wand2,
  Library,
  Users,
  TrendingUp,
  Clock,
  Star,
  ArrowRight,
  Sparkles,
  Calendar,
  Award,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const stats: Array<{
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: typeof Wand2;
  href: string;
}> = [
  {
    title: '생성된 도안',
    value: '124',
    change: '+12%',
    changeType: 'positive',
    icon: Wand2,
    href: '/library',
  },
  {
    title: '내 라이브러리',
    value: '89',
    change: '+5%',
    changeType: 'positive',
    icon: Library,
    href: '/library',
  },
  {
    title: '등록 학생',
    value: '32',
    change: '+3',
    changeType: 'positive',
    icon: Users,
    href: '/classroom/students',
  },
  {
    title: '이번 달 사용량',
    value: '67%',
    change: '20/30',
    changeType: 'neutral',
    icon: TrendingUp,
    href: '/settings/subscription',
  },
];

const recentSheets = [
  {
    id: '1',
    title: '귀여운 고양이 색칠하기',
    technique: '색칠하기',
    theme: '동물',
    createdAt: '2시간 전',
    thumbnail: '/api/placeholder/200/200',
  },
  {
    id: '2',
    title: '봄 꽃 만다라',
    technique: '만다라',
    theme: '자연',
    createdAt: '5시간 전',
    thumbnail: '/api/placeholder/200/200',
  },
  {
    id: '3',
    title: '종이접기 비행기',
    technique: '종이접기',
    theme: '탈것',
    createdAt: '1일 전',
    thumbnail: '/api/placeholder/200/200',
  },
  {
    id: '4',
    title: '점잇기 공룡',
    technique: '점잇기',
    theme: '동물',
    createdAt: '2일 전',
    thumbnail: '/api/placeholder/200/200',
  },
];

const upcomingClasses = [
  {
    id: '1',
    name: '1-A반 미술 수업',
    time: '오늘 14:00',
    students: 25,
    topic: '가을 풍경 그리기',
  },
  {
    id: '2',
    name: '2-B반 미술 수업',
    time: '내일 10:00',
    students: 28,
    topic: '동물 색칠하기',
  },
  {
    id: '3',
    name: '3-A반 미술 수업',
    time: '내일 14:00',
    students: 30,
    topic: '만다라 패턴',
  },
];

const achievements = [
  {
    id: '1',
    title: '첫 도안 생성',
    description: '첫 번째 도안을 생성했어요!',
    icon: '🎨',
    earned: true,
  },
  {
    id: '2',
    title: '100개 도안 달성',
    description: '100개의 도안을 생성했어요!',
    icon: '🏆',
    earned: true,
  },
  {
    id: '3',
    title: '인기 크리에이터',
    description: '도안이 100회 다운로드되었어요!',
    icon: '⭐',
    earned: false,
    progress: 67,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">안녕하세요, 김선생님! 👋</h1>
          <p className="text-muted-foreground">
            오늘도 아이들을 위한 멋진 미술 도안을 만들어보세요.
          </p>
        </div>
        <Button asChild size="lg" className="gap-2">
          <Link href="/generate">
            <Sparkles className="h-5 w-5" />
            새 도안 생성하기
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p
                  className={`text-xs ${
                    stat.changeType === 'positive'
                      ? 'text-green-600'
                      : stat.changeType === 'negative'
                      ? 'text-red-600'
                      : 'text-muted-foreground'
                  }`}
                >
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Sheets */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>최근 생성한 도안</CardTitle>
              <CardDescription>최근에 만든 도안들이에요</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/library" className="gap-1">
                전체 보기 <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {recentSheets.map((sheet) => (
                <div
                  key={sheet.id}
                  className="flex gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Wand2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{sheet.title}</h4>
                    <div className="flex gap-1.5 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {sheet.technique}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {sheet.theme}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <Clock className="inline h-3 w-3 mr-1" />
                      {sheet.createdAt}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Classes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>예정된 수업</CardTitle>
              <CardDescription>다가오는 수업 일정</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/calendar">
                <Calendar className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingClasses.map((cls) => (
              <div
                key={cls.id}
                className="flex items-start gap-3 p-3 rounded-lg border"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">{cls.name}</h4>
                  <p className="text-xs text-muted-foreground">{cls.topic}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {cls.time}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {cls.students}명
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>빠른 작업</CardTitle>
            <CardDescription>자주 사용하는 기능</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button variant="outline" className="justify-start gap-2" asChild>
              <Link href="/generate">
                <Wand2 className="h-4 w-4" />
                새 도안 생성
              </Link>
            </Button>
            <Button variant="outline" className="justify-start gap-2" asChild>
              <Link href="/curriculum/new">
                <Calendar className="h-4 w-4" />
                커리큘럼 만들기
              </Link>
            </Button>
            <Button variant="outline" className="justify-start gap-2" asChild>
              <Link href="/classroom/students/new">
                <Users className="h-4 w-4" />
                학생 등록
              </Link>
            </Button>
            <Button variant="outline" className="justify-start gap-2" asChild>
              <Link href="/marketplace">
                <Star className="h-4 w-4" />
                마켓플레이스 둘러보기
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>성취 배지</CardTitle>
              <CardDescription>획득한 배지와 진행 중인 도전</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/achievements" className="gap-1">
                전체 보기 <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border text-center ${
                    achievement.earned
                      ? 'bg-primary/5 border-primary/20'
                      : 'bg-muted/30'
                  }`}
                >
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <h4 className="font-medium text-sm">{achievement.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {achievement.description}
                  </p>
                  {!achievement.earned && achievement.progress && (
                    <div className="mt-2">
                      <Progress value={achievement.progress} className="h-1.5" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {achievement.progress}%
                      </p>
                    </div>
                  )}
                  {achievement.earned && (
                    <Badge className="mt-2" variant="secondary">
                      <Award className="h-3 w-3 mr-1" />
                      획득
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Credit Usage */}
      <Card>
        <CardHeader>
          <CardTitle>이번 달 크레딧 사용량</CardTitle>
          <CardDescription>
            무료 플랜: 월 30 크레딧 제공 | 현재 20/30 사용
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>사용량</span>
              <span className="font-medium">20/30 크레딧</span>
            </div>
            <Progress value={67} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>리셋까지 15일 남음</span>
              <Link
                href="/settings/subscription"
                className="text-primary hover:underline"
              >
                업그레이드하기
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
