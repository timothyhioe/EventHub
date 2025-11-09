import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter } from 'react-router-dom';
import { EventsListPage } from './EventsListPage';
import type { EventWithRelations } from '../types/event';

jest.mock('../services/api', () => ({
    eventsApi: {
        getAll: jest.fn(),
    },
    tagsApi: {
        getAll: jest.fn(),
    },
    }));

    const { eventsApi, tagsApi } = jest.requireMock('../services/api');

    const baseEvents: EventWithRelations[] = [
    {
        id: 'event-1',
        title: 'Frontend Summit',
        description: 'All about modern frontend engineering trends.',
        location: 'Berlin, Germany',
        date: new Date('2025-12-01T09:00:00.000Z').toISOString(),
        imageUrl: 'https://example.com/frontend.jpg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [
        { id: 'tag-1', name: 'Conference', color: '#2563EB', createdAt: '', updatedAt: '' },
        ],
        participants: [],
        latitude: '52.52',
        longitude: '13.405',
    },
    {
        id: 'event-2',
        title: 'Backend Workshop',
        description: 'Hands-on backend patterns.',
        location: 'Munich, Germany',
        date: new Date('2025-06-15T10:00:00.000Z').toISOString(),
        imageUrl: 'https://example.com/backend.jpg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [
        { id: 'tag-2', name: 'Workshop', color: '#F59E0B', createdAt: '', updatedAt: '' },
        ],
        participants: [],
        latitude: '48.1351',
        longitude: '11.582',
    },
    ];

    const tagResponse = {
    success: true,
    data: [
        { id: 'tag-1', name: 'Conference', color: '#2563EB', createdAt: '', updatedAt: '' },
        { id: 'tag-2', name: 'Workshop', color: '#F59E0B', createdAt: '', updatedAt: '' },
    ],
    };

    function renderPage() {
    return render(
        <MantineProvider>
        <MemoryRouter initialEntries={['/events']}>
            <EventsListPage />
        </MemoryRouter>
        </MantineProvider>,
    );
    }

    describe('EventsListPage', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.resetAllMocks();

        (tagsApi.getAll as jest.Mock).mockResolvedValue(tagResponse);

        (eventsApi.getAll as jest.Mock).mockImplementation(
        (params?: { search?: string; tagIds?: string[] }) => {
            if (params?.search === 'Workshop') {
            return Promise.resolve({
                success: true,
                data: [baseEvents[1]],
            });
            }
            if (params?.tagIds && params.tagIds.includes('tag-2')) {
            return Promise.resolve({
                success: true,
                data: [baseEvents[1]],
            });
            }
            return Promise.resolve({
            success: true,
            data: baseEvents,
            });
        },
        );
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('loads events and filters by search query', async () => {
        renderPage();

        await waitFor(() => {
        expect(screen.getByText(/Frontend Summit/i)).toBeInTheDocument();
        expect(eventsApi.getAll).toHaveBeenCalledWith(
            expect.objectContaining({ include: true }),
        );
        });

        const searchInput = screen.getByPlaceholderText(/Search events/i);
        fireEvent.change(searchInput, { target: { value: 'Workshop' } });

        await act(async () => {
        jest.advanceTimersByTime(350);
        });

        await waitFor(() => {
        expect(eventsApi.getAll).toHaveBeenLastCalledWith(
            expect.objectContaining({ search: 'Workshop', include: true }),
        );
        expect(screen.getByText(/Backend Workshop/i)).toBeInTheDocument();
        expect(screen.queryByText(/Frontend Summit/i)).not.toBeInTheDocument();
        });
    });

    it('displays empty state when no events match filters', async () => {
        (eventsApi.getAll as jest.Mock).mockImplementation(() =>
        Promise.resolve({
            success: true,
            data: [],
        }),
        );

        renderPage();

        await waitFor(() => {
        expect(screen.getByText(/No events found/i)).toBeInTheDocument();
        expect(
            screen.getByText(/Get started by creating your first event/i),
        ).toBeInTheDocument();
        });
    });
});

