import { drizzle } from 'drizzle-orm/postgres-js';
import postgres_js from 'postgres';
import { sql } from 'drizzle-orm';
import { config } from 'dotenv';
config({ path: '.env.local' });

async function clean() {
  const dbUrl = process.env.DATABASE_URL!.replace('5432', '6543');
  const client = postgres_js(dbUrl);
  const db = drizzle(client);
  console.log('Cleaning Basic 1-3 History...');
  
  await db.execute(sql.raw("DELETE FROM curriculum_sources WHERE title = 'History' AND class_level_id IN (SELECT id FROM class_levels WHERE name IN ('BASIC 1', 'BASIC 2', 'BASIC 3'))"));
  
  console.log('Done');
  process.exit(0);
}
clean().catch(console.error);
