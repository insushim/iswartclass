'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Image,
  Download,
  Share2,
  Edit,
  Printer,
  Star,
  Calendar,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface PortfolioWork {
  id: string;
  title: string;
  technique: string;
  theme: string;
  completedAt: string;
  rating: number;
  comment?: string;
}

const mockPortfolios: Record<string, {
  studentName: string;
  studentClass: string;
  title: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  works: PortfolioWork[];
}> = {
  '1': {
    studentName: '김민준',
    studentClass: '1-A반',
    title: '민준이의 미술 작품집',
    description: '1학년 1학기 미술 활동 모음',
    isPublic: true,
    createdAt: '2024-03-01',
    updatedAt: '2024-03-25',
    works: [
      { id: '1', title: '가족 그림', technique: '색칠하기', theme: '가족', completedAt: '2024-03-15', rating: 5, comment: '가족의 사랑이 느껴지는 멋진 그림이에요!' },
      { id: '2', title: '봄 꽃', technique: '만다라', theme: '자연', completedAt: '2024-03-20', rating: 4, comment: '색감이 정말 예쁘네요' },
      { id: '3', title: '우리집 강아지', technique: '색칠하기', theme: '동물', completedAt: '2024-03-25', rating: 5 },
      { id: '4', title: '바다 속 친구들', technique: '수채화', theme: '동물', completedAt: '2024-03-28', rating: 4 },
      { id: '5', title: '나의 꿈', technique: '색칠하기', theme: '판타지', completedAt: '2024-04-01', rating: 5 },
    ],
  },
  '2': {
    studentName: '이서연',
    studentClass: '1-A반',
    title: '서연이의 그림 일기',
    description: '매일 그리는 그림 일기',
    isPublic: true,
    createdAt: '2024-03-01',
    updatedAt: '2024-03-18',
    works: [
      { id: '1', title: '무지개 나라', technique: '패턴', theme: '판타지', completedAt: '2024-03-10', rating: 5 },
      { id: '2', title: '공룡 세계', technique: '점잇기', theme: '동물', completedAt: '2024-03-18', rating: 4 },
    ],
  },
};

const techniqueEmoji: Record<string, string> = {
  '색칠하기': '🎨',
  '만다라': '🔵',
  '종이접기': '📄',
  '수채화': '💧',
  '점잇기': '✏️',
  '패턴': '🔶',
};

export default function PortfolioDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [selectedWork, setSelectedWork] = useState<PortfolioWork | null>(null);

  const portfolio = mockPortfolios[id] || {
    studentName: `학생 ${id}`,
    studentClass: '1-A반',
    title: `포트폴리오 ${id}`,
    description: '학생 작품 모음집',
    isPublic: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    works: [],
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/portfolio/view/${id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: portfolio.title,
          text: `${portfolio.studentName}의 작품집을 확인해보세요!`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('공유 링크가 복사되었습니다');
      }
    } catch {
      toast.error('공유에 실패했습니다');
    }
  };

  const handleDownload = () => {
    toast.success('PDF 다운로드를 시작합니다');
  };

  const handlePrint = () => {
    window.print();
    toast.success('인쇄 대화상자를 열었습니다');
  };

  const toggleVisibility = () => {
    toast.success(portfolio.isPublic ? '비공개로 변경되었습니다' : '공개로 변경되었습니다');
  };

  const averageRating = portfolio.works.length > 0
    ? (portfolio.works.reduce((sum, w) => sum + w.rating, 0) / portfolio.works.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {portfolio.studentName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{portfolio.title}</h1>
              <p className="text-muted-foreground">
                {portfolio.studentName} ({portfolio.studentClass})
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={toggleVisibility}>
            {portfolio.isPublic ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="icon" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleDownload}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Description */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">{portfolio.description}</p>
          <div className="flex flex-wrap gap-4 mt-4 text-sm">
            <Badge variant={portfolio.isPublic ? 'default' : 'secondary'}>
              {portfolio.isPublic ? '공개' : '비공개'}
            </Badge>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Image className="h-4 w-4" />
              {portfolio.works.length}개 작품
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Star className="h-4 w-4 text-yellow-500" />
              평균 {averageRating}점
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {portfolio.updatedAt} 업데이트
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Works Grid */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>작품 목록</CardTitle>
          <Button size="sm" asChild>
            <Link href={`/portfolio/${id}/add-work`}>
              <Plus className="h-4 w-4 mr-1" />
              작품 추가
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {portfolio.works.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {portfolio.works.map((work) => (
                <Card
                  key={work.id}
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedWork(work)}
                >
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-2">
                        {techniqueEmoji[work.technique] || '🖼️'}
                      </div>
                      <p className="text-sm text-muted-foreground">{work.technique}</p>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold truncate">{work.title}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="outline">{work.theme}</Badge>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < work.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{work.completedAt}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Image className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 font-medium">작품이 없습니다</h3>
              <p className="text-sm text-muted-foreground mt-1">
                학생의 작품을 추가해보세요
              </p>
              <Button className="mt-4" asChild>
                <Link href={`/portfolio/${id}/add-work`}>
                  <Plus className="h-4 w-4 mr-2" />
                  작품 추가
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Work Detail Dialog */}
      <Dialog open={!!selectedWork} onOpenChange={() => setSelectedWork(null)}>
        <DialogContent className="max-w-2xl">
          {selectedWork && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedWork.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-8xl mb-4">
                      {techniqueEmoji[selectedWork.technique] || '🖼️'}
                    </div>
                    <p className="text-muted-foreground">작품 이미지</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">기법</p>
                    <p className="font-medium">{selectedWork.technique}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">테마</p>
                    <p className="font-medium">{selectedWork.theme}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">완료일</p>
                    <p className="font-medium">{selectedWork.completedAt}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">평점</p>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < selectedWork.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                {selectedWork.comment && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">선생님 코멘트</p>
                    <p>{selectedWork.comment}</p>
                  </div>
                )}
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setSelectedWork(null)}>
                    닫기
                  </Button>
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    다운로드
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
