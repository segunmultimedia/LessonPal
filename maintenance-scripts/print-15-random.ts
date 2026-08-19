import postgres from 'postgres';
import { config } from 'dotenv';
config({ path: '.env.local' });

async function printRandom() {
  const dbUrl = process.env.DATABASE_URL!.replace('5432', '6543');
  const sql = postgres(dbUrl);
  
  const all = await sql`
    SELECT cl.topic, s.name as strand, ss.name as sub_strand, cl.what_to_teach, cl.how_to_teach, cl.activities, 
           c.name as class_level
    FROM curriculum_lessons cl
    JOIN indicators i ON cl.indicator_id = i.id
    JOIN content_standards cs ON i.content_standard_id = cs.id
    JOIN sub_strands ss ON cs.sub_strand_id = ss.id
    JOIN strands s ON ss.strand_id = s.id
    JOIN class_levels c ON cl.class_level_id = c.id
    WHERE cl.subject_id = (SELECT id FROM subjects WHERE name = 'Mathematics')
    ORDER BY random() LIMIT 15
  `;
  
  for (const l of all) {
    console.log(`CLASS: ${l.class_level}`);
    console.log(`TOPIC: ${l.strand}`);
    console.log(`SUBTOPIC: ${l.sub_strand}`);
    console.log(`LESSON TITLE: ${l.topic}`);
    console.log(`WHAT TO TEACH: \n${l.what_to_teach}`);
    console.log(`HOW TO TEACH: \n${l.how_to_teach}`);
    console.log('---');
  }
  
  await sql.end();
}
printRandom();
