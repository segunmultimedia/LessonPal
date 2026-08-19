import postgres from 'postgres';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(process.cwd(), '.env.local') });

async function cleanupDb() {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

  // Delete class level without lessons
  await sql`
    DELETE FROM class_levels
    WHERE name = 'Basic 5'
    AND id NOT IN (
      SELECT class_level_id FROM curriculum_lessons WHERE class_level_id IS NOT NULL
    )
  `;

  // Delete Basic 4 duplicates without lessons
  await sql`
    DELETE FROM class_levels
    WHERE name = 'Basic 4'
    AND id NOT IN (
      SELECT class_level_id FROM curriculum_lessons WHERE class_level_id IS NOT NULL
    )
  `;
  
  console.log('Cleanup complete!');
  await sql.end();
}

cleanupDb();
