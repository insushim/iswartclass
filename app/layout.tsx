import type { Metadata, Viewport } from 'next';
import { Toaster } from 'sonner';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: {
    default: 'ArtSheet Pro - AI 미술 도안 생성 플랫폼',
    template: '%s | ArtSheet Pro',
  },
  description:
    '유아부터 초등학생까지, AI가 생성하는 교육용 미술 도안 플랫폼. 36가지 미술 기법으로 창의력을 키워보세요.',
  keywords: [
    '미술 도안',
    '색칠 공부',
    '어린이 미술',
    'AI 도안',
    '초등 미술',
    '유아 미술',
    '미술 교육',
    '미술 활동지',
    '종이접기',
    '만다라',
  ],
  authors: [{ name: 'ArtSheet Pro Team' }],
  creator: 'ArtSheet Pro',
  publisher: 'ArtSheet Pro',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://artsheet.pro',
    title: 'ArtSheet Pro - AI 미술 도안 생성 플랫폼',
    description:
      '유아부터 초등학생까지, AI가 생성하는 교육용 미술 도안 플랫폼',
    siteName: 'ArtSheet Pro',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ArtSheet Pro',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ArtSheet Pro - AI 미술 도안 생성 플랫폼',
    description:
      '유아부터 초등학생까지, AI가 생성하는 교육용 미술 도안 플랫폼',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              duration: 4000,
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
