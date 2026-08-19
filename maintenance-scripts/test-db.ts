import postgres from 'postgres';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(process.cwd(), '.env.local') });

async function test() {
  const url = 'postgresql://postgres.zpkbsbrmfrepylhbhpsr:u7GCz26tFOo98GZs@db.zpkbsbrmfrepylhbhpsr.supabase.co:5432/postgres';
  const pgClient = postgres(url, { ssl: 'require', prepare: false, connect_timeout: 5 });
  try {
    console.log('Connecting...');
    let result = await pgClient`SELECT id FROM countries WHERE code = 'GHA' LIMIT 1`;
    console.log('Country:', result[0].id);
  } catch(e) {
    console.error(e);
  } finally {
    await pgClient.end();
  }
}

test();
