'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Clock,
  BookOpen,
  Star,
  Bookmark,
  Share2,
  Award,
  Check,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  image: string;
  tips?: string[];
}

const mockTutorials: Record<string, {
  title: string;
  description: string;
  technique: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  rating: number;
  views: number;
  steps: TutorialStep[];
}> = {
  '1': {
    title: '기초 색칠하기 테크닉',
    description: '색연필과 크레파스를 사용한 기초 색칠 기법을 배워보세요',
    technique: '색칠하기',
    difficulty: 'beginner',
    duration: 15,
    rating: 4.8,
    views: 1250,
    steps: [
      { id: 1, title: '준비물 확인', description: '색연필, 크레파스, 도화지를 준비합니다.', image: '1', tips: ['부드러운 종이를 사용하면 색이 잘 묻습니다'] },
      { id: 2, title: '밑그림 그리기', description: '연필로 가볍게 밑그림을 그립니다.', image: '2', tips: ['너무 진하게 그리지 않도록 주의하세요'] },
      { id: 3, title: '기본색 칠하기', description: '가장 넓은 면적부터 기본색을 칠합니다.', image: '3' },
      { id: 4, title: '그라데이션', description: '같은 계열의 색으로 그라데이션을 만듭니다.', image: '4', tips: ['밝은 색에서 어두운 색 순서로 칠하세요'] },
      { id: 5, title: '디테일 추가', description: '세부적인 부분을 꼼꼼하게 채웁니다.', image: '5' },
      { id: 6, title: '명암 표현', description: '어두운 부분에 음영을 넣어 입체감을 줍니다.', image: '6' },
      { id: 7, title: '하이라이트', description: '밝은 부분을 강조하여 완성도를 높입니다.', image: '7' },
      { id: 8, title: '완성', description: '전체적인 균형을 확인하고 마무리합니다.', image: '8', tips: ['작품에 서명을 넣어보세요!'] },
    ],
  },
  '2': {
    title: '만다라 패턴 그리기',
    description: '아름다운 만다라 패턴을 단계별로 그려보세요',
    technique: '만다라',
    difficulty: 'intermediate',
    duration: 25,
    rating: 4.9,
    views: 890,
    steps: [
      { id: 1, title: '원 그리기', description: '컴퍼스로 중심 원을 그립니다.', image: '1' },
      { id: 2, title: '중심선 그리기', description: '원을 8등분하는 선을 그립니다.', image: '2' },
      { id: 3, title: '첫 번째 패턴', description: '중심에서 첫 번째 패턴을 그립니다.', image: '3' },
      { id: 4, title: '패턴 반복', description: '같은 패턴을 8방향으로 반복합니다.', image: '4' },
      { id: 5, title: '두 번째 층', description: '바깥쪽으로 두 번째 패턴을 추가합니다.', image: '5' },
      { id: 6, title: '세부 장식', description: '작은 장식 요소를 추가합니다.', image: '6' },
      { id: 7, title: '색칠하기', description: '대칭을 유지하며 색을 칠합니다.', image: '7' },
      { id: 8, title: '완성', description: '전체 균형을 확인하고 마무리합니다.', image: '8' },
    ],
  },
};

const difficultyConfig = {
  beginner: { label: '초급', color: 'bg-green-100 text-green-700' },
  intermediate: { label: '중급', color: 'bg-yellow-100 text-yellow-700' },
  advanced: { label: '고급', color: 'bg-red-100 text-red-700' },
};

export default function TutorialDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const tutorial = mockTutorials[id] || {
    title: `튜토리얼 ${id}`,
    description: '튜토리얼 설명입니다.',
    technique: '기타',
    difficulty: 'beginner' as const,
    duration: 15,
    rating: 4.5,
    views: 100,
    steps: [
      { id: 1, title: '단계 1', description: '첫 번째 단계입니다.', image: '1' },
      { id: 2, title: '단계 2', description: '두 번째 단계입니다.', image: '2' },
      { id: 3, title: '단계 3', description: '세 번째 단계입니다.', image: '3' },
    ],
  };

  const progress = Math.round((completedSteps.length / tutorial.steps.length) * 100);
  const currentStepData = tutorial.steps[currentStep];

  const handleNextStep = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    if (currentStep < tutorial.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setCompletedSteps(tutorial.steps.map((_, i) => i));
    toast.success('튜토리얼을 완료했습니다!');
  };

  const handleToggleSave = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? '저장 목록에서 제거했습니다' : '저장 목록에 추가했습니다');
  };

  const handleShare = async () => {
    const shareData = {
      title: tutorial.title,
      text: tutorial.description,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('링크가 클립보드에 복사되었습니다');
      }
    } catch {
      toast.error('공유에 실패했습니다');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{tutorial.title}</h1>
          <p className="text-muted-foreground">{tutorial.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleToggleSave}>
            <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
          </Button>
          <Button variant="outline" size="icon" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Meta Info */}
      <div className="flex flex-wrap gap-2">
        <Badge className={difficultyConfig[tutorial.difficulty].color}>
          {difficultyConfig[tutorial.difficulty].label}
        </Badge>
        <Badge variant="outline">{tutorial.technique}</Badge>
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" />
          {tutorial.duration}분
        </Badge>
        <Badge variant="secondary" className="gap-1">
          <BookOpen className="h-3 w-3" />
          {tutorial.steps.length}단계
        </Badge>
        <Badge variant="secondary" className="gap-1">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          {tutorial.rating}
        </Badge>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">진행률</span>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{completedSteps.length}개 완료</span>
            <span>{tutorial.steps.length - completedSteps.length}개 남음</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="pt-6">
              {/* Step Image */}
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <div className="text-8xl mb-2">
                    {tutorial.technique === '색칠하기' ? '🎨' :
                     tutorial.technique === '만다라' ? '🔵' :
                     tutorial.technique === '종이접기' ? '📄' : '🖼️'}
                  </div>
                  <p className="text-muted-foreground">단계 {currentStep + 1} 이미지</p>
                </div>
              </div>

              {/* Step Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">단계 {currentStep + 1}/{tutorial.steps.length}</Badge>
                  {completedSteps.includes(currentStep) && (
                    <Badge className="bg-green-500">
                      <Check className="h-3 w-3 mr-1" />
                      완료
                    </Badge>
                  )}
                </div>
                <h3 className="text-xl font-semibold">{currentStepData.title}</h3>
                <p className="text-muted-foreground">{currentStepData.description}</p>

                {currentStepData.tips && currentStepData.tips.length > 0 && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">팁</h4>
                    <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                      {currentStepData.tips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrevStep}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  이전
                </Button>

                {currentStep === tutorial.steps.length - 1 ? (
                  <Button onClick={handleComplete} className="gap-2">
                    <Award className="h-4 w-4" />
                    완료하기
                  </Button>
                ) : (
                  <Button onClick={handleNextStep}>
                    다음
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Steps Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">단계 목록</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tutorial.steps.map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(index)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      index === currentStep
                        ? 'bg-primary text-primary-foreground'
                        : completedSteps.includes(index)
                        ? 'bg-green-50 hover:bg-green-100'
                        : 'bg-muted/50 hover:bg-muted'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      index === currentStep
                        ? 'bg-primary-foreground text-primary'
                        : completedSteps.includes(index)
                        ? 'bg-green-500 text-white'
                        : 'bg-muted-foreground/20'
                    }`}>
                      {completedSteps.includes(index) ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className="text-sm font-medium truncate">{step.title}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {progress === 100 && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6 text-center">
                <Award className="h-12 w-12 mx-auto text-green-600 mb-2" />
                <h3 className="font-semibold text-green-800">축하합니다!</h3>
                <p className="text-sm text-green-600 mt-1">
                  튜토리얼을 완료했습니다
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
