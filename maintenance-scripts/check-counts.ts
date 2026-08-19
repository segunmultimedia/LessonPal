import { config } from 'dotenv';
import postgres from 'postgres';
import { join } from 'path';

config({ path: join(process.cwd(), '.env.local') });

async function check() {
  const dbUrl = process.env.DATABASE_URL;
  const sql = postgres(dbUrl, { ssl: 'require' });
  
  const classLevelQuery = await sql`SELECT cl.id FROM class_levels cl JOIN academic_levels al ON cl.academic_level_id = al.id WHERE cl.name = 'Basic 4' AND al.name = 'Upper Primary'`;
  const subjectQuery = await sql`SELECT id FROM subjects WHERE name = 'English Language'`;
  
  if (classLevelQuery.length === 0 || subjectQuery.length === 0) {
      console.log('Not found');
      return;
  }
  const classLevelId = classLevelQuery[0].id;
  const subjectId = subjectQuery[0].id;

  const bIndicators = await sql`
        SELECT COUNT(DISTINCT i.id) as count
        FROM indicators i
        JOIN content_standards cs ON i.content_standard_id = cs.id
        JOIN sub_strands ss ON cs.sub_strand_id = ss.id
        JOIN strands s ON ss.strand_id = s.id
        WHERE s.class_level_id = ${classLevelId} AND s.subject_id = ${subjectId}
      `;
  const bSessions = await sql`
        SELECT COUNT(*) as count 
        FROM curriculum_lessons 
        WHERE class_level_id = ${classLevelId} AND subject_id = ${subjectId}
      `;
  
  console.log('Indicators:', bIndicators[0].count, 'Sessions:', bSessions[0].count);
  await sql.end();
}
check();
