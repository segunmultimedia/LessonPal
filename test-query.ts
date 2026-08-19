import { config } from 'dotenv';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import { curriculumSources } from './src/lib/db/schema';

config({ path: './.env.local' });

async function test() {
  const pgClient = postgres(process.env.DATABASE_URL!, { ssl: 'require' });
  const db = drizzle(pgClient);
  console.log("Connected");
  
  try {
    const sourceTitle = `English Language Curriculum for Basic 6`;
    console.log("Querying...");
    let [source] = await db.select().from(curriculumSources).where(eq(curriculumSources.title, sourceTitle)).limit(1);
    console.log("Result:", source);
  } catch (e) {
    console.error(e);
  } finally {
    await pgClient.end();
  }
}
test();
