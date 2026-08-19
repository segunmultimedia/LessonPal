import { config } from 'dotenv';
import postgres from 'postgres';
import { join } from 'path';

config({ path: join(process.cwd(), '.env.local') });

async function audit() {
  const dbUrl = process.env.DATABASE_URL;
  const sql = postgres(dbUrl, { ssl: 'require' });
  
  try {
    const cur_levels = await sql`SELECT id, name FROM academic_levels`;
    console.log("Academic Levels:");
    console.table(cur_levels);
    
    const cl = await sql`
        SELECT cl.id, cl.name as class_level, al.name as academic_level, al.id as academic_level_id
        FROM class_levels cl 
        JOIN academic_levels al ON cl.academic_level_id = al.id
        WHERE cl.name = 'Basic 4'
    `;
    console.log("Basic 4 class_levels:");
    console.table(cl);

    for (const c of cl) {
        const counts = await sql`
            SELECT 
                (SELECT COUNT(*) FROM strands WHERE class_level_id = ${c.id}) as strands,
                (SELECT COUNT(*) FROM class_level_subjects WHERE class_level_id = ${c.id}) as cls_links,
                (SELECT COUNT(*) FROM curriculum_lessons WHERE class_level_id = ${c.id}) as lessons
        `;
        console.log(`Counts for ${c.class_level} (${c.academic_level}):`);
        console.table(counts);
    }
  } finally {
    await sql.end();
  }
}
audit();
