import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { ENV } from '../config/env.config';

export async function runMigrations() {
    try {
        console.log('Running database migrations...');
        const client = postgres(ENV.DATABASE_URL, { max: 1 });
        const db = drizzle(client);
        
        await migrate(db, { migrationsFolder: './drizzle' });
        await client.end();
        
        console.log('Migrations success');
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    }
}
