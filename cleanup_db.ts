import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

async function run() {
  try {
    const lessonId = 'ad13d90d-159a-4dd9-b750-e77fb0b59d1a';
    
    await sql.begin(async (sql) => {
      // Disconnect from scheduled_lessons to avoid FK violation
      await sql`UPDATE scheduled_lessons SET curriculum_lesson_id = NULL WHERE curriculum_lesson_id = ${lessonId}`;
      
      // Delete the test lesson (this will cascade delete lesson_exercises and exercise_questions)
      const result = await sql`DELETE FROM curriculum_lessons WHERE id = ${lessonId} RETURNING id`;
      console.log('Deleted lesson ID:', result.length ? result[0].id : 'Not found');
    });

    // Verification queries
    const indicators = await sql`SELECT count(*) FROM indicators`;
    const scheduled = await sql`SELECT count(DISTINCT indicator_id) FROM curriculum_lessons WHERE indicator_id IS NOT NULL`;
    const sessions = await sql`SELECT count(*) FROM curriculum_lessons`;
    const term1 = await sql`SELECT count(*) FROM curriculum_lessons cl JOIN academic_terms t ON cl.academic_term_id = t.id WHERE t.name = 'Term 1'`;
    const term2 = await sql`SELECT count(*) FROM curriculum_lessons cl JOIN academic_terms t ON cl.academic_term_id = t.id WHERE t.name = 'Term 2'`;
    const term3 = await sql`SELECT count(*) FROM curriculum_lessons cl JOIN academic_terms t ON cl.academic_term_id = t.id WHERE t.name = 'Term 3'`;
    const missing = await sql`SELECT count(*) FROM curriculum_lessons WHERE indicator_id IS NULL`;
    const duplicates = await sql`SELECT count(*) as count FROM (SELECT code FROM indicators GROUP BY code, academic_term_id HAVING count(*) > 1) d`;

    console.log(JSON.stringify({
      indicators: indicators[0].count,
      scheduled: scheduled[0].count,
      sessions: sessions[0].count,
      term1: term1[0].count,
      term2: term2[0].count,
      term3: term3[0].count,
      missing: missing[0].count,
      duplicates: duplicates[0].count
    }, null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
