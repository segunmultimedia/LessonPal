import postgres from 'postgres';
import { config } from 'dotenv';
config({ path: '.env.local' });
async function updateStrands() {
  const dbUrl = process.env.DATABASE_URL!.replace('5432', '6543');
  const sql = postgres(dbUrl);
  
  // Find subject and class
  const classObj = await sql`SELECT id FROM class_levels WHERE name = 'BASIC 5'`;
  const subjectObj = await sql`SELECT id FROM subjects WHERE name = 'Mathematics'`;
  
  if (classObj.length && subjectObj.length) {
    const classId = classObj[0].id;
    const subjectId = subjectObj[0].id;
    
    // Update Strand 1
    const strandUpdate = await sql`UPDATE strands SET name = 'Number' WHERE class_level_id = ${classId} AND subject_id = ${subjectId} AND sort_order = 1 RETURNING id`;
    
    if (strandUpdate.length) {
       // Update Sub-Strand 1
       await sql`UPDATE sub_strands SET name = 'Counting, Representation and Cardinality' WHERE strand_id = ${strandUpdate[0].id} AND sort_order = 1`;
    }
  }
  
  console.log('Strands updated.');
  await sql.end();
}
updateStrands();
