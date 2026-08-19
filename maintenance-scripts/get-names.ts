import postgres from 'postgres';
import { config } from 'dotenv';
config({ path: '.env.local' });

async function getNames() {
  const dbUrl = process.env.DATABASE_URL!.replace('5432', '6543');
  const sql = postgres(dbUrl);
  
  const res = await sql`
    SELECT DISTINCT s.name as strand, ss.name as sub_strand 
    FROM sub_strands ss 
    JOIN strands s ON ss.strand_id = s.id 
    JOIN subjects subj ON s.subject_id = subj.id 
    WHERE subj.name = 'Mathematics' AND ss.name NOT LIKE 'Sub-Strand %'
  `;
  console.table(res);
  await sql.end();
}
getNames();
