import postgres from 'postgres';
import { config } from 'dotenv';
config({ path: '.env.local' });
async function check() {
  const dbUrl = process.env.DATABASE_URL!.replace('5432', '6543');
  const sql = postgres(dbUrl);
  
  const classObj = await sql`SELECT id FROM class_levels WHERE name = 'BASIC 5'`;
  const subjectObj = await sql`SELECT id FROM subjects WHERE name = 'Mathematics'`;
  const classId = classObj[0].id;
  const subjectId = subjectObj[0].id;

  const lessons = await sql`SELECT cl.id, cl.topic, i.code, cl.week_number 
    FROM curriculum_lessons cl
    JOIN indicators i ON cl.indicator_id = i.id
    WHERE cl.class_level_id = ${classId} AND cl.subject_id = ${subjectId}
    ORDER BY cl.week_number ASC, cl.lesson_number ASC LIMIT 5 OFFSET 1`;
  
  console.log('Lessons:', JSON.stringify(lessons, null, 2));
  await sql.end();
}
check();
