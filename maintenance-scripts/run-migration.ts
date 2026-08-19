import postgres from 'postgres';
import { config } from 'dotenv';
import { join } from 'path';
import { readFileSync } from 'fs';

config({ path: join(process.cwd(), '.env.local') });

async function runMigration() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL missing');
  }
  const client = postgres(process.env.DATABASE_URL, { max: 1 });
  
  try {
    const sqlFile = readFileSync(join(process.cwd(), 'src/lib/db/migrations/0003_worried_christian_walker.sql'), 'utf8');
    console.log('Running migration...');
    await client.unsafe(sqlFile);
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

runMigration();
