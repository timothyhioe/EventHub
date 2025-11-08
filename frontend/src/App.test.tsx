import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

jest.mock('./services/api', () => ({
    eventsApi: {
        getAll: jest.fn().mockResolvedValue({
        success: true,
        data: [
            {
            id: 'event-1',
            title: 'React Conf',
            description: 'React community gathering',
            location: 'San Francisco',
            date: new Date('2025-05-20T10:00:00.000Z').toISOString(),
            imageUrl: null,
            createdAt: '',
            updatedAt: '',
            participants: [],
            tags: [],
            latitude: '37.7749',
            longitude: '-122.4194',
            },
        ],
        }),
        getById: jest.fn(),
    },
    participantsApi: {
        getAll: jest.fn().mockResolvedValue({ success: true, data: [] }),
    },
    tagsApi: {
        getAll: jest.fn().mockResolvedValue({ success: true, data: [] }),
    },
    }));

    describe('App routing', () => {
    it('navigates to map view when Map nav item is clicked', async () => {
        window.history.pushState({}, '', '/events');
        render(<App />);

        await waitFor(() =>
        expect(screen.getByRole('heading', { name: /events/i })).toBeInTheDocument(),
        );

        const mapNav = screen.getByText(/map/i);
        fireEvent.click(mapNav);

        await waitFor(() => {
        expect(screen.getByText(/Events Map/i)).toBeInTheDocument();
        });
    });
});

