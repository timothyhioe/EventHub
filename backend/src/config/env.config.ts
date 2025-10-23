import 'dotenv/config';

export const ENV = {
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/event_management',
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
};

export type EnvType = typeof ENV;
