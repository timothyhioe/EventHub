import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

export class App {
  public app: express.Application;

  constructor(routes: {
    eventRoutes: any;
    participantRoutes: any;
    tagRoutes: any;
    geocodingRoutes: any;
  }) {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes(routes);
  }

  private setupMiddleware(): void {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(morgan('combined'));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private setupRoutes(routes: {
    eventRoutes: any;
    participantRoutes: any;
    tagRoutes: any;
    geocodingRoutes: any;
  }): void {
    // Routes
    this.app.use('/api/events', routes.eventRoutes.getRoutes());
    this.app.use('/api/tags', routes.tagRoutes.getRoutes());
    this.app.use('/api/participants', routes.participantRoutes.getRoutes());
    this.app.use('/api/geocoding', routes.geocodingRoutes.getRoutes());

    this.app.get('/', (req, res) => {
      res.json({ 
        message: 'Event Management System API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
          events: '/api/events',
          tags: '/api/tags',
          participants: '/api/participants',
          health: '/health'
        }
      });
    });

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString()
      });
    });
  }
}