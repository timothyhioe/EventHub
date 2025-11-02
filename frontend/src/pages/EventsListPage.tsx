import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Title, TextInput, MultiSelect, SimpleGrid, Stack, Group, Button, Text, Paper, Loader, Center } from '@mantine/core';
import { Search, Plus, Calendar } from 'lucide-react';
import { EventCard } from '../components/EventCard';
import { eventsApi, tagsApi } from '../services/api';
import type { EventWithRelations, EventResponse } from '../types/event';
import type { TagResponse } from '../types/tag';

export function EventsListPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventWithRelations[]>([]);
  const [tags, setTags] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    loadEvents();
    loadTags();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadEvents();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedTags]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = (await eventsApi.getAll({
        search: searchQuery || undefined,
        tagIds: selectedTags.length > 0 ? selectedTags : undefined,
        include: true,
      })) as EventResponse;

      if (response.success) {
        const eventsData = Array.isArray(response.data) ? response.data : [response.data];
        setEvents(eventsData);
      }
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const response = (await tagsApi.getAll()) as TagResponse;
      if (response.success) {
        const tagsData = Array.isArray(response.data) ? response.data : [response.data];
        setTags(
          tagsData.map((tag) => ({
            id: tag.id,
            name: tag.name,
          }))
        );
      }
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  const tagOptions = tags.map((tag) => ({
    value: tag.id,
    label: tag.name,
  }));

  const filteredEvents = events.filter((event) => {
    //client-side filtering
    if (selectedTags.length > 0) {
      const eventTagIds = event.tags?.map((t) => t.id) || [];
      const hasSelectedTags = selectedTags.some((tagId) => eventTagIds.includes(tagId));
      if (!hasSelectedTags) return false;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        event.title.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.location?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  if (loading && events.length === 0) {
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
            <Title order={1}>Events</Title>
            <Text c="dimmed" mt="xs">
              Manage and organize all your events
            </Text>
          </div>
          <Button leftSection={<Plus size={20} />} onClick={() => navigate('/events/new')}>
            Create Event
          </Button>
        </Group>

        <Paper p="md" withBorder>
          <Stack gap="md">
            <TextInput
              placeholder="Search events by title, description, or location..."
              leftSection={<Search size={20} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <MultiSelect
              placeholder="Filter by tags"
              data={tagOptions}
              value={selectedTags}
              onChange={setSelectedTags}
              clearable
              searchable
            />
          </Stack>
        </Paper>

        {filteredEvents.length === 0 ? (
          <Paper p="xl" withBorder>
            <Stack align="center" gap="md">
              <Calendar size={48} strokeWidth={1.5} opacity={0.3} />
              <div style={{ textAlign: 'center' }}>
                <Text size="lg" fw={500}>
                  No events found
                </Text>
                <Text c="dimmed" size="sm" mt="xs">
                  {searchQuery || selectedTags.length > 0
                    ? 'Try adjusting your search or filters'
                    : 'Get started by creating your first event'}
                </Text>
              </div>
              {!searchQuery && selectedTags.length === 0 && (
                <Button
                  leftSection={<Plus size={20} />}
                  onClick={() => navigate('/events/new')}
                  mt="md"
                >
                  Create Your First Event
                </Button>
              )}
            </Stack>
          </Paper>
        ) : (
          <>
            <Text c="dimmed" size="sm">
              Showing {filteredEvents.length} of {events.length} events
            </Text>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onViewDetails={(id) => navigate(`/events/${id}`)}
                />
              ))}
            </SimpleGrid>
          </>
        )}
      </Stack>
    </Container>
  );
}


