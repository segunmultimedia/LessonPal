import postgres from 'postgres';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(process.cwd(), '.env.local') });

async function verifyDb() {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });
  const b4 = await sql`SELECT id, academic_level_id, name FROM class_levels WHERE name = 'Basic 4'`;
  console.log('B4:', b4);
  const al = await sql`SELECT id, name FROM academic_levels`;
  console.log('AL:', al);
  await sql.end();
}

verifyDb();
