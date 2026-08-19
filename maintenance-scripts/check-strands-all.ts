import postgres from 'postgres';
import { config } from 'dotenv';
config({ path: '.env.local' });
async function check() {
  const dbUrl = process.env.DATABASE_URL!.replace('5432', '6543');
  const sql = postgres(dbUrl);
  const strands = await sql`SELECT DISTINCT s.name as strand, ss.name as sub_strand 
    FROM curriculum_lessons cl
    JOIN indicators i ON cl.indicator_id = i.id
    JOIN content_standards cs ON i.content_standard_id = cs.id
    JOIN sub_strands ss ON cs.sub_strand_id = ss.id
    JOIN strands s ON ss.strand_id = s.id
    JOIN subjects subj ON cl.subject_id = subj.id
    WHERE subj.name = 'Mathematics'
  `;
  console.log(strands);
  await sql.end();
}
check();
