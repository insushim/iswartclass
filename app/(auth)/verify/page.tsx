'use client';

import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VerifyPage() {
  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="rounded-full bg-purple-100 p-3">
          <Mail className="h-8 w-8 text-purple-600" />
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold">이메일을 확인하세요</h1>
        <p className="text-muted-foreground">
          입력하신 이메일로 인증 링크를 발송했습니다.
          <br />
          이메일의 링크를 클릭하여 가입을 완료해주세요.
        </p>
      </div>

      <div className="rounded-lg border bg-muted/50 p-4 text-left space-y-2">
        <p className="text-sm font-medium">이메일이 도착하지 않았나요?</p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• 스팸 폴더를 확인해주세요</li>
          <li>• 이메일 주소를 다시 확인해주세요</li>
          <li>• 몇 분 후에 다시 시도해주세요</li>
        </ul>
      </div>

      <div className="space-y-4">
        <Button asChild variant="outline" className="w-full">
          <Link href="/register">다른 이메일로 가입하기</Link>
        </Button>

        <Link
          href="/login"
          className="inline-flex items-center text-sm text-primary hover:underline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          로그인으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
