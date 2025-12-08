'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  PlayCircle,
  Search,
  Filter,
  Clock,
  Eye,
  BookOpen,
  Star,
  ChevronRight,
  Play,
  Bookmark,
  Share2,
  Award,
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
import { toast } from 'sonner';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  technique: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  steps: number;
  thumbnail: string;
  views: number;
  rating: number;
  category: string;
  isCompleted?: boolean;
  progress?: number;
  isSaved?: boolean;
}

const mockTutorials: Tutorial[] = [
  {
    id: '1',
    title: '기초 색칠하기 테크닉',
    description: '색연필과 크레파스를 사용한 기초 색칠 기법을 배워보세요',
    technique: '색칠하기',
    difficulty: 'beginner',
    duration: 15,
    steps: 8,
    thumbnail: '/api/placeholder/400/225',
    views: 1250,
    rating: 4.8,
    category: '기초',
    progress: 60,
    isSaved: true,
  },
  {
    id: '2',
    title: '만다라 패턴 그리기',
    description: '아름다운 만다라 패턴을 단계별로 그려보세요',
    technique: '만다라',
    difficulty: 'intermediate',
    duration: 25,
    steps: 12,
    thumbnail: '/api/placeholder/400/225',
    views: 890,
    rating: 4.9,
    category: '패턴',
    isSaved: false,
  },
  {
    id: '3',
    title: '종이접기 - 학 접기',
    description: '전통적인 학 접기를 배워보세요',
    technique: '종이접기',
    difficulty: 'intermediate',
    duration: 20,
    steps: 15,
    thumbnail: '/api/placeholder/400/225',
    views: 2100,
    rating: 4.7,
    category: '종이접기',
    isCompleted: true,
    isSaved: true,
  },
  {
    id: '4',
    title: '수채화 기초',
    description: '물감 농도 조절과 그라데이션 기법',
    technique: '수채화',
    difficulty: 'beginner',
    duration: 30,
    steps: 10,
    thumbnail: '/api/placeholder/400/225',
    views: 1580,
    rating: 4.6,
    category: '회화',
    isSaved: false,
  },
  {
    id: '5',
    title: '점잇기 마스터',
    description: '복잡한 점잇기 도안 완성하기',
    technique: '점잇기',
    difficulty: 'beginner',
    duration: 10,
    steps: 5,
    thumbnail: '/api/placeholder/400/225',
    views: 3200,
    rating: 4.9,
    category: '기초',
    progress: 100,
    isCompleted: true,
    isSaved: true,
  },
  {
    id: '6',
    title: '고급 만다라 디자인',
    description: '복잡한 기하학적 패턴을 활용한 만다라',
    technique: '만다라',
    difficulty: 'advanced',
    duration: 45,
    steps: 20,
    thumbnail: '/api/placeholder/400/225',
    views: 456,
    rating: 4.5,
    category: '패턴',
    isSaved: false,
  },
];

const difficultyConfig = {
  beginner: { label: '초급', color: 'bg-green-100 text-green-700' },
  intermediate: { label: '중급', color: 'bg-yellow-100 text-yellow-700' },
  advanced: { label: '고급', color: 'bg-red-100 text-red-700' },
};

const categories = ['전체', '기초', '패턴', '종이접기', '회화'];

export default function TutorialsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('전체');
  const [activeTab, setActiveTab] = useState('all');

  const handleToggleSave = (id: string) => {
    toast.success('저장 목록이 업데이트되었습니다');
  };

  const filteredTutorials = mockTutorials.filter((tutorial) => {
    const matchesSearch =
      tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutorial.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutorial.technique.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty =
      filterDifficulty === 'all' || tutorial.difficulty === filterDifficulty;
    const matchesCategory =
      filterCategory === '전체' || tutorial.category === filterCategory;

    if (activeTab === 'saved') {
      return matchesSearch && matchesDifficulty && matchesCategory && tutorial.isSaved;
    }
    if (activeTab === 'in-progress') {
      return (
        matchesSearch &&
        matchesDifficulty &&
        matchesCategory &&
        tutorial.progress !== undefined &&
        !tutorial.isCompleted
      );
    }
    if (activeTab === 'completed') {
      return matchesSearch && matchesDifficulty && matchesCategory && tutorial.isCompleted;
    }
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  const completedCount = mockTutorials.filter((t) => t.isCompleted).length;
  const inProgressCount = mockTutorials.filter(
    (t) => t.progress !== undefined && !t.isCompleted
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <PlayCircle className="h-6 w-6 text-primary" />
            튜토리얼
          </h1>
          <p className="text-muted-foreground">
            미술 기법을 단계별로 배워보세요
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Award className="h-3.5 w-3.5" />
            {completedCount}개 완료
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3.5 w-3.5" />
            {inProgressCount}개 진행중
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <PlayCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockTutorials.length}</p>
                <p className="text-sm text-muted-foreground">전체 튜토리얼</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-100">
                <Award className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedCount}</p>
                <p className="text-sm text-muted-foreground">완료</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-100">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inProgressCount}</p>
                <p className="text-sm text-muted-foreground">진행중</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <Bookmark className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {mockTutorials.filter((t) => t.isSaved).length}
                </p>
                <p className="text-sm text-muted-foreground">저장됨</p>
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
            placeholder="튜토리얼 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="난이도" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모든 난이도</SelectItem>
            <SelectItem value="beginner">초급</SelectItem>
            <SelectItem value="intermediate">중급</SelectItem>
            <SelectItem value="advanced">고급</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="카테고리" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="in-progress">진행중</TabsTrigger>
          <TabsTrigger value="completed">완료</TabsTrigger>
          <TabsTrigger value="saved">저장됨</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredTutorials.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredTutorials.map((tutorial) => (
                <Card
                  key={tutorial.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-muted">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-6xl">
                        {tutorial.technique === '색칠하기'
                          ? '🎨'
                          : tutorial.technique === '만다라'
                          ? '🔵'
                          : tutorial.technique === '종이접기'
                          ? '📄'
                          : tutorial.technique === '수채화'
                          ? '💧'
                          : tutorial.technique === '점잇기'
                          ? '✏️'
                          : '🖼️'}
                      </div>
                    </div>
                    {tutorial.isCompleted && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-green-500">
                          <Award className="h-3 w-3 mr-1" />
                          완료
                        </Badge>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        variant="secondary"
                        size="icon-sm"
                        onClick={() => handleToggleSave(tutorial.id)}
                      >
                        <Bookmark
                          className={`h-4 w-4 ${
                            tutorial.isSaved ? 'fill-current' : ''
                          }`}
                        />
                      </Button>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/30">
                      <Button size="lg" className="gap-2" asChild>
                        <Link href={`/tutorials/${tutorial.id}`}>
                          <Play className="h-5 w-5" />
                          {tutorial.progress ? '계속하기' : '시작하기'}
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold line-clamp-1">
                          {tutorial.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {tutorial.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <Badge
                        className={difficultyConfig[tutorial.difficulty].color}
                      >
                        {difficultyConfig[tutorial.difficulty].label}
                      </Badge>
                      <Badge variant="outline">{tutorial.technique}</Badge>
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {tutorial.duration}분
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {tutorial.steps}단계
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {tutorial.rating}
                      </span>
                    </div>

                    {tutorial.progress !== undefined && !tutorial.isCompleted && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">진행률</span>
                          <span className="font-medium">{tutorial.progress}%</span>
                        </div>
                        <Progress value={tutorial.progress} className="h-2" />
                      </div>
                    )}

                    <Button className="w-full mt-4" asChild>
                      <Link href={`/tutorials/${tutorial.id}`}>
                        {tutorial.isCompleted ? (
                          <>다시 보기</>
                        ) : tutorial.progress ? (
                          <>계속하기</>
                        ) : (
                          <>시작하기</>
                        )}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <PlayCircle className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 font-medium">튜토리얼이 없습니다</h3>
              <p className="text-sm text-muted-foreground mt-1">
                검색어나 필터를 변경해보세요
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
