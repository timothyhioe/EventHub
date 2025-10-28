import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/event_management_test',
  },
});
