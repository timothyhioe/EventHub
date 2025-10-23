# Event Management System

A modern full-stack web application for managing events, participants, and tags.

## Features

- **Event Management**: Create, read, update, and delete events
- **Participant Management**: Manage event participants
- **Tag System**: Organize events with color-coded tags
- **Search & Filter**: Find events by various criteria
- **Responsive Design**: Works on desktop, tablet, and mobile

## Tech Stack

### Backend
- Node.js with TypeScript
- Express.js
- PostgreSQL
- Drizzle ORM
- Docker

### Frontend
- React with TypeScript
- Modern UI components
- Responsive design

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git

## Quick Start

1. **Clone the repository**

2. **Set up environment variables:**
   ```bash
   cd backend
   cp env.example .env
   cd ..
   ```

3. **Run with Docker:**
   ```bash
   docker compose up --build
   ```

4. **Set up the database:**
   ```bash
   # In a new terminal, push the database schema
   cd backend
   npm run db:push
   ```

5. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Database: localhost:5433 (PostgreSQL)

## Project Structure

```
├── backend/          # Node.js + TypeScript backend
├── frontend/         # React + TypeScript frontend
├── docker-compose.yml # Docker configuration
└── README.md         # This file
```

## Testing

```bash
# Run backend tests
cd backend && npm test

# Run frontend tests
cd frontend && npm test
```

## API Documentation

The API documentation will be available once the backend is implemented.

## Development

### Backend Development
```bash
cd backend
npm install
cp env.example .env  # Create .env file
npm run dev
```

### Database Management
```bash
cd backend
npm run db:generate  # Generate migration files
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio (GUI)
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

## Database Schema

The database includes the following tables:
- **events** - Event information (title, description, location, date, image)
- **tags** - Color-coded tags for organizing events
- **participants** - People who can attend events
- **event_tags** - Many-to-many relationship between events and tags
- **event_participants** - Many-to-many relationship between events and participants

For detailed schema information, see `backend/src/db/schema.ts`
