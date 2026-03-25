import { describe, it, expect } from 'vitest'
import { convexTest } from 'convex-test'
import schema from '../../../../convex/schema.js'
import {
  create,
  update,
  remove,
} from '../../../../convex/eventTypes/mutations.js'

// Create a mock modules object that convex-test expects
const modules = import.meta.glob('../../../../convex/**/*.ts', { eager: true })

describe('eventTypes mutations', () => {
  describe('create', () => {
    it('creates event type with valid data', async () => {
      const t = convexTest(schema, modules)

      const id = await t.mutation(create, {
        name: 'Sunday Service',
        description: 'Weekly worship service',
        color: '#3b82f6',
      })

      expect(id).toBeDefined()
      expect(typeof id).toBe('string')

      // Verify it was created
      const result = await t.run(async (ctx) => {
        return await ctx.db.get(id)
      })

      expect(result).not.toBeNull()
      expect(result?.name).toBe('Sunday Service')
      expect(result?.description).toBe('Weekly worship service')
      expect(result?.color).toBe('#3b82f6')
      expect(result?.isActive).toBe(true)
      expect(result?.createdAt).toBeDefined()
    })

    it('creates event type with minimal fields', async () => {
      const t = convexTest(schema, modules)

      const id = await t.mutation(create, {
        name: 'Youth Event',
      })

      const result = await t.run(async (ctx) => {
        return await ctx.db.get(id)
      })

      expect(result?.name).toBe('Youth Event')
      expect(result?.description).toBeUndefined()
      expect(result?.color).toBeUndefined()
      expect(result?.isActive).toBe(true)
    })

    it('trims whitespace from name', async () => {
      const t = convexTest(schema, modules)

      const id = await t.mutation(create, {
        name: '  Prayer Meeting  ',
      })

      const result = await t.run(async (ctx) => {
        return await ctx.db.get(id)
      })

      expect(result?.name).toBe('Prayer Meeting')
    })
  })

  describe('update', () => {
    it('updates event type fields', async () => {
      const t = convexTest(schema, modules)

      const id = await t.mutation(create, {
        name: 'Original Name',
        color: '#3b82f6',
      })

      await t.mutation(update, {
        id,
        name: 'Updated Name',
        color: '#8b5cf6',
      })

      const result = await t.run(async (ctx) => {
        return await ctx.db.get(id)
      })

      expect(result?.name).toBe('Updated Name')
      expect(result?.color).toBe('#8b5cf6')
    })

    it('partially updates event type', async () => {
      const t = convexTest(schema, modules)

      const id = await t.mutation(create, {
        name: 'Event Type',
        description: 'Original description',
        color: '#3b82f6',
      })

      await t.mutation(update, {
        id,
        description: 'Updated description',
      })

      const result = await t.run(async (ctx) => {
        return await ctx.db.get(id)
      })

      expect(result?.name).toBe('Event Type')
      expect(result?.description).toBe('Updated description')
      expect(result?.color).toBe('#3b82f6')
    })

    it('throws error for non-existent event type', async () => {
      const t = convexTest(schema, modules)

      await expect(
        t.mutation(update, {
          id: 'eventTypes:nonexistent' as any,
          name: 'Updated Name',
        }),
      ).rejects.toThrow('Event type not found')
    })
  })

  describe('remove', () => {
    it('deletes event type with no associated events', async () => {
      const t = convexTest(schema, modules)

      const id = await t.mutation(create, {
        name: 'To Be Deleted',
      })

      await t.mutation(remove, { id })

      const result = await t.run(async (ctx) => {
        return await ctx.db.get(id)
      })

      expect(result).toBeNull()
    })

    it('throws error when event type has associated events', async () => {
      const t = convexTest(schema, modules)

      const eventTypeId = await t.mutation(create, {
        name: 'Used Event Type',
      })

      // Create an event using this type
      await t.run(async (ctx) => {
        await ctx.db.insert('events', {
          name: 'Test Event',
          eventTypeId,
          date: Date.now(),
          status: 'upcoming',
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
      })

      await expect(t.mutation(remove, { id: eventTypeId })).rejects.toThrow(
        'Cannot delete event type with associated events',
      )
    })

    it('throws error for non-existent event type', async () => {
      const t = convexTest(schema, modules)

      await expect(
        t.mutation(remove, { id: 'eventTypes:nonexistent' as any }),
      ).rejects.toThrow('Event type not found')
    })
  })
})
