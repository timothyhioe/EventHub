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
- Prisma ORM
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

1. Clone the repository
2. Run with Docker:
   ```bash
   docker-compose up --build
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

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
npm run dev
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```
