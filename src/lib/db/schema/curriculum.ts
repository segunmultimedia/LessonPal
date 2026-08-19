import { pgTable, uuid, varchar, text, integer, boolean, timestamp, unique, index, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const countries = pgTable('countries', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  code: varchar('code', { length: 3 }).notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const contentSourceStatusEnum = pgEnum('content_source_status', ['OFFICIAL_NACCA', 'UNVERIFIED']);
export const sequenceSourceStatusEnum = pgEnum('sequence_source_status', ['OFFICIAL_NACCA_SEQUENCE', 'LESSONPAL_GENERATED_SEQUENCE', 'UNVERIFIED']);
export const supportSourceStatusEnum = pgEnum('support_source_status', ['OFFICIAL_NACCA', 'LESSONPAL_GENERATED', 'TEACHER_UPLOADED', 'UNVERIFIED']);

export const curriculumSources = pgTable('curriculum_sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 300 }).notNull(),
  sourceType: varchar('source_type', { length: 100 }),
  urlOrReference: text('url_or_reference'),
  versionYear: varchar('version_year', { length: 50 }),
  dateImported: timestamp('date_imported', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    unqSourceIdentity: unique('curriculum_sources_identity_unq').on(table.title, table.versionYear),
  };
});

export const curricula = pgTable('curricula', {
  id: uuid('id').primaryKey().defaultRandom(),
  countryId: uuid('country_id').notNull().references(() => countries.id),
  name: varchar('name', { length: 200 }).notNull(),
  version: varchar('version', { length: 50 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    countryIdIdx: index('curricula_country_id_idx').on(table.countryId),
    unqCurriculumIdentity: unique('curricula_identity_unq').on(table.countryId, table.name, table.version),
  };
});

export const academicLevels = pgTable('academic_levels', {
  id: uuid('id').primaryKey().defaultRandom(),
  curriculumId: uuid('curriculum_id').notNull().references(() => curricula.id),
  name: varchar('name', { length: 100 }).notNull(),
  sortOrder: integer('sort_order').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    curriculumIdIdx: index('academic_levels_curriculum_id_idx').on(table.curriculumId),
    unqAcademicLevelIdentity: unique('academic_levels_identity_unq').on(table.curriculumId, table.name),
  };
});

export const classLevels = pgTable('class_levels', {
  id: uuid('id').primaryKey().defaultRandom(),
  academicLevelId: uuid('academic_level_id').notNull().references(() => academicLevels.id),
  name: varchar('name', { length: 100 }).notNull(),
  shortName: varchar('short_name', { length: 20 }),
  sortOrder: integer('sort_order').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    academicLevelIdIdx: index('class_levels_academic_level_id_idx').on(table.academicLevelId),
    unqClassLevelIdentity: unique('class_levels_identity_unq').on(table.academicLevelId, table.name),
  };
});

export const subjects = pgTable('subjects', {
  id: uuid('id').primaryKey().defaultRandom(),
  curriculumId: uuid('curriculum_id').notNull().references(() => curricula.id),
  name: varchar('name', { length: 100 }).notNull(),
  code: varchar('code', { length: 20 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    curriculumIdIdx: index('subjects_curriculum_id_idx').on(table.curriculumId),
    unqSubjectIdentity: unique('subjects_identity_unq').on(table.curriculumId, table.name),
  };
});

export const classLevelSubjects = pgTable('class_level_subjects', {
  id: uuid('id').primaryKey().defaultRandom(),
  classLevelId: uuid('class_level_id').notNull().references(() => classLevels.id),
  subjectId: uuid('subject_id').notNull().references(() => subjects.id),
}, (table) => {
  return {
    classLevelIdIdx: index('class_level_subjects_class_level_id_idx').on(table.classLevelId),
    subjectIdIdx: index('class_level_subjects_subject_id_idx').on(table.subjectId),
    unq: unique().on(table.classLevelId, table.subjectId),
  };
});

export const academicTerms = pgTable('academic_terms', {
  id: uuid('id').primaryKey().defaultRandom(),
  curriculumId: uuid('curriculum_id').notNull().references(() => curricula.id),
  name: varchar('name', { length: 50 }).notNull(),
  termNumber: integer('term_number').notNull(),
  totalWeeks: integer('total_weeks').notNull(),
  sortOrder: integer('sort_order').notNull(),
}, (table) => {
  return {
    curriculumIdIdx: index('academic_terms_curriculum_id_idx').on(table.curriculumId),
    unqTermIdentity: unique('academic_terms_identity_unq').on(table.curriculumId, table.termNumber),
  };
});

export const strands = pgTable('strands', {
  id: uuid('id').primaryKey().defaultRandom(),
  subjectId: uuid('subject_id').notNull().references(() => subjects.id),
  classLevelId: uuid('class_level_id').notNull().references(() => classLevels.id),
  name: varchar('name', { length: 300 }).notNull(),
  code: varchar('code', { length: 50 }),
  sortOrder: integer('sort_order').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    subjectIdIdx: index('strands_subject_id_idx').on(table.subjectId),
    classLevelIdIdx: index('strands_class_level_id_idx').on(table.classLevelId),
    unqStrandIdentity: unique('strands_identity_unq').on(table.subjectId, table.classLevelId, table.sortOrder),
  };
});

export const subStrands = pgTable('sub_strands', {
  id: uuid('id').primaryKey().defaultRandom(),
  strandId: uuid('strand_id').notNull().references(() => strands.id),
  name: varchar('name', { length: 300 }).notNull(),
  code: varchar('code', { length: 50 }),
  sortOrder: integer('sort_order').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    strandIdIdx: index('sub_strands_strand_id_idx').on(table.strandId),
    unqSubStrandIdentity: unique('sub_strands_identity_unq').on(table.strandId, table.sortOrder),
  };
});

export const contentStandards = pgTable('content_standards', {
  id: uuid('id').primaryKey().defaultRandom(),
  subStrandId: uuid('sub_strand_id').notNull().references(() => subStrands.id),
  description: text('description').notNull(),
  code: varchar('code', { length: 50 }),
  sortOrder: integer('sort_order').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    subStrandIdIdx: index('content_standards_sub_strand_id_idx').on(table.subStrandId),
    unqContentStandardIdentity: unique('content_standards_identity_unq').on(table.subStrandId, table.code),
  };
});

export const indicators = pgTable('indicators', {
  id: uuid('id').primaryKey().defaultRandom(),
  contentStandardId: uuid('content_standard_id').notNull().references(() => contentStandards.id),
  description: text('description').notNull(),
  code: varchar('code', { length: 50 }),
  academicTermId: uuid('academic_term_id').references(() => academicTerms.id),
  weekNumber: integer('week_number'),
  sortOrder: integer('sort_order').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    contentStandardIdIdx: index('indicators_content_standard_id_idx').on(table.contentStandardId),
    academicTermIdIdx: index('indicators_academic_term_id_idx').on(table.academicTermId),
    unqIndicatorIdentity: unique('indicators_identity_unq').on(table.contentStandardId, table.code),
  };
});

// Relations
export const countriesRelations = relations(countries, ({ many }) => ({
  curricula: many(curricula),
}));

export const curriculaRelations = relations(curricula, ({ one, many }) => ({
  country: one(countries, {
    fields: [curricula.countryId],
    references: [countries.id],
  }),
  academicLevels: many(academicLevels),
  subjects: many(subjects),
  academicTerms: many(academicTerms),
}));

export const academicLevelsRelations = relations(academicLevels, ({ one, many }) => ({
  curriculum: one(curricula, {
    fields: [academicLevels.curriculumId],
    references: [curricula.id],
  }),
  classLevels: many(classLevels),
}));

export const classLevelsRelations = relations(classLevels, ({ one, many }) => ({
  academicLevel: one(academicLevels, {
    fields: [classLevels.academicLevelId],
    references: [academicLevels.id],
  }),
  classLevelSubjects: many(classLevelSubjects),
  strands: many(strands),
}));

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  curriculum: one(curricula, {
    fields: [subjects.curriculumId],
    references: [curricula.id],
  }),
  classLevelSubjects: many(classLevelSubjects),
  strands: many(strands),
}));

export const classLevelSubjectsRelations = relations(classLevelSubjects, ({ one }) => ({
  classLevel: one(classLevels, {
    fields: [classLevelSubjects.classLevelId],
    references: [classLevels.id],
  }),
  subject: one(subjects, {
    fields: [classLevelSubjects.subjectId],
    references: [subjects.id],
  }),
}));

export const academicTermsRelations = relations(academicTerms, ({ one, many }) => ({
  curriculum: one(curricula, {
    fields: [academicTerms.curriculumId],
    references: [curricula.id],
  }),
  indicators: many(indicators),
}));

export const strandsRelations = relations(strands, ({ one, many }) => ({
  subject: one(subjects, {
    fields: [strands.subjectId],
    references: [subjects.id],
  }),
  classLevel: one(classLevels, {
    fields: [strands.classLevelId],
    references: [classLevels.id],
  }),
  subStrands: many(subStrands),
}));

export const subStrandsRelations = relations(subStrands, ({ one, many }) => ({
  strand: one(strands, {
    fields: [subStrands.strandId],
    references: [strands.id],
  }),
  contentStandards: many(contentStandards),
}));

export const contentStandardsRelations = relations(contentStandards, ({ one, many }) => ({
  subStrand: one(subStrands, {
    fields: [contentStandards.subStrandId],
    references: [subStrands.id],
  }),
  indicators: many(indicators),
}));

export const indicatorsRelations = relations(indicators, ({ one }) => ({
  contentStandard: one(contentStandards, {
    fields: [indicators.contentStandardId],
    references: [contentStandards.id],
  }),
  academicTerm: one(academicTerms, {
    fields: [indicators.academicTermId],
    references: [academicTerms.id],
  }),
}));
