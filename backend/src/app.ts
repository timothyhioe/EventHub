import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import eventRoutes from './routes/eventRoutes';
import tagRoutes from './routes/tagRoutes';
import participantRoutes from './routes/participantRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/events', eventRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/participants', participantRoutes);

app.get('/', (req, res) => {
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
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Server startup is handled in server.ts

export default app;
