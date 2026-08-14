import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { z } from 'zod/v4';

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/signin',
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        
        // TODO: Phase 2 - implement actual database lookup and bcrypt verification
        // For now, return null (no users exist yet)
        return null;
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnApp = nextUrl.pathname.startsWith('/dashboard') ||
                      nextUrl.pathname.startsWith('/lessons') ||
                      nextUrl.pathname.startsWith('/classes') ||
                      nextUrl.pathname.startsWith('/carry-overs') ||
                      nextUrl.pathname.startsWith('/history') ||
                      nextUrl.pathname.startsWith('/settings') ||
                      nextUrl.pathname.startsWith('/onboarding');
      
      if (isOnApp) {
        if (isLoggedIn) return true;
        return false; // Redirect to signin
      }
      
      // Redirect logged-in users away from auth pages
      if (isLoggedIn && (nextUrl.pathname === '/signin' || nextUrl.pathname === '/signup')) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      
      return true;
    },
    session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
};
