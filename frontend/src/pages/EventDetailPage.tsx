import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Title, Text, Image, Badge, Button, Group, Stack, Paper, ActionIcon, Divider, Avatar, Grid, Loader, Center } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { ArrowLeft, Calendar, MapPin, Edit, Trash2, Users, Mail, Phone } from 'lucide-react';
import { eventsApi } from '../services/api';
import type { EventWithRelations, EventResponse } from '../types/event';

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventWithRelations | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadEvent();
    }
  }, [id]);

  const loadEvent = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = (await eventsApi.getById(id, true)) as EventResponse;
      if (response.success) {
        const eventData = Array.isArray(response.data) ? response.data[0] : response.data;
        setEvent(eventData);
      }
    } catch (error) {
      console.error('Failed to load event:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load event details',
        color: 'red',
      });
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      await eventsApi.delete(id);
      notifications.show({
        title: 'Success',
        message: 'Event deleted successfully',
        color: 'green',
      });
      navigate('/events');
    } catch (error) {
      console.error('Failed to delete event:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete event',
        color: 'red',
      });
    }
  };

  if (loading) {
    return (
      <Container size="lg" py="xl">
        <Center>
          <Loader size="lg" />
        </Center>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container size="md" py="xl">
        <Paper p="xl" withBorder>
          <Text>Event not found</Text>
          <Button mt="md" onClick={() => navigate('/events')}>
            Back to Events
          </Button>
        </Paper>
      </Container>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Group justify="space-between">
          <Button
            variant="subtle"
            leftSection={<ArrowLeft size={20} />}
            onClick={() => navigate('/events')}
          >
            Back to Events
          </Button>
          <Group gap="xs">
            <ActionIcon
              variant="light"
              size="lg"
              onClick={() => navigate(`/events/${event.id}/edit`)}
            >
              <Edit size={20} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="red"
              size="lg"
              onClick={handleDelete}
            >
              <Trash2 size={20} />
            </ActionIcon>
          </Group>
        </Group>

        <Paper shadow="sm" radius="md" withBorder>
          <Image
            src={event.imageUrl || undefined}
            height={400}
            alt={event.title}
            fallbackSrc="https://via.placeholder.com/1200x400?text=Event+Image"
          />

          <Stack gap="lg" p="xl">
            <div>
              {event.tags && event.tags.length > 0 && (
                <Group gap="xs" mb="sm">
                  {event.tags.map((tag) => (
                    <Badge key={tag.id} color={tag.color} variant="light">
                      {tag.name}
                    </Badge>
                  ))}
                </Group>
              )}
              <Title order={1}>{event.title}</Title>
            </div>

            <Grid>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Group gap="xs">
                  <Calendar size={20} />
                  <div>
                    <Text size="xs" c="dimmed">
                      Date
                    </Text>
                    <Text size="sm">{formatDate(event.date)}</Text>
                  </div>
                </Group>
              </Grid.Col>
              {event.location && (
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Group gap="xs">
                    <MapPin size={20} />
                    <div>
                      <Text size="xs" c="dimmed">
                        Location
                      </Text>
                      <Text size="sm">{event.location}</Text>
                    </div>
                  </Group>
                </Grid.Col>
              )}
            </Grid>

            <Divider />

            {event.description && (
              <>
                <div>
                  <Text size="sm" c="dimmed" mb="xs">
                    Description
                  </Text>
                  <Text>{event.description}</Text>
                </div>
                <Divider />
              </>
            )}

            <div>
              <Group gap="xs" mb="md">
                <Users size={20} />
                <Title order={3}>
                  Participants ({event.participants?.length || 0})
                </Title>
              </Group>

              {!event.participants || event.participants.length === 0 ? (
                <Paper p="md" withBorder>
                  <Text c="dimmed" ta="center">
                    No participants registered yet
                  </Text>
                </Paper>
              ) : (
                <Stack gap="sm">
                  {event.participants.map((participant) => (
                    <Paper
                      key={participant.id}
                      p="md"
                      withBorder
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/participants/${participant.id}`)}
                    >
                      <Group justify="space-between">
                        <Group gap="md">
                          <Avatar color="blue" radius="xl">
                            {participant.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()}
                          </Avatar>
                          <div>
                            <Text fw={500}>{participant.name}</Text>
                            <Group gap="md" mt="xs">
                              <Group gap="xs">
                                <Mail size={14} />
                                <Text size="sm" c="dimmed">
                                  {participant.email}
                                </Text>
                              </Group>
                              {participant.phone && (
                                <Group gap="xs">
                                  <Phone size={14} />
                                  <Text size="sm" c="dimmed">
                                    {participant.phone}
                                  </Text>
                                </Group>
                              )}
                            </Group>
                          </div>
                        </Group>
                        <Button variant="light" size="sm">
                          View Profile
                        </Button>
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              )}
            </div>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}


