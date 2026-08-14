import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not set. Make sure .env.local exists and contains DATABASE_URL.'
  );
}

export default defineConfig({
  out: './src/lib/db/migrations',
  schema: './src/lib/db/schema/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
    ssl: 'require',
  },
});
