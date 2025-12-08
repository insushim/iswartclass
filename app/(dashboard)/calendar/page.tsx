'use client';

import { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Users,
  BookOpen,
  MoreVertical,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'class' | 'curriculum' | 'event';
  className?: string;
  description?: string;
}

const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: '1-A반 미술 수업',
    date: '2024-01-15',
    time: '14:00-14:40',
    type: 'class',
    className: '1-A반',
    description: '봄 꽃 색칠하기',
  },
  {
    id: '2',
    title: '1-B반 미술 수업',
    date: '2024-01-16',
    time: '14:00-14:40',
    type: 'class',
    className: '1-B반',
    description: '만다라 그리기',
  },
  {
    id: '3',
    title: '2-A반 미술 수업',
    date: '2024-01-15',
    time: '15:00-15:40',
    type: 'class',
    className: '2-A반',
    description: '종이접기 - 비행기',
  },
  {
    id: '4',
    title: '커리큘럼 검토',
    date: '2024-01-17',
    time: '10:00-11:00',
    type: 'curriculum',
    description: '2학기 커리큘럼 계획 회의',
  },
  {
    id: '5',
    title: '학생 작품 전시회',
    date: '2024-01-20',
    time: '09:00-12:00',
    type: 'event',
    description: '1학기 미술 작품 전시회',
  },
];

const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
const months = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월'
];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [isNewEventOpen, setIsNewEventOpen] = useState(false);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (number | null)[] = [];

    // Add empty days for the start of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Add the days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const getEventsForDate = (day: number | null) => {
    if (!day) return [];
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return mockEvents.filter((event) => event.date === dateStr);
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleCreateEvent = () => {
    toast.success('일정이 추가되었습니다');
    setIsNewEventOpen(false);
  };

  const days = getDaysInMonth(currentDate);
  const today = new Date();
  const isToday = (day: number | null) => {
    if (!day) return false;
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const typeColors = {
    class: 'bg-blue-100 text-blue-700 border-blue-200',
    curriculum: 'bg-purple-100 text-purple-700 border-purple-200',
    event: 'bg-green-100 text-green-700 border-green-200',
  };

  const upcomingEvents = mockEvents
    .filter((event) => new Date(event.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-primary" />
            캘린더
          </h1>
          <p className="text-muted-foreground">
            수업 일정을 관리하세요
          </p>
        </div>
        <Dialog open={isNewEventOpen} onOpenChange={setIsNewEventOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              일정 추가
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 일정 추가</DialogTitle>
              <DialogDescription>
                새로운 수업 또는 이벤트를 추가하세요
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="eventTitle">제목</Label>
                <Input id="eventTitle" placeholder="일정 제목" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eventDate">날짜</Label>
                  <Input id="eventDate" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventTime">시간</Label>
                  <Input id="eventTime" type="time" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventType">유형</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="유형 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="class">수업</SelectItem>
                    <SelectItem value="curriculum">커리큘럼</SelectItem>
                    <SelectItem value="event">이벤트</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewEventOpen(false)}>
                취소
              </Button>
              <Button onClick={handleCreateEvent}>추가</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Calendar */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={prevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-semibold min-w-[120px] text-center">
                  {currentDate.getFullYear()}년 {months[currentDate.getMonth()]}
                </h2>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={goToToday}>
                  오늘
                </Button>
                <Select value={view} onValueChange={(v) => setView(v as 'month' | 'week')}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">월</SelectItem>
                    <SelectItem value="week">주</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className={`text-center text-sm font-medium py-2 ${
                    day === '일' ? 'text-red-500' : day === '토' ? 'text-blue-500' : ''
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                const events = getEventsForDate(day);
                return (
                  <div
                    key={index}
                    className={`min-h-[100px] p-1 border rounded-lg ${
                      day ? 'bg-card hover:bg-muted/50 cursor-pointer' : 'bg-muted/30'
                    } ${isToday(day) ? 'border-primary' : ''}`}
                  >
                    {day && (
                      <>
                        <div
                          className={`text-sm font-medium mb-1 ${
                            isToday(day)
                              ? 'bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center'
                              : index % 7 === 0
                              ? 'text-red-500'
                              : index % 7 === 6
                              ? 'text-blue-500'
                              : ''
                          }`}
                        >
                          {day}
                        </div>
                        <div className="space-y-1">
                          {events.slice(0, 2).map((event) => (
                            <div
                              key={event.id}
                              className={`text-xs p-1 rounded truncate border ${
                                typeColors[event.type]
                              }`}
                            >
                              {event.title}
                            </div>
                          ))}
                          {events.length > 2 && (
                            <div className="text-xs text-muted-foreground text-center">
                              +{events.length - 2}개
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>다가오는 일정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3 border rounded-lg"
                >
                  <div
                    className={`w-1 h-full rounded-full ${
                      event.type === 'class'
                        ? 'bg-blue-500'
                        : event.type === 'curriculum'
                        ? 'bg-purple-500'
                        : 'bg-green-500'
                    }`}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {event.date} {event.time}
                    </p>
                    {event.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {upcomingEvents.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  예정된 일정이 없습니다
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>일정 유형</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm">수업</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-sm">커리큘럼</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm">이벤트</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
