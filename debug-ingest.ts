import { config } from 'dotenv';
import fs from 'fs';
import { join } from 'path';
import { CurriculumImporter } from './src/lib/ingestion/importer';

config({ path: './.env.local' });

async function runImporter() {
  const dbUrl = process.env.DATABASE_URL!;
  
  console.log("Loading data from disk...");
  const info = JSON.parse(fs.readFileSync('./curriculum-data/basic-6/english-language/source.json', 'utf8'));
  const indicators = JSON.parse(fs.readFileSync('./curriculum-data/basic-6/english-language/indicators.json', 'utf8'));
  const lessons = JSON.parse(fs.readFileSync('./curriculum-data/basic-6/english-language/lessons.json', 'utf8'));
  
  console.log("Running importer...");
  try {
    await CurriculumImporter.ingest(dbUrl, info, indicators, lessons);
    console.log("Importer finished.");
  } catch(e) {
    console.error("Importer failed:", e);
  }
}
runImporter();
