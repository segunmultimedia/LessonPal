import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { teacherClassSubjects, classLevels, subjects, academicTerms } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar } from 'lucide-react';
import { changeWeekAction } from './actions';

export default async function MissingLessonPage({
  searchParams,
}: {
  searchParams: Promise<{ assignmentId?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/signin');
  }

  const { assignmentId } = await searchParams;

  if (!assignmentId) {
    redirect('/dashboard');
  }

  // Fetch assignment details
  const [assignment] = await db.select({
    id: teacherClassSubjects.id,
    className: classLevels.name,
    subjectName: subjects.name,
    termName: academicTerms.name,
    weekNumber: teacherClassSubjects.currentWeek
  })
  .from(teacherClassSubjects)
  .leftJoin(classLevels, eq(teacherClassSubjects.classLevelId, classLevels.id))
  .leftJoin(subjects, eq(teacherClassSubjects.subjectId, subjects.id))
  .leftJoin(academicTerms, eq(teacherClassSubjects.academicTermId, academicTerms.id))
  .where(eq(teacherClassSubjects.id, assignmentId))
  .limit(1);

  if (!assignment) {
    redirect('/dashboard');
  }

  return (
    <div className="max-w-2xl mx-auto pt-12 pb-24 px-4 text-center">
      <div className="bg-white dark:bg-gray-900 border rounded-2xl p-8 shadow-sm">
        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <Calendar className="w-6 h-6 text-gray-500 dark:text-gray-400" />
        </div>
        
        <h2 className="text-2xl font-bold tracking-tight mb-4">Lesson Not Available</h2>
        
        <p className="text-muted-foreground mb-10 text-lg">
          No lesson content is available yet for:
          <br />
          <span className="font-semibold text-foreground mt-4 block text-xl">
            {assignment.className}
            <br />
            {assignment.subjectName}
            <br />
            {assignment.termName}
            <br />
            Week {assignment.weekNumber}
          </span>
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/dashboard"
            className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 font-medium px-6 py-3 rounded flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          
          <form action={changeWeekAction} className="w-full sm:w-auto flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded">
            <input type="hidden" name="assignmentId" value={assignment.id} />
            <select 
              name="weekNumber" 
              defaultValue={assignment.weekNumber || 1}
              className="bg-transparent font-medium outline-none text-gray-900 dark:text-gray-100 pr-2 pl-3 py-1 cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(w => (
                <option key={w} value={w}>Week {w}</option>
              ))}
            </select>
            <button 
              type="submit"
              className="bg-white dark:bg-gray-700 px-4 py-2 rounded text-sm font-semibold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Change Week
            </button>
          </form>
        </div>
        
        <p className="text-sm text-muted-foreground mt-8">
          * Note: For development testing, select <strong>Week 3</strong> to preview the seeded test lesson.
        </p>
      </div>
    </div>
  );
}
