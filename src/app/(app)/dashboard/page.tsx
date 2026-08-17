import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { teacherClassSubjects, teacherProfiles, classLevels, subjects, academicTerms } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { DashboardTabs, DashboardClass } from './client';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/signin');
  }

  // Get the teacher's profile and assigned subjects/positions
  const profileRecord = await db.select().from(teacherProfiles).where(eq(teacherProfiles.userId, session.user.id)).limit(1);
  if (!profileRecord.length) {
    // If the JWT claims onboarding is complete but the DB record is missing, the session is corrupted (e.g. DB was wiped)
    if (session.user.onboardingCompleted === true || String(session.user.onboardingCompleted) === 'true') {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-12 text-center">
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-2xl p-8 max-w-md">
            <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-4">Session Corrupted</h2>
            <p className="text-muted-foreground mb-6">Your user profile could not be found in the database. This typically happens if the local database was wiped while you still had an active login session.</p>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a 
              href="/api/auth/signout"
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded transition-colors"
            >
              Sign out to fix this
            </a>
          </div>
        </div>
      );
    } else {
      redirect('/onboarding');
    }
  }
  
  const profileId = profileRecord[0].id;

  // Fetch the assigned class subjects with joined data
  const assignments = await db.select({
    id: teacherClassSubjects.id,
    classLevelId: teacherClassSubjects.classLevelId,
    className: classLevels.name,
    subjectName: subjects.name,
    termName: academicTerms.name,
    weekNumber: teacherClassSubjects.currentWeek,
  })
  .from(teacherClassSubjects)
  .leftJoin(classLevels, eq(teacherClassSubjects.classLevelId, classLevels.id))
  .leftJoin(subjects, eq(teacherClassSubjects.subjectId, subjects.id))
  .leftJoin(academicTerms, eq(teacherClassSubjects.academicTermId, academicTerms.id))
  .where(eq(teacherClassSubjects.teacherProfileId, profileId));

  // Group assignments by classLevelId
  const groupedClassesMap = new Map<string, DashboardClass>();
  
  for (const a of assignments) {
    if (!a.classLevelId) continue;
    
    if (!groupedClassesMap.has(a.classLevelId)) {
      groupedClassesMap.set(a.classLevelId, {
        classLevelId: a.classLevelId,
        className: a.className || 'Unknown Class',
        termName: a.termName || 'Unknown Term',
        weekNumber: a.weekNumber,
        subjects: []
      });
    }
    
    const group = groupedClassesMap.get(a.classLevelId)!;
    group.subjects.push({
      id: a.id,
      subjectName: a.subjectName || 'Unknown Subject',
      termName: a.termName || 'Unknown Term',
      weekNumber: a.weekNumber
    });
  }

  const groupedClasses = Array.from(groupedClassesMap.values());

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Good morning, {session.user.name?.split(' ')[0]}! 👋</h1>
          <p className="text-muted-foreground mt-1">{today}</p>
        </div>
      </div>

      <DashboardTabs classes={groupedClasses} />
    </div>
  );
}
