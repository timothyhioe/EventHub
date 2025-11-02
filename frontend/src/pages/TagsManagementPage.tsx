import { useState, useEffect } from 'react';
import { Container, Title, Button, Group, Stack, Paper, Text, TextInput, ColorInput, Table, Badge, ActionIcon, Modal, Loader, Center } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Plus, Edit, Trash2, Tag as TagIcon } from 'lucide-react';
import { tagsApi } from '../services/api';
import type { TagResponse, Tag } from '../types/tag';

export function TagsManagementPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#228BE6',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setLoading(true);
      const response = (await tagsApi.getAll()) as TagResponse;
      if (response.success) {
        const tagsData = Array.isArray(response.data) ? response.data : [response.data];
        setTags(tagsData);
      }
    } catch (error) {
      console.error('Failed to load tags:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load tags',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingTag(null);
    setFormData({ name: '', color: '#228BE6' });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({ name: tag.name, color: tag.color });
    setErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tag name is required';
    }

    if (!formData.color) {
      newErrors.color = 'Color is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      if (editingTag) {
        await tagsApi.update(editingTag.id, formData);
        notifications.show({
          title: 'Success',
          message: 'Tag updated successfully',
          color: 'green',
        });
      } else {
        await tagsApi.create(formData);
        notifications.show({
          title: 'Success',
          message: 'Tag created successfully',
          color: 'green',
        });
      }
      setIsModalOpen(false);
      loadTags();
    } catch (error) {
      console.error('Failed to save tag:', error);
      notifications.show({
        title: 'Error',
        message: editingTag ? 'Failed to update tag' : 'Failed to create tag',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tag?')) {
      return;
    }

    try {
      await tagsApi.delete(id);
      notifications.show({
        title: 'Success',
        message: 'Tag deleted successfully',
        color: 'green',
      });
      loadTags();
    } catch (error) {
      console.error('Failed to delete tag:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete tag',
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

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="center">
          <div>
            <Title order={1}>Tags Management</Title>
            <Text c="dimmed" mt="xs">
              Organize your events with custom tags
            </Text>
          </div>
          <Button leftSection={<Plus size={20} />} onClick={openCreateModal}>
            Create Tag
          </Button>
        </Group>

        {tags.length === 0 ? (
          <Paper p="xl" withBorder>
            <Stack align="center" gap="md">
              <TagIcon size={48} strokeWidth={1.5} opacity={0.3} />
              <div style={{ textAlign: 'center' }}>
                <Text size="lg" fw={500}>
                  No tags created yet
                </Text>
                <Text c="dimmed" size="sm" mt="xs">
                  Create your first tag to start organizing events
                </Text>
              </div>
              <Button
                leftSection={<Plus size={20} />}
                onClick={openCreateModal}
                mt="md"
              >
                Create Your First Tag
              </Button>
            </Stack>
          </Paper>
        ) : (
          <Paper withBorder>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Tag Name</Table.Th>
                  <Table.Th>Preview</Table.Th>
                  <Table.Th>Color Code</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {tags.map((tag) => (
                  <Table.Tr key={tag.id}>
                    <Table.Td>
                      <Text fw={500}>{tag.name}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={tag.color} variant="light">
                        {tag.name}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <div
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 4,
                            backgroundColor: tag.color,
                            border: '1px solid #dee2e6',
                          }}
                        />
                        <Text size="sm" c="dimmed">
                          {tag.color}
                        </Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon
                          variant="light"
                          onClick={() => openEditModal(tag)}
                        >
                          <Edit size={18} />
                        </ActionIcon>
                        <ActionIcon
                          variant="light"
                          color="red"
                          onClick={() => handleDelete(tag.id)}
                        >
                          <Trash2 size={18} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        )}

        <Text c="dimmed" size="sm">
          Total tags: {tags.length}
        </Text>
      </Stack>

      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTag ? 'Edit Tag' : 'Create New Tag'}
        centered
      >
        <Stack gap="md">
          <TextInput
            label="Tag Name"
            placeholder="Enter tag name"
            required
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            error={errors.name}
          />

          <ColorInput
            label="Tag Color"
            placeholder="Select color"
            required
            value={formData.color}
            onChange={(color) => setFormData({ ...formData, color })}
            error={errors.color}
          />

          <Paper p="md" withBorder>
            <Text size="sm" c="dimmed" mb="xs">
              Preview
            </Text>
            <Badge color={formData.color} variant="light">
              {formData.name || 'Tag Name'}
            </Badge>
          </Paper>

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={saving}>
              {editingTag ? 'Save Changes' : 'Create Tag'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}


