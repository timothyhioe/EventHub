import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Title, Text, Stack, Button, Group, Loader, Center } from '@mantine/core';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { List, MapPin } from 'lucide-react';
import { eventsApi } from '../services/api';
import type { EventWithRelations } from '../types/event';

export function EventsMapPage() {
    const navigate = useNavigate();
    const [events, setEvents] = useState<EventWithRelations[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
        setLoading(true);
        const response = await eventsApi.getAll({ include: true });
        if (response.success) {
            const eventsData = Array.isArray(response.data) ? response.data : [response.data];
            //filter events that have coordinates
            const eventsWithCoords = eventsData.filter(
            e => e.latitude && e.longitude
            );
            setEvents(eventsWithCoords);
        }
        } catch (error) {
        console.error('Failed to load events:', error);
        } finally {
        setLoading(false);
        }
    };

    //calculate center point (average of all coordinates)
    const getMapCenter = (): [number, number] => {
        const avgLat = events.reduce((sum, e) => sum + (e.latitude ? parseFloat(e.latitude.toString()) : 0), 0) / events.length;
        const avgLng = events.reduce((sum, e) => sum + (e.longitude ? parseFloat(e.longitude.toString()) : 0), 0) / events.length;
        return [avgLat, avgLng];
    };

    if (loading) {
        return (
        <Container size="xl" py="xl">
            <Center><Loader size="lg" /></Center>
        </Container>
        );
    }

    return (
        <Container size="xl" py="xl">
        <Stack gap="xl">
            <Group justify="space-between">
            <div>
                <Title order={1}>Events Map</Title>
                <Text c="dimmed" mt="xs">
                {events.length} events with locations
                </Text>
            </div>
            </Group>

            {events.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
                No events with locations to display
            </Text>
            ) : (
            <div style={{ height: '600px', borderRadius: '8px', overflow: 'hidden' }}>
                <MapContainer
                center={getMapCenter()}
                zoom={events.length === 1 ? 13 : 6}
                style={{ height: '100%', width: '100%' }}
                >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {events.map((event) => (
                    <Marker
                    key={event.id}
                    position={[parseFloat(event.latitude!), parseFloat(event.longitude!)]}
                    >
                    <Popup>
                        <div style={{ minWidth: '200px' }}>
                        <Text fw={600} mb="xs">{event.title}</Text>
                        <Text size="sm" c="dimmed" mb="xs">
                            {new Date(event.date).toLocaleDateString()}
                        </Text>
                        {event.location && (
                            <Text size="sm" mb="sm">
                            <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
                            {event.location}
                            </Text>
                        )}
                        <Button
                            size="xs"
                            onClick={() => navigate(`/events/${event.id}`)}
                            fullWidth
                        >
                            View Details
                        </Button>
                        </div>
                    </Popup>
                    </Marker>
                ))}
                </MapContainer>
            </div>
            )}
        </Stack>
        </Container>
    );
}