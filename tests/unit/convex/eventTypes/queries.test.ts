import { describe, it, expect } from 'vitest'
import { convexTest } from 'convex-test'
import schema from '../../../../convex/schema.js'
import {
  list,
  getById,
  checkAssociations,
} from '../../../../convex/eventTypes/queries.js'

// Create a mock modules object that convex-test expects
const modules = import.meta.glob('../../../../convex/**/*.ts', { eager: true })

describe('eventTypes queries', () => {
  describe('list', () => {
    it('returns empty array when no event types exist', async () => {
      const t = convexTest(schema, modules)

      const result = await t.query(list, { isActive: true })

      expect(result).toEqual([])
    })

    it('returns all active event types ordered by name', async () => {
      const t = convexTest(schema, modules)

      // Create test event types
      await t.run(async (ctx) => {
        await ctx.db.insert('eventTypes', {
          name: 'Youth Event',
          color: '#8b5cf6',
          isActive: true,
          createdAt: Date.now(),
        })
        await ctx.db.insert('eventTypes', {
          name: 'Sunday Service',
          color: '#3b82f6',
          isActive: true,
          createdAt: Date.now(),
        })
        await ctx.db.insert('eventTypes', {
          name: 'Prayer Meeting',
          color: '#f97316',
          isActive: true,
          createdAt: Date.now(),
        })
      })

      const result = await t.query(list, { isActive: true })

      expect(result).toHaveLength(3)
      expect(result[0].name).toBe('Prayer Meeting')
      expect(result[1].name).toBe('Sunday Service')
      expect(result[2].name).toBe('Youth Event')
    })

    it('filters by isActive status', async () => {
      const t = convexTest(schema, modules)

      await t.run(async (ctx) => {
        await ctx.db.insert('eventTypes', {
          name: 'Active Event',
          color: '#3b82f6',
          isActive: true,
          createdAt: Date.now(),
        })
        await ctx.db.insert('eventTypes', {
          name: 'Inactive Event',
          color: '#f97316',
          isActive: false,
          createdAt: Date.now(),
        })
      })

      const activeResult = await t.query(list, { isActive: true })
      const inactiveResult = await t.query(list, { isActive: false })

      expect(activeResult).toHaveLength(1)
      expect(activeResult[0].name).toBe('Active Event')
      expect(inactiveResult).toHaveLength(1)
      expect(inactiveResult[0].name).toBe('Inactive Event')
    })
  })

  describe('getById', () => {
    it('returns event type by valid ID', async () => {
      const t = convexTest(schema, modules)

      const id = await t.run(async (ctx) => {
        return await ctx.db.insert('eventTypes', {
          name: 'Test Event Type',
          description: 'Test description',
          color: '#3b82f6',
          isActive: true,
          createdAt: Date.now(),
        })
      })

      const result = await t.query(getById, { id })

      expect(result).not.toBeNull()
      expect(result?.name).toBe('Test Event Type')
      expect(result?.description).toBe('Test description')
      expect(result?.color).toBe('#3b82f6')
    })

    it('returns null for non-existent event type ID', async () => {
      const t = convexTest(schema, modules)

      const result = await t.query(getById, {
        id: 'eventTypes:nonexistent' as any,
      })

      expect(result).toBeNull()
    })
  })

  describe('checkAssociations', () => {
    it('returns isDeletable true when no events use this type', async () => {
      const t = convexTest(schema, modules)

      const id = await t.run(async (ctx) => {
        return await ctx.db.insert('eventTypes', {
          name: 'Unused Event Type',
          color: '#3b82f6',
          isActive: true,
          createdAt: Date.now(),
        })
      })

      const result = await t.query(checkAssociations, { id })

      expect(result.eventCount).toBe(0)
      expect(result.isDeletable).toBe(true)
    })
  })
})
