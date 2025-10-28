import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { ENV } from '../config/env.config';

const client = postgres(ENV.DATABASE_URL);

export const db = drizzle(client, { schema });

export * from './schema';