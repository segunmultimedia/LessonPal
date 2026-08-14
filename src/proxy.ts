import { auth } from '@/lib/auth';

// Next.js 16 uses "proxy" instead of "middleware"
// The auth function from next-auth is compatible as a proxy handler
export const proxy = auth;

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
};
