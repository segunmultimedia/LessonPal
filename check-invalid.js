const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
require('dotenv').config({path: '.env.local'});
async function f() {
  const sql = postgres(process.env.DATABASE_URL);
  const res = await sql`SELECT id, indicator_id, week_number, lesson_number, academic_term_id FROM curriculum_lessons WHERE id = 'ad13d90d-159a-4dd9-b750-e77fb0b59d1a'`;
  console.log(res);
  sql.end();
}
f();
