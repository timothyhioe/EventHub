import { render, screen, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter } from 'react-router-dom';
import { EventsMapPage } from './EventsMapPage';
import type { EventWithRelations } from '../types/event';

jest.mock('../services/api', () => ({
    eventsApi: {
        getAll: jest.fn(),
    },
    }));

    const { eventsApi } = jest.requireMock('../services/api');

    const eventsWithMixedCoords: EventWithRelations[] = [
    {
        id: 'has-coords',
        title: 'Mapped Meetup',
        description: 'Event with coordinates',
        location: 'Hamburg, Germany',
        date: new Date('2025-03-01T10:00:00.000Z').toISOString(),
        imageUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        latitude: '53.5511',
        longitude: '9.9937',
        participants: [],
        tags: [],
    },
    {
        id: 'no-coords',
        title: 'Offline Event',
        description: 'Missing coordinates',
        location: 'Unknown',
        date: new Date('2025-05-20T08:00:00.000Z').toISOString(),
        imageUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        latitude: null,
        longitude: null,
        participants: [],
        tags: [],
    },
    ];

    function renderPage() {
    return render(
        <MantineProvider>
        <MemoryRouter initialEntries={['/events/map']}>
            <EventsMapPage />
        </MemoryRouter>
        </MantineProvider>,
    );
    }

    describe('EventsMapPage', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('shows events that have coordinates on the map', async () => {
        (eventsApi.getAll as jest.Mock).mockResolvedValue({
        success: true,
        data: eventsWithMixedCoords,
        });

        renderPage();

        await waitFor(() => {
        expect(screen.getByText(/Events Map/i)).toBeInTheDocument();
        expect(eventsApi.getAll).toHaveBeenCalledWith({ include: true });
        });

        expect(screen.getByText(/1 events with locations/i)).toBeInTheDocument();
        expect(
        screen.queryByText(/No events with locations to display/i),
        ).not.toBeInTheDocument();
    });

    it('renders fallback when no events have coordinates', async () => {
        (eventsApi.getAll as jest.Mock).mockResolvedValue({
        success: true,
        data: [],
        });

        renderPage();

        await waitFor(() => {
        expect(screen.getByText(/Events Map/i)).toBeInTheDocument();
        });

        expect(
        screen.getByText(/No events with locations to display/i),
        ).toBeInTheDocument();
    });
});

