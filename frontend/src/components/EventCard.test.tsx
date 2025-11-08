import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { EventCard } from './EventCard';
import type { EventWithRelations } from '../types/event';

function renderWithMantine(ui: React.ReactNode) {
    return render(<MantineProvider>{ui}</MantineProvider>);
}

const mockEvent: EventWithRelations = {
    id: 'event-1',
    title: 'Frontend Summit',
    description: 'All about modern frontend engineering trends.',
    location: 'Berlin, Germany',
    date: new Date('2025-12-01T09:00:00.000Z').toISOString(),
    imageUrl: 'https://example.com/image.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: [
        { id: 'tag-1', name: 'Conference', color: '#2563EB', createdAt: '', updatedAt: '' },
        { id: 'tag-2', name: 'React', color: '#38BDF8', createdAt: '', updatedAt: '' },
    ],
    participants: [
        { id: 'part-1', name: 'Alice Johnson', email: 'alice@example.com', createdAt: '', updatedAt: '' },
        { id: 'part-2', name: 'Marcus Lee', email: 'marcus@example.com', createdAt: '', updatedAt: '' },
    ],
    latitude: undefined,
    longitude: undefined,
};

describe('EventCard', () => {
    it('renders event details correctly', () => {
        const handleView = jest.fn();
        renderWithMantine(<EventCard event={mockEvent} onViewDetails={handleView} />);

        expect(screen.getByText(/Frontend Summit/i)).toBeInTheDocument();
        expect(screen.getByText(/All about modern frontend engineering/i)).toBeInTheDocument();
        expect(screen.getByText(/Berlin, Germany/i)).toBeInTheDocument();
        expect(screen.getByText(/2 participants/i)).toBeInTheDocument();
        expect(screen.getByText('Conference')).toBeInTheDocument();
        expect(screen.getByText('React')).toBeInTheDocument();
    });

    it('invokes callback when view button is clicked', () => {
        const handleView = jest.fn();
        renderWithMantine(<EventCard event={mockEvent} onViewDetails={handleView} />);

        fireEvent.click(screen.getByRole('button', { name: /view details/i }));
        expect(handleView).toHaveBeenCalledWith('event-1');
    });
});

