require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL);

async function check() {
  const constraints = await sql`
    SELECT
      tc.table_name,
      tc.constraint_name,
      string_agg(kcu.column_name, ', ') as columns
    FROM 
      information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'UNIQUE'
    GROUP BY tc.table_name, tc.constraint_name;
  `;

  console.log(JSON.stringify(constraints, null, 2));
  process.exit(0);
}

check().catch(console.error);
