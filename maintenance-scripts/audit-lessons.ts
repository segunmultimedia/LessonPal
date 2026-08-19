import postgres from 'postgres';
import { config } from 'dotenv';
config({ path: '.env.local' });

async function auditCurriculumLessons() {
  const dbUrl = process.env.DATABASE_URL!.replace('5432', '6543');
  const sql = postgres(dbUrl);
  
  // Get all curriculum lessons for Mathematics in Basic 4, 5, 6
  const lessons = await sql`
    SELECT cl.id, cl.topic, i.code as indicator_code, s.name as strand, ss.name as sub_strand
    FROM curriculum_lessons cl
    LEFT JOIN indicators i ON cl.indicator_id = i.id
    LEFT JOIN content_standards cs ON i.content_standard_id = cs.id
    LEFT JOIN sub_strands ss ON cs.sub_strand_id = ss.id
    LEFT JOIN strands s ON ss.strand_id = s.id
    JOIN subjects subj ON cl.subject_id = subj.id
    JOIN class_levels c ON cl.class_level_id = c.id
    WHERE subj.name = 'Mathematics' AND c.name IN ('BASIC 4', 'BASIC 5', 'BASIC 6')
  `;
  
  let success = 0;
  let fail = 0;
  let reasons: any = {};
  
  for (const l of lessons) {
    if (!l.id) {
      fail++;
      reasons['missing_id'] = (reasons['missing_id'] || 0) + 1;
      continue;
    }
    
    if (!l.topic) {
      fail++;
      reasons['missing_topic'] = (reasons['missing_topic'] || 0) + 1;
      continue;
    }
    
    if (!l.indicator_code) {
      fail++;
      reasons['missing_indicator'] = (reasons['missing_indicator'] || 0) + 1;
      continue;
    }
    
    // Check if strand and sub_strand join worked
    // (It might be null if the hierarchy is broken)
    if (!l.strand) {
      fail++;
      reasons['missing_strand'] = (reasons['missing_strand'] || 0) + 1;
      continue;
    }
    
    success++;
  }
  
  console.log(`Audited ${lessons.length} Mathematics lesson records.`);
  console.log(`Success: ${success}`);
  console.log(`Failed: ${fail}`);
  if (fail > 0) {
    console.log(`Failure reasons:`, reasons);
  }
  
  await sql.end();
}

auditCurriculumLessons();
