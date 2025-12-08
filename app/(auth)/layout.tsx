import { Palette } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-12 flex-col justify-between">
        <Link href="/" className="flex items-center gap-2 text-white">
          <Palette className="h-8 w-8" />
          <span className="text-2xl font-bold">ArtSheet Pro</span>
        </Link>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            AI가 만드는<br />
            창의적인 미술 도안
          </h1>
          <p className="text-white/80 text-lg">
            유아부터 초등학생까지, 36가지 미술 기법으로<br />
            아이들의 창의력을 키워보세요.
          </p>

          <div className="flex gap-4 text-white/90 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white" />
              <span>36가지 미술 기법</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white" />
              <span>AI 맞춤 도안</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white" />
              <span>인쇄 최적화</span>
            </div>
          </div>
        </div>

        <p className="text-white/60 text-sm">
          © 2024 ArtSheet Pro. All rights reserved.
        </p>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <Palette className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold gradient-text">ArtSheet Pro</span>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
