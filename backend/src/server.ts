import { App } from './app';
import { ENV } from './config/env.config';

export class Server {
  constructor(private app: App, private env: typeof ENV) {}

  start(): void {
    this.app.app.listen(this.env.PORT, () => {
      console.log(`Server running on port ${this.env.PORT}`);
      console.log(`API available at http://localhost:${this.env.PORT}`);
      console.log(`Database: ${this.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@')}`);
    });
  }
}