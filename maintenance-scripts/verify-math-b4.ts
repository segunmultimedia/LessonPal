import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(process.cwd(), '.env.local') });

async function verify() {
  const pgClient = postgres(process.env.DATABASE_URL!.replace('5432', '6543'), { ssl: 'require', prepare: false, max: 1 });
  
  try {
    const classLevel = await pgClient`SELECT id FROM class_levels WHERE name = 'BASIC 4' LIMIT 1`;
    const b4Id = classLevel[0].id;
    
    const subject = await pgClient`SELECT id FROM subjects WHERE name = 'Mathematics' LIMIT 1`;
    const mathId = subject[0].id;

    // 1. Official Indicators
    const indicators = await pgClient`
      SELECT i.id, i.code 
      FROM indicators i
      JOIN content_standards cs ON i.content_standard_id = cs.id
      JOIN sub_strands ss ON cs.sub_strand_id = ss.id
      JOIN strands s ON ss.strand_id = s.id
      WHERE s.class_level_id = ${b4Id} AND s.subject_id = ${mathId}
    `;
    console.log('Indicators count:', indicators.length);

    // Duplicates checking
    const indicatorCodes = new Set();
    let dupIndicators = 0;
    for (const ind of indicators) {
      if (indicatorCodes.has(ind.code)) dupIndicators++;
      indicatorCodes.add(ind.code);
    }
    console.log('Duplicate indicators:', dupIndicators);

    // 2. Teaching Sessions
    const lessons = await pgClient`
      SELECT cl.id, cl.indicator_id, t.term_number
      FROM curriculum_lessons cl
      JOIN academic_terms t ON cl.academic_term_id = t.id
      WHERE cl.class_level_id = ${b4Id} AND cl.subject_id = ${mathId}
    `;
    console.log('Lessons count:', lessons.length);

    let t1 = 0; let t2 = 0; let t3 = 0;
    let dupSessions = 0;
    let invalidRefs = 0;
    let orphanedSessions = 0; // Sessions without indicator_id or missing

    const sessionRefs = new Set();
    const indIdSet = new Set(indicators.map(i => i.id));

    for (const l of lessons) {
      if (l.term_number === 1) t1++;
      if (l.term_number === 2) t2++;
      if (l.term_number === 3) t3++;
      
      if (!l.indicator_id || !indIdSet.has(l.indicator_id)) {
        invalidRefs++;
      }
      
      const sig = `${l.term_number}-${l.indicator_id}`;
      // In the same term, same indicator might have multiple sessions, which is expected (e.g. 2 sessions for one indicator). 
      // But we check for exact duplicate sessions? A session doesn't have much to distinguish other than ordering.
      // We will just verify valid indicator refs.
    }

    console.log(`T1: ${t1}, T2: ${t2}, T3: ${t3}, Total: ${t1 + t2 + t3}`);
    console.log(`Invalid refs: ${invalidRefs}`);
    
    // Check regression for B5 Math
    const b5Level = await pgClient`SELECT id FROM class_levels WHERE name = 'BASIC 5' LIMIT 1`;
    const b5MathLessons = await pgClient`SELECT id FROM curriculum_lessons WHERE class_level_id = ${b5Level[0].id} AND subject_id = ${mathId}`;
    console.log('B5 Math Lessons:', b5MathLessons.length);

    // Check regression for B6 Math
    const b6Level = await pgClient`SELECT id FROM class_levels WHERE name = 'BASIC 6' LIMIT 1`;
    const b6MathLessons = await pgClient`SELECT id FROM curriculum_lessons WHERE class_level_id = ${b6Level[0].id} AND subject_id = ${mathId}`;
    console.log('B6 Math Lessons:', b6MathLessons.length);

    // Check regression for English
    const engSubject = await pgClient`SELECT id FROM subjects WHERE name = 'English Language' LIMIT 1`;
    const engId = engSubject[0].id;
    const b4Eng = await pgClient`SELECT id FROM curriculum_lessons WHERE class_level_id = ${b4Id} AND subject_id = ${engId}`;
    const b5Eng = await pgClient`SELECT id FROM curriculum_lessons WHERE class_level_id = ${b5Level[0].id} AND subject_id = ${engId}`;
    const b6Eng = await pgClient`SELECT id FROM curriculum_lessons WHERE class_level_id = ${b6Level[0].id} AND subject_id = ${engId}`;
    
    console.log(`B4 Eng: ${b4Eng.length}, B5 Eng: ${b5Eng.length}, B6 Eng: ${b6Eng.length}`);

  } catch(e) {
    console.error(e);
  } finally {
    await pgClient.end();
  }
}

verify();
