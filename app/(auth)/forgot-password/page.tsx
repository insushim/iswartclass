'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const forgotPasswordSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });

      if (!response.ok) {
        const result = await response.json();
        toast.error(result.error || '이메일 발송에 실패했습니다');
        return;
      }

      setIsSubmitted(true);
    } catch (error) {
      toast.error('비밀번호 재설정 이메일 발송에 실패했습니다');
      console.error('Forgot password error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">이메일을 확인하세요</h1>
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">{getValues('email')}</span>
            으로 비밀번호 재설정 링크를 발송했습니다.
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            이메일이 도착하지 않았나요? 스팸 폴더를 확인하거나 다시 시도해주세요.
          </p>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsSubmitted(false)}
          >
            다시 시도
          </Button>
        </div>

        <Link
          href="/login"
          className="inline-flex items-center text-sm text-primary hover:underline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          로그인으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">비밀번호 찾기</h1>
        <p className="text-muted-foreground">
          가입하신 이메일을 입력하면 비밀번호 재설정 링크를 보내드립니다
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">이메일</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="pl-10"
              error={!!errors.email}
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              발송 중...
            </>
          ) : (
            '재설정 링크 받기'
          )}
        </Button>
      </form>

      <Link
        href="/login"
        className="flex items-center justify-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        로그인으로 돌아가기
      </Link>
    </div>
  );
}
