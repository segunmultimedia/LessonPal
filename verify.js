const postgres = require('postgres');
const sql = postgres('postgres://lessonpal:lessonpal@localhost:5432/lessonpal');

async function check() {
  const res1 = await sql`SELECT count(*) FROM indicators`;
  const res2 = await sql`SELECT count(*) FROM curriculum_lessons`;
  const res3 = await sql`SELECT count(*) FROM lesson_exercises`;
  const res4 = await sql`SELECT count(*) FROM exercise_questions`;
  const res5 = await sql`SELECT count(*) FROM strands`;
  const res6 = await sql`SELECT count(*) FROM sub_strands`;
  const res7 = await sql`SELECT count(*) FROM content_standards`;
  const res8 = await sql`SELECT count(*) FROM curriculum_lessons WHERE indicator_id IS NULL`;

  console.log({
    indicators: res1[0].count,
    lessons: res2[0].count,
    exercises: res3[0].count,
    questions: res4[0].count,
    strands: res5[0].count,
    subStrands: res6[0].count,
    contentStandards: res7[0].count,
    missingIndicators: res8[0].count
  });
  
  // also check duplicate indicators
  const res9 = await sql`SELECT code, count(*) FROM indicators GROUP BY code HAVING count(*) > 1`;
  console.log('Duplicate indicators:', res9.length);

  const res10 = await sql`SELECT count(*) FROM curriculum_lessons GROUP BY class_level_id, subject_id, academic_term_id, week_number, lesson_number HAVING count(*) > 1`;
  console.log('Duplicate lessons:', res10.length);

  process.exit(0);
}

check();
