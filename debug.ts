import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import { join } from 'path';
import { teacherClassSubjects } from './src/lib/db/schema';
import { curriculumLessons } from './src/lib/db/schema/curriculum_library';
import { curriculumSources } from './src/lib/db/schema/curriculum';

config({ path: join(process.cwd(), '.env.local') });

async function debug() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client);

  console.log("=== DB VERIFICATION ===");
  const assignments = await db.select().from(teacherClassSubjects);
  console.log(`Teacher Assignments Count: ${assignments.length}`);
  
  const sources = await db.select().from(curriculumSources);
  console.log(`Curriculum Sources Count: ${sources.length}`);
  
  const lessons = await db.select().from(curriculumLessons).limit(1);
  console.log("Sample Curriculum Lesson:");
  console.log(lessons[0]);
  
  process.exit(0);
}

debug();
