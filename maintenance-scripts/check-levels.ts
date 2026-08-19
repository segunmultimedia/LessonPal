import { config } from 'dotenv';
import postgres from 'postgres';
import { join } from 'path';

config({ path: join(process.cwd(), '.env.local') });

async function check() {
  const dbUrl = process.env.DATABASE_URL;
  const sql = postgres(dbUrl, { ssl: 'require' });
  
  const res = await sql`
      SELECT 
        al.name as academic_level, 
        cl.name as class_level, 
        (SELECT COUNT(DISTINCT i.id) FROM indicators i 
         JOIN content_standards cs ON i.content_standard_id = cs.id 
         JOIN sub_strands ss ON cs.sub_strand_id = ss.id 
         JOIN strands s ON ss.strand_id = s.id 
         WHERE s.class_level_id = cl.id) as ind_count 
      FROM class_levels cl 
      JOIN academic_levels al ON cl.academic_level_id = al.id
  `;
  console.log(res);
  await sql.end();
}
check();
