import { db } from '@/lib/db';
import { classLevels, subjects, academicTerms } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';
import { AddClassClient } from './client';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function NewClassPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/signin');
  }

  // Fetch initial data for the form
  const classLevelsList = await db.select().from(classLevels).orderBy(asc(classLevels.sortOrder));
  const subjectsList = await db.select().from(subjects).orderBy(asc(subjects.name));
  const termsList = await db.select().from(academicTerms).orderBy(asc(academicTerms.sortOrder));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border/50 shadow-sm p-4 sm:p-8">
        <AddClassClient 
          classes={classLevelsList} 
          subjects={subjectsList}
          terms={termsList}
        />
      </div>
    </div>
  );
}
