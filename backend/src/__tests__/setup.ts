import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import * as schema from '../db/schema';
import { randomUUID } from 'crypto';
import 'dotenv/config';

const testDbUrl = process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/event_management_test';

let testDb: ReturnType<typeof drizzle<typeof schema>>;
let testClient: ReturnType<typeof postgres>;

beforeAll(async () => {
  try {
    //connect to test database
    testClient = postgres(testDbUrl);
    testDb = drizzle(testClient, { schema });
    
    //override the main database export for tests
    const dbModule = require('../db');
    dbModule.db = testDb;
    
    //run migrations
    await migrate(testDb, { migrationsFolder: './drizzle' });
    console.log('Test database ready');
  } catch (error: any) {
    console.error('Failed to set up test database:', error?.message);
    throw error;
  }
});

beforeEach(async () => {
  //clean up test data before each test
  try {
    await testClient`SET session_replication_role = replica`;
    await testClient`DELETE FROM event_participants`;
    await testClient`DELETE FROM event_tags`;
    await testClient`DELETE FROM events`;
    await testClient`DELETE FROM participants`;
    await testClient`DELETE FROM tags`;
    await testClient`SET session_replication_role = DEFAULT`;
  } catch (error) {
    //tables don't exist yet, that's okay
    console.log('Tables not found, skipping cleanup');
  }
});

afterAll(async () => {
  if (testClient) {
    await testClient.end();
  }
});

//helper functions
export const generateValidUUID = () => randomUUID();
export const generateNonExistentUUID = () => randomUUID();

//export test database for use in tests
export { testDb, testClient };
