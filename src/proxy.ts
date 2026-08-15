import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth/config';

// Next.js 16 uses "proxy" instead of "middleware"
// Using NextAuth(authConfig).auth avoids Edge runtime errors from DB imports
export const proxy = NextAuth(authConfig).auth;

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
};
