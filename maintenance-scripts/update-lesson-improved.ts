import postgres from 'postgres';
import { config } from 'dotenv';
config({ path: '.env.local' });
async function updateLesson() {
  const dbUrl = process.env.DATABASE_URL!.replace('5432', '6543');
  const sql = postgres(dbUrl);
  
  const lessonId = '3aedb974-a9a5-440f-a603-c8b2f8043143'; // B5 Mathematics Term 1 Week 1
  
  await sql`UPDATE curriculum_lessons SET
    what_to_teach = '1. Understanding Place Value up to 1,000,000\nPlace value is the value of each digit in a number based on its position. A six-digit number is made up of:\n- Hundred Thousands (HTH)\n- Ten Thousands (TTH)\n- Thousands (TH)\n- Hundreds (H)\n- Tens (T)\n- Ones (O)\n\nFor example, in the number 436,000:\n- The digit 4 is in the Hundred Thousands place, meaning 400,000.\n- The digit 3 is in the Ten Thousands place, meaning 30,000.\n- The digit 6 is in the Thousands place, meaning 6,000.\n\n2. Modelling with Materials\nTo help pupils visualize these large numbers, we use physical models:\n- Graph sheets: Shading a 1cm x 1cm square (which contains 1,000 tiny mm squares) can represent 1,000 units. To model 137,000, you would shade 137 such squares.\n- Multi-base blocks: A cube = 1,000 units; a rod = 10,000 units; a flat = 100,000 units. To model 436,000, you use 4 flats, 3 rods, and 6 cubes.\n- Token Currency: Money notes (¢10, ¢100, ¢500) can be grouped to model large sums of money.'
    WHERE id = ${lessonId}`;
    
  console.log('Lesson updated successfully.');
  await sql.end();
}
updateLesson();
