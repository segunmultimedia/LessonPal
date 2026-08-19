import postgres from 'postgres';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(process.cwd(), '.env.local') });

async function fixDb() {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

  // Get the GOOD Basic 5 (Upper Primary)
  const goodB5 = await sql`
    SELECT cl.id 
    FROM class_levels cl
    JOIN academic_levels al ON cl.academic_level_id = al.id
    WHERE cl.name = 'Basic 5' AND al.name = 'Upper Primary'
  `;
  const goodB5Id = goodB5[0].id;
  
  // Get bad Basic 5s
  const badB5s = await sql`SELECT id FROM class_levels WHERE name = 'Basic 5' AND id != ${goodB5Id}`;
  
  for (const bad of badB5s) {
    const badId = bad.id;
    console.log('Deleting bad Basic 5 data for ID:', badId);

    await sql`DELETE FROM exercise_questions WHERE exercise_id IN (SELECT id FROM lesson_exercises WHERE curriculum_lesson_id IN (SELECT id FROM curriculum_lessons WHERE class_level_id = ${badId}))`;
    await sql`DELETE FROM lesson_exercises WHERE curriculum_lesson_id IN (SELECT id FROM curriculum_lessons WHERE class_level_id = ${badId})`;
    await sql`DELETE FROM curriculum_lessons WHERE class_level_id = ${badId}`;
    
    await sql`DELETE FROM indicators WHERE content_standard_id IN (SELECT id FROM content_standards WHERE sub_strand_id IN (SELECT id FROM sub_strands WHERE strand_id IN (SELECT id FROM strands WHERE class_level_id = ${badId})))`;
    await sql`DELETE FROM content_standards WHERE sub_strand_id IN (SELECT id FROM sub_strands WHERE strand_id IN (SELECT id FROM strands WHERE class_level_id = ${badId}))`;
    await sql`DELETE FROM sub_strands WHERE strand_id IN (SELECT id FROM strands WHERE class_level_id = ${badId})`;
    await sql`DELETE FROM strands WHERE class_level_id = ${badId}`;
    
    await sql`DELETE FROM class_level_subjects WHERE class_level_id = ${badId}`;
    await sql`DELETE FROM teacher_class_subjects WHERE class_level_id = ${badId}`;
    await sql`DELETE FROM class_levels WHERE id = ${badId}`;
  }
  
  console.log('Wipe complete!');
  await sql.end();
}

fixDb();
