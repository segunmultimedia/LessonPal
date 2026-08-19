import { config } from 'dotenv';
import { join } from 'path';
import fs from 'fs';
import { BatchPipeline, BatchConfig } from './src/lib/ingestion/batch';

config({ path: join(process.cwd(), '.env.local') });

async function run() {
  const text = fs.readFileSync('science_pdf.txt', 'utf8');
  let subject = 'Unknown';
  if (text.toLowerCase().includes('science')) {
     subject = 'Science';
  }

  // Detect time allocation
  let periods = 4;
  let duration = 30;
  if (text.includes('four periods a week')) periods = 4;
  if (text.includes('thirty minutes')) duration = 30;

  const configParams: BatchConfig = {
    sourceFile: 'science_pdf.txt',
    subject: subject,
    versionYear: '2019',
    sourceType: 'OFFICIAL_NACCA',
    dryRun: false,
    dbUrl: process.env.DATABASE_URL!.replace('5432', '6543'),
    outputDir: './curriculum-data',
    timeAllocation: {
      recommendedPeriodsPerWeek: periods,
      periodDurationMinutes: duration,
      termsPerYear: 3,
      weeksPerTerm: 12
    }
  };

  await BatchPipeline.run(configParams);
}

run();
