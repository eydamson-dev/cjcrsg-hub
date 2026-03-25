import { describe, it, expect } from 'vitest'
import { convexTest } from 'convex-test'
import schema from '../../../../convex/schema.js'
import {
  create,
  update,
  startEvent,
  completeEvent,
  cancelEvent,
  archive,
} from '../../../../convex/events/mutations.js'
import { create as createEventType } from '../../../../convex/eventTypes/mutations.js'

// Create a mock modules object that convex-test expects
const modules = import.meta.glob('../../../../convex/**/*.ts', { eager: true })

describe('events mutations', () => {
  // Helper to create an event type for testing
  const createTestEventType = async (t: any, name: string = 'Test Type') => {
    return await t.mutation(createEventType, { name })
  }

  describe('create', () => {
    it('creates event with valid data', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t)

      const id = await t.mutation(create, {
        name: 'Sunday Service',
        eventTypeId,
        description: 'Weekly worship service',
        date: Date.now(),
        startTime: '09:00',
        endTime: '11:00',
        location: 'Main Sanctuary',
      })

      expect(id).toBeDefined()
      expect(typeof id).toBe('string')

      // Verify it was created
      const result = await t.run(async (ctx) => {
        return await ctx.db.get(id)
      })

      expect(result).not.toBeNull()
      expect(result?.name).toBe('Sunday Service')
      expect(result?.status).toBe('upcoming')
      expect(result?.isActive).toBe(true)
      expect(result?.createdAt).toBeDefined()
      expect(result?.updatedAt).toBeDefined()
    })

    it('creates event with minimal fields', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t)

      const id = await t.mutation(create, {
        name: 'Simple Event',
        eventTypeId,
        date: Date.now(),
      })

      const result = await t.run(async (ctx) => {
        return await ctx.db.get(id)
      })

      expect(result?.name).toBe('Simple Event')
      expect(result?.status).toBe('upcoming')
      expect(result?.isActive).toBe(true)
    })

    it('validates event name minimum length', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t)

      await expect(
        t.mutation(create, {
          name: 'A',
          eventTypeId,
          date: Date.now(),
        }),
      ).rejects.toThrow('Event name must be at least 2 characters')
    })

    it('throws error when event type not found', async () => {
      const t = convexTest(schema, modules)

      await expect(
        t.mutation(create, {
          name: 'Test Event',
          eventTypeId: 'eventTypes:nonexistent' as any,
          date: Date.now(),
        }),
      ).rejects.toThrow('Event type not found')
    })

    it('throws error when event type is inactive', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await t.mutation(createEventType, {
        name: 'Inactive Type',
      })

      // Archive the event type
      await t.run(async (ctx) => {
        await ctx.db.patch(eventTypeId, { isActive: false })
      })

      await expect(
        t.mutation(create, {
          name: 'Test Event',
          eventTypeId,
          date: Date.now(),
        }),
      ).rejects.toThrow('Event type is inactive')
    })

    it('validates banner image URL format', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t)

      await expect(
        t.mutation(create, {
          name: 'Test Event',
          eventTypeId,
          date: Date.now(),
          bannerImage: 'invalid-url',
        }),
      ).rejects.toThrow('Invalid banner image URL')
    })

    it('validates end time is after start time', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t)

      await expect(
        t.mutation(create, {
          name: 'Test Event',
          eventTypeId,
          date: Date.now(),
          startTime: '10:00',
          endTime: '09:00',
        }),
      ).rejects.toThrow('End time must be after start time')
    })

    it('trims event name whitespace', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t)

      const id = await t.mutation(create, {
        name: '  Test Event  ',
        eventTypeId,
        date: Date.now(),
      })

      const result = await t.run(async (ctx) => {
        return await ctx.db.get(id)
      })

      expect(result?.name).toBe('Test Event')
    })
  })

  describe('update', () => {
    it('updates event name', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t)

      const id = await t.mutation(create, {
        name: 'Original Name',
        eventTypeId,
        date: Date.now(),
      })

      await t.mutation(update, {
        id,
        name: 'Updated Name',
      })

      const result = await t.run(async (ctx) => {
        return await ctx.db.get(id)
      })

      expect(result?.name).toBe('Updated Name')
    })

    it('throws error for non-existent event', async () => {
      const t = convexTest(schema, modules)

      await expect(
        t.mutation(update, {
          id: 'events:nonexistent' as any,
          name: 'New Name',
        }),
      ).rejects.toThrow('Event not found')
    })

    it('prevents setting status to active when another event is active', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t)

      // Create first event and make it active
      const event1Id = await t.mutation(create, {
        name: 'Event 1',
        eventTypeId,
        date: Date.now(),
      })
      await t.mutation(startEvent, { id: event1Id })

      // Create second event and try to make it active
      const event2Id = await t.mutation(create, {
        name: 'Event 2',
        eventTypeId,
        date: Date.now(),
      })

      await expect(
        t.mutation(update, {
          id: event2Id,
          status: 'active',
        }),
      ).rejects.toThrow('Another event is currently active')
    })

    it('validates event type when updating eventTypeId', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t)

      const id = await t.mutation(create, {
        name: 'Test Event',
        eventTypeId,
        date: Date.now(),
      })

      await expect(
        t.mutation(update, {
          id,
          eventTypeId: 'eventTypes:nonexistent' as any,
        }),
      ).rejects.toThrow('Event type not found')
    })

    it('validates end time is after start time when updating times', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t)

      const id = await t.mutation(create, {
        name: 'Test Event',
        eventTypeId,
        date: Date.now(),
        startTime: '09:00',
        endTime: '11:00',
      })

      await expect(
        t.mutation(update, {
          id,
          startTime: '10:00',
          endTime: '09:00',
        }),
      ).rejects.toThrow('End time must be after start time')
    })

    it('updates updatedAt timestamp', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t)

      const id = await t.mutation(create, {
        name: 'Test Event',
        eventTypeId,
        date: Date.now(),
      })

      const beforeUpdate = await t.run(async (ctx) => {
        return await ctx.db.get(id)
      })

      // Wait a bit to ensure timestamp changes
      await new Promise((resolve) => setTimeout(resolve, 10))

      await t.mutation(update, {
        id,
        name: 'Updated Name',
      })

      const afterUpdate = await t.run(async (ctx) => {
        return await ctx.db.get(id)
      })

      expect(afterUpdate?.updatedAt).toBeGreaterThan(
        beforeUpdate?.updatedAt as number,
      )
    })
  })

  describe('startEvent', () => {
    it('transitions event to active status', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t)

      const id = await t.mutation(create, {
        name: 'Test Event',
        eventTypeId,
        date: Date.now(),
      })

      await t.mutation(startEvent, { id })

      const result = await t.run(async (ctx) => {
        return await ctx.db.get(id)
      })

      expect(result?.status).toBe('active')
    })

    it('throws error when event already active', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t)

      const id = await t.mutation(create, {
        name: 'Test Event',
        eventTypeId,
        date: Date.now(),
      })

      await t.mutation(startEvent, { id })

      await expect(t.mutation(startEvent, { id })).rejects.toThrow(
        'Event is already active',
      )
    })

    it('throws error when event is completed', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t)

      const id = await t.mutation(create, {
        name: 'Test Event',
        eventTypeId,
        date: Date.now(),
      })

      await t.mutation(startEvent, { id })
      await t.mutation(completeEvent, { id })

      await expect(t.mutation(startEvent, { id })).rejects.toThrow(
        'Cannot start a completed event',
      )
    })

    it('throws error when another event is active', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t)

      // Create and activate first event
      const event1Id = await t.mutation(create, {
        name: 'Event 1',
        eventTypeId,
        date: Date.now(),
      })
      await t.mutation(startEvent, { id: event1Id })

      // Try to start second event
      const event2Id = await t.mutation(create, {
        name: 'Event 2',
        eventTypeId,
        date: Date.now(),
      })

      await expect(t.mutation(startEvent, { id: event2Id })).rejects.toThrow(
        'Another event is currently active',
      )
    })

    it('throws error for non-existent event', async () => {
      const t = convexTest(schema, modules)

      await expect(
        t.mutation(startEvent, { id: 'events:nonexistent' as any }),
      ).rejects.toThrow('Event not found')
    })
  })

  describe('completeEvent', () => {
    it('transitions event to completed status', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t)

      const id = await t.mutation(create, {
        name: 'Test Event',
        eventTypeId,
        date: Date.now(),
      })

      await t.mutation(startEvent, { id })
      await t.mutation(completeEvent, { id })

      const result = await t.run(async (ctx) => {
        return await ctx.db.get(id)
      })

      expect(result?.status).toBe('completed')
      expect(result?.completedAt).toBeDefined()
    })

    it('throws error when event is not active', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t)

      const id = await t.mutation(create, {
        name: 'Test Event',
        eventTypeId,
        date: Date.now(),
      })

      await expect(t.mutation(completeEvent, { id })).rejects.toThrow(
        'Only active events can be completed',
      )
    })

    it('throws error for non-existent event', async () => {
      const t = convexTest(schema, modules)

      await expect(
        t.mutation(completeEvent, { id: 'events:nonexistent' as any }),
      ).rejects.toThrow('Event not found')
    })
  })

  describe('cancelEvent', () => {
    it('cancels an upcoming event', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t)

      const id = await t.mutation(create, {
        name: 'Test Event',
        eventTypeId,
        date: Date.now(),
      })

      await t.mutation(cancelEvent, { id })

      const result = await t.run(async (ctx) => {
        return await ctx.db.get(id)
      })

      expect(result?.status).toBe('cancelled')
    })

    it('cancels an active event', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t)

      const id = await t.mutation(create, {
        name: 'Test Event',
        eventTypeId,
        date: Date.now(),
      })

      await t.mutation(startEvent, { id })
      await t.mutation(cancelEvent, { id })

      const result = await t.run(async (ctx) => {
        return await ctx.db.get(id)
      })

      expect(result?.status).toBe('cancelled')
    })

    it('throws error when event is already completed', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t)

      const id = await t.mutation(create, {
        name: 'Test Event',
        eventTypeId,
        date: Date.now(),
      })

      await t.mutation(startEvent, { id })
      await t.mutation(completeEvent, { id })

      await expect(t.mutation(cancelEvent, { id })).rejects.toThrow(
        'Cannot cancel a completed event',
      )
    })

    it('throws error when event is already cancelled', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t)

      const id = await t.mutation(create, {
        name: 'Test Event',
        eventTypeId,
        date: Date.now(),
      })

      await t.mutation(cancelEvent, { id })

      await expect(t.mutation(cancelEvent, { id })).rejects.toThrow(
        'Event is already cancelled',
      )
    })

    it('throws error for non-existent event', async () => {
      const t = convexTest(schema, modules)

      await expect(
        t.mutation(cancelEvent, { id: 'events:nonexistent' as any }),
      ).rejects.toThrow('Event not found')
    })
  })

  describe('archive', () => {
    it('archives an event (soft delete)', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t)

      const id = await t.mutation(create, {
        name: 'Test Event',
        eventTypeId,
        date: Date.now(),
      })

      await t.mutation(archive, { id })

      const result = await t.run(async (ctx) => {
        return await ctx.db.get(id)
      })

      expect(result?.isActive).toBe(false)
    })

    it('updates updatedAt when archiving', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t)

      const id = await t.mutation(create, {
        name: 'Test Event',
        eventTypeId,
        date: Date.now(),
      })

      const beforeArchive = await t.run(async (ctx) => {
        return await ctx.db.get(id)
      })

      // Wait a bit to ensure timestamp changes
      await new Promise((resolve) => setTimeout(resolve, 10))

      await t.mutation(archive, { id })

      const afterArchive = await t.run(async (ctx) => {
        return await ctx.db.get(id)
      })

      expect(afterArchive?.updatedAt).toBeGreaterThan(
        beforeArchive?.updatedAt as number,
      )
    })

    it('throws error for non-existent event', async () => {
      const t = convexTest(schema, modules)

      await expect(
        t.mutation(archive, { id: 'events:nonexistent' as any }),
      ).rejects.toThrow('Event not found')
    })

    it('preserves event data when archived', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t)

      const id = await t.mutation(create, {
        name: 'Test Event',
        eventTypeId,
        date: Date.now(),
        description: 'Test description',
      })

      await t.mutation(archive, { id })

      const result = await t.run(async (ctx) => {
        return await ctx.db.get(id)
      })

      expect(result?.name).toBe('Test Event')
      expect(result?.description).toBe('Test description')
      expect(result?.isActive).toBe(false)
    })
  })
})
