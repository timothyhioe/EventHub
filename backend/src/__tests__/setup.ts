import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import * as schema from '../db/schema';
import { randomUUID } from 'crypto';

// Test database configuration
const testDbUrl = process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/event_management_test';

let testDb: ReturnType<typeof drizzle<typeof schema>>;
let testClient: ReturnType<typeof postgres>;

beforeAll(async () => {
  // Create test database connection
  testClient = postgres(testDbUrl);
  testDb = drizzle(testClient, { schema });
  
  // Override the main database export for tests
  const dbModule = require('../db');
  dbModule.db = testDb;
  
  // Run migrations for test database
  try {
    await migrate(testDb, { migrationsFolder: './drizzle' });
    console.log('Test database migrations completed successfully');
  } catch (error) {
    console.warn('Migration failed, continuing with tests:', error);
  }
});

beforeEach(async () => {
  // Clean up test data before each test with more aggressive approach
  try {
    // Disable foreign key checks temporarily for cleanup
    await testClient`SET session_replication_role = replica`;
    
    // Use raw SQL to ensure complete cleanup in correct order
    await testClient`DELETE FROM event_participants`;
    await testClient`DELETE FROM event_tags`;
    await testClient`DELETE FROM events`;
    await testClient`DELETE FROM participants`;
    await testClient`DELETE FROM tags`;
    
    // Re-enable foreign key checks
    await testClient`SET session_replication_role = DEFAULT`;
    
    // Reset sequences to ensure clean IDs
    await testClient`ALTER SEQUENCE IF EXISTS events_id_seq RESTART WITH 1`;
    await testClient`ALTER SEQUENCE IF EXISTS participants_id_seq RESTART WITH 1`;
    await testClient`ALTER SEQUENCE IF EXISTS tags_id_seq RESTART WITH 1`;
    
    console.log('🧹 Test data cleaned up successfully');
  } catch (error) {
    // Tables don't exist yet, that's okay for now
    console.log('⚠️ Tables not found, skipping cleanup:', error);
  }
});

afterAll(async () => {
  // Close database connection
  if (testClient) {
    await testClient.end();
  }
});

// Helper functions for tests
export const generateValidUUID = () => randomUUID();
export const generateNonExistentUUID = () => randomUUID(); // Generate a valid UUID that doesn't exist in DB

// Export test database for use in tests
export { testDb, testClient };
