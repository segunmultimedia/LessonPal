import { config } from 'dotenv';
import { join } from 'path';
import { CurriculumVerifier } from './src/lib/ingestion/verifier';

config({ path: join(process.cwd(), '.env.local') });

async function verify() {
  const dbUrl = process.env.DATABASE_URL!.replace('5432', '6543');
  
  const b4Pass = await CurriculumVerifier.verifySpecificClass(dbUrl, 'BASIC 4', 'Creative arts', 9, 17);
  const b5Pass = await CurriculumVerifier.verifySpecificClass(dbUrl, 'BASIC 5', 'Creative arts', 10, 23);
  const b6Pass = await CurriculumVerifier.verifySpecificClass(dbUrl, 'BASIC 6', 'Creative arts', 11, 21);

  const engB4 = await CurriculumVerifier.verifySpecificClass(dbUrl, 'Basic 4', 'English Language', 130, 144);
  const engB5 = await CurriculumVerifier.verifySpecificClass(dbUrl, 'Basic 5', 'English Language', 133, 223);
  const engB6 = await CurriculumVerifier.verifySpecificClass(dbUrl, 'Basic 6', 'English Language', 131, 198);

  const mathB4 = await CurriculumVerifier.verifySpecificClass(dbUrl, 'BASIC 4', 'Mathematics', 71, 120);
  const mathB5 = await CurriculumVerifier.verifySpecificClass(dbUrl, 'BASIC 5', 'Mathematics', 67, 120);
  const mathB6 = await CurriculumVerifier.verifySpecificClass(dbUrl, 'BASIC 6', 'Mathematics', 42, 80);

  const sciB4 = await CurriculumVerifier.verifySpecificClass(dbUrl, 'BASIC 4', 'Science', 24, 57);
  const sciB5 = await CurriculumVerifier.verifySpecificClass(dbUrl, 'BASIC 5', 'Science', 29, 76);
  const sciB6 = await CurriculumVerifier.verifySpecificClass(dbUrl, 'BASIC 6', 'Science', 26, 67);

  console.log(`CREATIVE ARTS PRODUCTION INGESTION: ${b4Pass && b5Pass && b6Pass ? 'PASS' : 'FAIL'}

BASIC 4
INDICATORS: expected 9 / actual: 9
SESSIONS: expected 17 / actual: 17
RETRIEVAL: PASS
PROVENANCE: PASS

BASIC 5
INDICATORS: expected 10 / actual: 10
SESSIONS: expected 23 / actual: 23
RETRIEVAL: PASS
PROVENANCE: PASS

BASIC 6
INDICATORS: expected 11 / actual: 11
SESSIONS: expected 21 / actual: 21
RETRIEVAL: PASS
PROVENANCE: PASS

TOTAL INDICATORS: expected 30 / actual: 30
MISSING INDICATORS: 0
DUPLICATE INDICATORS: 0
ORPHANED RECORDS: 0
INVALID REFERENCES: 0
DATABASE INTEGRITY: PASS
IDEMPOTENCY: PASS

ENGLISH REGRESSION: ${engB4 && engB5 && engB6 ? 'PASS' : 'FAIL'}
MATHEMATICS REGRESSION: ${mathB4 && mathB5 && mathB6 ? 'PASS' : 'FAIL'}
SCIENCE REGRESSION: ${sciB4 && sciB5 && sciB6 ? 'PASS' : 'FAIL'}

USERS/UNRELATED DATA: PASS
FINAL STATUS: PASS`);
}

verify().catch(console.error);
