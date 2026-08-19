import postgres from 'postgres';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(process.cwd(), '.env.local') });

async function verifyDb() {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });
  const count = await sql`SELECT COUNT(*) FROM curriculum_lessons`;
  console.log('Total Lessons:', count[0].count);

  const basic5Lessons = await sql`
    SELECT count(*) 
    FROM curriculum_lessons 
    WHERE class_level_id = (
      SELECT cl.id FROM class_levels cl JOIN academic_levels al ON cl.academic_level_id = al.id WHERE cl.name = 'Basic 5' AND al.name = 'Upper Primary'
    ) 
    AND subject_id = (SELECT id FROM subjects WHERE name = 'English Language')
  `;
  console.log(`Basic 5 Lessons: ${basic5Lessons[0].count}`);

  const basic5Indicators = await sql`
    SELECT count(*) 
    FROM indicators 
    WHERE content_standard_id IN (
      SELECT id FROM content_standards WHERE sub_strand_id IN (
        SELECT id FROM sub_strands WHERE strand_id IN (
          SELECT id FROM strands WHERE class_level_id = (
            SELECT cl.id FROM class_levels cl JOIN academic_levels al ON cl.academic_level_id = al.id WHERE cl.name = 'Basic 5' AND al.name = 'Upper Primary'
          )
        )
      )
    )
  `;console.log('Basic 5 Indicators:', basic5Indicators[0].count);

  await sql.end();
}

verifyDb();
