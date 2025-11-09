# EventHub

EventHub is a modern full-stack platform for managing events, participants, and tags. Organizers can create events, enrich them with location-aware context, and keep attendees informed through rendered cards and maps.

## Table of Contents
- [Project Overview](#project-overview)
- [Feature Highlights](#feature-highlights)
- [Freestyle Feature Spotlight](#freestyle-feature-spotlight)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [UI Preview](#ui-preview)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Installation & Setup](#installation--setup)
- [Local Development](#local-development)
- [Database Management](#database-management)
- [Running Tests](#running-tests)
- [API Documentation](#api-documentation)

## Project Overview
EventHub combines a TypeScript/Node backend with a React/Mantine frontend. The goal is to keep event logistics tidy, discoverable, and visually engaging—whether you are browsing a list, looking at a detail view, or exploring everything on a map.

## Feature Highlights
- **Event Management** – full CRUD support, including automatic geocoding and imagery.
- **Participant Directory** – manage attendees, track contact details, and attach them to events.
- **Tag System** – organize events with color-coded labels and quick filtering.
- **Powerful Search & Filters** – find events by keyword, date range, tags, or location.
- **Interactive Maps** – visualize events geographically and open directions in a single click.
- **Responsive UI** – optimized layouts for desktop, tablet, and mobile breakpoints.

## Freestyle Feature Spotlight
### Geocoding & Maps
- Converts addresses to coordinates with the Nominatim API.
- Mini-map confirmation while creation/editing event's location so organizers can validate the spot.
- Dedicated `/events/map` view that shows markers for every event.
- One-click routing via Google Maps from the event detail page.

### Smart Event Imagery
- When an event is saved without an `imageUrl`, the backend requests a themed landscape photo from Unsplash.
- Falls back if the API key is missing or the Unsplash request fails.

## Tech Stack
### Backend
- Node.js + TypeScript
- Express.js
- PostgreSQL (via Drizzle ORM)
- Nominatim & Unsplash API integrations
- Jest + Supertest for automated testing
- Dockerized runtime

### Frontend
- React + TypeScript (Vite)
- Mantine UI, Mantine Hooks, Mantine Notifications
- Leaflet & React-Leaflet for interactive maps
- Jest + React Testing Library
- Dockerized runtime

## Project Structure
```
├── backend/
│   ├── src/
│   │   ├── app.ts                # Express application bootstrap
│   │   ├── controllers/          # HTTP controllers (events, tags, participants, geocoding)
│   │   ├── routes/               # Express routers
│   │   ├── services/             # Business logic + integrations
│   │   ├── db/                   # Drizzle schema, migrations, repositories
│   │   ├── middleware/           # Express middleware
│   │   ├── errors/               # Error definitions & handlers
│   │   └── __tests__/            # Jest unit & integration suites
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/                # Route-level components
│   │   ├── components/           # Reusable UI building blocks
│   │   ├── services/             # API client
│   │   ├── utils/                # Shared helpers
│   │   └── __tests__/            # Jest + RTL tests
│   └── Dockerfile
├── docker-compose.yml            # Multi-service stack (PostgreSQL + apps)
└── README.md                     # You are here
```

## UI Preview

- Dashboard / Event list – `docs/media/dashboard.png`
- Map view – `docs/media/events-map.png`
- Event Form with mini-map confirmation – `docs/media/event-detail.png`

## Prerequisites
- Docker & Docker Compose
- Node.js 18+ and npm (only required for local, non-docker workflows)
- Git

## Environment Variables



## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/eventhub.git
   cd eventhub
   ```

2. **Create environment files**
   ```bash
   # Backend
   cd backend
   cp .env.example .env    # create if the template exists, otherwise create manually
   # set DATABASE_URL, UNSPLASH_ACCESS_KEY, etc.
   cd ..

   # Frontend
   cd frontend
   cp .env.example .env    # create if the template exists, otherwise create manually
   cd ..
   ```

3. **Run with Docker**
   ```bash
   docker compose up --build
   ```

4. **Apply database migrations**
   ```bash
   docker compose exec backend npm run db:migrate
   ```

5. **Visit the stack**
   - Frontend: http://localhost:3000
   - Backend API Explorer: http://localhost:3001
   - PostgreSQL: localhost:5433 (`postgres` / `postgres`)


## Local Development
Prefer to run services outside Docker? Install dependencies once and use the dev servers:

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (in a separate terminal)
cd frontend
npm install
npm run dev
```

Keep PostgreSQL running via Docker (`docker compose up postgres`) or point `DATABASE_URL` to your own instance.

## Database Management
```bash
# Generate a migration from schema changes
npm run db:generate

# Apply migrations to main database
npm run db:migrate

# Apply migrations to the Jest test database
npm run db:migrate:test

# Open Drizzle Studio GUI
npm run db:studio

# Reset databases (use with care)
npm run db:reset        # drops + migrates main DB
npm run db:reset:test   # drops + migrates test DB
```

**Schema quick reference**
- `events` — stores event metadata, imagery, and geocoded coordinates.
- `tags` — color-coded labels.
- `participants` — attendee directory with optional phone details.
- `event_tags` / `event_participants` — join tables for many-to-many relationships.

## Running Tests

### Backend (Jest + Supertest)
```bash
cd backend
npm test              # run once
npm run test:watch    # watch mode
npm run test:coverage # collect coverage
```

- Unit tests cover services and repositories.
- Integration tests exercise controllers and routes with an isolated Postgres schema.
- Test configuration lives in `backend/src/__tests__/setup.ts`.

### Frontend (Jest + React Testing Library)
```bash
cd frontend
npm test               # run all tests
npm run test:watch     # watch mode
npm run test:ci        # serial run for CI
```

- Utility coverage (`src/utils`), component tests (e.g., `EventCard`), and form/routing integration tests.
- `src/setupTests.ts` polyfills browser APIs (e.g., `TextEncoder`, `ResizeObserver`) and mocks Leaflet.

## API Documentation
- **Postman Collection** – Import `docs/postman/EventHub.postman_collection.json` to explore endpoints (health checks, CRUD operations, geocoding, relationship management). Every request includes example payloads and scripts for quick seeding.
- **Base URL** – `http://localhost:3001/api`
- **Example workflow**:
  1. `GET /events` – list events
  2. `POST /events` – create an event (auto-geocodes + fetches imagery)
  3. `POST /events/:id/tags` – attach a tag
  4. `GET /geocoding/search?q=Darmstadt` – fetch coordinates for map confirmation



