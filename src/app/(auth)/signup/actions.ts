'use server';

import { z } from 'zod/v4';
import { db } from '@/lib/db';
import { users, teacherProfiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { signIn } from '@/lib/auth';

const signUpSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function signUpUser(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const parsed = signUpSchema.safeParse(rawData);
    
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0].message,
      };
    }

    const { fullName, email, password } = parsed.data;

    // Check if user already exists
    const existingUsers = await db.select().from(users).where(eq(users.email, email));
    if (existingUsers.length > 0) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user and profile in a transaction
    await db.transaction(async (tx) => {
      const newUser = await tx.insert(users).values({
        email,
        passwordHash,
        fullName,
      }).returning({ id: users.id });

      const userId = newUser[0].id;

      await tx.insert(teacherProfiles).values({
        userId,
        onboardingCompleted: false,
      });
    });

    // Sign in the user automatically
    await signIn('credentials', {
      email,
      password,
      redirect: false, // We handle redirection manually or let useActionState handle the successful result
    });
    
    // Redirect handled client-side on success to bypass Next.js Action redirect bugs
    return { success: true };

  } catch (error: any) {
    console.error('Sign up error:', error);
    if (error.name === 'CredentialsSignin') {
        return { success: false, error: 'Failed to sign in after registration.' };
    }
    return { success: false, error: 'An unexpected error occurred during registration. Please try again.' };
  }
}
