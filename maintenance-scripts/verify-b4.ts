import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import { join } from 'path';
import { sql as drizzleSql } from 'drizzle-orm';
import {
  indicators,
  curricula,
  academicLevels,
  classLevels,
  subjects,
  academicTerms,
  strands,
  subStrands,
  contentStandards,
} from './src/lib/db/schema/curriculum';
import {
  curriculumLessons,
  lessonExercises,
  exerciseQuestions
} from './src/lib/db/schema/curriculum_library';

config({ path: join(process.cwd(), '.env.local') });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString);
const db = drizzle(sql);

async function verify() {
  console.log("=== DB VERIFICATION ===");
  const indicatorCount = await db.select({ count: drizzleSql<number>`count(*)` }).from(indicators);
  const lessonsCount = await db.select({ count: drizzleSql<number>`count(*)` }).from(curriculumLessons);
  const exercisesCount = await db.select({ count: drizzleSql<number>`count(*)` }).from(lessonExercises);
  const questionsCount = await db.select({ count: drizzleSql<number>`count(*)` }).from(exerciseQuestions);
  const termsCount = await db.select({ count: drizzleSql<number>`count(*)` }).from(academicTerms);
  const strandsCount = await db.select({ count: drizzleSql<number>`count(*)` }).from(strands);
  const subStrandsCount = await db.select({ count: drizzleSql<number>`count(*)` }).from(subStrands);
  const contentStandardsCount = await db.select({ count: drizzleSql<number>`count(*)` }).from(contentStandards);

  console.log({
    indicators: indicatorCount[0].count,
    lessons: lessonsCount[0].count,
    exercises: exercisesCount[0].count,
    questions: questionsCount[0].count,
    terms: termsCount[0].count,
    strands: strandsCount[0].count,
    subStrands: subStrandsCount[0].count,
    contentStandards: contentStandardsCount[0].count,
  });

  const missingIndicators = await db.select({ count: drizzleSql<number>`count(*)` }).from(curriculumLessons).where(drizzleSql`indicator_id IS NULL`);
  console.log("Lessons with missing indicators:", missingIndicators[0].count);

  process.exit(0);
}

verify().catch(console.error);
