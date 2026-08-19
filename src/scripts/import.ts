import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';
import pdf from 'pdf-parse';
import { BatchPipeline, BatchConfig } from '../lib/ingestion/batch';

config({ path: path.join(process.cwd(), '.env.local') });

async function run() {
  const args = process.argv.slice(2);
  let fileArg = '';
  let commit = false;
  let targetClasses: string[] | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--file=')) {
      fileArg = args[i].split('=')[1];
    } else if (args[i].startsWith('--classes=')) {
      targetClasses = args[i].split('=')[1].split(',').map(s => s.trim().toUpperCase());
    } else if (args[i] === '--commit') {
      commit = true;
    }
  }

  if (!fileArg) {
    console.error('Usage: npm run curriculum:import -- --file="path-to-pdf" [--commit]');
    process.exit(1);
  }

  const filePath = path.resolve(process.cwd(), fileArg);
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }

  let textContent = '';

  if (filePath.toLowerCase().endsWith('.pdf')) {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    textContent = data.text;
  } else {
    textContent = fs.readFileSync(filePath, 'utf8');
  }

  // 1. Detect Subject
  let subject = 'Unknown';
  const subjectMatch = textContent.match(/(?:subject|curriculum for).*?\b(mathematics|english language|science|history|computing|creative arts|our world our people|religious and moral education|ghanaian language)\b/i);
  if (subjectMatch) subject = subjectMatch[1].trim();
  
  if (subject === 'Unknown') {
    if (textContent.toLowerCase().includes('science')) subject = 'Science';
    else if (textContent.toLowerCase().includes('mathematics')) subject = 'Mathematics';
    else if (textContent.toLowerCase().includes('english')) subject = 'English Language';
  }
  
  // Clean up subject name
  subject = subject.charAt(0).toUpperCase() + subject.slice(1).toLowerCase();
  if (subject.toLowerCase() === 'english language' || subject.toLowerCase() === 'english') subject = 'English Language';

  // Detect time allocation
  let periods = 4;
  let duration = 30;
  if (textContent.toLowerCase().includes('ten periods a week')) periods = 10;
  else if (textContent.toLowerCase().includes('four periods a week')) periods = 4;
  else if (textContent.toLowerCase().includes('six periods a week')) periods = 6;
  if (textContent.toLowerCase().includes('thirty minutes')) duration = 30;
  else if (textContent.toLowerCase().includes('sixty minutes')) duration = 60;

  const configParams: BatchConfig = {
    sourceFile: fileArg,
    subject: subject,
    versionYear: '2019',
    sourceType: 'OFFICIAL_NACCA',
    dryRun: !commit,
    dbUrl: process.env.DATABASE_URL!.replace('5432', '6543'),
    outputDir: './curriculum-data',
    timeAllocation: {
      recommendedPeriodsPerWeek: periods,
      periodDurationMinutes: duration,
      termsPerYear: 3,
      weeksPerTerm: 12
    },
    targetClasses: targetClasses
  };

  configParams.textContent = textContent;

  await BatchPipeline.run(configParams);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
