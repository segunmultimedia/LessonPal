import postgres from 'postgres';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(process.cwd(), '.env.local') });

async function clearLocks() {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });
  const active = await sql`
    SELECT pid, state, query 
    FROM pg_stat_activity 
    WHERE state = 'active' OR state = 'idle in transaction'
  `;
  console.log('Active queries:', active);
  
  for (const a of active) {
    if (a.pid !== process.pid && !a.query.includes('pg_stat_activity')) {
      console.log('Killing PID', a.pid);
      await sql`SELECT pg_terminate_backend(${a.pid})`;
    }
  }
  
  await sql.end();
}

clearLocks();
