import postgres from 'postgres';
import { config } from 'dotenv';
config({ path: '.env.local' });
async function check() {
  const dbUrl = process.env.DATABASE_URL!.replace('5432', '6543');
  const sql = postgres(dbUrl);
  
  const ind = await sql`SELECT s.name as strand, ss.name as sub_strand 
    FROM indicators i 
    LEFT JOIN content_standards cs ON i.content_standard_id = cs.id 
    LEFT JOIN sub_strands ss ON cs.sub_strand_id = ss.id 
    LEFT JOIN strands s ON ss.strand_id = s.id 
    JOIN subjects subj ON s.subject_id = subj.id
    WHERE i.code = 'B5.1.1.1.1' AND subj.name = 'Mathematics' LIMIT 1`;
  console.log('Strand:', ind[0]?.strand, 'SubStrand:', ind[0]?.sub_strand);
  
  await sql.end();
}
check();
