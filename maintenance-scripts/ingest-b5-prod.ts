import fs from 'fs';
import { IngestionEngine } from './src/lib/ingestion/engine';
import { CurriculumSourceInfo } from './src/lib/ingestion/types';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(process.cwd(), '.env.local') });

async function ingestBasic5() {
  const textContent = fs.readFileSync('pdf_text.txt', 'utf8');

  const info: CurriculumSourceInfo = {
    classLevel: 'Basic 5',
    subject: 'English Language',
    sourceType: 'OFFICIAL_NACCA',
    versionYear: '2019',
    textContent,
    timeAllocation: {
      recommendedPeriodsPerWeek: 10,
      periodDurationMinutes: 30,
      weeksPerTerm: 12,
      termsPerYear: 3
    }
  };

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL is not set.');
  }

  try {
    await IngestionEngine.run(info, dbUrl, './curriculum-data');
    console.log('FINAL STATUS: BASIC 5 ENGLISH PRODUCTION INGESTION: PASS');
  } catch (err) {
    console.error("Test failed", err);
    console.log('FINAL STATUS: BASIC 5 ENGLISH PRODUCTION INGESTION: FAIL');
  }
}

ingestBasic5();
