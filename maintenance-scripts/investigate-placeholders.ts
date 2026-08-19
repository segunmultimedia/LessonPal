import postgres from 'postgres';
import { config } from 'dotenv';
config({ path: '.env.local' });

async function investigate() {
  const dbUrl = process.env.DATABASE_URL!.replace('5432', '6543');
  const sql = postgres(dbUrl);
  
  const placeholders = await sql`
    SELECT DISTINCT ss.id, ss.name as sub_strand_name, s.name as strand_name,
           (SELECT cs.description FROM content_standards cs WHERE cs.sub_strand_id = ss.id LIMIT 1) as cs_desc
    FROM sub_strands ss
    JOIN strands s ON ss.strand_id = s.id
    JOIN subjects subj ON s.subject_id = subj.id
    WHERE subj.name = 'Mathematics' AND ss.name LIKE 'Sub-Strand %'
  `;
  
  console.log('Found placeholders:', placeholders.length);
  for (const p of placeholders) {
    console.log(`Sub-strand ID: ${p.id}`);
    console.log(`Sub-strand: ${p.sub_strand_name} (Strand: ${p.strand_name})`);
    console.log(`  CS Desc: ${p.cs_desc}`);
    console.log('---');
  }
  
  await sql.end();
}

investigate();
