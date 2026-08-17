import { pgTable, uuid, varchar, text, integer, boolean, timestamp, pgEnum, date, time, numeric, jsonb, index, AnyPgColumn } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { teacherProfiles, teacherClassSubjects, users } from './users';
import { classLevels, subjects, indicators } from './curriculum';
import { curriculumLessons } from './curriculum_library';

export const uploadStatusEnum = pgEnum('upload_status', ['pending', 'processing', 'extracted', 'review', 'approved', 'failed']);
export const lessonStatusEnum = pgEnum('lesson_status', ['upcoming', 'today', 'in_progress', 'completed', 'partially_completed', 'not_taught', 'carried_forward', 'skipped']);
export const carryOverResolutionEnum = pgEnum('carry_over_resolution', ['pending', 'carried_forward', 'rescheduled', 'merged', 'skipped']);
export const lessonSourceEnum = pgEnum('lesson_source', ['upload', 'manual']);

export const documentUploads = pgTable('document_uploads', {
  id: uuid('id').primaryKey().defaultRandom(),
  teacherProfileId: uuid('teacher_profile_id').notNull().references(() => teacherProfiles.id),
  originalFilename: varchar('original_filename', { length: 500 }).notNull(),
  storagePath: text('storage_path').notNull(),
  fileType: varchar('file_type', { length: 10 }).notNull(),
  fileSizeBytes: integer('file_size_bytes'),
  status: uploadStatusEnum('status').default('pending'),
  pageCount: integer('page_count'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, (table) => {
  return {
    teacherProfileIdIdx: index('document_uploads_teacher_profile_id_idx').on(table.teacherProfileId),
    statusIdx: index('document_uploads_status_idx').on(table.status),
  };
});

export const extractionResults = pgTable('extraction_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  documentUploadId: uuid('document_upload_id').notNull().references(() => documentUploads.id, { onDelete: 'cascade' }),
  extractedClass: varchar('extracted_class', { length: 100 }),
  extractedSubject: varchar('extracted_subject', { length: 100 }),
  extractedTerm: varchar('extracted_term', { length: 50 }),
  extractedWeek: integer('extracted_week'),
  extractedDate: date('extracted_date'),
  extractedDay: varchar('extracted_day', { length: 20 }),
  extractedStrand: text('extracted_strand'),
  extractedSubStrand: text('extracted_sub_strand'),
  extractedTopic: text('extracted_topic'),
  extractedContentStandard: text('extracted_content_standard'),
  extractedIndicator: text('extracted_indicator'),
  extractedLearningObjectives: text('extracted_learning_objectives'),
  extractedTeachingActivities: text('extracted_teaching_activities'),
  extractedLearnerActivities: text('extracted_learner_activities'),
  extractedAssessment: text('extracted_assessment'),
  extractedResources: text('extracted_resources'),
  extractedDuration: varchar('extracted_duration', { length: 50 }),
  confidenceScore: numeric('confidence_score', { precision: 3, scale: 2 }),
  rawAiResponse: jsonb('raw_ai_response'),
  teacherCorrections: jsonb('teacher_corrections'),
  isTeacherApproved: boolean('is_teacher_approved').default(false),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  resolvedClassLevelId: uuid('resolved_class_level_id').references(() => classLevels.id),
  resolvedSubjectId: uuid('resolved_subject_id').references(() => subjects.id),
  resolvedIndicatorId: uuid('resolved_indicator_id').references(() => indicators.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, (table) => {
  return {
    documentUploadIdIdx: index('extraction_results_document_upload_id_idx').on(table.documentUploadId),
  };
});

export const teachingPeriods = pgTable('teaching_periods', {
  id: uuid('id').primaryKey().defaultRandom(),
  teacherClassSubjectId: uuid('teacher_class_subject_id').notNull().references(() => teacherClassSubjects.id, { onDelete: 'cascade' }),
  dayOfWeek: integer('day_of_week').notNull(),
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    teacherClassSubjectIdIdx: index('teaching_periods_teacher_class_subject_id_idx').on(table.teacherClassSubjectId),
  };
});

export const scheduledLessons = pgTable('scheduled_lessons', {
  id: uuid('id').primaryKey().defaultRandom(),
  teacherClassSubjectId: uuid('teacher_class_subject_id').notNull().references(() => teacherClassSubjects.id),
  topic: text('topic').notNull(),
  strand: text('strand'),
  subStrand: text('sub_strand'),
  contentStandard: text('content_standard'),
  learningObjectives: text('learning_objectives'),
  teachingActivities: text('teaching_activities'),
  learnerActivities: text('learner_activities'),
  assessment: text('assessment'),
  resources: text('resources'),
  indicatorId: uuid('indicator_id').references(() => indicators.id),
  scheduledDate: date('scheduled_date').notNull(),
  scheduledTime: time('scheduled_time'),
  durationMinutes: integer('duration_minutes'),
  weekNumber: integer('week_number'),
  source: lessonSourceEnum('source').default('manual'),
  extractionResultId: uuid('extraction_result_id').references(() => extractionResults.id),
  status: lessonStatusEnum('status').default('upcoming'),
  sortOrder: integer('sort_order').notNull().default(0),
  curriculumLessonId: uuid('curriculum_lesson_id').references(() => curriculumLessons.id),
  originalLessonId: uuid('original_lesson_id').references((): AnyPgColumn => scheduledLessons.id),
  isCarryOver: boolean('is_carry_over').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, (table) => {
  return {
    teacherClassSubjectIdIdx: index('scheduled_lessons_teacher_class_subject_id_idx').on(table.teacherClassSubjectId),
    scheduledDateIdx: index('scheduled_lessons_scheduled_date_idx').on(table.scheduledDate),
    teacherClassSubjectDateIdx: index('scheduled_lessons_teacher_class_subject_date_idx').on(table.teacherClassSubjectId, table.scheduledDate),
    statusIdx: index('scheduled_lessons_status_idx').on(table.status),
  };
});

export const lessonProgress = pgTable('lesson_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  scheduledLessonId: uuid('scheduled_lesson_id').notNull().references(() => scheduledLessons.id),
  status: lessonStatusEnum('status').notNull(),
  actualDate: date('actual_date').notNull(),
  actualStartTime: time('actual_start_time'),
  actualEndTime: time('actual_end_time'),
  stoppedAtDescription: text('stopped_at_description'),
  stoppedAtSection: varchar('stopped_at_section', { length: 200 }),
  remainingContent: text('remaining_content'),
  estimatedRemainingMinutes: integer('estimated_remaining_minutes'),
  teacherNotes: text('teacher_notes'),
  skipReason: text('skip_reason'),
  recordedBy: uuid('recorded_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    scheduledLessonIdIdx: index('lesson_progress_scheduled_lesson_id_idx').on(table.scheduledLessonId),
    statusIdx: index('lesson_progress_status_idx').on(table.status),
  };
});

export const carryOvers = pgTable('carry_overs', {
  id: uuid('id').primaryKey().defaultRandom(),
  sourceLessonId: uuid('source_lesson_id').notNull().references(() => scheduledLessons.id),
  resolution: carryOverResolutionEnum('resolution').default('pending'),
  targetLessonId: uuid('target_lesson_id').references(() => scheduledLessons.id),
  targetDate: date('target_date'),
  reason: text('reason'),
  skipReason: text('skip_reason'),
  resolvedBy: uuid('resolved_by').references(() => users.id),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    sourceLessonIdIdx: index('carry_overs_source_lesson_id_idx').on(table.sourceLessonId),
    targetLessonIdIdx: index('carry_overs_target_lesson_id_idx').on(table.targetLessonId),
    resolutionIdx: index('carry_overs_resolution_idx').on(table.resolution),
  };
});

// Relations
export const documentUploadsRelations = relations(documentUploads, ({ one, many }) => ({
  teacherProfile: one(teacherProfiles, {
    fields: [documentUploads.teacherProfileId],
    references: [teacherProfiles.id],
  }),
  extractionResults: many(extractionResults),
}));

export const extractionResultsRelations = relations(extractionResults, ({ one, many }) => ({
  documentUpload: one(documentUploads, {
    fields: [extractionResults.documentUploadId],
    references: [documentUploads.id],
  }),
  resolvedClassLevel: one(classLevels, {
    fields: [extractionResults.resolvedClassLevelId],
    references: [classLevels.id],
  }),
  resolvedSubject: one(subjects, {
    fields: [extractionResults.resolvedSubjectId],
    references: [subjects.id],
  }),
  resolvedIndicator: one(indicators, {
    fields: [extractionResults.resolvedIndicatorId],
    references: [indicators.id],
  }),
  scheduledLessons: many(scheduledLessons),
}));

export const teachingPeriodsRelations = relations(teachingPeriods, ({ one }) => ({
  teacherClassSubject: one(teacherClassSubjects, {
    fields: [teachingPeriods.teacherClassSubjectId],
    references: [teacherClassSubjects.id],
  }),
}));

export const scheduledLessonsRelations = relations(scheduledLessons, ({ one, many }) => ({
  teacherClassSubject: one(teacherClassSubjects, {
    fields: [scheduledLessons.teacherClassSubjectId],
    references: [teacherClassSubjects.id],
  }),
  indicator: one(indicators, {
    fields: [scheduledLessons.indicatorId],
    references: [indicators.id],
  }),
  extractionResult: one(extractionResults, {
    fields: [scheduledLessons.extractionResultId],
    references: [extractionResults.id],
  }),
  curriculumLesson: one(curriculumLessons, {
    fields: [scheduledLessons.curriculumLessonId],
    references: [curriculumLessons.id],
  }),
  originalLesson: one(scheduledLessons, {
    fields: [scheduledLessons.originalLessonId],
    references: [scheduledLessons.id],
    relationName: 'originalLessonRef'
  }),
  derivedLessons: many(scheduledLessons, {
    relationName: 'originalLessonRef'
  }),
  progressRecords: many(lessonProgress),
  carryOversAsSource: many(carryOvers, { relationName: 'sourceCarryOver' }),
  carryOversAsTarget: many(carryOvers, { relationName: 'targetCarryOver' }),
}));

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  scheduledLesson: one(scheduledLessons, {
    fields: [lessonProgress.scheduledLessonId],
    references: [scheduledLessons.id],
  }),
  recordedByUser: one(users, {
    fields: [lessonProgress.recordedBy],
    references: [users.id],
  }),
}));

export const carryOversRelations = relations(carryOvers, ({ one }) => ({
  sourceLesson: one(scheduledLessons, {
    fields: [carryOvers.sourceLessonId],
    references: [scheduledLessons.id],
    relationName: 'sourceCarryOver'
  }),
  targetLesson: one(scheduledLessons, {
    fields: [carryOvers.targetLessonId],
    references: [scheduledLessons.id],
    relationName: 'targetCarryOver'
  }),
  resolvedByUser: one(users, {
    fields: [carryOvers.resolvedBy],
    references: [users.id],
  }),
}));
