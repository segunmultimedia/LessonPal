'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { scheduledLessons, teacherClassSubjects, teacherProfiles } from '@/lib/db/schema';
import { curriculumLessons } from '@/lib/db/schema/curriculum_library';
import { eq, and } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export async function startTeachingAction(teacherClassSubjectId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // Verify the assignment belongs to the user
  const [profile] = await db.select({ id: teacherProfiles.id })
    .from(teacherProfiles)
    .where(eq(teacherProfiles.userId, session.user.id))
    .limit(1);

  if (!profile) throw new Error('Profile not found');

  const [assignment] = await db.select()
    .from(teacherClassSubjects)
    .where(
      and(
        eq(teacherClassSubjects.id, teacherClassSubjectId),
        eq(teacherClassSubjects.teacherProfileId, profile.id)
      )
    )
    .limit(1);

  if (!assignment) throw new Error('Assignment not found');

  // Find if there is an in-progress lesson for this assignment
  const [existingInProgress] = await db.select()
    .from(scheduledLessons)
    .where(
      and(
        eq(scheduledLessons.teacherClassSubjectId, assignment.id),
        eq(scheduledLessons.status, 'in_progress')
      )
    )
    .limit(1);

  if (existingInProgress) {
    redirect(`/dashboard/teach/${existingInProgress.id}`);
  }

  // If no in_progress lesson, find the curriculum lesson for this term/week
  // For Phase 3, we'll pick the first lesson in the current week that hasn't been completed.
  // To keep it simple, we'll just query curriculum_lessons for this class/subject/term/week
  const curriculumLessonsForWeek = await db.select()
    .from(curriculumLessons)
    .where(
      and(
        eq(curriculumLessons.classLevelId, assignment.classLevelId),
        eq(curriculumLessons.subjectId, assignment.subjectId),
        eq(curriculumLessons.academicTermId, assignment.academicTermId!),
        eq(curriculumLessons.weekNumber, assignment.currentWeek!)
      )
    )
    .orderBy(curriculumLessons.lessonNumber);

  if (curriculumLessonsForWeek.length === 0) {
    redirect(`/dashboard/teach/missing?assignmentId=${assignment.id}`);
  }

  // For MVP, if we haven't completed any lessons this week, we pick lesson 1.
  // Let's find completed lessons this week to know which one to pick next.
  const completedLessonsThisWeek = await db.select({ curriculumLessonId: scheduledLessons.curriculumLessonId })
    .from(scheduledLessons)
    .where(
      and(
        eq(scheduledLessons.teacherClassSubjectId, assignment.id),
        eq(scheduledLessons.weekNumber, assignment.currentWeek!),
        eq(scheduledLessons.status, 'completed')
      )
    );

  const completedCurriculumLessonIds = new Set(completedLessonsThisWeek.map(l => l.curriculumLessonId));
  
  let nextCurriculumLesson = curriculumLessonsForWeek.find(l => !completedCurriculumLessonIds.has(l.id));
  
  // If all are completed for this week, we should ideally move to the next week. 
  // For MVP, we'll just return the first lesson of the week again or throw an error.
  if (!nextCurriculumLesson) {
    nextCurriculumLesson = curriculumLessonsForWeek[0]; // fallback
  }

  // Create a scheduled lesson
  const [newScheduledLesson] = await db.insert(scheduledLessons).values({
    teacherClassSubjectId: assignment.id,
    topic: nextCurriculumLesson.topic,
    learningObjectives: nextCurriculumLesson.learningObjective,
    teachingActivities: nextCurriculumLesson.activities,
    resources: nextCurriculumLesson.resources,
    durationMinutes: nextCurriculumLesson.durationMinutes,
    weekNumber: assignment.currentWeek,
    scheduledDate: new Date().toISOString().split('T')[0],
    source: 'manual',
    status: 'in_progress',
    curriculumLessonId: nextCurriculumLesson.id
  }).returning({ id: scheduledLessons.id });

  redirect(`/dashboard/teach/${newScheduledLesson.id}`);
}
