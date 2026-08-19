import postgres from 'postgres';
import { config } from 'dotenv';
config({ path: '.env.local' });
async function check() {
  const dbUrl = process.env.DATABASE_URL!.replace('5432', '6543');
  const sql = postgres(dbUrl);
  
  const ind = await sql`SELECT i.id, i.code, i.description,
    cs.description as cs_description, ss.name as sub_strand, s.name as strand 
    FROM indicators i 
    LEFT JOIN content_standards cs ON i.content_standard_id = cs.id 
    LEFT JOIN sub_strands ss ON cs.sub_strand_id = ss.id 
    LEFT JOIN strands s ON ss.strand_id = s.id 
    JOIN subjects subj ON s.subject_id = subj.id
    WHERE i.code = 'B5.1.1.1.1' AND subj.name = 'Mathematics' LIMIT 1`;
  console.log('Indicator:', JSON.stringify(ind, null, 2));
  
  if (ind.length > 0) {
    const lesson = await sql`SELECT * FROM curriculum_lessons WHERE indicator_id = ${ind[0].id} LIMIT 1`;
    console.log('Lesson:', JSON.stringify(lesson, null, 2));
    if (lesson.length > 0) {
      const exercises = await sql`SELECT * FROM lesson_exercises WHERE curriculum_lesson_id = ${lesson[0].id}`;
      console.log('Exercises:', JSON.stringify(exercises, null, 2));
      for (const ex of exercises) {
         const qs = await sql`SELECT * FROM exercise_questions WHERE exercise_id = ${ex.id}`;
         console.log('Questions for ' + ex.title + ':', JSON.stringify(qs, null, 2));
      }
    }
  }
  await sql.end();
}
check();
