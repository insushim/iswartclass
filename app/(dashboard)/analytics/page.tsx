'use client';

import { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Wand2,
  Users,
  Clock,
  Download,
  Calendar,
  PieChart,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

interface StatCard {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ElementType;
}

const stats: StatCard[] = [
  {
    title: '총 도안 생성',
    value: '248',
    change: '+12%',
    changeType: 'positive',
    icon: Wand2,
  },
  {
    title: '활동 학생',
    value: '86',
    change: '+5%',
    changeType: 'positive',
    icon: Users,
  },
  {
    title: '수업 시간',
    value: '42h',
    change: '이번 달',
    changeType: 'neutral',
    icon: Clock,
  },
  {
    title: '다운로드',
    value: '156',
    change: '+23%',
    changeType: 'positive',
    icon: Download,
  },
];

const techniqueUsage = [
  { name: '색칠하기', count: 85, percentage: 34 },
  { name: '만다라', count: 52, percentage: 21 },
  { name: '종이접기', count: 38, percentage: 15 },
  { name: '점잇기', count: 28, percentage: 11 },
  { name: '미로찾기', count: 25, percentage: 10 },
  { name: '기타', count: 20, percentage: 9 },
];

const themeUsage = [
  { name: '동물', count: 72, percentage: 29 },
  { name: '자연', count: 48, percentage: 19 },
  { name: '판타지', count: 35, percentage: 14 },
  { name: '탈것', count: 30, percentage: 12 },
  { name: '음식', count: 25, percentage: 10 },
  { name: '기타', count: 38, percentage: 16 },
];

const weeklyActivity = [
  { day: '월', count: 12 },
  { day: '화', count: 18 },
  { day: '수', count: 15 },
  { day: '목', count: 22 },
  { day: '금', count: 28 },
  { day: '토', count: 8 },
  { day: '일', count: 5 },
];

const classPerformance = [
  { name: '1-A반', students: 25, completed: 156, average: 6.2 },
  { name: '1-B반', students: 26, completed: 142, average: 5.5 },
  { name: '2-A반', students: 28, completed: 189, average: 6.8 },
  { name: '방과후 A반', students: 15, completed: 78, average: 5.2 },
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('month');

  const maxWeekly = Math.max(...weeklyActivity.map((d) => d.count));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            통계
          </h1>
          <p className="text-muted-foreground">
            도안 생성 및 수업 활동 통계를 확인하세요
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">이번 주</SelectItem>
              <SelectItem value="month">이번 달</SelectItem>
              <SelectItem value="quarter">이번 분기</SelectItem>
              <SelectItem value="year">올해</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            내보내기
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <Badge
                  variant="secondary"
                  className={
                    stat.changeType === 'positive'
                      ? 'bg-green-100 text-green-700'
                      : stat.changeType === 'negative'
                      ? 'bg-red-100 text-red-700'
                      : ''
                  }
                >
                  {stat.changeType === 'positive' && (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  )}
                  {stat.changeType === 'negative' && (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {stat.change}
                </Badge>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Activity */}
        <Card>
          <CardHeader>
            <CardTitle>주간 활동</CardTitle>
            <CardDescription>요일별 도안 생성 현황</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-48 gap-2">
              {weeklyActivity.map((day) => (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-primary rounded-t transition-all"
                    style={{
                      height: `${(day.count / maxWeekly) * 100}%`,
                      minHeight: '4px',
                    }}
                  />
                  <span className="text-xs text-muted-foreground">{day.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Technique Usage */}
        <Card>
          <CardHeader>
            <CardTitle>기법별 사용량</CardTitle>
            <CardDescription>가장 많이 사용된 미술 기법</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {techniqueUsage.map((tech) => (
              <div key={tech.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{tech.name}</span>
                  <span className="text-muted-foreground">
                    {tech.count}회 ({tech.percentage}%)
                  </span>
                </div>
                <Progress value={tech.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Theme Usage */}
        <Card>
          <CardHeader>
            <CardTitle>테마별 사용량</CardTitle>
            <CardDescription>가장 많이 사용된 테마</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {themeUsage.map((theme) => (
              <div key={theme.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{theme.name}</span>
                  <span className="text-muted-foreground">
                    {theme.count}회 ({theme.percentage}%)
                  </span>
                </div>
                <Progress value={theme.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Class Performance */}
        <Card>
          <CardHeader>
            <CardTitle>학급별 활동</CardTitle>
            <CardDescription>학급별 도안 완성 현황</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {classPerformance.map((cls) => (
                <div
                  key={cls.name}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{cls.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {cls.students}명 학생
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{cls.completed}</p>
                    <p className="text-sm text-muted-foreground">
                      평균 {cls.average}개/학생
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Credit Usage */}
      <Card>
        <CardHeader>
          <CardTitle>크레딧 사용 현황</CardTitle>
          <CardDescription>이번 달 크레딧 사용량</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center p-4 rounded-lg bg-muted">
              <p className="text-3xl font-bold">20</p>
              <p className="text-sm text-muted-foreground">사용 크레딧</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted">
              <p className="text-3xl font-bold">10</p>
              <p className="text-sm text-muted-foreground">남은 크레딧</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted">
              <p className="text-3xl font-bold">30</p>
              <p className="text-sm text-muted-foreground">월간 한도</p>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>사용량</span>
              <span className="font-medium">67%</span>
            </div>
            <Progress value={67} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              다음 달 1일에 크레딧이 리셋됩니다
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
