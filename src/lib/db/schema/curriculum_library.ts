import { pgTable, uuid, varchar, text, integer, timestamp, index, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { classLevels, subjects, academicTerms, curriculumSources, indicators, contentSourceStatusEnum, sequenceSourceStatusEnum, supportSourceStatusEnum } from './curriculum';

export const curriculumLessons = pgTable('curriculum_lessons', {
  id: uuid('id').primaryKey().defaultRandom(),
  classLevelId: uuid('class_level_id').notNull().references(() => classLevels.id),
  subjectId: uuid('subject_id').notNull().references(() => subjects.id),
  academicTermId: uuid('academic_term_id').references(() => academicTerms.id),
  weekNumber: integer('week_number'),
  lessonNumber: integer('lesson_number').notNull(),
  
  sourceId: uuid('source_id').references(() => curriculumSources.id),
  sourceReference: text('source_reference'),
  indicatorId: uuid('indicator_id').references(() => indicators.id),
  
  contentSourceStatus: contentSourceStatusEnum('content_source_status').default('UNVERIFIED'),
  sequenceSourceStatus: sequenceSourceStatusEnum('sequence_source_status').default('UNVERIFIED'),
  supportSourceStatus: supportSourceStatusEnum('support_source_status').default('UNVERIFIED'),
  topic: text('topic').notNull(),
  learningObjective: text('learning_objective'),
  whatToTeach: text('what_to_teach'),
  howToTeach: text('how_to_teach'),
  activities: text('activities'),
  resources: text('resources'),
  durationMinutes: integer('duration_minutes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    classSubjectTermIdx: index('curriculum_lessons_class_subject_term_idx').on(table.classLevelId, table.subjectId, table.academicTermId),
    weekLessonIdx: index('curriculum_lessons_week_lesson_idx').on(table.weekNumber, table.lessonNumber),
    unqLessonIdentity: unique('curriculum_lessons_identity_unq').on(table.classLevelId, table.subjectId, table.academicTermId, table.weekNumber, table.lessonNumber, table.indicatorId),
  };
});

export const lessonExercises = pgTable('lesson_exercises', {
  id: uuid('id').primaryKey().defaultRandom(),
  curriculumLessonId: uuid('curriculum_lesson_id').notNull().references(() => curriculumLessons.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 200 }).notNull(),
  sortOrder: integer('sort_order').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    curriculumLessonIdIdx: index('lesson_exercises_curriculum_lesson_id_idx').on(table.curriculumLessonId),
    unqExerciseIdentity: unique('lesson_exercises_identity_unq').on(table.curriculumLessonId, table.title),
  };
});

export const exerciseQuestions = pgTable('exercise_questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  exerciseId: uuid('exercise_id').notNull().references(() => lessonExercises.id, { onDelete: 'cascade' }),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  sortOrder: integer('sort_order').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    exerciseIdIdx: index('exercise_questions_exercise_id_idx').on(table.exerciseId),
    unqQuestionIdentity: unique('exercise_questions_identity_unq').on(table.exerciseId, table.sortOrder),
  };
});

// Relations
export const curriculumLessonsRelations = relations(curriculumLessons, ({ one, many }) => ({
  classLevel: one(classLevels, {
    fields: [curriculumLessons.classLevelId],
    references: [classLevels.id],
  }),
  subject: one(subjects, {
    fields: [curriculumLessons.subjectId],
    references: [subjects.id],
  }),
  academicTerm: one(academicTerms, {
    fields: [curriculumLessons.academicTermId],
    references: [academicTerms.id],
  }),
  source: one(curriculumSources, {
    fields: [curriculumLessons.sourceId],
    references: [curriculumSources.id],
  }),
  indicator: one(indicators, {
    fields: [curriculumLessons.indicatorId],
    references: [indicators.id],
  }),
  exercises: many(lessonExercises),
}));

export const lessonExercisesRelations = relations(lessonExercises, ({ one, many }) => ({
  lesson: one(curriculumLessons, {
    fields: [lessonExercises.curriculumLessonId],
    references: [curriculumLessons.id],
  }),
  questions: many(exerciseQuestions),
}));

export const exerciseQuestionsRelations = relations(exerciseQuestions, ({ one }) => ({
  exercise: one(lessonExercises, {
    fields: [exerciseQuestions.exerciseId],
    references: [lessonExercises.id],
  }),
}));
