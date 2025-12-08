'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Plus,
  Download,
  Heart,
  MoreVertical,
  Folder,
  Trash2,
  Edit,
  Share2,
  Copy,
  SlidersHorizontal,
  Calendar,
  Tag,
  ChevronDown,
  FolderPlus,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface Sheet {
  id: string;
  title: string;
  technique: string;
  theme: string;
  ageGroup: string;
  thumbnail: string;
  createdAt: string;
  isFavorite: boolean;
  folderId?: string;
}

interface FolderType {
  id: string;
  name: string;
  count: number;
  color: string;
}

const mockSheets: Sheet[] = [
  {
    id: '1',
    title: '귀여운 고양이 색칠하기',
    technique: '색칠하기',
    theme: '동물',
    ageGroup: '유아',
    thumbnail: '/api/placeholder/400/400',
    createdAt: '2024-01-15',
    isFavorite: true,
  },
  {
    id: '2',
    title: '봄 꽃 만다라',
    technique: '만다라',
    theme: '자연',
    ageGroup: '저학년',
    thumbnail: '/api/placeholder/400/400',
    createdAt: '2024-01-14',
    isFavorite: false,
  },
  {
    id: '3',
    title: '종이접기 비행기 도안',
    technique: '종이접기',
    theme: '탈것',
    ageGroup: '유아',
    thumbnail: '/api/placeholder/400/400',
    createdAt: '2024-01-13',
    isFavorite: true,
  },
  {
    id: '4',
    title: '공룡 점잇기',
    technique: '점잇기',
    theme: '동물',
    ageGroup: '유아',
    thumbnail: '/api/placeholder/400/400',
    createdAt: '2024-01-12',
    isFavorite: false,
  },
  {
    id: '5',
    title: '미로 찾기 - 숲속 탐험',
    technique: '미로찾기',
    theme: '자연',
    ageGroup: '저학년',
    thumbnail: '/api/placeholder/400/400',
    createdAt: '2024-01-11',
    isFavorite: false,
  },
  {
    id: '6',
    title: '패턴 따라 그리기',
    technique: '패턴',
    theme: '기하학',
    ageGroup: '고학년',
    thumbnail: '/api/placeholder/400/400',
    createdAt: '2024-01-10',
    isFavorite: true,
  },
];

const mockFolders: FolderType[] = [
  { id: '1', name: '1학년 수업자료', count: 12, color: 'bg-blue-500' },
  { id: '2', name: '2학년 수업자료', count: 8, color: 'bg-green-500' },
  { id: '3', name: '방과후 활동', count: 15, color: 'bg-purple-500' },
  { id: '4', name: '계절 테마', count: 6, color: 'bg-orange-500' },
];

export default function LibraryPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedSheets, setSelectedSheets] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [filterTechnique, setFilterTechnique] = useState<string | null>(null);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const handleSelectSheet = (id: string) => {
    setSelectedSheets((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedSheets.length === mockSheets.length) {
      setSelectedSheets([]);
    } else {
      setSelectedSheets(mockSheets.map((s) => s.id));
    }
  };

  const handleToggleFavorite = (id: string) => {
    toast.success('즐겨찾기가 업데이트되었습니다');
  };

  const handleDeleteSheets = () => {
    toast.success(`${selectedSheets.length}개의 도안이 삭제되었습니다`);
    setSelectedSheets([]);
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    toast.success(`'${newFolderName}' 폴더가 생성되었습니다`);
    setNewFolderName('');
    setIsNewFolderOpen(false);
  };

  const filteredSheets = mockSheets.filter((sheet) => {
    const matchesSearch =
      sheet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sheet.technique.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sheet.theme.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTechnique = !filterTechnique || sheet.technique === filterTechnique;
    return matchesSearch && matchesTechnique;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">내 라이브러리</h1>
          <p className="text-muted-foreground">
            저장한 도안을 관리하고 정리하세요
          </p>
        </div>
        <Button asChild>
          <Link href="/generate">
            <Plus className="h-4 w-4 mr-2" />
            새 도안 생성
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Sidebar - Folders */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">폴더</CardTitle>
                <Dialog open={isNewFolderOpen} onOpenChange={setIsNewFolderOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon-sm">
                      <FolderPlus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>새 폴더 만들기</DialogTitle>
                      <DialogDescription>
                        도안을 정리할 새 폴더를 만드세요
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="folderName">폴더 이름</Label>
                        <Input
                          id="folderName"
                          value={newFolderName}
                          onChange={(e) => setNewFolderName(e.target.value)}
                          placeholder="예: 3학년 수업자료"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsNewFolderOpen(false)}>
                        취소
                      </Button>
                      <Button onClick={handleCreateFolder}>생성</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <button
                onClick={() => setSelectedFolder(null)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                  !selectedFolder
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <Folder className="h-4 w-4" />
                <span className="flex-1 text-left">전체 도안</span>
                <Badge variant="secondary" className="ml-auto">
                  {mockSheets.length}
                </Badge>
              </button>
              {mockFolders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                    selectedFolder === folder.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className={`h-3 w-3 rounded ${folder.color}`} />
                  <span className="flex-1 text-left truncate">{folder.name}</span>
                  <Badge variant="secondary" className="ml-auto">
                    {folder.count}
                  </Badge>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Quick Filters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">빠른 필터</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <button
                onClick={() => setFilterTechnique(null)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                  !filterTechnique ? 'bg-muted' : 'hover:bg-muted'
                }`}
              >
                <Tag className="h-4 w-4" />
                전체 기법
              </button>
              {['색칠하기', '만다라', '종이접기', '점잇기'].map((tech) => (
                <button
                  key={tech}
                  onClick={() => setFilterTechnique(tech)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                    filterTechnique === tech ? 'bg-muted' : 'hover:bg-muted'
                  }`}
                >
                  <Tag className="h-4 w-4" />
                  {tech}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-4 space-y-4">
          {/* Toolbar */}
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
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">최신순</SelectItem>
                  <SelectItem value="oldest">오래된순</SelectItem>
                  <SelectItem value="name">이름순</SelectItem>
                  <SelectItem value="technique">기법별</SelectItem>
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

          {/* Selection Bar */}
          {selectedSheets.length > 0 && (
            <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
              <Checkbox
                checked={selectedSheets.length === mockSheets.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium">
                {selectedSheets.length}개 선택됨
              </span>
              <div className="flex-1" />
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Folder className="h-4 w-4 mr-1" />
                  폴더로 이동
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  다운로드
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={handleDeleteSheets}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  삭제
                </Button>
              </div>
            </div>
          )}

          {/* Sheets Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredSheets.map((sheet) => (
                <Card
                  key={sheet.id}
                  className={`group overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                    selectedSheets.includes(sheet.id) ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <div className="relative aspect-square bg-muted">
                    <div className="absolute inset-0 flex items-center justify-center text-4xl text-muted-foreground">
                      {sheet.technique === '색칠하기'
                        ? '🎨'
                        : sheet.technique === '만다라'
                        ? '🔵'
                        : sheet.technique === '종이접기'
                        ? '📄'
                        : '✏️'}
                    </div>
                    <div className="absolute top-2 left-2">
                      <Checkbox
                        checked={selectedSheets.includes(sheet.id)}
                        onCheckedChange={() => handleSelectSheet(sheet.id)}
                        className="bg-white"
                      />
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
                            <Edit className="h-4 w-4 mr-2" />
                            이름 변경
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Folder className="h-4 w-4 mr-2" />
                            폴더로 이동
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
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <button
                      onClick={() => handleToggleFavorite(sheet.id)}
                      className="absolute bottom-2 right-2"
                    >
                      <Heart
                        className={`h-5 w-5 ${
                          sheet.isFavorite
                            ? 'fill-red-500 text-red-500'
                            : 'text-white drop-shadow'
                        }`}
                      />
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
                      {sheet.createdAt}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSheets.map((sheet) => (
                <Card
                  key={sheet.id}
                  className={`hover:shadow-md transition-shadow ${
                    selectedSheets.includes(sheet.id) ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <CardContent className="flex items-center gap-4 p-3">
                    <Checkbox
                      checked={selectedSheets.includes(sheet.id)}
                      onCheckedChange={() => handleSelectSheet(sheet.id)}
                    />
                    <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center text-2xl shrink-0">
                      {sheet.technique === '색칠하기'
                        ? '🎨'
                        : sheet.technique === '만다라'
                        ? '🔵'
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
                        {sheet.createdAt}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleToggleFavorite(sheet.id)}
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            sheet.isFavorite ? 'fill-red-500 text-red-500' : ''
                          }`}
                        />
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
                            <Edit className="h-4 w-4 mr-2" />
                            이름 변경
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Folder className="h-4 w-4 mr-2" />
                            폴더로 이동
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            복제
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredSheets.length === 0 && (
            <div className="text-center py-12">
              <Folder className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 font-medium">도안이 없습니다</h3>
              <p className="text-sm text-muted-foreground mt-1">
                새 도안을 생성하거나 검색어를 변경해보세요
              </p>
              <Button asChild className="mt-4">
                <Link href="/generate">
                  <Plus className="h-4 w-4 mr-2" />
                  새 도안 생성
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
