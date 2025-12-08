import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

// 인증이 필요한 경로
const protectedRoutes = [
  '/dashboard',
  '/generate',
  '/library',
  '/favorites',
  '/curriculum',
  '/classroom',
  '/portfolio',
  '/tutorials',
  '/marketplace',
  '/community',
  '/analytics',
  '/calendar',
  '/settings',
];

// 인증된 사용자가 접근하면 안 되는 경로
const authRoutes = ['/login', '/register', '/forgot-password', '/verify'];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isProtectedRoute = protectedRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  // 인증된 사용자가 auth 페이지에 접근하면 대시보드로 리다이렉트
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  // 비인증 사용자가 보호된 경로에 접근하면 로그인 페이지로 리다이렉트
  if (isProtectedRoute && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
