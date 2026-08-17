import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import { join } from 'path';
import { teacherClassSubjects } from './src/lib/db/schema';

config({ path: join(process.cwd(), '.env.local') });

async function debug() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client);

  const assignments = await db.select().from(teacherClassSubjects);
  console.log("Teacher Assignments:");
  console.log(assignments);
  
  process.exit(0);
}

debug();
