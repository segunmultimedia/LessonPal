import postgres from 'postgres';
import { config } from 'dotenv';
config({ path: '.env.local' });
async function updateSecondLesson() {
  const dbUrl = process.env.DATABASE_URL!.replace('5432', '6543');
  const sql = postgres(dbUrl);
  
  const lessonId = 'b8f0e935-5a13-4e57-ad27-83001eda313f'; // B5.3.1.1.1
  
  // Find indicator to get strand/substrand ids
  const indData = await sql`SELECT cs.sub_strand_id, ss.strand_id, i.id as ind_id 
    FROM indicators i 
    JOIN content_standards cs ON i.content_standard_id = cs.id
    JOIN sub_strands ss ON cs.sub_strand_id = ss.id
    WHERE i.code = 'B5.3.1.1.1' LIMIT 1`;
    
  if (indData.length > 0) {
    const { sub_strand_id, strand_id, ind_id } = indData[0];
    
    // Update strand names (Geometry and Measurement, 2D and 3D Shapes)
    await sql`UPDATE strands SET name = 'Geometry and Measurement' WHERE id = ${strand_id}`;
    await sql`UPDATE sub_strands SET name = '2D and 3D Shapes' WHERE id = ${sub_strand_id}`;
    
    // Update the lesson content
    await sql`UPDATE curriculum_lessons SET
      topic = 'Properties of 2D Shapes and 3D Objects',
      learning_objective = 'By the end of the lesson, pupils will be able to demonstrate an understanding of the properties of 2D shapes (regular/irregular) and 3D objects (prisms and pyramids).',
      what_to_teach = '1. 2D Shapes\n- A 2D shape is a flat shape that has only two dimensions: length and width.\n- Regular 2D shapes have equal sides and equal angles (e.g., square, equilateral triangle).\n- Irregular 2D shapes have unequal sides and angles (e.g., scalene triangle, irregular pentagon).\n\n2. 3D Objects\n- A 3D object has three dimensions: length, width, and height.\n- A prism is a 3D object with two identical parallel bases and flat rectangular sides (e.g., a rectangular prism or cube).\n- A pyramid has one base and triangular faces that meet at a single point (apex).',
      how_to_teach = 'Introduction\n- Show pupils various real-life objects (a box, a ball, a book) and ask them if they are flat or solid.\n- Introduce the terms 2D (flat) and 3D (solid).\n\nTeacher Demonstration\n- Draw regular and irregular polygons on the board. Explain the difference using side lengths.\n- Show physical models of prisms and pyramids. Point out the bases, faces, edges, and vertices.\n\nGuided Practice\n- Have pupils sort a collection of cut-out 2D shapes into regular and irregular groups.\n- Work together to identify the properties (faces, edges, vertices) of a rectangular prism.\n\nLearner Activity\n- Ask pupils to find one prism and one pyramid in the classroom environment or draw them in their books.\n\nAssessment/Closure\n- Ask pupils to state the difference between a prism and a pyramid.\n- Summarize the lesson.',
      activities = '1. Shape Sorting: Pupils work in pairs to sort flashcards of shapes into "Regular 2D", "Irregular 2D", "Prism", and "Pyramid".\n2. Object Hunt: Pupils look around the classroom and identify 3D objects and their geometric names.',
      resources = '1. Cut-out 2D shapes (regular and irregular)\n2. Physical 3D models (cubes, rectangular prisms, triangular pyramids)\n3. Flashcards for sorting\n4. Board and markers'
      WHERE id = ${lessonId}`;
      
    // Create an exercise
    // Fetch an existing exercise to update, or clear and insert if none
    const exercises = await sql`SELECT id FROM lesson_exercises WHERE curriculum_lesson_id = ${lessonId}`;
    let exerciseId = '';
    if (exercises.length > 0) {
      exerciseId = exercises[0].id;
      await sql`UPDATE lesson_exercises SET title = 'Identify Shapes and Objects' WHERE id = ${exerciseId}`;
    } else {
      const inserted = await sql`INSERT INTO lesson_exercises (id, curriculum_lesson_id, title, sort_order) VALUES (gen_random_uuid(), ${lessonId}, 'Identify Shapes and Objects', 1) RETURNING id`;
      exerciseId = inserted[0].id;
    }
    
    // Insert questions
    await sql`DELETE FROM exercise_questions WHERE exercise_id = ${exerciseId}`;
    await sql`INSERT INTO exercise_questions (id, exercise_id, question, answer, sort_order) VALUES
      (gen_random_uuid(), ${exerciseId}, 'What is the main difference between a regular and an irregular 2D shape?', 'Regular shapes have equal sides and angles; irregular shapes do not.', 1),
      (gen_random_uuid(), ${exerciseId}, 'Which 3D object has two identical parallel bases and flat rectangular sides?', 'A prism', 2),
      (gen_random_uuid(), ${exerciseId}, 'Give an example of a real-life rectangular prism.', 'A book, a box, or a brick', 3)`;
      
    console.log('Second lesson (B5.3.1.1.1) updated successfully.');
  }
  await sql.end();
}
updateSecondLesson();
