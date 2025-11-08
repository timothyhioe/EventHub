import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { ParticipantForm } from './ParticipantForm';

jest.mock('../services/api', () => ({
    participantsApi: {
        create: jest.fn(),
        update: jest.fn(),
    },
}));

const { participantsApi } = jest.requireMock('../services/api');

function renderForm(props: React.ComponentProps<typeof ParticipantForm>) {
    return render(
        <MantineProvider>
        <ParticipantForm {...props} />
        </MantineProvider>,
    );
}

describe('ParticipantForm', () => {
    const createDefaultProps = () => ({
    participant: null,
    opened: true,
    onClose: jest.fn(),
    onSuccess: jest.fn(),
    });

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('validates required fields', async () => {
    const props = createDefaultProps();
    renderForm(props);

        fireEvent.click(screen.getByRole('button', { name: /create participant/i }));

    await waitFor(() => {
        expect(participantsApi.create).not.toHaveBeenCalled();
        expect(props.onSuccess).not.toHaveBeenCalled();
    });
    });

    it('submits new participant data', async () => {
        (participantsApi.create as jest.Mock).mockResolvedValueOnce({});

    const props = createDefaultProps();
    renderForm(props);

        fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Jane Doe' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'jane@example.com' } });
        fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: '+1-555-0101' } });

        fireEvent.click(screen.getByRole('button', { name: /create participant/i }));

        await waitFor(() => {
        expect(participantsApi.create).toHaveBeenCalledWith({
            name: 'Jane Doe',
            email: 'jane@example.com',
            phone: '+1-555-0101',
        });
        expect(props.onSuccess).toHaveBeenCalled();
        expect(props.onClose).toHaveBeenCalled();
        });
    });

    it('submits updated participant data', async () => {
        (participantsApi.update as jest.Mock).mockResolvedValueOnce({});

        const participant = {
        id: 'participant-1',
        name: 'Existing User',
        email: 'existing@example.com',
        phone: '+1-555-2222',
        createdAt: '',
        updatedAt: '',
        };

    const props = createDefaultProps();
    renderForm({
        ...props,
        participant,
        });

        fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Updated User' } });
        fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

        await waitFor(() => {
        expect(participantsApi.update).toHaveBeenCalledWith('participant-1', {
            name: 'Updated User',
            email: 'existing@example.com',
            phone: '+1-555-2222',
        });
        });
    });
});

