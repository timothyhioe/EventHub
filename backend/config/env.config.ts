import dotenv from 'dotenv';

dotenv.config();

export const ENV = {
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/eventdb',
} as const;
