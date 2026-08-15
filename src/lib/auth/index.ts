import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { z } from 'zod/v4';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { users, teacherProfiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { authConfig } from './config';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          console.error("Invalid login format", parsed.error);
          return null;
        }
        
        const { email, password } = parsed.data;

        // Fetch user from database
        const userResults = await db.select().from(users).where(eq(users.email, email));
        const user = userResults[0];

        if (!user || !user.passwordHash) {
          return null; // User not found or OAuth only user
        }

        // Verify password
        const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
        
        if (!passwordsMatch) {
          return null;
        }

        // Fetch teacher profile to get onboarding status
        const profileResults = await db.select().from(teacherProfiles).where(eq(teacherProfiles.userId, user.id));
        const profile = profileResults[0];

        // Return user object compatible with NextAuth User type
        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          image: user.avatarUrl,
          onboardingCompleted: profile?.onboardingCompleted ?? false,
        };
      },
    }),
  ],
});
