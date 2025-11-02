import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Title, Text, Button, Group, Stack, Paper, ActionIcon, Avatar, Divider, SimpleGrid, Card, Loader, Center } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { ArrowLeft, Mail, Phone, Edit, Trash2, Calendar } from 'lucide-react';
import { participantsApi } from '../services/api';
import { ParticipantForm } from '../components/ParticipantForm';
import type { ParticipantResponse, ParticipantWithEvents } from '../types/participant';

export function ParticipantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [participant, setParticipant] = useState<ParticipantWithEvents | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadParticipant();
    }
  }, [id]);

  const loadParticipant = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = (await participantsApi.getById(id)) as ParticipantResponse;
      if (response.success) {
        const participantData = Array.isArray(response.data) ? response.data[0] : response.data;
        setParticipant(participantData);
      }
    } catch (error) {
      console.error('Failed to load participant:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load participant details',
        color: 'red',
      });
      navigate('/participants');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this participant? This action cannot be undone.')) {
      return;
    }

    try {
      await participantsApi.delete(id);
      notifications.show({
        title: 'Success',
        message: 'Participant deleted successfully',
        color: 'green',
      });
      navigate('/participants');
    } catch (error) {
      console.error('Failed to delete participant:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete participant',
        color: 'red',
      });
    }
  };

  const handleFormSuccess = () => {
    loadParticipant();
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

  if (!participant) {
    return (
      <Container size="md" py="xl">
        <Paper p="xl" withBorder>
          <Text>Participant not found</Text>
          <Button mt="md" onClick={() => navigate('/participants')}>
            Back to Participants
          </Button>
        </Paper>
      </Container>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const participantEvents = participant.events || [];

  return (
    <>
      <Container size="lg" py="xl">
        <Stack gap="xl">
          <Group justify="space-between">
            <Button
              variant="subtle"
              leftSection={<ArrowLeft size={20} />}
              onClick={() => navigate('/participants')}
            >
              Back to Participants
            </Button>
            <Group gap="xs">
              <ActionIcon
                variant="light"
                size="lg"
                onClick={() => setIsFormOpen(true)}
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

          <Paper shadow="sm" p="xl" withBorder>
            <Stack gap="lg">
              <Group gap="xl">
                <Avatar size={120} color="blue" radius="xl">
                  {participant.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </Avatar>
                <div>
                  <Title order={1}>{participant.name}</Title>
                  <Stack gap="sm" mt="md">
                    <Group gap="xs">
                      <Mail size={18} />
                      <Text>{participant.email}</Text>
                    </Group>
                    {participant.phone && (
                      <Group gap="xs">
                        <Phone size={18} />
                        <Text>{participant.phone}</Text>
                      </Group>
                    )}
                  </Stack>
                </div>
              </Group>

              <Divider />

              <div>
                <Title order={3} mb="md">
                  Registered Events ({participantEvents.length})
                </Title>

                {participantEvents.length === 0 ? (
                  <Paper p="md" withBorder>
                    <Text c="dimmed" ta="center">
                      No events registered yet
                    </Text>
                  </Paper>
                ) : (
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    {participantEvents.map((event) => (
                      <Card
                        key={event.id}
                        shadow="sm"
                        padding="lg"
                        withBorder
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/events/${event.id}`)}
                      >
                        <Stack gap="sm">
                          <Text fw={500}>{event.title}</Text>

                          <Group gap="xs">
                            <Calendar size={14} />
                            <Text size="sm" c="dimmed">
                              {formatDate(event.date)}
                            </Text>
                          </Group>

                          <Button variant="light" size="sm" fullWidth mt="xs">
                            View Event
                          </Button>
                        </Stack>
                      </Card>
                    ))}
                  </SimpleGrid>
                )}
              </div>
            </Stack>
          </Paper>
        </Stack>
      </Container>

      <ParticipantForm
        participant={participant}
        opened={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
      />
    </>
  );
}

