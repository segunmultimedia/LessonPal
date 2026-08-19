import postgres from 'postgres';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(process.cwd(), '.env.local') });

async function cleanupDb() {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

  // Use min(id::text)::uuid
  await sql`
    DELETE FROM class_levels
    WHERE id NOT IN (
      SELECT min(id::text)::uuid FROM class_levels GROUP BY name, academic_level_id
    )
  `;

  await sql`
    DELETE FROM academic_levels
    WHERE id NOT IN (
      SELECT min(id::text)::uuid FROM academic_levels GROUP BY name, curriculum_id
    )
  `;

  await sql`
    DELETE FROM curricula
    WHERE id NOT IN (
      SELECT min(id::text)::uuid FROM curricula GROUP BY name, country_id
    )
  `;

  await sql`
    DELETE FROM curriculum_sources
    WHERE id NOT IN (
      SELECT min(id::text)::uuid FROM curriculum_sources GROUP BY title
    )
  `;
  
  await sql`
    DELETE FROM subjects
    WHERE id NOT IN (
      SELECT min(id::text)::uuid FROM subjects GROUP BY name, curriculum_id
    )
  `;

  console.log('Cleanup complete!');
  await sql.end();
}

cleanupDb();
