'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { teacherClassSubjects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function changeWeekAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  
  const assignmentId = formData.get('assignmentId') as string;
  const targetWeek = parseInt(formData.get('weekNumber') as string);
  
  if (!assignmentId || isNaN(targetWeek)) throw new Error('Invalid input');
  
  // Update the teacher's current week for this specific class/subject
  await db.update(teacherClassSubjects)
    .set({ currentWeek: targetWeek })
    .where(eq(teacherClassSubjects.id, assignmentId));
    
  revalidatePath('/dashboard');
  redirect('/dashboard');
}
