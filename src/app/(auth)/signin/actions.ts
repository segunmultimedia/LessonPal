'use server';

import { z } from 'zod/v4';
import { signIn } from '@/lib/auth';
import { AuthError } from 'next-auth';

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function signInUser(prevState: unknown, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const parsed = signInSchema.safeParse(rawData);
    
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0].message,
      };
    }

    const { email, password } = parsed.data;

    await signIn('credentials', {
      email,
      password,
      redirect: false, // Handle redirect client-side
    });
    
    return { success: true };
    
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { success: false, error: 'Invalid email or password.' };
        default:
          return { success: false, error: 'Something went wrong.' };
      }
    }
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}
