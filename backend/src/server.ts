import app from './app';
import { ENV } from './config/env.config';

// This file is the entry point for the server
// The app is imported and started here

app.listen(ENV.PORT, () => {
  console.log(`🚀 Server running on port ${ENV.PORT}`);
  console.log(`📖 API available at http://localhost:${ENV.PORT}`);
  console.log(`🗄️  Database: ${ENV.DATABASE_URL.replace(/:[^:@]+@/, ':****@')}`);
});
