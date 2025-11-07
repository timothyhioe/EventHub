# EventHub
A modern full-stack web application for managing events, participants, and tags.

## Features

- **Event Management**: Create, read, update, and delete events
- **Participant Management**: Manage event participants
- **Tag System**: Organize events with color-coded tags
- **Search & Filter**: Find events by various criteria
- **Geocoding & Maps (Freestyle Feature)**: 
  - Automatic address-to-coordinates conversion using Nominatim
  - Location autocomplete with real-time suggestions
  - Interactive map view showing all events
  - Mini-map preview when creating/editing events
  - Instant directions to events via Google Maps or OpenStreetMap
- **Responsive Design**: Works on desktop, tablet, and mobile

## Tech Stack

### Backend
- Node.js with TypeScript
- Express.js
- PostgreSQL
- Drizzle ORM
- Nominatim Geocoding API integration
- Docker

### Frontend
- React with TypeScript
- Mantine UI components
- Leaflet & React-Leaflet for interactive maps
- Location autocomplete with debouncing
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
   # Apply database migrations (run inside backend container or locally)
   docker compose exec backend npm run db:migrate
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

### Backend Testing

The backend includes comprehensive testing with Jest and Supertest:

```bash
# Run backend tests
cd backend && npm test

# Run tests with coverage
cd backend && npm run test:coverage

# Run tests in watch mode
cd backend && npm run test:watch
```

**Test Coverage:**
- ✅ Unit tests for all services (EventService, ParticipantService, TagService)
- ✅ Integration tests for controllers
- ✅ API endpoint tests with Supertest
- ✅ Test database setup with proper isolation
- ✅ 25+ tests currently passing

**Test Structure:**
```
backend/src/__tests__/
├── setup.ts                    # Test database configuration
├── services/                   # Unit tests for services
│   ├── eventService.test.ts
│   ├── participantService.test.ts
│   └── tagService.test.ts
├── controllers/                # Integration tests for controllers
│   └── eventController.test.ts
├── routes/                     # API endpoint tests
│   └── api.test.ts
└── helpers/
    └── testApp.ts             # Test app setup helper
```

**Test Database:**
- Separate test database (`event_management_test`)
- Automatic cleanup between tests
- Proper schema setup

### Frontend Testing

Frontend testing setup is ready for implementation:

```bash
# Run frontend tests (when implemented)
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

**Migration Commands:**
```bash
cd backend
npm run db:generate     # Generate migration files from schema changes
npm run db:migrate      # Apply migrations to main database
npm run db:migrate:test # Apply migrations to test database
npm run db:push         # Push schema directly (for development)
npm run db:studio       # Open Drizzle Studio (GUI)
```

**Database Reset Commands:**
```bash
npm run db:reset        # Reset main database (drop + migrate)
npm run db:reset:test   # Reset test database (drop + migrate)
npm run db:drop         # Drop all tables in main database
```

**Migration Workflow:**
1. Make changes to `src/db/schema.ts`
2. Run `npm run db:generate` to create migration files
3. Run `npm run db:migrate` to apply changes to database
4. For tests: `npm run db:migrate:test`

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

## Database Schema

The database includes the following tables:
- **events** - Event information (title, description, location, date, image, latitude, longitude)
- **tags** - Color-coded tags for organizing events
- **participants** - People who can attend events
- **event_tags** - Many-to-many relationship between events and tags
- **event_participants** - Many-to-many relationship between events and participants

**Geocoding Fields:**
- `latitude` (numeric) - Automatically populated from location address
- `longitude` (numeric) - Automatically populated from location address

For detailed schema information, see `backend/src/db/schema.ts`

## Geocoding & Mapping Features

### Automatic Geocoding
When creating or updating an event with a location, the system automatically:
1. Converts the address to coordinates using Nominatim API
2. Stores latitude and longitude in the database
3. Enables map-based features

### Location Autocomplete
The event form includes intelligent location search:
- Mini-map preview of selected location

### Interactive Maps
- **Map View Page** (`/events/map`): See all events plotted on an interactive map
- **Event Details**: Clickable markers with event information
- **Get Directions**: One-click routing via Google Maps or OpenStreetMap
- **Responsive**: Maps adapt to all screen sizes

### API Endpoints

**Geocoding Search**
```
GET /api/geocoding/search?q={query}
```
Returns location suggestions with coordinates.

Example response:
```json
{
  "success": true,
  "data": [
    {
      "displayName": "New York, United States",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "address": {
        "city": "New York",
        "state": "New York",
        "country": "United States"
      }
    }
  ]
}
````
