import { describe, it, expect } from 'vitest'
import { convexTest } from 'convex-test'
import schema from '../../../../convex/schema.js'
import {
  list,
  getById,
  getCurrentEvent,
  listArchive,
  getStats,
} from '../../../../convex/events/queries.js'
import { create as createEvent } from '../../../../convex/events/mutations.js'
import { create as createEventType } from '../../../../convex/eventTypes/mutations.js'

// Create a mock modules object that convex-test expects
const modules = import.meta.glob('../../../../convex/**/*.ts', { eager: true })

describe('events queries', () => {
  // Helper to create an event type for testing
  const createTestEventType = async (t: any, name: string = 'Test Type') => {
    return await t.mutation(createEventType, { name })
  }

  // Helper to create an event for testing
  const createTestEvent = async (
    t: any,
    eventTypeId: string,
    overrides: any = {},
  ) => {
    return await t.mutation(createEvent, {
      name: 'Test Event',
      eventTypeId,
      date: Date.now(),
      ...overrides,
    })
  }

  describe('list', () => {
    it('returns paginated events', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t)

      // Create multiple events
      await createTestEvent(t, eventTypeId)
      await createTestEvent(t, eventTypeId)
      await createTestEvent(t, eventTypeId)

      const result = await t.query(list, {
        paginationOpts: { numItems: 10, cursor: null },
      })

      expect(result.page).toHaveLength(3)
      expect(result.isDone).toBe(true)
    })

    it('filters by status', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t)

      // Create events with different statuses
      const event1Id = await createTestEvent(t, eventTypeId)
      const event2Id = await createTestEvent(t, eventTypeId)
      const event3Id = await createTestEvent(t, eventTypeId)

      // Make event1 active
      await t.run(async (ctx) => {
        await ctx.db.patch(event1Id, { status: 'active' })
      })

      // Make event2 completed
      await t.run(async (ctx) => {
        await ctx.db.patch(event2Id, { status: 'completed' })
      })

      // Query for active events
      const activeResult = await t.query(list, {
        paginationOpts: { numItems: 10, cursor: null },
        status: 'active',
      })

      expect(activeResult.page).toHaveLength(1)
      expect(activeResult.page[0].status).toBe('active')

      // Query for completed events
      const completedResult = await t.query(list, {
        paginationOpts: { numItems: 10, cursor: null },
        status: 'completed',
      })

      expect(completedResult.page).toHaveLength(1)
      expect(completedResult.page[0].status).toBe('completed')
    })

    it('filters by eventTypeId', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId1 = await createTestEventType(t, 'Type 1')
      const eventTypeId2 = await createTestEventType(t, 'Type 2')

      await createTestEvent(t, eventTypeId1)
      await createTestEvent(t, eventTypeId2)

      const result = await t.query(list, {
        paginationOpts: { numItems: 10, cursor: null },
        eventTypeId: eventTypeId1,
      })

      expect(result.page).toHaveLength(1)
      expect(result.page[0].eventTypeId).toBe(eventTypeId1)
    })

    it('filters by date range', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t)

      const now = Date.now()
      const oneDay = 24 * 60 * 60 * 1000

      // Create events at different dates
      await createTestEvent(t, eventTypeId, { date: now - oneDay })
      await createTestEvent(t, eventTypeId, { date: now })
      await createTestEvent(t, eventTypeId, { date: now + oneDay })

      // Query for events in the future
      const futureResult = await t.query(list, {
        paginationOpts: { numItems: 10, cursor: null },
        dateFrom: now,
      })

      expect(futureResult.page).toHaveLength(2) // now and future

      // Query for events in the past
      const pastResult = await t.query(list, {
        paginationOpts: { numItems: 10, cursor: null },
        dateTo: now - 1,
      })

      expect(pastResult.page).toHaveLength(1)
    })

    it('joins eventType data', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t, 'Sunday Service')

      await createTestEvent(t, eventTypeId)

      const result = await t.query(list, {
        paginationOpts: { numItems: 10, cursor: null },
      })

      expect(result.page[0].eventType).toBeDefined()
      expect(result.page[0].eventType?.name).toBe('Sunday Service')
    })

    it('orders by date descending', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t)

      const now = Date.now()
      const oneDay = 24 * 60 * 60 * 1000

      // Create events at different dates
      await createTestEvent(t, eventTypeId, { date: now })
      await createTestEvent(t, eventTypeId, { date: now + oneDay })
      await createTestEvent(t, eventTypeId, { date: now - oneDay })

      const result = await t.query(list, {
        paginationOpts: { numItems: 10, cursor: null },
      })

      // Should be ordered newest first
      expect(result.page[0].date).toBeGreaterThanOrEqual(result.page[1].date)
      expect(result.page[1].date).toBeGreaterThanOrEqual(result.page[2].date)
    })

    it('excludes archived events', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t)

      const eventId = await createTestEvent(t, eventTypeId)

      // Archive the event
      await t.run(async (ctx) => {
        await ctx.db.patch(eventId, { isActive: false })
      })

      const result = await t.query(list, {
        paginationOpts: { numItems: 10, cursor: null },
      })

      expect(result.page).toHaveLength(0)
    })

    it('supports pagination', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t)

      // Create multiple events
      await createTestEvent(t, eventTypeId)
      await createTestEvent(t, eventTypeId)
      await createTestEvent(t, eventTypeId)

      // Get first page with 2 items
      const firstPage = await t.query(list, {
        paginationOpts: { numItems: 2, cursor: null },
      })

      expect(firstPage.page).toHaveLength(2)
      expect(firstPage.isDone).toBe(false)
      expect(firstPage.continueCursor).toBeDefined()

      // Get second page
      const secondPage = await t.query(list, {
        paginationOpts: { numItems: 2, cursor: firstPage.continueCursor },
      })

      expect(secondPage.page).toHaveLength(1)
      expect(secondPage.isDone).toBe(true)
    })
  })

  describe('getById', () => {
    it('returns event with eventType', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t, 'Sunday Service')

      const eventId = await createTestEvent(t, eventTypeId, {
        name: 'Test Event',
      })

      const result = await t.query(getById, { id: eventId })

      expect(result).toBeDefined()
      expect(result?.name).toBe('Test Event')
      expect(result?.eventType).toBeDefined()
      expect(result?.eventType?.name).toBe('Sunday Service')
    })

    it('returns null for non-existent event', async () => {
      const t = convexTest(schema, modules)

      const result = await t.query(getById, { id: 'events:nonexistent' as any })

      expect(result).toBeNull()
    })

    it('returns event with all fields', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t)

      const eventId = await t.mutation(createEvent, {
        name: 'Full Event',
        eventTypeId,
        date: Date.now(),
        description: 'Test description',
        startTime: '09:00',
        endTime: '11:00',
        location: 'Main Sanctuary',
      })

      const result = await t.query(getById, { id: eventId })

      expect(result?.name).toBe('Full Event')
      expect(result?.description).toBe('Test description')
      expect(result?.startTime).toBe('09:00')
      expect(result?.endTime).toBe('11:00')
      expect(result?.location).toBe('Main Sanctuary')
    })
  })

  describe('getCurrentEvent', () => {
    it('returns single active event', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t)

      const eventId = await createTestEvent(t, eventTypeId)

      // Make event active
      await t.run(async (ctx) => {
        await ctx.db.patch(eventId, { status: 'active' })
      })

      const result = await t.query(getCurrentEvent, {})

      expect(result).toBeDefined()
      expect(result?.status).toBe('active')
    })

    it('returns null when no active event', async () => {
      const t = convexTest(schema, modules)

      const result = await t.query(getCurrentEvent, {})

      expect(result).toBeNull()
    })

    it('returns null when active event is archived', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t)

      const eventId = await createTestEvent(t, eventTypeId)

      // Make event active but archived
      await t.run(async (ctx) => {
        await ctx.db.patch(eventId, { status: 'active', isActive: false })
      })

      const result = await t.query(getCurrentEvent, {})

      expect(result).toBeNull()
    })

    it('includes attendance count', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t)

      const eventId = await createTestEvent(t, eventTypeId)

      // Make event active
      await t.run(async (ctx) => {
        await ctx.db.patch(eventId, { status: 'active' })
      })

      // Add attendance records
      await t.run(async (ctx) => {
        const attendee1 = await ctx.db.insert('attendees', {
          firstName: 'John',
          lastName: 'Doe',
          status: 'member',
          address: '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })

        const attendee2 = await ctx.db.insert('attendees', {
          firstName: 'Jane',
          lastName: 'Smith',
          status: 'visitor',
          address: '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })

        await ctx.db.insert('attendanceRecords', {
          eventId,
          attendeeId: attendee1,
          checkedInAt: Date.now(),
          checkedInBy: 'test-user',
        })

        await ctx.db.insert('attendanceRecords', {
          eventId,
          attendeeId: attendee2,
          checkedInAt: Date.now(),
          checkedInBy: 'test-user',
        })
      })

      const result = await t.query(getCurrentEvent, {})

      expect(result?.attendanceCount).toBe(2)
    })
  })

  describe('listArchive', () => {
    it('returns completed events', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t)

      const eventId = await createTestEvent(t, eventTypeId)

      // Make event completed
      await t.run(async (ctx) => {
        await ctx.db.patch(eventId, { status: 'completed' })
      })

      const result = await t.query(listArchive, {
        paginationOpts: { numItems: 10, cursor: null },
      })

      expect(result.page).toHaveLength(1)
      expect(result.page[0].status).toBe('completed')
    })

    it('excludes active events', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t)

      // Create active event
      const activeEventId = await createTestEvent(t, eventTypeId)
      await t.run(async (ctx) => {
        await ctx.db.patch(activeEventId, { status: 'active' })
      })

      // Create completed event
      const completedEventId = await createTestEvent(t, eventTypeId)
      await t.run(async (ctx) => {
        await ctx.db.patch(completedEventId, { status: 'completed' })
      })

      const result = await t.query(listArchive, {
        paginationOpts: { numItems: 10, cursor: null },
      })

      expect(result.page).toHaveLength(1)
      expect(result.page[0].status).toBe('completed')
    })

    it('filters by eventTypeId', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId1 = await createTestEventType(t, 'Type 1')
      const eventTypeId2 = await createTestEventType(t, 'Type 2')

      const event1Id = await createTestEvent(t, eventTypeId1)
      await t.run(async (ctx) => {
        await ctx.db.patch(event1Id, { status: 'completed' })
      })

      const event2Id = await createTestEvent(t, eventTypeId2)
      await t.run(async (ctx) => {
        await ctx.db.patch(event2Id, { status: 'completed' })
      })

      const result = await t.query(listArchive, {
        paginationOpts: { numItems: 10, cursor: null },
        eventTypeId: eventTypeId1,
      })

      expect(result.page).toHaveLength(1)
      expect(result.page[0].eventTypeId).toBe(eventTypeId1)
    })

    it('includes attendance count', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t)

      const eventId = await createTestEvent(t, eventTypeId)

      // Make event completed
      await t.run(async (ctx) => {
        await ctx.db.patch(eventId, { status: 'completed' })

        const attendee = await ctx.db.insert('attendees', {
          firstName: 'John',
          lastName: 'Doe',
          status: 'member',
          address: '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })

        await ctx.db.insert('attendanceRecords', {
          eventId,
          attendeeId: attendee,
          checkedInAt: Date.now(),
          checkedInBy: 'test-user',
        })
      })

      const result = await t.query(listArchive, {
        paginationOpts: { numItems: 10, cursor: null },
      })

      expect(result.page[0].attendanceCount).toBe(1)
    })

    it('excludes archived events', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t)

      const eventId = await createTestEvent(t, eventTypeId)

      // Make event completed but archived
      await t.run(async (ctx) => {
        await ctx.db.patch(eventId, { status: 'completed', isActive: false })
      })

      const result = await t.query(listArchive, {
        paginationOpts: { numItems: 10, cursor: null },
      })

      expect(result.page).toHaveLength(0)
    })
  })

  describe('getStats', () => {
    it('returns total events count', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t)

      await createTestEvent(t, eventTypeId)
      await createTestEvent(t, eventTypeId)
      await createTestEvent(t, eventTypeId)

      const result = await t.query(getStats, {})

      expect(result.totalEvents).toBe(3)
    })

    it('returns counts by status', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t)

      // Create events with different statuses
      const event1Id = await createTestEvent(t, eventTypeId)
      await t.run(async (ctx) => {
        await ctx.db.patch(event1Id, { status: 'upcoming' })
      })

      const event2Id = await createTestEvent(t, eventTypeId)
      await t.run(async (ctx) => {
        await ctx.db.patch(event2Id, { status: 'active' })
      })

      const event3Id = await createTestEvent(t, eventTypeId)
      await t.run(async (ctx) => {
        await ctx.db.patch(event3Id, { status: 'completed' })
      })

      const result = await t.query(getStats, {})

      expect(result.byStatus.upcoming).toBe(1)
      expect(result.byStatus.active).toBe(1)
      expect(result.byStatus.completed).toBe(1)
    })

    it('excludes archived events from total', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t)

      const eventId = await createTestEvent(t, eventTypeId)

      // Archive the event
      await t.run(async (ctx) => {
        await ctx.db.patch(eventId, { isActive: false })
      })

      const result = await t.query(getStats, {})

      expect(result.totalEvents).toBe(0)
    })

    it('returns next upcoming event', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t)

      const now = Date.now()
      const oneDay = 24 * 60 * 60 * 1000

      // Create event in the past
      const pastEventId = await createTestEvent(t, eventTypeId, {
        name: 'Past Event',
        date: now - oneDay,
      })
      await t.run(async (ctx) => {
        await ctx.db.patch(pastEventId, { status: 'upcoming' })
      })

      // Create event in the future
      const futureEventId = await createTestEvent(t, eventTypeId, {
        name: 'Future Event',
        date: now + oneDay,
      })
      await t.run(async (ctx) => {
        await ctx.db.patch(futureEventId, { status: 'upcoming' })
      })

      const result = await t.query(getStats, {})

      expect(result.nextUpcoming).toBeDefined()
      expect(result.nextUpcoming?.name).toBe('Future Event')
    })

    it('returns null for nextUpcoming when no upcoming events', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t)

      // Create only completed event
      const eventId = await createTestEvent(t, eventTypeId)
      await t.run(async (ctx) => {
        await ctx.db.patch(eventId, { status: 'completed' })
      })

      const result = await t.query(getStats, {})

      expect(result.nextUpcoming).toBeNull()
    })

    it('calculates thisMonth count', async () => {
      const t = convexTest(schema, modules)
      const eventTypeId = await createTestEventType(t)

      const now = Date.now()
      const oneDay = 24 * 60 * 60 * 1000

      // Create event this month (assuming we're in the middle)
      await createTestEvent(t, eventTypeId, { date: now })

      // Create event next month
      const nextMonth = new Date()
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      await createTestEvent(t, eventTypeId, { date: nextMonth.getTime() })

      const result = await t.query(getStats, {})

      expect(result.thisMonth).toBeGreaterThanOrEqual(1)
    })
  })
})
