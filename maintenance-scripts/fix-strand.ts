import postgres from 'postgres';
import { config } from 'dotenv';
config({ path: '.env.local' });
async function fixStrand() {
  const dbUrl = process.env.DATABASE_URL!.replace('5432', '6543');
  const sql = postgres(dbUrl);
  
  const classObj = await sql`SELECT id FROM class_levels WHERE name = 'BASIC 5'`;
  const subjectObj = await sql`SELECT id FROM subjects WHERE name = 'Mathematics'`;
  
  if (classObj.length && subjectObj.length) {
    const classId = classObj[0].id;
    const subjectId = subjectObj[0].id;
    
    // Update Strand 3 for Mathematics Basic 5
    const strandUpdate = await sql`UPDATE strands SET name = 'Geometry and Measurement' WHERE class_level_id = ${classId} AND subject_id = ${subjectId} AND sort_order = 3 RETURNING id`;
    
    if (strandUpdate.length) {
       await sql`UPDATE sub_strands SET name = '2D and 3D Shapes' WHERE strand_id = ${strandUpdate[0].id} AND sort_order = 1`;
    }
  }
  
  await sql.end();
}
fixStrand();
