import postgres_js from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import { config } from 'dotenv';
config({ path: '.env.local' });

async function clean() {
  const dbUrl = process.env.DATABASE_URL!.replace('5432', '6543');
  const client = postgres_js(dbUrl);
  const db = drizzle(client);
  
  const query = `
    DELETE FROM curriculum_lessons WHERE class_level_id IN (SELECT id FROM class_levels WHERE name IN ('BASIC 1', 'BASIC 2', 'BASIC 3')) AND subject_id IN (SELECT id FROM subjects WHERE name = 'History');
    DELETE FROM indicators WHERE content_standard_id IN (
       SELECT id FROM content_standards WHERE sub_strand_id IN (
          SELECT id FROM sub_strands WHERE strand_id IN (
             SELECT id FROM strands WHERE class_level_id IN (SELECT id FROM class_levels WHERE name IN ('BASIC 1', 'BASIC 2', 'BASIC 3')) AND subject_id IN (SELECT id FROM subjects WHERE name = 'History')
          )
       )
    );
    DELETE FROM content_standards WHERE sub_strand_id IN (
       SELECT id FROM sub_strands WHERE strand_id IN (
          SELECT id FROM strands WHERE class_level_id IN (SELECT id FROM class_levels WHERE name IN ('BASIC 1', 'BASIC 2', 'BASIC 3')) AND subject_id IN (SELECT id FROM subjects WHERE name = 'History')
       )
    );
    DELETE FROM sub_strands WHERE strand_id IN (
       SELECT id FROM strands WHERE class_level_id IN (SELECT id FROM class_levels WHERE name IN ('BASIC 1', 'BASIC 2', 'BASIC 3')) AND subject_id IN (SELECT id FROM subjects WHERE name = 'History')
    );
    DELETE FROM strands WHERE class_level_id IN (SELECT id FROM class_levels WHERE name IN ('BASIC 1', 'BASIC 2', 'BASIC 3')) AND subject_id IN (SELECT id FROM subjects WHERE name = 'History');
    DELETE FROM class_level_subjects WHERE class_level_id IN (SELECT id FROM class_levels WHERE name IN ('BASIC 1', 'BASIC 2', 'BASIC 3')) AND subject_id IN (SELECT id FROM subjects WHERE name = 'History');
  `;
  
  await db.execute(sql.raw(query));
  console.log('Clean done');
  process.exit(0);
}
clean().catch(console.error);
