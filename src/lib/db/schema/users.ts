import { pgTable, uuid, varchar, text, boolean, timestamp, pgEnum, unique, index, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { countries, curricula, classLevels, subjects, academicTerms } from './curriculum';

export const userRoleEnum = pgEnum('user_role', ['teacher', 'supervisor', 'admin']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  fullName: varchar('full_name', { length: 200 }).notNull(),
  avatarUrl: text('avatar_url'),
  emailVerified: boolean('email_verified').default(false),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
});

export const userRoles = pgTable('user_roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: userRoleEnum('role').notNull(),
  grantedAt: timestamp('granted_at', { withTimezone: true }).defaultNow(),
  grantedBy: uuid('granted_by').references(() => users.id),
}, (table) => {
  return {
    userIdIdx: index('user_roles_user_id_idx').on(table.userId),
    unq: unique().on(table.userId, table.role),
  };
});

export const schools = pgTable('schools', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 300 }).notNull(),
  location: varchar('location', { length: 300 }),
  district: varchar('district', { length: 200 }),
  region: varchar('region', { length: 200 }),
  countryId: uuid('country_id').references(() => countries.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    countryIdIdx: index('schools_country_id_idx').on(table.countryId),
  };
});

export const teacherProfiles = pgTable('teacher_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  schoolId: uuid('school_id').references(() => schools.id),
  staffId: varchar('staff_id', { length: 50 }),
  phone: varchar('phone', { length: 20 }),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  curriculumId: uuid('curriculum_id').references(() => curricula.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, (table) => {
  return {
    schoolIdIdx: index('teacher_profiles_school_id_idx').on(table.schoolId),
    curriculumIdIdx: index('teacher_profiles_curriculum_id_idx').on(table.curriculumId),
  };
});

export const teacherClassSubjects = pgTable('teacher_class_subjects', {
  id: uuid('id').primaryKey().defaultRandom(),
  teacherProfileId: uuid('teacher_profile_id').notNull().references(() => teacherProfiles.id, { onDelete: 'cascade' }),
  classLevelId: uuid('class_level_id').notNull().references(() => classLevels.id),
  subjectId: uuid('subject_id').notNull().references(() => subjects.id),
  academicTermId: uuid('academic_term_id').references(() => academicTerms.id),
  academicYear: varchar('academic_year', { length: 9 }),
  currentWeek: integer('current_week'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    teacherProfileIdIdx: index('teacher_class_subjects_teacher_profile_id_idx').on(table.teacherProfileId),
    classLevelIdIdx: index('teacher_class_subjects_class_level_id_idx').on(table.classLevelId),
    subjectIdIdx: index('teacher_class_subjects_subject_id_idx').on(table.subjectId),
    academicTermIdIdx: index('teacher_class_subjects_academic_term_id_idx').on(table.academicTermId),
    unq: unique().on(table.teacherProfileId, table.classLevelId, table.subjectId, table.academicTermId),
  };
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  roles: many(userRoles),
  teacherProfile: one(teacherProfiles, {
    fields: [users.id],
    references: [teacherProfiles.userId],
  }),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
    relationName: 'userRolesUser'
  }),
  grantedByUser: one(users, {
    fields: [userRoles.grantedBy],
    references: [users.id],
    relationName: 'userRolesGrantedBy'
  }),
}));

export const schoolsRelations = relations(schools, ({ one, many }) => ({
  country: one(countries, {
    fields: [schools.countryId],
    references: [countries.id],
  }),
  teachers: many(teacherProfiles),
}));

export const teacherProfilesRelations = relations(teacherProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [teacherProfiles.userId],
    references: [users.id],
  }),
  school: one(schools, {
    fields: [teacherProfiles.schoolId],
    references: [schools.id],
  }),
  curriculum: one(curricula, {
    fields: [teacherProfiles.curriculumId],
    references: [curricula.id],
  }),
  teacherClassSubjects: many(teacherClassSubjects),
}));

export const teacherClassSubjectsRelations = relations(teacherClassSubjects, ({ one }) => ({
  teacherProfile: one(teacherProfiles, {
    fields: [teacherClassSubjects.teacherProfileId],
    references: [teacherProfiles.id],
  }),
  classLevel: one(classLevels, {
    fields: [teacherClassSubjects.classLevelId],
    references: [classLevels.id],
  }),
  subject: one(subjects, {
    fields: [teacherClassSubjects.subjectId],
    references: [subjects.id],
  }),
  academicTerm: one(academicTerms, {
    fields: [teacherClassSubjects.academicTermId],
    references: [academicTerms.id],
  }),
}));
