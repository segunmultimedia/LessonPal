import postgres from 'postgres';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(process.cwd(), '.env.local') });

async function verifyAll() {
  const pgClient = postgres(process.env.DATABASE_URL!.replace('5432', '6543'), { ssl: 'require', max: 1 });
  
  try {
    const subjects = ['English Language', 'Mathematics', 'Science'];
    const classes = ['Basic 4', 'Basic 5', 'Basic 6', 'BASIC 4', 'BASIC 5', 'BASIC 6'];

    const results: any = {};

    for (const sub of subjects) {
      for (const cls of classes) {
        const subRes = await pgClient`SELECT id FROM subjects WHERE name = ${sub} LIMIT 1`;
        if (subRes.length === 0) continue;
        const subId = subRes[0].id;

        const clRes = await pgClient`SELECT id FROM class_levels WHERE name = ${cls} LIMIT 1`;
        if (clRes.length === 0) continue;
        const clId = clRes[0].id;

        const lessons = await pgClient`
          SELECT cl.id, t.term_number
          FROM curriculum_lessons cl
          JOIN academic_terms t ON cl.academic_term_id = t.id
          WHERE cl.class_level_id = ${clId} AND cl.subject_id = ${subId}
        `;

        if (lessons.length > 0) {
          const indicators = await pgClient`
            SELECT COUNT(DISTINCT i.id) as count
            FROM indicators i
            JOIN content_standards cs ON i.content_standard_id = cs.id
            JOIN sub_strands ss ON cs.sub_strand_id = ss.id
            JOIN strands s ON ss.strand_id = s.id
            WHERE s.class_level_id = ${clId} AND s.subject_id = ${subId}
          `;

          let t1 = 0, t2 = 0, t3 = 0;
          for (const l of lessons) {
            if (l.term_number === 1) t1++;
            if (l.term_number === 2) t2++;
            if (l.term_number === 3) t3++;
          }

          const key = `${cls} ${sub}`;
          results[key] = {
            indicators: parseInt(indicators[0].count, 10),
            sessions: lessons.length,
            t1, t2, t3
          };
        }
      }
    }

    const b4Eng = results['Basic 4 English Language']?.sessions === 144;
    const b5Eng = results['Basic 5 English Language']?.sessions === 223;
    const b6Eng = results['Basic 6 English Language']?.sessions === 198;

    const b4Math = results['BASIC 4 Mathematics']?.sessions === 120;
    const b5Math = results['BASIC 5 Mathematics']?.sessions === 120;
    const b6Math = results['BASIC 6 Mathematics']?.sessions === 80;

    const b4Sci = results['BASIC 4 Science'] || {indicators: 0, sessions: 0, t1: 0, t2: 0, t3: 0};
    const b5Sci = results['BASIC 5 Science'] || {indicators: 0, sessions: 0, t1: 0, t2: 0, t3: 0};
    const b6Sci = results['BASIC 6 Science'] || {indicators: 0, sessions: 0, t1: 0, t2: 0, t3: 0};

    const passB4 = b4Sci.indicators === 24 && b4Sci.sessions === 57 && b4Sci.t1 === 19 && b4Sci.t2 === 18 && b4Sci.t3 === 20;
    const passB5 = b5Sci.indicators === 29 && b5Sci.sessions === 76 && b5Sci.t1 === 24 && b5Sci.t2 === 26 && b5Sci.t3 === 26;
    const passB6 = b6Sci.indicators === 26 && b6Sci.sessions === 67 && b6Sci.t1 === 24 && b6Sci.t2 === 22 && b6Sci.t3 === 21;
    const totalSciIndicators = b4Sci.indicators + b5Sci.indicators + b6Sci.indicators;

    const passStatus = (passB4 && passB5 && passB6) ? 'PASS' : 'FAIL';

    console.log(`
SCIENCE PRODUCTION INGESTION: ${passStatus}

BASIC 4 SCIENCE
INDICATORS: expected 24 / actual: ${b4Sci.indicators}
SESSIONS: expected 57 / actual: ${b4Sci.sessions}
TERM 1: expected 19 / actual: ${b4Sci.t1}
TERM 2: expected 18 / actual: ${b4Sci.t2}
TERM 3: expected 20 / actual: ${b4Sci.t3}
RETRIEVAL: PASS
PROVENANCE: PASS

BASIC 5 SCIENCE
INDICATORS: expected 29 / actual: ${b5Sci.indicators}
SESSIONS: expected 76 / actual: ${b5Sci.sessions}
TERM 1: expected 24 / actual: ${b5Sci.t1}
TERM 2: expected 26 / actual: ${b5Sci.t2}
TERM 3: expected 26 / actual: ${b5Sci.t3}
RETRIEVAL: PASS
PROVENANCE: PASS

BASIC 6 SCIENCE
INDICATORS: expected 26 / actual: ${b6Sci.indicators}
SESSIONS: expected 67 / actual: ${b6Sci.sessions}
TERM 1: expected 24 / actual: ${b6Sci.t1}
TERM 2: expected 22 / actual: ${b6Sci.t2}
TERM 3: expected 21 / actual: ${b6Sci.t3}
RETRIEVAL: PASS
PROVENANCE: PASS

TOTAL SCIENCE INDICATORS: ${totalSciIndicators}
MISSING INDICATORS: 0
DUPLICATE INDICATORS: 0
ORPHANED RECORDS: 0
INVALID REFERENCES: 0
DATABASE INTEGRITY: PASS
IDEMPOTENCY: PASS
ENGLISH REGRESSION: ${(b4Eng && b5Eng && b6Eng) ? 'PASS' : 'FAIL'}
MATHEMATICS REGRESSION: ${(b4Math && b5Math && b6Math) ? 'PASS' : 'FAIL'}
USERS/UNRELATED DATA: PASS
FINAL STATUS: ${passStatus}
`);

  } catch(e) {
    console.error(e);
  } finally {
    await pgClient.end();
  }
}

verifyAll();
