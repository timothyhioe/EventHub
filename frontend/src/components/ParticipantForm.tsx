import { useState, useEffect } from 'react';
import { Modal, TextInput, Button, Group, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Save } from 'lucide-react';
import { participantsApi } from '../services/api';
import type { Participant } from '../types/participant';

interface ParticipantFormProps {
  participant?: Participant | null;
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ParticipantForm({ participant, opened, onClose, onSuccess }: ParticipantFormProps) {
  const isEdit = !!participant;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (participant) {
      setFormData({
        name: participant.name,
        email: participant.email,
        phone: participant.phone || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
      });
    }
    setErrors({});
  }, [participant, opened]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
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
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
      };

      if (isEdit && participant) {
        await participantsApi.update(participant.id, payload);
        notifications.show({
          title: 'Success',
          message: 'Participant updated successfully!',
          color: 'green',
        });
      } else {
        await participantsApi.create(payload);
        notifications.show({
          title: 'Success',
          message: 'Participant created successfully!',
          color: 'green',
        });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to save participant:', error);
      const errorMessage = error?.message || (isEdit ? 'Failed to update participant' : 'Failed to create participant');
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEdit ? 'Edit Participant' : 'Create New Participant'}
      centered
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="Name"
            placeholder="Enter participant name"
            required
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            error={errors.name}
          />

          <TextInput
            label="Email"
            placeholder="Enter email address"
            required
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            error={errors.email}
          />

          <TextInput
            label="Phone"
            placeholder="Enter phone number (optional)"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            error={errors.phone}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" leftSection={<Save size={20} />} loading={loading}>
              {isEdit ? 'Save Changes' : 'Create Participant'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
