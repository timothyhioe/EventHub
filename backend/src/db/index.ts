import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { ENV } from '../config/env.config';

// Create postgres client
const client = postgres(ENV.DATABASE_URL);

// Create drizzle instance
export const db = drizzle(client, { schema });

// Export schema for use in other files
export * from './schema';