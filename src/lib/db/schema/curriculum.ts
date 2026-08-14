import { pgTable, uuid, varchar, text, integer, boolean, timestamp, unique, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const countries = pgTable('countries', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  code: varchar('code', { length: 3 }).notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
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
