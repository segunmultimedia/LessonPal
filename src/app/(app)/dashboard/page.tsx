import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { teacherClassSubjects, teacherProfiles, classLevels, subjects, academicTerms } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';

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

      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
          <h2 className="text-lg font-semibold">Your Classes</h2>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/classes/manage" className="text-sm font-medium text-muted-foreground hover:text-foreground border border-transparent hover:border-border px-3 py-1.5 rounded transition">
              Manage Classes
            </Link>
            <Link href="/dashboard/classes/new" className="bg-blue-600 text-white text-sm font-medium px-3 py-1.5 rounded flex items-center gap-1.5 hover:bg-blue-700 transition shadow-sm">
              <Plus className="w-4 h-4" /> Add New Class
            </Link>
          </div>
        </div>
        
        {assignments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="bg-white dark:bg-gray-900 border rounded-xl p-4 sm:p-5 shadow-sm flex flex-col h-full hover:border-blue-500/50 transition-colors">
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 text-xs font-semibold px-2.5 py-0.5 rounded">
                      {assignment.className}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">
                      {assignment.termName} • Week {assignment.weekNumber}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">{assignment.subjectName}</h3>
                </div>
                
                <div className="mt-auto pt-4">
                  <button disabled className="w-full bg-gray-900/50 dark:bg-gray-100/50 text-white dark:text-gray-900 font-medium py-3 rounded opacity-70 cursor-not-allowed flex items-center justify-center gap-2">
                    Start Teaching <span className="text-xs bg-gray-800/20 px-2 py-0.5 rounded">(Coming soon)</span>
                  </button>
                  <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <button disabled className="flex-1 text-sm border font-medium py-2.5 rounded text-muted-foreground opacity-50 cursor-not-allowed">
                      Mark Complete
                    </button>
                    <button disabled className="flex-1 text-sm border font-medium py-2.5 rounded text-muted-foreground opacity-50 cursor-not-allowed">
                      Reschedule
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="font-semibold text-lg mb-2">No subjects assigned yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Please complete your onboarding setup to tell us what classes and subjects you teach.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
