import postgres from 'postgres';
import { config } from 'dotenv';
config({ path: '.env.local' });
async function updateBasic6Lesson() {
  const dbUrl = process.env.DATABASE_URL!.replace('5432', '6543');
  const sql = postgres(dbUrl);
  
  // Find a B6 Math lesson
  const classObj = await sql`SELECT id FROM class_levels WHERE name = 'BASIC 6'`;
  const subjectObj = await sql`SELECT id FROM subjects WHERE name = 'Mathematics'`;
  
  if (classObj.length && subjectObj.length) {
    const classId = classObj[0].id;
    const subjectId = subjectObj[0].id;
    
    // get a lesson
    const lessons = await sql`SELECT cl.id, i.id as ind_id, i.code, cl.topic, cs.sub_strand_id, ss.strand_id 
      FROM curriculum_lessons cl
      JOIN indicators i ON cl.indicator_id = i.id
      JOIN content_standards cs ON i.content_standard_id = cs.id
      JOIN sub_strands ss ON cs.sub_strand_id = ss.id
      WHERE cl.class_level_id = ${classId} AND cl.subject_id = ${subjectId}
      ORDER BY cl.week_number ASC, cl.lesson_number ASC LIMIT 1`;
      
    if (lessons.length) {
      const lesson = lessons[0];
      
      // We will pretend B6 Math week 1 is Number & Counting
      await sql`UPDATE strands SET name = 'Number' WHERE id = ${lesson.strand_id}`;
      await sql`UPDATE sub_strands SET name = 'Fractions' WHERE id = ${lesson.sub_strand_id}`;
      
      // Update the lesson content
      await sql`UPDATE curriculum_lessons SET
        topic = 'Comparing and Ordering Fractions',
        learning_objective = 'By the end of the lesson, pupils will be able to compare and order fractions with unlike denominators by finding equivalent fractions.',
        what_to_teach = '1. Equivalent Fractions\n- Equivalent fractions represent the same part of a whole (e.g., 1/2 = 2/4).\n- To find equivalent fractions, multiply or divide the numerator and denominator by the same non-zero number.\n\n2. Comparing Unlike Fractions\n- To compare fractions with different denominators, first find a common denominator (often the Least Common Multiple).\n- Convert both fractions to equivalent fractions with this common denominator.\n- Compare the numerators: the fraction with the larger numerator is the greater fraction.',
        how_to_teach = 'Introduction\n- Review equivalent fractions with a quick board activity.\n- Ask pupils: "Which is bigger, 1/2 or 1/4?" (They should easily answer 1/2).\n\nTeacher Demonstration\n- Write 3/4 and 2/3 on the board. Ask which is larger.\n- Show how to find the common denominator (12).\n- Convert 3/4 to 9/12 and 2/3 to 8/12.\n- Compare the numerators (9 > 8), so 3/4 is greater.\n\nGuided Practice\n- Work through comparing 2/5 and 3/7 as a class.\n\nLearner Activity\n- Give pupils a set of fractions to compare using <, >, or =.\n\nAssessment/Closure\n- Ask a pupil to explain the steps for comparing unlike fractions.\n- Review the answers to the activity.',
        activities = '1. Fraction War: Pupils play in pairs with fraction cards. They flip two cards and must determine which is greater. The pupil who correctly identifies the greater fraction keeps the cards.\n2. Ordering Line: Pupils are given a fraction on a card and must arrange themselves in order from smallest to largest fraction at the front of the class.',
        resources = '1. Fraction cards\n2. Board and markers\n3. LCM charts (optional)'
        WHERE id = ${lesson.id}`;
        
      // Create an exercise
      const exercises = await sql`SELECT id FROM lesson_exercises WHERE curriculum_lesson_id = ${lesson.id}`;
      let exerciseId = '';
      if (exercises.length > 0) {
        exerciseId = exercises[0].id;
        await sql`UPDATE lesson_exercises SET title = 'Compare Fractions' WHERE id = ${exerciseId}`;
      } else {
        const inserted = await sql`INSERT INTO lesson_exercises (id, curriculum_lesson_id, title, sort_order) VALUES (gen_random_uuid(), ${lesson.id}, 'Compare Fractions', 1) RETURNING id`;
        exerciseId = inserted[0].id;
      }
      
      // Insert questions
      await sql`DELETE FROM exercise_questions WHERE exercise_id = ${exerciseId}`;
      await sql`INSERT INTO exercise_questions (id, exercise_id, question, answer, sort_order) VALUES
        (gen_random_uuid(), ${exerciseId}, 'Which fraction is greater: 1/3 or 2/5? (Hint: find a common denominator)', '2/5 is greater (5/15 vs 6/15)', 1),
        (gen_random_uuid(), ${exerciseId}, 'Order the following fractions from least to greatest: 1/2, 3/8, 3/4', '3/8, 1/2, 3/4 (since 1/2=4/8 and 3/4=6/8)', 2)`;
        
      console.log('Basic 6 lesson updated successfully.', lesson.code);
    }
  }
  await sql.end();
}
updateBasic6Lesson();
