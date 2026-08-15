import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/signin',
  },
  providers: [], // Providers are injected in index.ts to avoid Edge runtime issues with DB/bcrypt
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnboarding = nextUrl.pathname.startsWith('/onboarding');
      const isOnApp = nextUrl.pathname.startsWith('/dashboard') ||
                      nextUrl.pathname.startsWith('/lessons') ||
                      nextUrl.pathname.startsWith('/classes') ||
                      nextUrl.pathname.startsWith('/carry-overs') ||
                      nextUrl.pathname.startsWith('/history') ||
                      nextUrl.pathname.startsWith('/settings');
      
      // If user is logged in, check onboarding status
      if (isLoggedIn) {

        const hasCompletedOnboarding = auth.user.onboardingCompleted === true || String(auth.user.onboardingCompleted) === 'true';
        
        // Prevent access to app routes if onboarding is not complete
        if (isOnApp && !hasCompletedOnboarding) {
          return Response.redirect(new URL('/onboarding', nextUrl));
        }
        
        // Prevent access to onboarding if already complete
        if (isOnboarding && hasCompletedOnboarding) {
          return Response.redirect(new URL('/dashboard', nextUrl));
        }

        // Prevent access to landing and auth pages if logged in
        if (nextUrl.pathname === '/' || nextUrl.pathname === '/signin' || nextUrl.pathname === '/signup') {
          return Response.redirect(new URL('/dashboard', nextUrl));
        }
        
        return true;
      }
      
      // Not logged in
      if (isOnApp || isOnboarding) {
        return false; // Redirects to signin
      }
      
      return true;
    },
    session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
        session.user.onboardingCompleted = token.onboardingCompleted as boolean;
      }
      return session;
    },
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id;
        token.onboardingCompleted = user.onboardingCompleted;
      }
      
      // Allow manual session updates (e.g. after completing onboarding)
      if (trigger === 'update' && session?.onboardingCompleted !== undefined) {
        token.onboardingCompleted = String(session.onboardingCompleted) === 'true';
      }
      
      return token;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
};
