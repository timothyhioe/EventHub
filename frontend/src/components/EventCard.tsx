import { Card, Image, Text, Badge, Button, Group, Stack } from '@mantine/core';
import { Calendar, MapPin, Users } from 'lucide-react';
import type { EventWithRelations } from '../types/event';
import { formatEventDate } from '../utils/date';

interface EventCardProps {
  event: EventWithRelations;
  onViewDetails: (id: string) => void;
}

export function EventCard({ event, onViewDetails }: EventCardProps) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        <Image
          src={event.imageUrl || undefined}
          height={200}
          alt={event.title}
          fallbackSrc="https://via.placeholder.com/800x200?text=Event+Image"
        />
      </Card.Section>

      <Stack gap="md" mt="md">
        <div>
          <Text fw={500} size="lg">
            {event.title}
          </Text>
          <Text size="sm" c="dimmed" lineClamp={2} mt="xs">
            {event.description || 'No description available'}
          </Text>
        </div>

        <Stack gap="xs">
          <Group gap="xs">
            <Calendar size={16} />
            <Text size="sm">{formatEventDate(event.date)}</Text>
          </Group>
          {event.location && (
            <Group gap="xs">
              <MapPin size={16} />
              <Text size="sm" lineClamp={1}>
                {event.location}
              </Text>
            </Group>
          )}
          <Group gap="xs">
            <Users size={16} />
            <Text size="sm">
              {event.participants?.length || 0} participants
            </Text>
          </Group>
        </Stack>

        {event.tags && event.tags.length > 0 && (
          <Group gap="xs">
            {event.tags.map((tag) => (
              <Badge key={tag.id} color={tag.color} variant="light">
                {tag.name}
              </Badge>
            ))}
          </Group>
        )}

        <Button
          variant="light"
          fullWidth
          mt="md"
          onClick={() => onViewDetails(event.id)}
        >
          View Details
        </Button>
      </Stack>
    </Card>
  );
}


