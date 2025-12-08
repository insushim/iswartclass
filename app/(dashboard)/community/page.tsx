'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Plus,
  Search,
  ThumbsUp,
  MessageCircle,
  Eye,
  Award,
  TrendingUp,
  Clock,
  Pin,
  Tag,
  Filter,
  MoreVertical,
  Bookmark,
  Share2,
  Flag,
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
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
  };
  category: string;
  tags: string[];
  likes: number;
  comments: number;
  views: number;
  isPinned: boolean;
  isLiked: boolean;
  isSaved: boolean;
  createdAt: string;
}

const mockPosts: Post[] = [
  {
    id: '1',
    title: '🎨 1학기 미술 수업 아이디어 공유합니다!',
    content:
      '안녕하세요! 이번 학기에 진행할 미술 수업 아이디어를 공유드려요. 특히 저학년 학생들에게 좋은 반응을 얻은 활동들입니다...',
    author: {
      id: '1',
      name: '김선생',
      role: '초등교사',
    },
    category: '수업 아이디어',
    tags: ['수업팁', '저학년', '색칠하기'],
    likes: 128,
    comments: 24,
    views: 1520,
    isPinned: true,
    isLiked: true,
    isSaved: true,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    title: '만다라 활동 자료 무료 배포합니다',
    content:
      '제가 직접 만든 만다라 도안 20종입니다. 자유롭게 사용하셔도 됩니다. 출처만 남겨주세요!',
    author: {
      id: '2',
      name: '박아트',
      role: '미술강사',
    },
    category: '자료 공유',
    tags: ['만다라', '무료자료', '도안'],
    likes: 256,
    comments: 42,
    views: 3240,
    isPinned: false,
    isLiked: false,
    isSaved: true,
    createdAt: '2024-01-14',
  },
  {
    id: '3',
    title: '종이접기 수업 어떻게 진행하시나요?',
    content:
      '종이접기 수업을 처음 진행하는데요, 어떤 순서로 가르치면 좋을지 조언 부탁드립니다.',
    author: {
      id: '3',
      name: '이새내기',
      role: '신규교사',
    },
    category: '질문',
    tags: ['종이접기', '수업방법', '질문'],
    likes: 12,
    comments: 18,
    views: 456,
    isPinned: false,
    isLiked: false,
    isSaved: false,
    createdAt: '2024-01-13',
  },
  {
    id: '4',
    title: '학생들 작품 전시회 후기 & 팁',
    content:
      '지난주에 학생들 작품 전시회를 진행했어요. 준비하면서 알게 된 팁들을 공유합니다!',
    author: {
      id: '4',
      name: '최전시',
      role: '초등교사',
    },
    category: '후기',
    tags: ['전시회', '학교행사', '후기'],
    likes: 89,
    comments: 15,
    views: 892,
    isPinned: false,
    isLiked: true,
    isSaved: false,
    createdAt: '2024-01-12',
  },
  {
    id: '5',
    title: 'ArtSheet Pro 도안 생성 꿀팁 모음',
    content:
      'AI 도안 생성할 때 프롬프트 작성하는 팁을 정리해봤어요. 원하는 결과물을 얻는 방법!',
    author: {
      id: '5',
      name: '정AI',
      role: '방과후강사',
    },
    category: '팁',
    tags: ['AI도안', '꿀팁', '프롬프트'],
    likes: 167,
    comments: 31,
    views: 2100,
    isPinned: false,
    isLiked: false,
    isSaved: false,
    createdAt: '2024-01-11',
  },
];

const categories = ['전체', '수업 아이디어', '자료 공유', '질문', '후기', '팁', '잡담'];

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('전체');
  const [sortBy, setSortBy] = useState('latest');

  const handleToggleLike = (id: string) => {
    toast.success('좋아요가 업데이트되었습니다');
  };

  const handleToggleSave = (id: string) => {
    toast.success('저장 목록이 업데이트되었습니다');
  };

  const filteredPosts = mockPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === '전체' || post.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const pinnedPosts = filteredPosts.filter((post) => post.isPinned);
  const regularPosts = filteredPosts.filter((post) => !post.isPinned);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            커뮤니티
          </h1>
          <p className="text-muted-foreground">
            다른 선생님들과 경험과 자료를 공유하세요
          </p>
        </div>
        <Button asChild>
          <Link href="/community/new">
            <Plus className="h-4 w-4 mr-2" />
            글 작성하기
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockPosts.length}</p>
                <p className="text-sm text-muted-foreground">전체 게시글</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <MessageCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {mockPosts.reduce((sum, p) => sum + p.comments, 0)}
                </p>
                <p className="text-sm text-muted-foreground">총 댓글</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-100">
                <ThumbsUp className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {mockPosts.reduce((sum, p) => sum + p.likes, 0)}
                </p>
                <p className="text-sm text-muted-foreground">총 좋아요</p>
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
                  {mockPosts.reduce((sum, p) => sum + p.views, 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">총 조회수</p>
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
            placeholder="게시글 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="정렬" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">최신순</SelectItem>
            <SelectItem value="popular">인기순</SelectItem>
            <SelectItem value="comments">댓글순</SelectItem>
            <SelectItem value="views">조회순</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {/* Pinned Posts */}
        {pinnedPosts.length > 0 && (
          <div className="space-y-2">
            {pinnedPosts.map((post) => (
              <Card key={post.id} className="border-primary/50 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.author.avatar} />
                      <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="gap-1">
                          <Pin className="h-3 w-3" />
                          공지
                        </Badge>
                        <Badge variant="outline">{post.category}</Badge>
                      </div>
                      <Link
                        href={`/community/${post.id}`}
                        className="font-semibold hover:text-primary transition-colors mt-1 block"
                      >
                        {post.title}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{post.author.name}</span>
                        <span>{post.createdAt}</span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3.5 w-3.5" />
                          {post.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3.5 w-3.5" />
                          {post.comments}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          {post.views}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Regular Posts */}
        {regularPosts.length > 0 ? (
          <div className="space-y-2">
            {regularPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.author.avatar} />
                      <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{post.category}</Badge>
                        {post.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                      <Link
                        href={`/community/${post.id}`}
                        className="font-semibold hover:text-primary transition-colors mt-1 block"
                      >
                        {post.title}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {post.content}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{post.author.name}</span>
                          <span className="text-xs">{post.author.role}</span>
                          <span>{post.createdAt}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1"
                            onClick={() => handleToggleLike(post.id)}
                          >
                            <ThumbsUp
                              className={`h-4 w-4 ${
                                post.isLiked ? 'fill-current text-primary' : ''
                              }`}
                            />
                            {post.likes}
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-1" asChild>
                            <Link href={`/community/${post.id}#comments`}>
                              <MessageCircle className="h-4 w-4" />
                              {post.comments}
                            </Link>
                          </Button>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {post.views}
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleToggleSave(post.id)}
                              >
                                <Bookmark
                                  className={`h-4 w-4 mr-2 ${
                                    post.isSaved ? 'fill-current' : ''
                                  }`}
                                />
                                {post.isSaved ? '저장됨' : '저장하기'}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Share2 className="h-4 w-4 mr-2" />
                                공유하기
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Flag className="h-4 w-4 mr-2" />
                                신고하기
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 font-medium">게시글이 없습니다</h3>
            <p className="text-sm text-muted-foreground mt-1">
              검색어나 카테고리를 변경해보세요
            </p>
            <Button asChild className="mt-4">
              <Link href="/community/new">
                <Plus className="h-4 w-4 mr-2" />
                첫 글 작성하기
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
