import { initializeDependencyInjection, DI } from './di';

// Initialize dependency injection
initializeDependencyInjection();

// Start the server
DI.server.start();
