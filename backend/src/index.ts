import { initializeDependencyInjection, DI } from './dependency-injection';

initializeDependencyInjection();

try{
    DI.server.start();
}catch(error){
    console.error('Error starting server:', error);
    process.exit(1);
}