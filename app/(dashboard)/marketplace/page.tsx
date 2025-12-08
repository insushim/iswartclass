'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Store,
  Search,
  Filter,
  Heart,
  Download,
  Star,
  ShoppingCart,
  Eye,
  TrendingUp,
  Award,
  Tag,
  Grid3X3,
  List,
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
import { toast } from 'sonner';

interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  technique: string;
  theme: string;
  ageGroup: string;
  price: number;
  isFree: boolean;
  thumbnail: string;
  seller: {
    id: string;
    name: string;
    avatar?: string;
    verified: boolean;
  };
  downloads: number;
  rating: number;
  reviews: number;
  createdAt: string;
  isFavorite: boolean;
  tags: string[];
}

const mockItems: MarketplaceItem[] = [
  {
    id: '1',
    title: '동물 친구들 색칠 컬렉션',
    description: '귀여운 동물 캐릭터 20종 색칠 도안 세트',
    technique: '색칠하기',
    theme: '동물',
    ageGroup: '유아',
    price: 0,
    isFree: true,
    thumbnail: '/api/placeholder/400/400',
    seller: {
      id: '1',
      name: '김선생',
      verified: true,
    },
    downloads: 1250,
    rating: 4.9,
    reviews: 86,
    createdAt: '2024-01-15',
    isFavorite: false,
    tags: ['인기', '무료'],
  },
  {
    id: '2',
    title: '계절별 만다라 세트',
    description: '봄, 여름, 가을, 겨울 테마 만다라 40종',
    technique: '만다라',
    theme: '계절',
    ageGroup: '저학년',
    price: 5000,
    isFree: false,
    thumbnail: '/api/placeholder/400/400',
    seller: {
      id: '2',
      name: '박아트',
      verified: true,
    },
    downloads: 856,
    rating: 4.8,
    reviews: 62,
    createdAt: '2024-01-10',
    isFavorite: true,
    tags: ['베스트셀러'],
  },
  {
    id: '3',
    title: '종이접기 마스터 가이드',
    description: '초급부터 고급까지 100가지 종이접기',
    technique: '종이접기',
    theme: '다양함',
    ageGroup: '전체',
    price: 12000,
    isFree: false,
    thumbnail: '/api/placeholder/400/400',
    seller: {
      id: '3',
      name: '이종이',
      verified: false,
    },
    downloads: 423,
    rating: 4.7,
    reviews: 34,
    createdAt: '2024-01-08',
    isFavorite: false,
    tags: ['프리미엄'],
  },
  {
    id: '4',
    title: '공룡 세계 점잇기',
    description: '티라노사우르스부터 트리케라톱스까지',
    technique: '점잇기',
    theme: '동물',
    ageGroup: '유아',
    price: 0,
    isFree: true,
    thumbnail: '/api/placeholder/400/400',
    seller: {
      id: '1',
      name: '김선생',
      verified: true,
    },
    downloads: 2100,
    rating: 4.9,
    reviews: 128,
    createdAt: '2024-01-05',
    isFavorite: true,
    tags: ['인기', '무료'],
  },
  {
    id: '5',
    title: '미로 찾기 어드벤처',
    description: '난이도별 50가지 미로 찾기',
    technique: '미로찾기',
    theme: '판타지',
    ageGroup: '저학년',
    price: 3000,
    isFree: false,
    thumbnail: '/api/placeholder/400/400',
    seller: {
      id: '4',
      name: '최미로',
      verified: true,
    },
    downloads: 678,
    rating: 4.6,
    reviews: 45,
    createdAt: '2024-01-03',
    isFavorite: false,
    tags: ['신규'],
  },
  {
    id: '6',
    title: '한글 따라쓰기',
    description: '자음, 모음부터 단어까지 체계적 학습',
    technique: '따라쓰기',
    theme: '교육',
    ageGroup: '유아',
    price: 8000,
    isFree: false,
    thumbnail: '/api/placeholder/400/400',
    seller: {
      id: '5',
      name: '정한글',
      verified: true,
    },
    downloads: 1890,
    rating: 4.8,
    reviews: 156,
    createdAt: '2024-01-01',
    isFavorite: false,
    tags: ['베스트셀러', '교육'],
  },
];

const categories = ['전체', '색칠하기', '만다라', '종이접기', '점잇기', '미로찾기', '따라쓰기'];

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('전체');
  const [filterPrice, setFilterPrice] = useState<string>('all');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleToggleFavorite = (id: string) => {
    toast.success('찜 목록이 업데이트되었습니다');
  };

  const handlePurchase = (item: MarketplaceItem) => {
    if (item.isFree) {
      toast.success('다운로드가 시작됩니다');
    } else {
      toast.success('장바구니에 추가되었습니다');
    }
  };

  const filteredItems = mockItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === '전체' || item.technique === filterCategory;
    const matchesPrice =
      filterPrice === 'all' ||
      (filterPrice === 'free' && item.isFree) ||
      (filterPrice === 'paid' && !item.isFree);
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const totalDownloads = mockItems.reduce((sum, item) => sum + item.downloads, 0);
  const freeItems = mockItems.filter((item) => item.isFree).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" />
            마켓플레이스
          </h1>
          <p className="text-muted-foreground">
            다른 선생님들이 만든 도안을 찾아보세요
          </p>
        </div>
        <Button asChild>
          <Link href="/marketplace/sell">
            내 도안 판매하기
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Store className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockItems.length}</p>
                <p className="text-sm text-muted-foreground">전체 상품</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-100">
                <Tag className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{freeItems}</p>
                <p className="text-sm text-muted-foreground">무료 도안</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <Download className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalDownloads.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">총 다운로드</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-100">
                <Award className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {mockItems.filter((i) => i.seller.verified).length}
                </p>
                <p className="text-sm text-muted-foreground">인증 판매자</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={filterCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterCategory(category)}
            className="shrink-0"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="도안 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterPrice} onValueChange={setFilterPrice}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="가격" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="free">무료</SelectItem>
            <SelectItem value="paid">유료</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="정렬" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">인기순</SelectItem>
            <SelectItem value="newest">최신순</SelectItem>
            <SelectItem value="rating">평점순</SelectItem>
            <SelectItem value="price-low">낮은 가격순</SelectItem>
            <SelectItem value="price-high">높은 가격순</SelectItem>
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

      {/* Items Grid */}
      {filteredItems.length > 0 ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'space-y-4'
          }
        >
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className={`overflow-hidden hover:shadow-lg transition-shadow ${
                viewMode === 'list' ? 'flex' : ''
              }`}
            >
              {/* Thumbnail */}
              <div
                className={`relative bg-muted ${
                  viewMode === 'list' ? 'w-48 shrink-0' : 'aspect-square'
                }`}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl">
                    {item.technique === '색칠하기'
                      ? '🎨'
                      : item.technique === '만다라'
                      ? '🔵'
                      : item.technique === '종이접기'
                      ? '📄'
                      : item.technique === '점잇기'
                      ? '✏️'
                      : item.technique === '미로찾기'
                      ? '🌀'
                      : '📝'}
                  </span>
                </div>
                {/* Tags */}
                <div className="absolute top-2 left-2 flex gap-1">
                  {item.tags.slice(0, 2).map((tag) => (
                    <Badge
                      key={tag}
                      className={
                        tag === '무료'
                          ? 'bg-green-500'
                          : tag === '베스트셀러'
                          ? 'bg-yellow-500'
                          : tag === '신규'
                          ? 'bg-blue-500'
                          : tag === '프리미엄'
                          ? 'bg-purple-500'
                          : ''
                      }
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                {/* Favorite */}
                <button
                  onClick={() => handleToggleFavorite(item.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white"
                >
                  <Heart
                    className={`h-4 w-4 ${
                      item.isFavorite
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-600'
                    }`}
                  />
                </button>
              </div>

              <CardContent className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                <div className="flex items-start gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={item.seller.avatar} />
                    <AvatarFallback>{item.seller.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-muted-foreground">
                        {item.seller.name}
                      </span>
                      {item.seller.verified && (
                        <Award className="h-3.5 w-3.5 text-blue-500" />
                      )}
                    </div>
                  </div>
                </div>

                <Link href={`/marketplace/${item.id}`}>
                  <h3 className="font-semibold mt-2 hover:text-primary transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                </Link>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {item.description}
                </p>

                <div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {item.rating}
                  </span>
                  <span className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    {item.downloads.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <span className="text-lg font-bold">
                    {item.isFree ? (
                      <span className="text-green-600">무료</span>
                    ) : (
                      `₩${item.price.toLocaleString()}`
                    )}
                  </span>
                  <Button size="sm" onClick={() => handlePurchase(item)}>
                    {item.isFree ? (
                      <>
                        <Download className="h-4 w-4 mr-1" />
                        다운로드
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        구매
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Store className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 font-medium">상품이 없습니다</h3>
          <p className="text-sm text-muted-foreground mt-1">
            검색어나 필터를 변경해보세요
          </p>
        </div>
      )}
    </div>
  );
}
