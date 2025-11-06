import { initializeDependencyInjection, DI } from './dependency-injection';
import { runMigrations } from './db/migrate';

initializeDependencyInjection();

async function start() {
    try {
        await runMigrations();
        DI.server.start();
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

start();