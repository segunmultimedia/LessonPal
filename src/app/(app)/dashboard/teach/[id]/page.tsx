import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { scheduledLessons, teacherClassSubjects, classLevels, subjects, academicTerms, indicators, contentStandards, subStrands, strands } from '@/lib/db/schema';
import { curriculumLessons, lessonExercises, exerciseQuestions } from '@/lib/db/schema/curriculum_library';
import { eq, and, asc } from 'drizzle-orm';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock } from 'lucide-react';
import { TeachClient } from './client';

export default async function TeachPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/signin');
  }
  const resolvedParams = await params;

  // Fetch the scheduled lesson and its assignment info
  const [lesson] = await db.select({
    id: scheduledLessons.id,
    curriculumLessonId: scheduledLessons.curriculumLessonId,
    status: scheduledLessons.status,
    className: classLevels.name,
    subjectName: subjects.name,
    termName: academicTerms.name,
    weekNumber: scheduledLessons.weekNumber,
    teacherClassSubjectId: scheduledLessons.teacherClassSubjectId
  })
  .from(scheduledLessons)
  .leftJoin(teacherClassSubjects, eq(scheduledLessons.teacherClassSubjectId, teacherClassSubjects.id))
  .leftJoin(classLevels, eq(teacherClassSubjects.classLevelId, classLevels.id))
  .leftJoin(subjects, eq(teacherClassSubjects.subjectId, subjects.id))
  .leftJoin(academicTerms, eq(teacherClassSubjects.academicTermId, academicTerms.id))
  .where(eq(scheduledLessons.id, resolvedParams.id))
  .limit(1);

  if (!lesson || !lesson.curriculumLessonId) {
    notFound();
  }

  // Fetch curriculum lesson content and hierarchy
  const [content] = await db.select({
    id: curriculumLessons.id,
    topic: curriculumLessons.topic,
    learningObjective: curriculumLessons.learningObjective,
    whatToTeach: curriculumLessons.whatToTeach,
    howToTeach: curriculumLessons.howToTeach,
    activities: curriculumLessons.activities,
    resources: curriculumLessons.resources,
    durationMinutes: curriculumLessons.durationMinutes,
    strandName: strands.name,
    subStrandName: subStrands.name
  })
    .from(curriculumLessons)
    .leftJoin(indicators, eq(curriculumLessons.indicatorId, indicators.id))
    .leftJoin(contentStandards, eq(indicators.contentStandardId, contentStandards.id))
    .leftJoin(subStrands, eq(contentStandards.subStrandId, subStrands.id))
    .leftJoin(strands, eq(subStrands.strandId, strands.id))
    .where(eq(curriculumLessons.id, lesson.curriculumLessonId))
    .limit(1);

  if (!content) {
    notFound();
  }

  // Fetch exercises and questions
  const exercisesData = await db.select()
    .from(lessonExercises)
    .where(eq(lessonExercises.curriculumLessonId, content.id))
    .orderBy(asc(lessonExercises.sortOrder));

  const exercisesWithQuestions = await Promise.all(
    exercisesData.map(async (ex) => {
      const q = await db.select()
        .from(exerciseQuestions)
        .where(eq(exerciseQuestions.exerciseId, ex.id))
        .orderBy(asc(exerciseQuestions.sortOrder));
      return { ...ex, questions: q };
    })
  );

  return (
    <div className="max-w-3xl mx-auto pb-24">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {lesson.className} • {lesson.subjectName}
            </h1>
            <p className="text-muted-foreground font-medium mt-1">
              {lesson.termName} • Week {lesson.weekNumber}
            </p>
          </div>
          {content.durationMinutes && (
            <div className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-md text-sm font-semibold self-start sm:self-auto border border-blue-100 dark:border-blue-800/50">
              <Clock className="w-4 h-4" />
              {content.durationMinutes} Min Lesson
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Today's Lesson */}
        <section className="bg-white dark:bg-gray-900 border rounded-2xl p-6 shadow-sm">
          {content.strandName && (
            <div className="mb-4">
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Topic</h2>
              <p className="text-sm font-medium text-foreground">{content.strandName}</p>
            </div>
          )}
          {content.subStrandName && (
            <div className="mb-6">
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Subtopic</h2>
              <p className="text-sm font-medium text-foreground">{content.subStrandName}</p>
            </div>
          )}
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Today&apos;s Lesson</h2>
          <h3 className="text-3xl font-bold tracking-tight mb-4">{content.topic}</h3>
          
          {content.learningObjective && (
            <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/50 rounded-xl p-4">
              <h4 className="text-sm font-bold text-blue-900 dark:text-blue-400 mb-1">Learning Objective</h4>
              <p className="text-blue-800 dark:text-blue-300 leading-relaxed text-sm">{content.learningObjective}</p>
            </div>
          )}
        </section>

        {/* What to Teach */}
        {content.whatToTeach && (
          <section className="bg-white dark:bg-gray-900 border rounded-2xl p-6 shadow-sm">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">What To Teach</h2>
            <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{content.whatToTeach}</p>
            </div>
          </section>
        )}

        {/* How to Teach It */}
        {content.howToTeach && (
          <section className="bg-white dark:bg-gray-900 border rounded-2xl p-6 shadow-sm">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">How To Teach It</h2>
            <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-muted-foreground">
              <p className="whitespace-pre-wrap">{content.howToTeach}</p>
            </div>
          </section>
        )}

        {/* Activities and Resources */}
        {(content.activities || content.resources) && (
          <section className="bg-white dark:bg-gray-900 border rounded-2xl p-6 shadow-sm">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Activities & Resources</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {content.activities && (
                <div>
                  <h4 className="font-semibold mb-2">Activities</h4>
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">{content.activities}</p>
                </div>
              )}
              {content.resources && (
                <div>
                  <h4 className="font-semibold mb-2">Resources</h4>
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">{content.resources}</p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      <TeachClient 
        scheduledLessonId={lesson.id} 
        teacherClassSubjectId={lesson.teacherClassSubjectId!}
        exercises={exercisesWithQuestions} 
      />
    </div>
  );
}
