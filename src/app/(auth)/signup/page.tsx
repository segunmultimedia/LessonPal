'use client';

import Link from 'next/link';
import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signUpUser } from './actions';

type ActionState = { error?: string; success: boolean; };
const initialState: ActionState = {
  success: false,
};

export default function SignUpPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(signUpUser, initialState);

  useEffect(() => {
    if (state?.success) {
      router.push('/dashboard'); // proxy will redirect to onboarding if needed
      router.refresh();
    }
  }, [state?.success, router]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border/50 shadow-xl shadow-black/5 p-6 sm:p-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="text-sm text-muted-foreground mt-1">Start managing your teaching progress</p>
      </div>

      <form action={formAction} className="space-y-4">
        {state?.error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg">
            {state.error}
          </div>
        )}

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium mb-1.5">
            Full name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            placeholder="Kwame Asante"
            className="w-full px-3.5 py-3 rounded border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-shadow"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1.5">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="w-full px-3.5 py-3 rounded border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-shadow"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1.5">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            placeholder="At least 8 characters"
            className="w-full px-3.5 py-3 rounded border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-shadow"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded font-medium text-sm hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
        >
          {isPending ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/signin" className="text-blue-600 hover:text-blue-700 font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
