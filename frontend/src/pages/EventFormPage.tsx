import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Title, TextInput, Textarea, Button, Group, Stack, Paper, MultiSelect, Box, Text } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { ArrowLeft, Save } from 'lucide-react';
import { eventsApi, tagsApi, participantsApi, geocodingApi } from '../services/api';
import type { EventResponse } from '../types/event';
import type { TagResponse } from '../types/tag';
import type { ParticipantResponse } from '../types/participant';
import { LocationMap } from '../components/LocationMap';
import { useDebouncedValue } from '@mantine/hooks';


export function EventFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    location: string;
    date: Date | null;
    imageUrl: string;
  }>({
    title: '',
    description: '',
    location: '',
    date: null,
    imageUrl: '',
  });
  
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [tags, setTags] = useState<Array<{ id: string; name: string }>>([]);
  const [participants, setParticipants] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewCoordinates, setPreviewCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [debouncedLocation] = useDebouncedValue(formData.location, 400);

  useEffect(() => {
    loadTags();
    loadParticipants();
    if (isEdit && id) {
      loadEvent();
    }
  }, [id, isEdit]);

  useEffect(() => {
    let isActive = true;

    const loadLocationPreview = async () => {
      const query = debouncedLocation.trim();
      if (query.length < 2) {
        setPreviewCoordinates(null);
        return;
      }
  
      try {
        const suggestions = await geocodingApi.searchLocations(query);
        if (!isActive) {
          return;
        }
        if (suggestions.length > 0) {
          const { latitude, longitude } = suggestions[0];
          setPreviewCoordinates({
            lat: latitude,
            lng: longitude,
          });
        } else {
          setPreviewCoordinates(null);
        }
      } catch (error) {
        if (!isActive) {
          return;
        }
        console.error('Failed to load location preview:', error);
        setPreviewCoordinates(null);
      }
    };
  
    loadLocationPreview();

    return () => {
      isActive = false;
    };
  }, [debouncedLocation]);

  const loadEvent = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = (await eventsApi.getById(id, true)) as EventResponse;
      if (response.success) {
        const eventData = Array.isArray(response.data) ? response.data[0] : response.data;
        setFormData({
          title: eventData.title,
          description: eventData.description || '',
          location: eventData.location || '',
          date: new Date(eventData.date),
          imageUrl: eventData.imageUrl || '',
        });
        setSelectedTags(eventData.tags?.map(t => t.id) || []);
        setSelectedParticipants(eventData.participants?.map(p => p.id) || []);
      }
    } catch (error) {
      console.error('Failed to load event:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load event',
        color: 'red',
      });
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const response = (await tagsApi.getAll()) as TagResponse;
      if (response.success) {
        const tagsData = Array.isArray(response.data) ? response.data : [response.data];
        setTags(tagsData.map(tag => ({ id: tag.id, name: tag.name })));
      }
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  const loadParticipants = async () => {
    try {
      const response = (await participantsApi.getAll()) as ParticipantResponse;
      if (response.success) {
        const participantsData = Array.isArray(response.data) ? response.data : [response.data];
        setParticipants(participantsData.map(p => ({ id: p.id, name: p.name, email: p.email })));
      }
    } catch (error) {
      console.error('Failed to load participants:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const eventPayload = {
        title: formData.title,
        description: formData.description || undefined,
        location: formData.location || undefined,
        date: formData.date!.toISOString(),
        imageUrl: formData.imageUrl || undefined,
      };

      let eventId: string;
      
      if (isEdit && id) {
        await eventsApi.update(id, eventPayload);
        eventId = id;
      } else {
        const response = await eventsApi.create(eventPayload);
        eventId = (response as any).data?.id || '';
      }

      // Handle tags
      if (isEdit && id) {
        // For edit, we need to sync tags
        const currentEvent = (await eventsApi.getById(eventId, true)) as EventResponse;
        const currentTags = Array.isArray(currentEvent.data) ? (currentEvent.data[0]?.tags || []) : (currentEvent.data?.tags || []);
        const currentTagIds = currentTags.map(t => t.id);
        
        // Remove tags that are no longer selected
        for (const tagId of currentTagIds) {
          if (!selectedTags.includes(tagId)) {
            await eventsApi.removeTag(eventId, tagId);
          }
        }
        
        // Add new tags
        for (const tagId of selectedTags) {
          if (!currentTagIds.includes(tagId)) {
            await eventsApi.addTag(eventId, tagId);
          }
        }
      } else {
        // For create, add all selected tags
        for (const tagId of selectedTags) {
          await eventsApi.addTag(eventId, tagId);
        }
      }

      // Handle participants
      if (isEdit && id) {
        // For edit, we need to sync participants
        const currentEvent = (await eventsApi.getById(eventId, true)) as EventResponse;
        const currentParticipants = Array.isArray(currentEvent.data) ? (currentEvent.data[0]?.participants || []) : (currentEvent.data?.participants || []);
        const currentParticipantIds = currentParticipants.map(p => p.id);
        
        // Remove participants that are no longer selected
        for (const participantId of currentParticipantIds) {
          if (!selectedParticipants.includes(participantId)) {
            await eventsApi.removeParticipant(eventId, participantId);
          }
        }
        
        // Add new participants
        for (const participantId of selectedParticipants) {
          if (!currentParticipantIds.includes(participantId)) {
            await eventsApi.addParticipant(eventId, participantId);
          }
        }
      } else {
        // For create, add all selected participants
        for (const participantId of selectedParticipants) {
          await eventsApi.addParticipant(eventId, participantId);
        }
      }

      notifications.show({
        title: 'Success',
        message: isEdit ? 'Event updated successfully!' : 'Event created successfully!',
        color: 'green',
      });
      navigate(`/events/${eventId}`);
    } catch (error) {
      console.error('Failed to save event:', error);
      notifications.show({
        title: 'Error',
        message: isEdit ? 'Failed to update event' : 'Failed to create event',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const tagOptions = tags.map((tag) => ({
    value: tag.id,
    label: tag.name,
  }));

  const participantOptions = participants.map((participant) => ({
    value: participant.id,
    label: `${participant.name} (${participant.email})`,
  }));

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Group justify="space-between">
          <Button
            variant="subtle"
            leftSection={<ArrowLeft size={20} />}
            onClick={() => navigate('/events')}
          >
            Back
          </Button>
        </Group>

        <Paper shadow="sm" p="xl" withBorder>
          <Title order={2} mb="xl">
            {isEdit ? 'Edit Event' : 'Create New Event'}
          </Title>

          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput
                label="Event Title"
                placeholder="Enter event title"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                error={errors.title}
              />

              <TextInput
                label="Location"
                placeholder="Enter event location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />

              {previewCoordinates && formData.location && (
                <Box mt="sm">
                  <Text size="sm" c="dimmed" mb="xs">
                    Location Preview
                  </Text>
                  <LocationMap
                    latitude={previewCoordinates.lat}
                    longitude={previewCoordinates.lng}
                    address={formData.location}
                    height={200}
                  />
                </Box>
              )}

              <Textarea
                label="Description"
                placeholder="Describe your event"
                minRows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />

              <DatePickerInput
                label="Event Date"
                placeholder="Select date"
                required
                value={formData.date}
                onChange={(value) => {
                  const nextDate = value ? new Date(value) : null;
                  setFormData({ ...formData, date: nextDate });
                }}
                error={errors.date}
                minDate={new Date()}
                popoverProps={{ withinPortal: true, zIndex: 2100 }}
              />

              <TextInput
                label="Image URL"
                placeholder="https://example.com/image.jpg"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                description="Optional: Add a URL to an event image"
              />

              <MultiSelect
                label="Tags"
                placeholder="Select tags"
                data={tagOptions}
                value={selectedTags}
                onChange={setSelectedTags}
                searchable
                clearable
              />

              <MultiSelect
                label="Participants"
                placeholder="Select participants"
                data={participantOptions}
                value={selectedParticipants}
                onChange={setSelectedParticipants}
                searchable
                clearable
              />

              <Group justify="flex-end" mt="xl">
                <Button variant="outline" onClick={() => navigate('/events')}>
                  Cancel
                </Button>
                <Button type="submit" leftSection={<Save size={20} />} loading={loading}>
                  {isEdit ? 'Save Changes' : 'Create Event'}
                </Button>
              </Group>
            </Stack>
          </form>
        </Paper>
      </Stack>
    </Container>
  );
}


