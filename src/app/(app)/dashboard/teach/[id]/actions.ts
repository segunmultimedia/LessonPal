'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { scheduledLessons, lessonProgress, teacherClassSubjects } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function markLessonCompleteAction(scheduledLessonId: string, teacherClassSubjectId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // 1. Update scheduledLesson status to 'completed'
  await db.update(scheduledLessons)
    .set({ status: 'completed' })
    .where(eq(scheduledLessons.id, scheduledLessonId));

  // 2. Insert into lessonProgress for tracking
  await db.insert(lessonProgress).values({
    scheduledLessonId: scheduledLessonId,
    status: 'completed',
    actualDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    recordedBy: session.user.id
  });

  // 3. For MVP "Where Did I Stop":
  // We can just query `scheduledLessons` for `completed` lessons to see where we stopped.
  // We don't strictly need to increment `currentWeek` right now unless we want to auto-advance the curriculum week.
  // For Phase 3, keeping `currentWeek` as is or auto-incrementing is fine. Let's just revalidate.

  revalidatePath('/dashboard');
  revalidatePath(`/dashboard/teach/${scheduledLessonId}`);
  
  // Return to dashboard
  redirect('/dashboard');
}
