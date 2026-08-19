import postgres from 'postgres';
import { config } from 'dotenv';
config({ path: '.env.local' });
async function updateLesson() {
  const dbUrl = process.env.DATABASE_URL!.replace('5432', '6543');
  const sql = postgres(dbUrl);
  
  const lessonId = '3aedb974-a9a5-440f-a603-c8b2f8043143'; // B5 Mathematics Term 1 Week 1
  const exerciseId = 'd490834a-4449-4236-8aba-97c7490a4254';
  
  // 1. Update curriculum_lessons
  await sql`UPDATE curriculum_lessons SET
    topic = 'Modelling Number Quantities up to 1,000,000',
    learning_objective = 'By the end of the lesson, pupils should be able to model and represent numbers up to 1,000,000 using graph sheets, multi-base blocks, and token currency.',
    what_to_teach = '1. Place Value and Number Quantities up to 1,000,000\n- A six-digit number is made up of hundred thousands, ten thousands, thousands, hundreds, tens, and ones.\n- Graph sheets (1cm x 1cm squares) can be used to represent 1,000 units.\n- Multi-base blocks help visualize large numbers: a cube = 1,000 units; a rod = 10,000 units; a flat = 100,000 units; a block = 1,000,000 units.\n\n2. Using Token Currency\n- Money (¢10, ¢100, ¢500 notes) can be used to model large sums of money by grouping them to reach a target amount.',
    how_to_teach = 'Introduction\n- Connect the lesson to pupils'' previous knowledge of numbers up to 100,000.\n- Ask starter questions: "Who can write one hundred thousand on the board?"\n\nTeacher Demonstration\n- Explain the value of each multi-base block (cube, rod, flat, block).\n- Demonstrate modelling the number 436,000 using the appropriate blocks.\n- Show how to shade graph sheet squares to represent 137,000.\n\nGuided Practice\n- Hand out teacher-made token currency notes to groups.\n- Work through modeling ¢23,480 together as a class.\n\nLearner Activity\n- Give pupils different target numbers to model using graph sheets and multi-base blocks.\n\nAssessment/Closure\n- Ask pupils to explain the place value of specific digits in the numbers they modelled.\n- Summarize the key points of the lesson.',
    activities = '1. Group Modelling: Provide groups with multi-base materials and ask them to model 436,000.\n2. Graph Shading: Have pupils shade graph sheets to represent 137,000.\n3. Currency Game: Use teacher-made token notes to work out how many are required to model ¢23,480.',
    resources = '1. Graph sheets (1cm x 1cm squares)\n2. Multi-base blocks (cubes, rods, flats, blocks)\n3. Teacher-made token currency notes (¢10, ¢100, ¢500 notes on coloured paper)\n4. Board and markers'
    WHERE id = ${lessonId}`;
    
  // 2. Update lesson_exercises
  await sql`UPDATE lesson_exercises SET title = 'Class Exercise' WHERE id = ${exerciseId}`;
  
  // 3. Clear existing questions and insert new ones
  await sql`DELETE FROM exercise_questions WHERE exercise_id = ${exerciseId}`;
  
  await sql`INSERT INTO exercise_questions (id, exercise_id, question, answer, sort_order) VALUES
    (gen_random_uuid(), ${exerciseId}, 'Which multi-base block represents 100,000 units?', 'A flat', 1),
    (gen_random_uuid(), ${exerciseId}, 'If one 1cm x 1cm square on a graph sheet represents 1,000 units, how many squares do you need to shade to represent 137,000?', '137 squares', 2),
    (gen_random_uuid(), ${exerciseId}, 'How many ¢100 token notes are required to make ¢1,000?', '10 notes', 3)`;
    
  console.log('Database updated successfully for B5.1.1.1.1');
  await sql.end();
}
updateLesson();
