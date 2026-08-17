'use server';

import { z } from 'zod/v4';
import { db } from '@/lib/db';
import { teacherProfiles, teacherClassSubjects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

const addClassSchema = z.object({
  assignments: z.string().refine((val) => {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) && parsed.length > 0;
    } catch {
      return false;
    }
  }, "Please assign at least one class and subject."),
});

export async function addClasses(prevState: unknown, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Not authenticated' };
    }

    const rawData = Object.fromEntries(formData.entries());
    const parsed = addClassSchema.safeParse(rawData);
    
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const field = issue.path.join('.') || 'form';
      return { success: false, error: `Validation error on '${field}': ${issue.message}` };
    }

    const { assignments } = parsed.data;
    const assignmentsList: { classLevelId: string, subjectId: string, termId: string, weekNumber: number }[] = JSON.parse(assignments);

    await db.transaction(async (tx) => {
      // Get profile ID
      const profile = await tx.select().from(teacherProfiles).where(eq(teacherProfiles.userId, session.user.id));
      if (!profile.length) throw new Error("Profile not found");
      const teacherProfileId = profile[0].id;

      // Insert Class Subjects
      const valuesToInsert = assignmentsList.map(a => ({
        teacherProfileId,
        classLevelId: a.classLevelId,
        subjectId: a.subjectId,
        academicTermId: a.termId,
        currentWeek: a.weekNumber,
        isActive: true,
      }));

      await tx.insert(teacherClassSubjects).values(valuesToInsert).onConflictDoNothing();
    });

    revalidatePath('/dashboard');
    return { success: true };

  } catch (error) {
    console.error('Add classes error:', error);
    return { success: false, error: 'An unexpected error occurred while adding the class. Please try again.' };
  }
}
