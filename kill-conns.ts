import postgres from 'postgres';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(process.cwd(), '.env.local') });

async function killConnections() {
  const connectionUrl = process.env.DATABASE_URL;
  const sql = postgres(connectionUrl, { ssl: 'require' });
  
  try {
     const conns = await sql`SELECT pid, state, query FROM pg_stat_activity WHERE datname = 'postgres' AND state = 'idle in transaction'`;
     console.log('Idle in transaction:', conns.length);
     
     const myPid = await sql`SELECT pg_backend_pid() as pid`;
     const myPidNum = myPid[0].pid;
     
     for (const c of conns) {
       if (c.pid !== myPidNum) {
         console.log(`Killing idle in transaction ${c.pid}...`);
         try {
             await sql`SELECT pg_cancel_backend(${c.pid})`;
             await sql`SELECT pg_terminate_backend(${c.pid})`;
         } catch(e) {}
       }
     }
     console.log('Done cleaning connections');
  } catch (e) {
     console.error(e);
  } finally {
     await sql.end();
  }
}

killConnections();
