import postgres from 'postgres';
import { config } from 'dotenv';
config({ path: '.env.local' });

async function queryLesson(sql: postgres.Sql, lessonId: string) {
  const result = await sql`
    SELECT 
      cl.topic as lesson_title,
      cl.learning_objective,
      cl.what_to_teach,
      cl.how_to_teach,
      cl.activities,
      cl.resources,
      s.name as strand,
      ss.name as sub_strand,
      subj.name as subject,
      c.name as class_level,
      cl.week_number
    FROM curriculum_lessons cl
    JOIN indicators i ON cl.indicator_id = i.id
    JOIN content_standards cs ON i.content_standard_id = cs.id
    JOIN sub_strands ss ON cs.sub_strand_id = ss.id
    JOIN strands s ON ss.strand_id = s.id
    JOIN subjects subj ON cl.subject_id = subj.id
    JOIN class_levels c ON cl.class_level_id = c.id
    WHERE cl.id = ${lessonId}
  `;
  
  if (result.length) {
    const r = result[0];
    console.log(`CLASS: ${r.class_level}`);
    console.log(`SUBJECT: ${r.subject}`);
    console.log(`TERM: 1`);
    console.log(`WEEK: ${r.week_number}\n`);
    
    console.log(`TOPIC:\n${r.strand}\n`);
    console.log(`SUBTOPIC:\n${r.sub_strand}\n`);
    console.log(`LESSON TITLE:\n${r.lesson_title}\n`);
    console.log(`LEARNING OBJECTIVE:\n${r.learning_objective}\n`);
    console.log(`WHAT TO TEACH:\n${r.what_to_teach}\n`);
    console.log(`HOW TO TEACH:\n${r.how_to_teach}\n`);
    console.log(`ACTIVITIES:\n${r.activities}\n`);
    console.log(`RESOURCES:\n${r.resources}\n`);
    
    const exercises = await sql`SELECT * FROM lesson_exercises WHERE curriculum_lesson_id = ${lessonId}`;
    if (exercises.length) {
      console.log(`EXERCISES:`);
      for (const ex of exercises) {
        console.log(`${ex.title}`);
        const qs = await sql`SELECT * FROM exercise_questions WHERE exercise_id = ${ex.id} ORDER BY sort_order ASC`;
        for (const q of qs) {
          console.log(`${q.sort_order}. ${q.question}`);
        }
        console.log(`\nANSWERS:`);
        for (const q of qs) {
          console.log(`${q.sort_order}. ${q.answer}`);
        }
      }
    }
    console.log('\n==================================================\n');
  }
}

async function run() {
  const dbUrl = process.env.DATABASE_URL!.replace('5432', '6543');
  const sql = postgres(dbUrl);
  
  console.log('--- SECOND BASIC 5 MATH LESSON ---');
  await queryLesson(sql, 'b8f0e935-5a13-4e57-ad27-83001eda313f');
  
  console.log('--- DIFFERENT CLASS MATH LESSON ---');
  // Need to find the B6 Math lesson ID. I know the topic is 'Comparing and Ordering Fractions'
  const b6lesson = await sql`SELECT cl.id FROM curriculum_lessons cl WHERE cl.topic = 'Comparing and Ordering Fractions' LIMIT 1`;
  if (b6lesson.length) {
    await queryLesson(sql, b6lesson[0].id);
  }
  
  await sql.end();
}
run();
