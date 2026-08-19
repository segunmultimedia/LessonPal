import { config } from 'dotenv';
import postgres from 'postgres';
import { join } from 'path';

config({ path: join(process.cwd(), '.env.local') });

async function checkLocks() {
  const dbUrl = process.env.DATABASE_URL;
  const sql = postgres(dbUrl, { ssl: 'require' });
  
  try {
    const locks = await sql`
      SELECT l.pid, c.relname, l.mode, l.granted
      FROM pg_locks l 
      JOIN pg_class c ON l.relation = c.oid 
      WHERE c.relkind = 'r'
    `;
    console.log(locks);
  } finally {
    await sql.end();
  }
}
checkLocks();
