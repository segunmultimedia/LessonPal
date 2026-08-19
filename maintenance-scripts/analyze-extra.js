const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
require('dotenv').config({path: '.env.local'});
async function f() {
  const sql = postgres(process.env.DATABASE_URL);
  
  try {
    const invalidLesson = await sql`
      SELECT cl.id, cl.week_number, cl.lesson_number, cl.topic, cl.indicator_id, cl.source_status, cl.created_at,
             cl.class_level_id, cl.subject_id, cl.academic_term_id,
             (SELECT name FROM class_levels WHERE id = cl.class_level_id) as class_name,
             (SELECT name FROM subjects WHERE id = cl.subject_id) as subject_name,
             (SELECT name FROM academic_terms WHERE id = cl.academic_term_id) as term_name
      FROM curriculum_lessons cl 
      WHERE indicator_id IS NULL OR indicator_id NOT IN (SELECT id FROM indicators)
    `;
    
    console.log("Invalid Lesson:", invalidLesson[0]);
    
    if (invalidLesson.length > 0) {
      const id = invalidLesson[0].id;
      
      const exercises = await sql`
        SELECT id FROM lesson_exercises WHERE curriculum_lesson_id = ${id}
      `;
      console.log("Related Exercises:", exercises.length);
      
      let questions = [];
      if (exercises.length > 0) {
        questions = await sql`
          SELECT id FROM exercise_questions WHERE exercise_id IN ${sql(exercises.map(e => e.id))}
        `;
      }
      console.log("Related Questions:", questions.length);
    }
  } finally {
    await sql.end();
  }
}
f();
