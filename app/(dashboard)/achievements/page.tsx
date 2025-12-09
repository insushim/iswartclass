'use client';

import { useState } from 'react';
import {
  Award,
  Trophy,
  Star,
  Medal,
  Target,
  Palette,
  Scissors,
  PenTool,
  Sparkles,
  Lock,
  CheckCircle,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'coloring' | 'mandala' | 'origami' | 'general' | 'special';
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirement: string;
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  points: number;
}

const mockAchievements: Achievement[] = [
  // Coloring achievements
  {
    id: '1',
    title: '색칠 입문자',
    description: '첫 번째 색칠하기 도안을 완료하세요',
    category: 'coloring',
    icon: 'palette',
    rarity: 'common',
    requirement: '색칠하기 1개 완료',
    progress: 1,
    maxProgress: 1,
    isUnlocked: true,
    unlockedAt: '2024-03-01',
    points: 10,
  },
  {
    id: '2',
    title: '색칠 마스터',
    description: '색칠하기 도안 50개를 완료하세요',
    category: 'coloring',
    icon: 'palette',
    rarity: 'rare',
    requirement: '색칠하기 50개 완료',
    progress: 23,
    maxProgress: 50,
    isUnlocked: false,
    points: 50,
  },
  {
    id: '3',
    title: '색의 마법사',
    description: '색칠하기 도안 100개를 완료하세요',
    category: 'coloring',
    icon: 'sparkles',
    rarity: 'epic',
    requirement: '색칠하기 100개 완료',
    progress: 23,
    maxProgress: 100,
    isUnlocked: false,
    points: 100,
  },
  // Mandala achievements
  {
    id: '4',
    title: '만다라 초보',
    description: '첫 번째 만다라 도안을 완료하세요',
    category: 'mandala',
    icon: 'target',
    rarity: 'common',
    requirement: '만다라 1개 완료',
    progress: 1,
    maxProgress: 1,
    isUnlocked: true,
    unlockedAt: '2024-03-05',
    points: 10,
  },
  {
    id: '5',
    title: '만다라 아티스트',
    description: '만다라 도안 25개를 완료하세요',
    category: 'mandala',
    icon: 'target',
    rarity: 'rare',
    requirement: '만다라 25개 완료',
    progress: 12,
    maxProgress: 25,
    isUnlocked: false,
    points: 50,
  },
  // Origami achievements
  {
    id: '6',
    title: '종이접기 시작',
    description: '첫 번째 종이접기를 완료하세요',
    category: 'origami',
    icon: 'scissors',
    rarity: 'common',
    requirement: '종이접기 1개 완료',
    progress: 1,
    maxProgress: 1,
    isUnlocked: true,
    unlockedAt: '2024-03-10',
    points: 10,
  },
  {
    id: '7',
    title: '종이접기 달인',
    description: '종이접기 30개를 완료하세요',
    category: 'origami',
    icon: 'scissors',
    rarity: 'rare',
    requirement: '종이접기 30개 완료',
    progress: 8,
    maxProgress: 30,
    isUnlocked: false,
    points: 50,
  },
  // General achievements
  {
    id: '8',
    title: '첫 걸음',
    description: '첫 번째 활동을 완료하세요',
    category: 'general',
    icon: 'star',
    rarity: 'common',
    requirement: '아무 활동 1개 완료',
    progress: 1,
    maxProgress: 1,
    isUnlocked: true,
    unlockedAt: '2024-03-01',
    points: 5,
  },
  {
    id: '9',
    title: '열정 가득',
    description: '총 100개의 활동을 완료하세요',
    category: 'general',
    icon: 'trophy',
    rarity: 'epic',
    requirement: '총 100개 활동 완료',
    progress: 43,
    maxProgress: 100,
    isUnlocked: false,
    points: 100,
  },
  {
    id: '10',
    title: '꾸준함의 힘',
    description: '7일 연속 활동을 완료하세요',
    category: 'general',
    icon: 'trending',
    rarity: 'rare',
    requirement: '7일 연속 활동',
    progress: 4,
    maxProgress: 7,
    isUnlocked: false,
    points: 30,
  },
  // Special achievements
  {
    id: '11',
    title: '올라운더',
    description: '모든 기법을 한 번씩 체험하세요',
    category: 'special',
    icon: 'medal',
    rarity: 'epic',
    requirement: '5가지 기법 체험',
    progress: 3,
    maxProgress: 5,
    isUnlocked: false,
    points: 75,
  },
  {
    id: '12',
    title: '레전드',
    description: '모든 업적을 달성하세요',
    category: 'special',
    icon: 'award',
    rarity: 'legendary',
    requirement: '모든 업적 달성',
    progress: 4,
    maxProgress: 20,
    isUnlocked: false,
    points: 500,
  },
];

const categoryConfig = {
  coloring: { label: '색칠하기', icon: Palette, color: 'bg-pink-100 text-pink-700' },
  mandala: { label: '만다라', icon: Target, color: 'bg-blue-100 text-blue-700' },
  origami: { label: '종이접기', icon: Scissors, color: 'bg-green-100 text-green-700' },
  general: { label: '일반', icon: Star, color: 'bg-yellow-100 text-yellow-700' },
  special: { label: '특별', icon: Sparkles, color: 'bg-purple-100 text-purple-700' },
};

const rarityConfig = {
  common: { label: '일반', color: 'bg-gray-100 text-gray-700', border: 'border-gray-300' },
  rare: { label: '희귀', color: 'bg-blue-100 text-blue-700', border: 'border-blue-400' },
  epic: { label: '영웅', color: 'bg-purple-100 text-purple-700', border: 'border-purple-500' },
  legendary: { label: '전설', color: 'bg-yellow-100 text-yellow-700', border: 'border-yellow-500' },
};

const iconMap: Record<string, React.ElementType> = {
  palette: Palette,
  target: Target,
  scissors: Scissors,
  star: Star,
  trophy: Trophy,
  medal: Medal,
  award: Award,
  sparkles: Sparkles,
  trending: TrendingUp,
  pen: PenTool,
};

export default function AchievementsPage() {
  const [activeTab, setActiveTab] = useState('all');

  const unlockedCount = mockAchievements.filter(a => a.isUnlocked).length;
  const totalPoints = mockAchievements
    .filter(a => a.isUnlocked)
    .reduce((sum, a) => sum + a.points, 0);
  const progressPercent = Math.round((unlockedCount / mockAchievements.length) * 100);

  const filteredAchievements = activeTab === 'all'
    ? mockAchievements
    : activeTab === 'unlocked'
    ? mockAchievements.filter(a => a.isUnlocked)
    : mockAchievements.filter(a => a.category === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            업적
          </h1>
          <p className="text-muted-foreground">
            다양한 활동을 완료하고 업적을 달성하세요
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-100">
                <Trophy className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{unlockedCount}/{mockAchievements.length}</p>
                <p className="text-sm text-muted-foreground">달성한 업적</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <Star className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalPoints}</p>
                <p className="text-sm text-muted-foreground">획득 포인트</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{progressPercent}%</p>
                <p className="text-sm text-muted-foreground">전체 진행률</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-100">
                <Sparkles className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {mockAchievements.filter(a => a.rarity === 'legendary' && a.isUnlocked).length}
                </p>
                <p className="text-sm text-muted-foreground">전설 업적</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">전체 진행률</span>
            <span className="text-sm text-muted-foreground">
              {unlockedCount} / {mockAchievements.length} 업적 달성
            </span>
          </div>
          <Progress value={progressPercent} className="h-3" />
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="unlocked">달성</TabsTrigger>
          {Object.entries(categoryConfig).map(([key, config]) => (
            <TabsTrigger key={key} value={key} className="gap-1">
              <config.icon className="h-3 w-3" />
              {config.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAchievements.map((achievement) => {
              const IconComponent = iconMap[achievement.icon] || Award;
              const category = categoryConfig[achievement.category];
              const rarity = rarityConfig[achievement.rarity];

              return (
                <Card
                  key={achievement.id}
                  className={`relative overflow-hidden transition-all ${
                    achievement.isUnlocked
                      ? `border-2 ${rarity.border}`
                      : 'opacity-75 grayscale'
                  }`}
                >
                  {achievement.isUnlocked && (
                    <div className="absolute top-0 right-0">
                      <Badge className={rarity.color}>{rarity.label}</Badge>
                    </div>
                  )}

                  <CardHeader className="pb-2">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${
                        achievement.isUnlocked ? category.color : 'bg-gray-100 text-gray-400'
                      }`}>
                        {achievement.isUnlocked ? (
                          <IconComponent className="h-6 w-6" />
                        ) : (
                          <Lock className="h-6 w-6" />
                        )}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{achievement.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {achievement.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{achievement.requirement}</span>
                        <Badge variant="outline" className="gap-1">
                          <Star className="h-3 w-3" />
                          {achievement.points}
                        </Badge>
                      </div>

                      {!achievement.isUnlocked && (
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-muted-foreground">진행률</span>
                            <span className="font-medium">
                              {achievement.progress}/{achievement.maxProgress}
                            </span>
                          </div>
                          <Progress
                            value={(achievement.progress / achievement.maxProgress) * 100}
                            className="h-2"
                          />
                        </div>
                      )}

                      {achievement.isUnlocked && achievement.unlockedAt && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {achievement.unlockedAt} 달성
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredAchievements.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 font-medium">업적이 없습니다</h3>
              <p className="text-sm text-muted-foreground mt-1">
                다른 카테고리를 확인해보세요
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
