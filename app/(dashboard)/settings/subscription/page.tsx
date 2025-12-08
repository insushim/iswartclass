'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  Check,
  Star,
  Zap,
  Crown,
  Infinity,
  ArrowLeft,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import Link from 'next/link';

interface Plan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  credits: number | 'unlimited';
  features: string[];
  icon: React.ElementType;
  popular?: boolean;
  current?: boolean;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: '무료',
    description: '기본적인 도안 생성',
    monthlyPrice: 0,
    yearlyPrice: 0,
    credits: 30,
    features: [
      '월 30 크레딧',
      '기본 기법 10종',
      '도안 라이브러리',
      '기본 테마',
      '워터마크 포함',
    ],
    icon: Star,
    current: true,
  },
  {
    id: 'basic',
    name: '베이직',
    description: '더 많은 도안 생성',
    monthlyPrice: 9900,
    yearlyPrice: 99000,
    credits: 150,
    features: [
      '월 150 크레딧',
      '전체 기법 36종',
      '무제한 라이브러리',
      '모든 테마',
      '워터마크 없음',
      '우선 지원',
    ],
    icon: Zap,
  },
  {
    id: 'premium',
    name: '프리미엄',
    description: '전문가를 위한 플랜',
    monthlyPrice: 19900,
    yearlyPrice: 199000,
    credits: 500,
    features: [
      '월 500 크레딧',
      '전체 기법 36종',
      '무제한 라이브러리',
      '모든 테마',
      '워터마크 없음',
      '고급 편집 기능',
      '학급 관리 기능',
      '우선 지원',
    ],
    icon: Crown,
    popular: true,
  },
  {
    id: 'unlimited',
    name: '무제한',
    description: '기관 및 대량 사용자',
    monthlyPrice: 49900,
    yearlyPrice: 499000,
    credits: 'unlimited',
    features: [
      '무제한 크레딧',
      '전체 기법 36종',
      '무제한 라이브러리',
      '모든 테마',
      '워터마크 없음',
      '고급 편집 기능',
      '학급 관리 기능',
      'API 접근',
      '전담 지원',
      '맞춤 기능 개발',
    ],
    icon: Infinity,
  },
];

export default function SubscriptionPage() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') {
      toast.info('이미 무료 플랜을 사용 중입니다');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement Toss Payments integration
      toast.success('결제 페이지로 이동합니다');
      // router.push(`/payment?plan=${planId}&cycle=${billingCycle}`);
    } catch (error) {
      toast.error('결제 처리 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            구독 관리
          </h1>
          <p className="text-muted-foreground">
            플랜을 선택하고 더 많은 기능을 이용하세요
          </p>
        </div>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center">
        <Tabs
          value={billingCycle}
          onValueChange={(value) => setBillingCycle(value as 'monthly' | 'yearly')}
        >
          <TabsList>
            <TabsTrigger value="monthly">월간 결제</TabsTrigger>
            <TabsTrigger value="yearly" className="gap-2">
              연간 결제
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                17% 할인
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative ${
              plan.popular
                ? 'border-primary shadow-lg'
                : plan.current
                ? 'border-muted-foreground/50'
                : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary">가장 인기</Badge>
              </div>
            )}
            {plan.current && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="secondary">현재 플랜</Badge>
              </div>
            )}
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                <plan.icon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {plan.monthlyPrice === 0
                    ? '무료'
                    : `₩${(billingCycle === 'monthly'
                        ? plan.monthlyPrice
                        : Math.round(plan.yearlyPrice / 12)
                      ).toLocaleString()}`}
                </div>
                {plan.monthlyPrice > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {billingCycle === 'monthly' ? '/월' : '/월 (연간 결제)'}
                  </p>
                )}
                {billingCycle === 'yearly' && plan.yearlyPrice > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    연 ₩{plan.yearlyPrice.toLocaleString()}
                  </p>
                )}
              </div>

              <div className="text-center p-3 rounded-lg bg-muted">
                <span className="text-2xl font-bold">
                  {plan.credits === 'unlimited' ? '∞' : plan.credits}
                </span>
                <span className="text-muted-foreground ml-1">
                  {plan.credits === 'unlimited' ? '무제한' : '크레딧/월'}
                </span>
              </div>

              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={plan.current ? 'outline' : plan.popular ? 'default' : 'outline'}
                disabled={plan.current || isLoading}
                onClick={() => handleSubscribe(plan.id)}
              >
                {plan.current ? '현재 이용중' : '선택하기'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>자주 묻는 질문</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium">크레딧이란 무엇인가요?</h4>
            <p className="text-sm text-muted-foreground mt-1">
              크레딧은 AI 도안 생성에 사용되는 단위입니다. 1개의 도안 생성에 1
              크레딧이 소모됩니다.
            </p>
          </div>
          <div>
            <h4 className="font-medium">언제든지 플랜을 변경할 수 있나요?</h4>
            <p className="text-sm text-muted-foreground mt-1">
              네, 언제든지 업그레이드하거나 다운그레이드할 수 있습니다. 변경 시
              남은 기간은 비례 계산되어 적용됩니다.
            </p>
          </div>
          <div>
            <h4 className="font-medium">환불 정책은 어떻게 되나요?</h4>
            <p className="text-sm text-muted-foreground mt-1">
              결제 후 7일 이내에 요청하시면 전액 환불해 드립니다. 단, 크레딧을
              이미 사용한 경우 사용량을 제외하고 환불됩니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
