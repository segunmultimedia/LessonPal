import postgres from 'postgres';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(process.cwd(), '.env.local') });

async function fixDb() {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

  // Find the duplicate Basic 5 (the one not referenced by teacher_class_subjects)
  const classLevels = await sql`SELECT id FROM class_levels WHERE name = 'Basic 5' AND id NOT IN (SELECT class_level_id FROM teacher_class_subjects WHERE class_level_id IS NOT NULL)`;
  
  if (classLevels.length === 0) {
     console.log('No duplicate Basic 5 found');
     await sql.end();
     return;
  }
  
  const badB5Id = classLevels[0].id;
  console.log('Deleting bad Basic 5 data for ID:', badB5Id);

  // Cascading up
  await sql`DELETE FROM exercise_questions WHERE exercise_id IN (SELECT id FROM lesson_exercises WHERE curriculum_lesson_id IN (SELECT id FROM curriculum_lessons WHERE class_level_id = ${badB5Id}))`;
  await sql`DELETE FROM lesson_exercises WHERE curriculum_lesson_id IN (SELECT id FROM curriculum_lessons WHERE class_level_id = ${badB5Id})`;
  await sql`DELETE FROM curriculum_lessons WHERE class_level_id = ${badB5Id}`;
  
  await sql`DELETE FROM indicators WHERE content_standard_id IN (SELECT id FROM content_standards WHERE sub_strand_id IN (SELECT id FROM sub_strands WHERE strand_id IN (SELECT id FROM strands WHERE class_level_id = ${badB5Id})))`;
  await sql`DELETE FROM content_standards WHERE sub_strand_id IN (SELECT id FROM sub_strands WHERE strand_id IN (SELECT id FROM strands WHERE class_level_id = ${badB5Id}))`;
  await sql`DELETE FROM sub_strands WHERE strand_id IN (SELECT id FROM strands WHERE class_level_id = ${badB5Id})`;
  await sql`DELETE FROM strands WHERE class_level_id = ${badB5Id}`;
  
  await sql`DELETE FROM class_level_subjects WHERE class_level_id = ${badB5Id}`;
  await sql`DELETE FROM class_levels WHERE id = ${badB5Id}`;

  console.log('Done!');
  await sql.end();
}

fixDb();
