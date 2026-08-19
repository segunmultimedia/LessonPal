import postgres from 'postgres';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(process.cwd(), '.env.local') });

async function t() {
  const pgClient = postgres(process.env.DATABASE_URL!.replace('5432', '6543'), { ssl: 'require', max: 1 });
  
  const b4Level = await pgClient`SELECT id FROM class_levels WHERE name = 'Basic 4' LIMIT 1`;
  const b5Level = await pgClient`SELECT id FROM class_levels WHERE name = 'Basic 5' LIMIT 1`;
  const b6Level = await pgClient`SELECT id FROM class_levels WHERE name = 'Basic 6' LIMIT 1`;

  const engSubject = await pgClient`SELECT id FROM subjects WHERE name = 'English Language' LIMIT 1`;
  const engId = engSubject[0].id;
  
  const b4Eng = await pgClient`SELECT count(*) FROM curriculum_lessons WHERE class_level_id = ${b4Level[0].id} AND subject_id = ${engId}`;
  const b5Eng = await pgClient`SELECT count(*) FROM curriculum_lessons WHERE class_level_id = ${b5Level[0].id} AND subject_id = ${engId}`;
  const b6Eng = await pgClient`SELECT count(*) FROM curriculum_lessons WHERE class_level_id = ${b6Level[0].id} AND subject_id = ${engId}`;

  console.log(`B4 Eng: ${b4Eng[0].count}, B5 Eng: ${b5Eng[0].count}, B6 Eng: ${b6Eng[0].count}`);
  
  await pgClient.end();
}
t();
