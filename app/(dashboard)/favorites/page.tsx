'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Heart,
  Search,
  Grid3X3,
  List,
  Download,
  MoreVertical,
  Trash2,
  Share2,
  Copy,
  Clock,
  Filter,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { toast } from 'sonner';

interface FavoriteSheet {
  id: string;
  title: string;
  technique: string;
  theme: string;
  ageGroup: string;
  thumbnail: string;
  createdAt: string;
  addedAt: string;
}

const mockFavorites: FavoriteSheet[] = [
  {
    id: '1',
    title: '귀여운 고양이 색칠하기',
    technique: '색칠하기',
    theme: '동물',
    ageGroup: '유아',
    thumbnail: '/api/placeholder/400/400',
    createdAt: '2024-01-15',
    addedAt: '2024-01-15',
  },
  {
    id: '3',
    title: '종이접기 비행기 도안',
    technique: '종이접기',
    theme: '탈것',
    ageGroup: '유아',
    thumbnail: '/api/placeholder/400/400',
    createdAt: '2024-01-13',
    addedAt: '2024-01-14',
  },
  {
    id: '6',
    title: '패턴 따라 그리기',
    technique: '패턴',
    theme: '기하학',
    ageGroup: '고학년',
    thumbnail: '/api/placeholder/400/400',
    createdAt: '2024-01-10',
    addedAt: '2024-01-12',
  },
];

export default function FavoritesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const handleRemoveFavorite = (id: string) => {
    toast.success('즐겨찾기에서 제거되었습니다');
  };

  const filteredFavorites = mockFavorites.filter((sheet) =>
    sheet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sheet.technique.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sheet.theme.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500 fill-red-500" />
            즐겨찾기
          </h1>
          <p className="text-muted-foreground">
            자주 사용하는 도안을 모아두세요
          </p>
        </div>
        <Badge variant="outline" className="w-fit">
          {mockFavorites.length}개의 즐겨찾기
        </Badge>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="즐겨찾기 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">최근 추가순</SelectItem>
              <SelectItem value="oldest">오래된 순</SelectItem>
              <SelectItem value="name">이름순</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Favorites Grid/List */}
      {filteredFavorites.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredFavorites.map((sheet) => (
              <Card
                key={sheet.id}
                className="group overflow-hidden cursor-pointer transition-all hover:shadow-lg"
              >
                <div className="relative aspect-square bg-muted">
                  <div className="absolute inset-0 flex items-center justify-center text-4xl text-muted-foreground">
                    {sheet.technique === '색칠하기'
                      ? '🎨'
                      : sheet.technique === '종이접기'
                      ? '📄'
                      : '✏️'}
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon-sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          다운로드
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          복제
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share2 className="h-4 w-4 mr-2" />
                          공유
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleRemoveFavorite(sheet.id)}
                        >
                          <Heart className="h-4 w-4 mr-2" />
                          즐겨찾기 해제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <button
                    onClick={() => handleRemoveFavorite(sheet.id)}
                    className="absolute bottom-2 right-2"
                  >
                    <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                  </button>
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium text-sm truncate">{sheet.title}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {sheet.technique}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {sheet.theme}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    <Clock className="inline h-3 w-3 mr-1" />
                    {sheet.addedAt} 추가
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFavorites.map((sheet) => (
              <Card key={sheet.id} className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center gap-4 p-3">
                  <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center text-2xl shrink-0">
                    {sheet.technique === '색칠하기'
                      ? '🎨'
                      : sheet.technique === '종이접기'
                      ? '📄'
                      : '✏️'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{sheet.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {sheet.technique}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {sheet.theme}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {sheet.ageGroup}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {sheet.addedAt} 추가
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleRemoveFavorite(sheet.id)}
                    >
                      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                    </Button>
                    <Button variant="ghost" size="icon-sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          복제
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share2 className="h-4 w-4 mr-2" />
                          공유
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleRemoveFavorite(sheet.id)}
                        >
                          <Heart className="h-4 w-4 mr-2" />
                          즐겨찾기 해제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-12">
          <Heart className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 font-medium">즐겨찾기가 비어있습니다</h3>
          <p className="text-sm text-muted-foreground mt-1">
            라이브러리에서 도안을 즐겨찾기에 추가해보세요
          </p>
          <Button asChild className="mt-4" variant="outline">
            <Link href="/library">라이브러리로 이동</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
