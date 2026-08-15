import { db } from '@/lib/db';
import { curricula, academicLevels, classLevels, subjects, academicTerms } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';
import { OnboardingClient } from './client';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/signin');
  }

  // If already onboardingCompleted, middleware should catch it, but double check
  if (session.user.onboardingCompleted === true || String(session.user.onboardingCompleted) === 'true') {
    redirect('/dashboard');
  }

  // Fetch initial data for the form
  const curriculaList = await db.select().from(curricula).orderBy(asc(curricula.name));
  const classLevelsList = await db.select().from(classLevels).orderBy(asc(classLevels.sortOrder));
  const subjectsList = await db.select().from(subjects).orderBy(asc(subjects.name));
  const termsList = await db.select().from(academicTerms).orderBy(asc(academicTerms.sortOrder));

  return (
    <SessionProvider session={session}>
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border/50 shadow-xl p-6 sm:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Welcome to LessonPal</h1>
            <p className="text-muted-foreground mt-2">Let&apos;s set up your current teaching assignments.</p>
          </div>
          
          <OnboardingClient 
            curricula={curriculaList} 
            classes={classLevelsList} 
            subjects={subjectsList}
            terms={termsList}
          />
        </div>
      </div>
    </SessionProvider>
  );
}
