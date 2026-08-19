import postgres from 'postgres';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(process.cwd(), '.env.local') });

async function verifyDb() {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });
  const subjects = await sql`SELECT id, name, curriculum_id FROM subjects`;
  console.log('Subjects:', subjects);
  const classLevels = await sql`SELECT id, name FROM class_levels`;
  console.log('Class Levels:', classLevels);
  await sql.end();
}

verifyDb();
