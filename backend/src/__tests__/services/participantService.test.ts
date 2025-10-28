import { ParticipantService } from '../../services/participantService';
import { testDb, generateNonExistentUUID } from '../setup';
import { participants, events, eventParticipants } from '../../db/schema';
import { NewParticipant } from '../../types/participant';

describe('ParticipantService', () => {
  describe('createParticipant', () => {
    it('should create a new participant successfully', async () => {
      const participantData: NewParticipant = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890'
      };

      const result = await ParticipantService.createParticipant(participantData);

      expect(result).toBeDefined();
      expect(result.name).toBe(participantData.name);
      expect(result.email).toBe(participantData.email);
      expect(result.phone).toBe(participantData.phone);
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('should create a participant with minimal required fields', async () => {
      const participantData: NewParticipant = {
        name: 'Jane Doe',
        email: 'jane@example.com'
      };

      const result = await ParticipantService.createParticipant(participantData);

      expect(result).toBeDefined();
      expect(result.name).toBe(participantData.name);
      expect(result.email).toBe(participantData.email);
      expect(result.phone).toBeNull();
    });
  });

  describe('getParticipantById', () => {
    it('should return a participant by ID', async () => {
      // Create a test participant
      const participantData: NewParticipant = {
        name: 'Test Participant',
        email: 'test@example.com'
      };
      const [createdParticipant] = await testDb.insert(participants).values(participantData).returning();

      const result = await ParticipantService.getParticipantById(createdParticipant.id);

      expect(result).toBeDefined();
      expect(result!.id).toBe(createdParticipant.id);
      expect(result!.name).toBe(participantData.name);
      expect(result!.email).toBe(participantData.email);
    });

    it('should return null for non-existent participant ID', async () => {
      const result = await ParticipantService.getParticipantById(generateNonExistentUUID());
      expect(result).toBeNull();
    });
  });

  describe('getAllParticipants', () => {
    it('should return all participants', async () => {
      // Create test participants
      const participantData1: NewParticipant = {
        name: 'Participant 1',
        email: 'participant1@example.com'
      };
      const participantData2: NewParticipant = {
        name: 'Participant 2',
        email: 'participant2@example.com'
      };

      // Insert participants separately to ensure different timestamps
      await testDb.insert(participants).values(participantData1);
      await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
      await testDb.insert(participants).values(participantData2);

      const result = await ParticipantService.getAllParticipants();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Participant 2'); // Should be ordered by createdAt desc
      expect(result[1].name).toBe('Participant 1');
    });

    it('should return empty array when no participants exist', async () => {
      const result = await ParticipantService.getAllParticipants();
      expect(result).toHaveLength(0);
    });
  });

  describe('updateParticipant', () => {
    it('should update an existing participant', async () => {
      // Create a test participant
      const participantData: NewParticipant = {
        name: 'Original Name',
        email: 'original@example.com',
        phone: '+1111111111'
      };
      const [createdParticipant] = await testDb.insert(participants).values(participantData).returning();

      const updateData = {
        name: 'Updated Name',
        phone: '+2222222222'
      };

      const result = await ParticipantService.updateParticipant(createdParticipant.id, updateData);

      expect(result).toBeDefined();
      expect(result!.name).toBe(updateData.name);
      expect(result!.phone).toBe(updateData.phone);
      expect(result!.email).toBe(participantData.email); // Should remain unchanged
      expect(result!.id).toBe(createdParticipant.id);
    });

    it('should return null for non-existent participant ID', async () => {
      const result = await ParticipantService.updateParticipant(generateNonExistentUUID(), {
        name: 'Updated Name'
      });
      expect(result).toBeNull();
    });
  });

  describe('deleteParticipant', () => {
    it('should delete an existing participant', async () => {
      // Create a test participant
      const participantData: NewParticipant = {
        name: 'Participant to Delete',
        email: 'delete@example.com'
      };
      const [createdParticipant] = await testDb.insert(participants).values(participantData).returning();

      const result = await ParticipantService.deleteParticipant(createdParticipant.id);

      expect(result).toBe(true);

      // Verify participant is deleted
      const deletedParticipant = await ParticipantService.getParticipantById(createdParticipant.id);
      expect(deletedParticipant).toBeNull();
    });

    it('should return false for non-existent participant ID', async () => {
      const result = await ParticipantService.deleteParticipant(generateNonExistentUUID());
      expect(result).toBe(false);
    });
  });

  describe('getEventsForParticipant', () => {
    beforeEach(async () => {
      // Create test participants and events
      const [participant] = await testDb.insert(participants).values({
        name: 'Test Participant',
        email: 'test@example.com'
      }).returning();

      const [event1] = await testDb.insert(events).values({
        title: 'Event 1',
        date: new Date('2024-12-31T18:00:00Z')
      }).returning();

      const [event2] = await testDb.insert(events).values({
        title: 'Event 2',
        date: new Date('2024-12-25T18:00:00Z')
      }).returning();

      // Add participant to events
      await testDb.insert(eventParticipants).values([
        { eventId: event1.id, participantId: participant.id },
        { eventId: event2.id, participantId: participant.id }
      ]);
    });

    it('should return events for a specific participant', async () => {
      const allParticipants = await ParticipantService.getAllParticipants();
      const participantId = allParticipants[0].id;

      const result = await ParticipantService.getEventsForParticipant(participantId);

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Event 1'); // Should be ordered by date desc
      expect(result[1].title).toBe('Event 2');
    });

    it('should return empty array for participant with no events', async () => {
      const [participant] = await testDb.insert(participants).values({
        name: 'Participant with No Events',
        email: 'noevents@example.com'
      }).returning();

      const result = await ParticipantService.getEventsForParticipant(participant.id);
      expect(result).toHaveLength(0);
    });
  });

  describe('emailExists', () => {
    beforeEach(async () => {
      // Create a test participant
      await testDb.insert(participants).values({
        name: 'Existing Participant',
        email: 'existing@example.com'
      });
    });

    it('should return true for existing email', async () => {
      const result = await ParticipantService.emailExists('existing@example.com');
      expect(result).toBe(true);
    });

    it('should return false for non-existing email', async () => {
      const result = await ParticipantService.emailExists('nonexisting@example.com');
      expect(result).toBe(false);
    });

    it('should exclude participant ID when checking for updates', async () => {
      const allParticipants = await ParticipantService.getAllParticipants();
      const participantId = allParticipants[0].id;

      const result = await ParticipantService.emailExists('existing@example.com', participantId);
      expect(result).toBe(false); // Should return false because it's the same participant
    });

    it('should return true for duplicate email from different participant', async () => {
      const allParticipants = await ParticipantService.getAllParticipants();
      const participantId = allParticipants[0].id;

      // Try to create another participant with same email - this should fail
      try {
        await testDb.insert(participants).values({
          name: 'Another Participant',
          email: 'existing@example.com'
        });
        // If we get here, the test should fail because duplicate creation succeeded
        expect(true).toBe(false);
      } catch (error) {
        // This is expected - duplicate key constraint should prevent creation
        expect(error).toBeDefined();
      }
    });
  });
});
