import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import * as schema from '../db/schema';

// Test database configuration
const testDbUrl = process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/event_management_test';

let testDb: ReturnType<typeof drizzle<typeof schema>>;
let testClient: ReturnType<typeof postgres>;

beforeAll(async () => {
  // Create test database connection
  testClient = postgres(testDbUrl);
  testDb = drizzle(testClient, { schema });
  
  // Run migrations for test database
  try {
    await migrate(testDb, { migrationsFolder: './drizzle' });
  } catch (error) {
    console.warn('Migration failed, continuing with tests:', error);
  }
});

beforeEach(async () => {
  // Clean up test data before each test (only if tables exist)
  try {
    await testDb.delete(schema.eventParticipants);
    await testDb.delete(schema.eventTags);
    await testDb.delete(schema.events);
    await testDb.delete(schema.participants);
    await testDb.delete(schema.tags);
  } catch (error) {
    // Tables don't exist yet, that's okay for now
    console.log('Tables not found, skipping cleanup');
  }
});

afterAll(async () => {
  // Close database connection
  if (testClient) {
    await testClient.end();
  }
});

// Export test database for use in tests
export { testDb, testClient };
