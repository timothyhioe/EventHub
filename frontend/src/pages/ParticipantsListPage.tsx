import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Title, TextInput, Table, Button, Group, Stack, Paper, Text, Avatar, Badge, ActionIcon, Loader, Center } from '@mantine/core';
import { Search, Plus, Eye, Mail, Phone, Calendar, Edit } from 'lucide-react';
import { participantsApi } from '../services/api';
import { ParticipantForm } from '../components/ParticipantForm';
import type { ParticipantResponse, ParticipantWithEvents, Participant } from '../types/participant';

export function ParticipantsListPage() {
  const navigate = useNavigate();
  const [participants, setParticipants] = useState<ParticipantWithEvents[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);

  useEffect(() => {
    loadParticipants();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadParticipants();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadParticipants = async () => {
    try {
      setLoading(true);
      const response = (await participantsApi.getAll({
        search: searchQuery || undefined,
      })) as ParticipantResponse;

      if (response.success) {
        const participantsData = Array.isArray(response.data) ? response.data : [response.data];
        setParticipants(participantsData);
      }
    } catch (error) {
      console.error('Failed to load participants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingParticipant(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (participant: Participant) => {
    setEditingParticipant(participant);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    loadParticipants();
  };

  const filteredParticipants = participants.filter((participant) => {
    const query = searchQuery.toLowerCase();
    return (
      participant.name.toLowerCase().includes(query) ||
      participant.email.toLowerCase().includes(query) ||
      (participant.phone && participant.phone.toLowerCase().includes(query))
    );
  });

  if (loading && participants.length === 0) {
    return (
      <Container size="xl" py="xl">
        <Center>
          <Loader size="lg" />
        </Center>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="center">
          <div>
            <Title order={1}>Participants</Title>
            <Text c="dimmed" mt="xs">
              Manage all event participants
            </Text>
          </div>
          <Button
            leftSection={<Plus size={20} />}
            onClick={handleOpenCreate}
          >
            Add Participant
          </Button>
        </Group>

        <Paper p="md" withBorder>
          <TextInput
            placeholder="Search participants by name, email, or phone..."
            leftSection={<Search size={20} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Paper>

        {filteredParticipants.length === 0 ? (
          <Paper p="xl" withBorder>
            <Stack align="center" gap="md">
              <div style={{ textAlign: 'center' }}>
                <Text size="lg" fw={500}>
                  No participants found
                </Text>
                <Text c="dimmed" size="sm" mt="xs">
                  {searchQuery
                    ? 'Try adjusting your search'
                    : 'Get started by adding participants'}
                </Text>
              </div>
            </Stack>
          </Paper>
        ) : (
          <Paper withBorder>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Participant</Table.Th>
                  <Table.Th>Contact</Table.Th>
                  <Table.Th>Events</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredParticipants.map((participant) => {
                  const eventCount = participant.events?.length || 0;
                  return (
                    <Table.Tr key={participant.id}>
                      <Table.Td>
                        <Group gap="sm">
                          <Avatar color="blue" radius="xl">
                            {participant.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()}
                          </Avatar>
                          <Text fw={500}>{participant.name}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Stack gap="xs">
                          <Group gap="xs">
                            <Mail size={14} />
                            <Text size="sm">{participant.email}</Text>
                          </Group>
                          {participant.phone && (
                            <Group gap="xs">
                              <Phone size={14} />
                              <Text size="sm">{participant.phone}</Text>
                            </Group>
                          )}
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <Calendar size={16} />
                          <Badge variant="light">
                            {eventCount} events
                          </Badge>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon
                            variant="light"
                            onClick={() => handleOpenEdit(participant)}
                            title="Edit participant"
                          >
                            <Edit size={18} />
                          </ActionIcon>
                          <ActionIcon
                            variant="light"
                            onClick={() => navigate(`/participants/${participant.id}`)}
                            title="View details"
                          >
                            <Eye size={18} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </Paper>
        )}

        <Text c="dimmed" size="sm">
          Showing {filteredParticipants.length} of {participants.length} participants
        </Text>
      </Stack>

      <ParticipantForm
        participant={editingParticipant}
        opened={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingParticipant(null);
        }}
        onSuccess={handleFormSuccess}
      />
    </Container>
  );
}

