import postgres from 'postgres';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(process.cwd(), '.env.local') });

async function verifyDb() {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });
  const classLevels = await sql`SELECT id, academic_level_id FROM class_levels WHERE name = 'Basic 5'`;
  console.log('B5 ClassLevels:', classLevels);
  const al = await sql`SELECT id, name FROM academic_levels`;
  console.log('AcademicLevels:', al);
  await sql.end();
}

verifyDb();
