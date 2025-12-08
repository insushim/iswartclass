'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Image,
  Plus,
  Search,
  Filter,
  Download,
  Share2,
  Eye,
  Calendar,
  Users,
  Award,
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink,
  Printer,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Portfolio {
  id: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  title: string;
  description: string;
  works: PortfolioWork[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PortfolioWork {
  id: string;
  title: string;
  technique: string;
  theme: string;
  thumbnail: string;
  completedAt: string;
  rating?: number;
  comment?: string;
}

const mockPortfolios: Portfolio[] = [
  {
    id: '1',
    studentId: '1',
    studentName: '김민준',
    studentClass: '1-A반',
    title: '민준이의 미술 작품집',
    description: '1학년 1학기 미술 활동 모음',
    works: [
      {
        id: '1',
        title: '가족 그림',
        technique: '색칠하기',
        theme: '가족',
        thumbnail: '/api/placeholder/300/300',
        completedAt: '2024-03-15',
        rating: 5,
      },
      {
        id: '2',
        title: '봄 꽃',
        technique: '만다라',
        theme: '자연',
        thumbnail: '/api/placeholder/300/300',
        completedAt: '2024-03-20',
        rating: 4,
      },
      {
        id: '3',
        title: '우리집 강아지',
        technique: '색칠하기',
        theme: '동물',
        thumbnail: '/api/placeholder/300/300',
        completedAt: '2024-03-25',
        rating: 5,
      },
    ],
    isPublic: true,
    createdAt: '2024-03-01',
    updatedAt: '2024-03-25',
  },
  {
    id: '2',
    studentId: '2',
    studentName: '이서연',
    studentClass: '1-A반',
    title: '서연이의 그림 일기',
    description: '매일 그리는 그림 일기',
    works: [
      {
        id: '4',
        title: '무지개 나라',
        technique: '패턴',
        theme: '판타지',
        thumbnail: '/api/placeholder/300/300',
        completedAt: '2024-03-10',
        rating: 5,
      },
      {
        id: '5',
        title: '공룡 세계',
        technique: '점잇기',
        theme: '동물',
        thumbnail: '/api/placeholder/300/300',
        completedAt: '2024-03-18',
        rating: 4,
      },
    ],
    isPublic: true,
    createdAt: '2024-03-01',
    updatedAt: '2024-03-18',
  },
  {
    id: '3',
    studentId: '3',
    studentName: '박지호',
    studentClass: '1-B반',
    title: '지호의 종이접기 컬렉션',
    description: '종이접기 작품 모음',
    works: [
      {
        id: '6',
        title: '비행기',
        technique: '종이접기',
        theme: '탈것',
        thumbnail: '/api/placeholder/300/300',
        completedAt: '2024-03-12',
        rating: 5,
      },
    ],
    isPublic: false,
    createdAt: '2024-03-01',
    updatedAt: '2024-03-12',
  },
];

export default function PortfolioPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);

  const handleSharePortfolio = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/portfolio/view/${id}`);
    toast.success('공유 링크가 복사되었습니다');
  };

  const handleDownloadPortfolio = (id: string) => {
    toast.success('PDF 다운로드를 시작합니다');
  };

  const filteredPortfolios = mockPortfolios.filter((portfolio) => {
    const matchesSearch =
      portfolio.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      portfolio.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass =
      filterClass === 'all' || portfolio.studentClass === filterClass;
    return matchesSearch && matchesClass;
  });

  const totalWorks = mockPortfolios.reduce((sum, p) => sum + p.works.length, 0);
  const uniqueClasses = [...new Set(mockPortfolios.map((p) => p.studentClass))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Image className="h-6 w-6 text-primary" />
            포트폴리오
          </h1>
          <p className="text-muted-foreground">
            학생들의 작품을 모아 포트폴리오로 관리하세요
          </p>
        </div>
        <Button asChild>
          <Link href="/portfolio/new">
            <Plus className="h-4 w-4 mr-2" />
            새 포트폴리오
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Image className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockPortfolios.length}</p>
                <p className="text-sm text-muted-foreground">전체 포트폴리오</p>
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
                <p className="text-2xl font-bold">{totalWorks}</p>
                <p className="text-sm text-muted-foreground">총 작품 수</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-100">
                <Eye className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {mockPortfolios.filter((p) => p.isPublic).length}
                </p>
                <p className="text-sm text-muted-foreground">공개 포트폴리오</p>
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
                <p className="text-2xl font-bold">{uniqueClasses.length}</p>
                <p className="text-sm text-muted-foreground">참여 학급</p>
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
            placeholder="학생 또는 포트폴리오 검색..."
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
      </div>

      {/* Portfolio Grid */}
      {filteredPortfolios.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPortfolios.map((portfolio) => (
            <Card
              key={portfolio.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Preview Grid */}
              <div className="grid grid-cols-3 gap-0.5 bg-muted">
                {portfolio.works.slice(0, 3).map((work, index) => (
                  <div
                    key={work.id}
                    className="aspect-square bg-muted-foreground/10 flex items-center justify-center"
                  >
                    <span className="text-2xl">
                      {work.technique === '색칠하기'
                        ? '🎨'
                        : work.technique === '만다라'
                        ? '🔵'
                        : work.technique === '종이접기'
                        ? '📄'
                        : work.technique === '점잇기'
                        ? '✏️'
                        : '🖼️'}
                    </span>
                  </div>
                ))}
                {portfolio.works.length < 3 &&
                  Array(3 - portfolio.works.length)
                    .fill(null)
                    .map((_, index) => (
                      <div
                        key={`empty-${index}`}
                        className="aspect-square bg-muted"
                      />
                    ))}
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {portfolio.studentName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{portfolio.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {portfolio.studentName} · {portfolio.studentClass}
                      </p>
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
                        <Link href={`/portfolio/${portfolio.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          상세보기
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/portfolio/${portfolio.id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          수정
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleSharePortfolio(portfolio.id)}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        공유
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDownloadPortfolio(portfolio.id)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        PDF 다운로드
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {portfolio.description}
                </p>

                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Image className="h-4 w-4" />
                    {portfolio.works.length}개 작품
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {portfolio.updatedAt}
                  </span>
                </div>

                <div className="flex gap-2 mt-4">
                  <Badge variant={portfolio.isPublic ? 'default' : 'secondary'}>
                    {portfolio.isPublic ? '공개' : '비공개'}
                  </Badge>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    asChild
                  >
                    <Link href={`/portfolio/${portfolio.id}`}>보기</Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSharePortfolio(portfolio.id)}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadPortfolio(portfolio.id)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Image className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 font-medium">포트폴리오가 없습니다</h3>
          <p className="text-sm text-muted-foreground mt-1">
            학생의 작품을 모아 포트폴리오를 만들어보세요
          </p>
          <Button asChild className="mt-4">
            <Link href="/portfolio/new">
              <Plus className="h-4 w-4 mr-2" />
              새 포트폴리오
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
