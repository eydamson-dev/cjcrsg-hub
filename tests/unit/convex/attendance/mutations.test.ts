import { describe, it, expect } from 'vitest'
import { convexTest } from 'convex-test'
import schema from '../../../../convex/schema.js'
import {
  checkIn,
  unCheckIn,
  bulkCheckIn,
} from '../../../../convex/attendance/mutations.js'
import { create as createEvent } from '../../../../convex/events/mutations.js'
import { create as createEventType } from '../../../../convex/eventTypes/mutations.js'
import { create as createAttendee } from '../../../../convex/attendees/mutations.js'

// Create a mock modules object that convex-test expects
const modules = import.meta.glob('../../../../convex/**/*.ts', { eager: true })

describe('attendance mutations', () => {
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

  describe('checkIn', () => {
    it('checks in attendee with authentication', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin User',
        email: 'admin@church.com',
      })

      const eventTypeId = await createTestEventType(t)
      const eventId = await createTestEvent(t, eventTypeId)
      const attendeeId = await createTestAttendee(t)

      const id = await asAdmin.mutation(checkIn, {
        eventId,
        attendeeId,
      })

      expect(id).toBeDefined()
      expect(typeof id).toBe('string')

      // Verify it was created
      const result = await t.run(async (ctx) => {
        return await ctx.db.get(id)
      })

      expect(result).not.toBeNull()
      expect(result?.eventId).toBe(eventId)
      expect(result?.attendeeId).toBe(attendeeId)
      expect(result?.checkedInAt).toBeDefined()
      expect(result?.checkedInBy).toBeDefined()
    })

    it('throws error when not authenticated', async () => {
      const t = convexTest(schema, modules)

      const eventTypeId = await createTestEventType(t)
      const eventId = await createTestEvent(t, eventTypeId)
      const attendeeId = await createTestAttendee(t)

      await expect(
        t.mutation(checkIn, {
          eventId,
          attendeeId,
        }),
      ).rejects.toThrow('Not authenticated')
    })

    it('throws error when event not found', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin User',
        email: 'admin@church.com',
      })

      const attendeeId = await createTestAttendee(t)

      await expect(
        asAdmin.mutation(checkIn, {
          eventId: 'events:nonexistent' as any,
          attendeeId,
        }),
      ).rejects.toThrow('Event not found')
    })

    it('throws error when attendee not found', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin User',
        email: 'admin@church.com',
      })

      const eventTypeId = await createTestEventType(t)
      const eventId = await createTestEvent(t, eventTypeId)

      await expect(
        asAdmin.mutation(checkIn, {
          eventId,
          attendeeId: 'attendees:nonexistent' as any,
        }),
      ).rejects.toThrow('Attendee not found')
    })

    it('throws error when attendee already checked in', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin User',
        email: 'admin@church.com',
      })

      const eventTypeId = await createTestEventType(t)
      const eventId = await createTestEvent(t, eventTypeId)
      const attendeeId = await createTestAttendee(t)

      // First check-in
      await asAdmin.mutation(checkIn, {
        eventId,
        attendeeId,
      })

      // Second check-in should fail
      await expect(
        asAdmin.mutation(checkIn, {
          eventId,
          attendeeId,
        }),
      ).rejects.toThrow('Attendee is already checked in to this event')
    })

    it('checks in with invitedBy', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin User',
        email: 'admin@church.com',
      })

      const eventTypeId = await createTestEventType(t)
      const eventId = await createTestEvent(t, eventTypeId)
      const attendeeId = await createTestAttendee(t)
      const inviterId = await createTestAttendee(t, { firstName: 'Inviter' })

      const id = await asAdmin.mutation(checkIn, {
        eventId,
        attendeeId,
        invitedBy: inviterId,
      })

      const result = await t.run(async (ctx) => {
        return await ctx.db.get(id)
      })

      expect(result?.invitedBy).toBe(inviterId)
    })

    it('checks in with notes', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin User',
        email: 'admin@church.com',
      })

      const eventTypeId = await createTestEventType(t)
      const eventId = await createTestEvent(t, eventTypeId)
      const attendeeId = await createTestAttendee(t)

      const id = await asAdmin.mutation(checkIn, {
        eventId,
        attendeeId,
        notes: 'First-time visitor',
      })

      const result = await t.run(async (ctx) => {
        return await ctx.db.get(id)
      })

      expect(result?.notes).toBe('First-time visitor')
    })

    it('throws error when inviter not found', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin User',
        email: 'admin@church.com',
      })

      const eventTypeId = await createTestEventType(t)
      const eventId = await createTestEvent(t, eventTypeId)
      const attendeeId = await createTestAttendee(t)

      await expect(
        asAdmin.mutation(checkIn, {
          eventId,
          attendeeId,
          invitedBy: 'attendees:nonexistent' as any,
        }),
      ).rejects.toThrow('Inviter not found')
    })
  })

  describe('unCheckIn', () => {
    it('removes attendance record', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin User',
        email: 'admin@church.com',
      })

      const eventTypeId = await createTestEventType(t)
      const eventId = await createTestEvent(t, eventTypeId)
      const attendeeId = await createTestAttendee(t)

      // Check in first
      const recordId = await asAdmin.mutation(checkIn, {
        eventId,
        attendeeId,
      })

      // Verify it exists
      const before = await t.run(async (ctx) => {
        return await ctx.db.get(recordId)
      })
      expect(before).not.toBeNull()

      // Remove check-in
      await asAdmin.mutation(unCheckIn, { attendanceRecordId: recordId })

      // Verify it's deleted
      const after = await t.run(async (ctx) => {
        return await ctx.db.get(recordId)
      })
      expect(after).toBeNull()
    })

    it('throws error when not authenticated', async () => {
      const t = convexTest(schema, modules)

      const eventTypeId = await createTestEventType(t)
      const eventId = await createTestEvent(t, eventTypeId)
      const attendeeId = await createTestAttendee(t)

      // Create record without auth using direct DB insert
      const recordId = await t.run(async (ctx) => {
        return await ctx.db.insert('attendanceRecords', {
          eventId,
          attendeeId,
          checkedInAt: Date.now(),
          checkedInBy: 'test-user',
        })
      })

      await expect(
        t.mutation(unCheckIn, { attendanceRecordId: recordId }),
      ).rejects.toThrow('Not authenticated')
    })

    it('throws error when record not found', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin User',
        email: 'admin@church.com',
      })

      await expect(
        asAdmin.mutation(unCheckIn, {
          attendanceRecordId: 'attendanceRecords:nonexistent' as any,
        }),
      ).rejects.toThrow('Attendance record not found')
    })
  })

  describe('bulkCheckIn', () => {
    it('checks in multiple attendees', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin User',
        email: 'admin@church.com',
      })

      const eventTypeId = await createTestEventType(t)
      const eventId = await createTestEvent(t, eventTypeId)
      const attendee1Id = await createTestAttendee(t, {
        firstName: 'Attendee1',
      })
      const attendee2Id = await createTestAttendee(t, {
        firstName: 'Attendee2',
      })

      const result = await asAdmin.mutation(bulkCheckIn, {
        eventId,
        attendees: [{ attendeeId: attendee1Id }, { attendeeId: attendee2Id }],
      })

      expect(result.successCount).toBe(2)
      expect(result.skippedCount).toBe(0)

      // Verify records created
      const records = await t.run(async (ctx) => {
        return await ctx.db
          .query('attendanceRecords')
          .withIndex('by_event', (q) => q.eq('eventId', eventId))
          .collect()
      })

      expect(records).toHaveLength(2)
    })

    it('skips already checked in attendees', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin User',
        email: 'admin@church.com',
      })

      const eventTypeId = await createTestEventType(t)
      const eventId = await createTestEvent(t, eventTypeId)
      const attendee1Id = await createTestAttendee(t, {
        firstName: 'Attendee1',
      })
      const attendee2Id = await createTestAttendee(t, {
        firstName: 'Attendee2',
      })

      // Check in first attendee
      await asAdmin.mutation(checkIn, {
        eventId,
        attendeeId: attendee1Id,
      })

      // Bulk check-in both
      const result = await asAdmin.mutation(bulkCheckIn, {
        eventId,
        attendees: [
          { attendeeId: attendee1Id }, // Already checked in
          { attendeeId: attendee2Id }, // Not checked in
        ],
      })

      expect(result.successCount).toBe(1)
      expect(result.skippedCount).toBe(1)
    })

    it('throws error when not authenticated', async () => {
      const t = convexTest(schema, modules)

      const eventTypeId = await createTestEventType(t)
      const eventId = await createTestEvent(t, eventTypeId)
      const attendeeId = await createTestAttendee(t)

      await expect(
        t.mutation(bulkCheckIn, {
          eventId,
          attendees: [{ attendeeId }],
        }),
      ).rejects.toThrow('Not authenticated')
    })

    it('throws error when event not found', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin User',
        email: 'admin@church.com',
      })

      const attendeeId = await createTestAttendee(t)

      await expect(
        asAdmin.mutation(bulkCheckIn, {
          eventId: 'events:nonexistent' as any,
          attendees: [{ attendeeId }],
        }),
      ).rejects.toThrow('Event not found')
    })

    it('skips non-existent attendees', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin User',
        email: 'admin@church.com',
      })

      const eventTypeId = await createTestEventType(t)
      const eventId = await createTestEvent(t, eventTypeId)

      const result = await asAdmin.mutation(bulkCheckIn, {
        eventId,
        attendees: [{ attendeeId: 'attendees:nonexistent' as any }],
      })

      expect(result.successCount).toBe(0)
      expect(result.skippedCount).toBe(0) // Non-existent is skipped differently
    })

    it('checks in with invitedBy for each attendee', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin User',
        email: 'admin@church.com',
      })

      const eventTypeId = await createTestEventType(t)
      const eventId = await createTestEvent(t, eventTypeId)
      const attendeeId = await createTestAttendee(t)
      const inviterId = await createTestAttendee(t, { firstName: 'Inviter' })

      const result = await asAdmin.mutation(bulkCheckIn, {
        eventId,
        attendees: [{ attendeeId, invitedBy: inviterId }],
      })

      expect(result.successCount).toBe(1)

      // Verify invitedBy was set
      const records = await t.run(async (ctx) => {
        return await ctx.db
          .query('attendanceRecords')
          .withIndex('by_event', (q) => q.eq('eventId', eventId))
          .collect()
      })

      expect(records[0].invitedBy).toBe(inviterId)
    })

    it('handles empty attendees array', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin User',
        email: 'admin@church.com',
      })

      const eventTypeId = await createTestEventType(t)
      const eventId = await createTestEvent(t, eventTypeId)

      const result = await asAdmin.mutation(bulkCheckIn, {
        eventId,
        attendees: [],
      })

      expect(result.successCount).toBe(0)
      expect(result.skippedCount).toBe(0)
    })

    it('skips when inviter not found', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin User',
        email: 'admin@church.com',
      })

      const eventTypeId = await createTestEventType(t)
      const eventId = await createTestEvent(t, eventTypeId)
      const attendeeId = await createTestAttendee(t)

      const result = await asAdmin.mutation(bulkCheckIn, {
        eventId,
        attendees: [{ attendeeId, invitedBy: 'attendees:nonexistent' as any }],
      })

      expect(result.successCount).toBe(0)
    })
  })
})
