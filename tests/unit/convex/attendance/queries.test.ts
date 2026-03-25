import { describe, it, expect } from 'vitest'
import { convexTest } from 'convex-test'
import schema from '../../../../convex/schema.js'
import {
  getByEvent,
  getStats,
  getByAttendee,
  getInviters,
} from '../../../../convex/attendance/queries.js'
import { checkIn } from '../../../../convex/attendance/mutations.js'
import { create as createEvent } from '../../../../convex/events/mutations.js'
import { create as createEventType } from '../../../../convex/eventTypes/mutations.js'
import { create as createAttendee } from '../../../../convex/attendees/mutations.js'

// Create a mock modules object that convex-test expects
const modules = import.meta.glob('../../../../convex/**/*.ts', { eager: true })

describe('attendance queries', () => {
  // Helper to create test data
  const createTestEventType = async (t: any, name: string = 'Test Type') => {
    return await t.mutation(createEventType, { name })
  }

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

  const createTestAttendee = async (t: any, overrides: any = {}) => {
    return await t.mutation(createAttendee, {
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Main St',
      status: 'member',
      ...overrides,
    })
  }

  const checkInAttendee = async (
    t: any,
    eventId: string,
    attendeeId: string,
    invitedBy?: string,
  ) => {
    const asAdmin = t.withIdentity({
      name: 'Admin User',
      email: 'admin@church.com',
    })
    return await asAdmin.mutation(checkIn, {
      eventId,
      attendeeId,
      invitedBy,
    })
  }

  describe('getByEvent', () => {
    it('returns attendance records for event', async () => {
      const t = convexTest(schema, modules)

      const eventTypeId = await createTestEventType(t)
      const eventId = await createTestEvent(t, eventTypeId)
      const attendeeId = await createTestAttendee(t)

      await checkInAttendee(t, eventId, attendeeId)

      const result = await t.query(getByEvent, {
        eventId,
        paginationOpts: { numItems: 10, cursor: null },
      })

      expect(result.page).toHaveLength(1)
      expect(result.page[0].eventId).toBe(eventId)
      expect(result.page[0].attendeeId).toBe(attendeeId)
    })

    it('joins attendee data', async () => {
      const t = convexTest(schema, modules)

      const eventTypeId = await createTestEventType(t)
      const eventId = await createTestEvent(t, eventTypeId)
      const attendeeId = await createTestAttendee(t, {
        firstName: 'Jane',
        lastName: 'Smith',
      })

      await checkInAttendee(t, eventId, attendeeId)

      const result = await t.query(getByEvent, {
        eventId,
        paginationOpts: { numItems: 10, cursor: null },
      })

      expect(result.page[0].attendee).toBeDefined()
      expect(result.page[0].attendee?.firstName).toBe('Jane')
      expect(result.page[0].attendee?.lastName).toBe('Smith')
    })

    it('joins inviter data', async () => {
      const t = convexTest(schema, modules)

      const eventTypeId = await createTestEventType(t)
      const eventId = await createTestEvent(t, eventTypeId)
      const attendeeId = await createTestAttendee(t)
      const inviterId = await createTestAttendee(t, { firstName: 'Inviter' })

      await checkInAttendee(t, eventId, attendeeId, inviterId)

      const result = await t.query(getByEvent, {
        eventId,
        paginationOpts: { numItems: 10, cursor: null },
      })

      expect(result.page[0].inviter).toBeDefined()
      expect(result.page[0].inviter?.firstName).toBe('Inviter')
    })

    it('orders by checkedInAt descending', async () => {
      const t = convexTest(schema, modules)

      const eventTypeId = await createTestEventType(t)
      const eventId = await createTestEvent(t, eventTypeId)
      const attendee1Id = await createTestAttendee(t, { firstName: 'First' })
      const attendee2Id = await createTestAttendee(t, { firstName: 'Second' })

      // Check in with delay
      await checkInAttendee(t, eventId, attendee1Id)
      await new Promise((resolve) => setTimeout(resolve, 10))
      await checkInAttendee(t, eventId, attendee2Id)

      const result = await t.query(getByEvent, {
        eventId,
        paginationOpts: { numItems: 10, cursor: null },
      })

      // Most recent first
      expect(result.page[0].attendee?.firstName).toBe('Second')
      expect(result.page[1].attendee?.firstName).toBe('First')
    })

    it('supports pagination', async () => {
      const t = convexTest(schema, modules)

      const eventTypeId = await createTestEventType(t)
      const eventId = await createTestEvent(t, eventTypeId)

      // Create multiple check-ins
      for (let i = 0; i < 5; i++) {
        const attendeeId = await createTestAttendee(t, {
          firstName: `Attendee${i}`,
        })
        await checkInAttendee(t, eventId, attendeeId)
      }

      // Get first page with 2 items
      const firstPage = await t.query(getByEvent, {
        eventId,
        paginationOpts: { numItems: 2, cursor: null },
      })

      expect(firstPage.page).toHaveLength(2)
      expect(firstPage.isDone).toBe(false)

      // Get second page
      const secondPage = await t.query(getByEvent, {
        eventId,
        paginationOpts: { numItems: 2, cursor: firstPage.continueCursor },
      })

      expect(secondPage.page).toHaveLength(2)
    })

    it('returns empty array for event with no attendance', async () => {
      const t = convexTest(schema, modules)

      const eventTypeId = await createTestEventType(t)
      const eventId = await createTestEvent(t, eventTypeId)

      const result = await t.query(getByEvent, {
        eventId,
        paginationOpts: { numItems: 10, cursor: null },
      })

      expect(result.page).toHaveLength(0)
    })
  })

  describe('getStats', () => {
    it('returns total attendance count', async () => {
      const t = convexTest(schema, modules)

      const eventTypeId = await createTestEventType(t)
      const eventId = await createTestEvent(t, eventTypeId)

      // Create 3 check-ins
      for (let i = 0; i < 3; i++) {
        const attendeeId = await createTestAttendee(t)
        await checkInAttendee(t, eventId, attendeeId)
      }

      const result = await t.query(getStats, { eventId })

      expect(result.total).toBe(3)
    })

    it('counts members and visitors separately', async () => {
      const t = convexTest(schema, modules)

      const eventTypeId = await createTestEventType(t)
      const eventId = await createTestEvent(t, eventTypeId)

      // Create member
      const memberId = await createTestAttendee(t, { status: 'member' })
      await checkInAttendee(t, eventId, memberId)

      // Create visitor
      const visitorId = await createTestAttendee(t, { status: 'visitor' })
      await checkInAttendee(t, eventId, visitorId)

      const result = await t.query(getStats, { eventId })

      expect(result.members).toBe(1)
      expect(result.visitors).toBe(1)
    })

    it('counts attendees with invites', async () => {
      const t = convexTest(schema, modules)

      const eventTypeId = await createTestEventType(t)
      const eventId = await createTestEvent(t, eventTypeId)

      const attendeeId = await createTestAttendee(t)
      const inviterId = await createTestAttendee(t, { firstName: 'Inviter' })

      await checkInAttendee(t, eventId, attendeeId, inviterId)

      const result = await t.query(getStats, { eventId })

      expect(result.withInvite).toBe(1)
    })

    it('returns zero counts for event with no attendance', async () => {
      const t = convexTest(schema, modules)

      const eventTypeId = await createTestEventType(t)
      const eventId = await createTestEvent(t, eventTypeId)

      const result = await t.query(getStats, { eventId })

      expect(result.total).toBe(0)
      expect(result.members).toBe(0)
      expect(result.visitors).toBe(0)
      expect(result.withInvite).toBe(0)
    })
  })

  describe('getByAttendee', () => {
    it('returns attendance history for attendee', async () => {
      const t = convexTest(schema, modules)

      const eventTypeId = await createTestEventType(t)
      const eventId = await createTestEvent(t, eventTypeId)
      const attendeeId = await createTestAttendee(t)

      await checkInAttendee(t, eventId, attendeeId)

      const result = await t.query(getByAttendee, {
        attendeeId,
        paginationOpts: { numItems: 10, cursor: null },
      })

      expect(result.page).toHaveLength(1)
      expect(result.page[0].attendeeId).toBe(attendeeId)
    })

    it('joins event data', async () => {
      const t = convexTest(schema, modules)

      const eventTypeId = await createTestEventType(t)
      const eventId = await createTestEvent(t, eventTypeId, {
        name: 'Sunday Service',
      })
      const attendeeId = await createTestAttendee(t)

      await checkInAttendee(t, eventId, attendeeId)

      const result = await t.query(getByAttendee, {
        attendeeId,
        paginationOpts: { numItems: 10, cursor: null },
      })

      expect(result.page[0].event).toBeDefined()
      expect(result.page[0].event?.name).toBe('Sunday Service')
    })

    it('joins eventType data', async () => {
      const t = convexTest(schema, modules)

      const eventTypeId = await createTestEventType(t, 'Worship Service')
      const eventId = await createTestEvent(t, eventTypeId)
      const attendeeId = await createTestAttendee(t)

      await checkInAttendee(t, eventId, attendeeId)

      const result = await t.query(getByAttendee, {
        attendeeId,
        paginationOpts: { numItems: 10, cursor: null },
      })

      expect(result.page[0].eventType).toBeDefined()
      expect(result.page[0].eventType?.name).toBe('Worship Service')
    })

    it('orders by checkedInAt descending', async () => {
      const t = convexTest(schema, modules)

      const eventTypeId = await createTestEventType(t)
      const attendeeId = await createTestAttendee(t)

      // Create two events and check in
      const event1Id = await createTestEvent(t, eventTypeId, { name: 'Event1' })
      await checkInAttendee(t, event1Id, attendeeId)
      await new Promise((resolve) => setTimeout(resolve, 10))

      const event2Id = await createTestEvent(t, eventTypeId, { name: 'Event2' })
      await checkInAttendee(t, event2Id, attendeeId)

      const result = await t.query(getByAttendee, {
        attendeeId,
        paginationOpts: { numItems: 10, cursor: null },
      })

      // Most recent first
      expect(result.page[0].event?.name).toBe('Event2')
      expect(result.page[1].event?.name).toBe('Event1')
    })

    it('supports pagination', async () => {
      const t = convexTest(schema, modules)

      const eventTypeId = await createTestEventType(t)
      const attendeeId = await createTestAttendee(t)

      // Create multiple check-ins
      for (let i = 0; i < 5; i++) {
        const eventId = await createTestEvent(t, eventTypeId)
        await checkInAttendee(t, eventId, attendeeId)
      }

      const result = await t.query(getByAttendee, {
        attendeeId,
        paginationOpts: { numItems: 2, cursor: null },
      })

      expect(result.page).toHaveLength(2)
      expect(result.isDone).toBe(false)
    })

    it('returns empty array for attendee with no attendance', async () => {
      const t = convexTest(schema, modules)

      const attendeeId = await createTestAttendee(t)

      const result = await t.query(getByAttendee, {
        attendeeId,
        paginationOpts: { numItems: 10, cursor: null },
      })

      expect(result.page).toHaveLength(0)
    })
  })

  describe('getInviters', () => {
    it('returns top inviters with counts', async () => {
      const t = convexTest(schema, modules)

      const eventTypeId = await createTestEventType(t)
      const eventId = await createTestEvent(t, eventTypeId)

      const inviterId = await createTestAttendee(t, {
        firstName: 'John',
        lastName: 'Inviter',
      })

      // Create 3 attendees invited by inviter
      for (let i = 0; i < 3; i++) {
        const attendeeId = await createTestAttendee(t)
        await checkInAttendee(t, eventId, attendeeId, inviterId)
      }

      const result = await t.query(getInviters, { eventId })

      expect(result).toHaveLength(1)
      expect(result[0].inviter?.firstName).toBe('John')
      expect(result[0].count).toBe(3)
    })

    it('sorts inviters by count descending', async () => {
      const t = convexTest(schema, modules)

      const eventTypeId = await createTestEventType(t)
      const eventId = await createTestEvent(t, eventTypeId)

      const inviter1Id = await createTestAttendee(t, { firstName: 'Top' })
      const inviter2Id = await createTestAttendee(t, { firstName: 'Less' })

      // inviter1 invites 3 people
      for (let i = 0; i < 3; i++) {
        const attendeeId = await createTestAttendee(t)
        await checkInAttendee(t, eventId, attendeeId, inviter1Id)
      }

      // inviter2 invites 1 person
      const attendeeId = await createTestAttendee(t)
      await checkInAttendee(t, eventId, attendeeId, inviter2Id)

      const result = await t.query(getInviters, { eventId })

      expect(result).toHaveLength(2)
      expect(result[0].inviter?.firstName).toBe('Top')
      expect(result[0].count).toBe(3)
      expect(result[1].inviter?.firstName).toBe('Less')
      expect(result[1].count).toBe(1)
    })

    it('excludes attendees without inviter', async () => {
      const t = convexTest(schema, modules)

      const eventTypeId = await createTestEventType(t)
      const eventId = await createTestEvent(t, eventTypeId)

      // Create attendee without inviter
      const attendeeId = await createTestAttendee(t)
      await checkInAttendee(t, eventId, attendeeId)

      const result = await t.query(getInviters, { eventId })

      expect(result).toHaveLength(0)
    })

    it('returns empty array for event with no invites', async () => {
      const t = convexTest(schema, modules)

      const eventTypeId = await createTestEventType(t)
      const eventId = await createTestEvent(t, eventTypeId)

      const result = await t.query(getInviters, { eventId })

      expect(result).toHaveLength(0)
    })

    it('handles multiple inviters correctly', async () => {
      const t = convexTest(schema, modules)

      const eventTypeId = await createTestEventType(t)
      const eventId = await createTestEvent(t, eventTypeId)

      const inviter1Id = await createTestAttendee(t, { firstName: 'Inviter1' })
      const inviter2Id = await createTestAttendee(t, { firstName: 'Inviter2' })

      // Each inviter invites 2 people
      for (let i = 0; i < 2; i++) {
        const attendeeId1 = await createTestAttendee(t)
        await checkInAttendee(t, eventId, attendeeId1, inviter1Id)

        const attendeeId2 = await createTestAttendee(t)
        await checkInAttendee(t, eventId, attendeeId2, inviter2Id)
      }

      const result = await t.query(getInviters, { eventId })

      expect(result).toHaveLength(2)
      // Both should have count 2 (order may vary if tied)
      expect(result[0].count).toBe(2)
      expect(result[1].count).toBe(2)
    })
  })
})
