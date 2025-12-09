'use client';

import { useState, useEffect } from 'react';
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
  Loader2,
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
  title: string;
  description?: string;
  isPublic: boolean;
  shareCode?: string;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    name: string;
    class?: {
      id: string;
      name: string;
    };
  };
  _count?: {
    items: number;
  };
  items?: Array<{
    id: string;
    title: string;
    technique?: string;
    theme?: string;
    imageUrl?: string;
    completedAt?: string;
    rating?: number;
  }>;
}

export default function PortfolioPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/portfolio');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setPortfolios(data);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      toast.error('포트폴리오를 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSharePortfolio = (portfolio: Portfolio) => {
    const shareUrl = portfolio.shareCode
      ? `${window.location.origin}/portfolio/view/${portfolio.shareCode}`
      : `${window.location.origin}/portfolio/${portfolio.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('공유 링크가 복사되었습니다');
  };

  const handleDownloadPortfolio = (id: string) => {
    toast.success('PDF 다운로드를 시작합니다');
    // TODO: Implement PDF download
  };

  const handleDeletePortfolio = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/portfolio/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');

      setPortfolios(portfolios.filter(p => p.id !== id));
      toast.success('포트폴리오가 삭제되었습니다');
    } catch (error) {
      toast.error('삭제에 실패했습니다');
    }
  };

  const filteredPortfolios = portfolios.filter((portfolio) => {
    const matchesSearch =
      (portfolio.student?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      portfolio.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass =
      filterClass === 'all' || portfolio.student?.class?.id === filterClass;
    return matchesSearch && matchesClass;
  });

  const totalWorks = portfolios.reduce((sum, p) => sum + (p._count?.items || 0), 0);
  const uniqueClasses = portfolios
    .filter(p => p.student?.class?.id)
    .map(p => p.student!.class!)
    .filter((cls, index, self) => self.findIndex(c => c.id === cls.id) === index);

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
                <p className="text-2xl font-bold">{portfolios.length}</p>
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
                  {portfolios.filter((p) => p.isPublic).length}
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
              <SelectItem key={cls.id} value={cls.id}>
                {cls.name}
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
                {(portfolio.items || []).slice(0, 3).map((work, index) => (
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
                {(portfolio._count?.items || 0) < 3 &&
                  Array(3 - (portfolio._count?.items || 0))
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
                        {portfolio.student?.name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{portfolio.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {portfolio.student?.name || '학생 미지정'} · {portfolio.student?.class?.name || '학급 미지정'}
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
                        onClick={() => handleSharePortfolio(portfolio)}
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
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeletePortfolio(portfolio.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {portfolio.description || '설명 없음'}
                </p>

                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Image className="h-4 w-4" />
                    {portfolio._count?.items || 0}개 작품
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(portfolio.updatedAt).toLocaleDateString('ko-KR')}
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
                    onClick={() => handleSharePortfolio(portfolio)}
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
