import { describe, it, expect } from 'vitest'
import { convexTest } from 'convex-test'
import schema from '../../../../convex/schema.js'
import {
  addTeacher,
  removeTeacher,
  updateTeacher,
  addLesson,
  updateLesson,
  removeLesson,
  reorderLessons,
  addStaff,
  updateStaff,
  removeStaff,
} from '../../../../convex/retreat/mutations.js'
import { create as createEvent } from '../../../../convex/events/mutations.js'
import { create as createEventType } from '../../../../convex/eventTypes/mutations.js'
import { create as createAttendee } from '../../../../convex/attendees/mutations.js'

const modules = import.meta.glob('../../../../convex/**/*.ts', { eager: true })

// Helper to get retreat extension for an event
const getRetreatExtension = async (ctx: any, eventId: string) => {
  return await ctx.db
    .query('spiritualRetreatEventExtensions')
    .withIndex('by_event', (q: any) => q.eq('eventId', eventId))
    .first()
}

describe('retreat mutations', () => {
  describe('addTeacher', () => {
    it('adds teacher with Pastor status', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin',
        email: 'admin@church.com',
      })

      const eventTypeId = await asAdmin.mutation(createEventType, {
        name: 'Spiritual Retreat',
        color: '#22c55e',
      })
      const eventId = await asAdmin.mutation(createEvent, {
        name: 'Spiritual Retreat',
        eventTypeId,
        date: Date.now(),
      })

      const attendeeId = await asAdmin.mutation(createAttendee, {
        firstName: 'John',
        lastName: 'Smith',
        address: '123 Main St',
        status: 'Pastor',
      })

      await asAdmin.mutation(addTeacher, {
        eventId,
        attendeeId,
        subject: 'Prayer',
        bio: 'Experienced prayer leader',
      })

      const extension = await asAdmin.run(async (ctx) => {
        return await getRetreatExtension(ctx, eventId)
      })

      expect(extension?.teachers).toHaveLength(1)
      expect(extension?.teachers?.[0].subject).toBe('Prayer')
      expect(extension?.teachers?.[0].bio).toBe('Experienced prayer leader')
    })

    it('adds teacher with Leader status', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin',
        email: 'admin2@church.com',
      })

      const eventTypeId = await asAdmin.mutation(createEventType, {
        name: 'Spiritual Retreat',
        color: '#22c55e',
      })
      const eventId = await asAdmin.mutation(createEvent, {
        name: 'Retreat 2',
        eventTypeId,
        date: Date.now(),
      })

      const attendeeId = await asAdmin.mutation(createAttendee, {
        firstName: 'Jane',
        lastName: 'Doe',
        address: '123 Main St',
        status: 'Leader',
      })

      await asAdmin.mutation(addTeacher, { eventId, attendeeId })

      const extension = await asAdmin.run(async (ctx) => {
        return await getRetreatExtension(ctx, eventId)
      })

      expect(extension?.teachers).toHaveLength(1)
    })

    it('adds teacher with Elder status', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin',
        email: 'admin3@church.com',
      })

      const eventTypeId = await asAdmin.mutation(createEventType, {
        name: 'Spiritual Retreat',
        color: '#22c55e',
      })
      const eventId = await asAdmin.mutation(createEvent, {
        name: 'Retreat 3',
        eventTypeId,
        date: Date.now(),
      })

      const attendeeId = await asAdmin.mutation(createAttendee, {
        firstName: 'Bob',
        lastName: 'Wilson',
        address: '123 Main St',
        status: 'Elder',
      })

      await asAdmin.mutation(addTeacher, { eventId, attendeeId })

      const extension = await asAdmin.run(async (ctx) => {
        return await getRetreatExtension(ctx, eventId)
      })

      expect(extension?.teachers).toHaveLength(1)
    })

    it('adds teacher with Deacon status', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin',
        email: 'admin4@church.com',
      })

      const eventTypeId = await asAdmin.mutation(createEventType, {
        name: 'Spiritual Retreat',
        color: '#22c55e',
      })
      const eventId = await asAdmin.mutation(createEvent, {
        name: 'Retreat 4',
        eventTypeId,
        date: Date.now(),
      })

      const attendeeId = await asAdmin.mutation(createAttendee, {
        firstName: 'Alice',
        lastName: 'Brown',
        address: '123 Main St',
        status: 'Deacon',
      })

      await asAdmin.mutation(addTeacher, { eventId, attendeeId })

      const extension = await asAdmin.run(async (ctx) => {
        return await getRetreatExtension(ctx, eventId)
      })

      expect(extension?.teachers).toHaveLength(1)
    })

    it('rejects Member as teacher', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin',
        email: 'admin5@church.com',
      })

      const eventTypeId = await asAdmin.mutation(createEventType, {
        name: 'Spiritual Retreat',
        color: '#22c55e',
      })
      const eventId = await asAdmin.mutation(createEvent, {
        name: 'Retreat 5',
        eventTypeId,
        date: Date.now(),
      })

      const attendeeId = await asAdmin.mutation(createAttendee, {
        firstName: 'Regular',
        lastName: 'Member',
        address: '123 Main St',
        status: 'member',
      })

      await expect(
        asAdmin.mutation(addTeacher, { eventId, attendeeId }),
      ).rejects.toThrow('not a qualified teacher status')
    })

    it('rejects Visitor as teacher', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin',
        email: 'admin6@church.com',
      })

      const eventTypeId = await asAdmin.mutation(createEventType, {
        name: 'Spiritual Retreat',
        color: '#22c55e',
      })
      const eventId = await asAdmin.mutation(createEvent, {
        name: 'Retreat 6',
        eventTypeId,
        date: Date.now(),
      })

      const attendeeId = await asAdmin.mutation(createAttendee, {
        firstName: 'New',
        lastName: 'Visitor',
        address: '123 Main St',
        status: 'visitor',
      })

      await expect(
        asAdmin.mutation(addTeacher, { eventId, attendeeId }),
      ).rejects.toThrow('not a qualified teacher status')
    })

    it('rejects duplicate teacher', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin',
        email: 'admin7@church.com',
      })

      const eventTypeId = await asAdmin.mutation(createEventType, {
        name: 'Spiritual Retreat',
        color: '#22c55e',
      })
      const eventId = await asAdmin.mutation(createEvent, {
        name: 'Retreat 7',
        eventTypeId,
        date: Date.now(),
      })

      const attendeeId = await asAdmin.mutation(createAttendee, {
        firstName: 'Duplicate',
        lastName: 'Test',
        address: '123 Main St',
        status: 'Pastor',
      })

      await asAdmin.mutation(addTeacher, { eventId, attendeeId })

      await expect(
        asAdmin.mutation(addTeacher, { eventId, attendeeId }),
      ).rejects.toThrow('already a teacher')
    })

    it('rejects non-existent attendee', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin',
        email: 'admin8@church.com',
      })

      const eventTypeId = await asAdmin.mutation(createEventType, {
        name: 'Spiritual Retreat',
        color: '#22c55e',
      })
      const eventId = await asAdmin.mutation(createEvent, {
        name: 'Retreat 8',
        eventTypeId,
        date: Date.now(),
      })

      await expect(
        asAdmin.mutation(addTeacher, {
          eventId,
          attendeeId: 'attendees:nonexistent' as any,
        }),
      ).rejects.toThrow('Attendee not found')
    })

    it('rejects non-existent event', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin',
        email: 'admin9@church.com',
      })

      const attendeeId = await asAdmin.mutation(createAttendee, {
        firstName: 'Test',
        lastName: 'Person',
        address: '123 Main St',
        status: 'Pastor',
      })

      // Convex validates the ID format before our mutation runs
      await expect(
        asAdmin.mutation(addTeacher, {
          eventId: 'events:nonexistent' as any,
          attendeeId,
        }),
      ).rejects.toThrow()
    })

    it('requires authentication', async () => {
      const t = convexTest(schema, modules)

      await expect(
        t.mutation(addTeacher, {
          eventId: 'events:test' as any,
          attendeeId: 'attendees:test' as any,
        }),
      ).rejects.toThrow('Not authenticated')
    })
  })

  describe('removeTeacher', () => {
    it('removes teacher without lessons', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin',
        email: 'admin10@church.com',
      })

      const eventTypeId = await asAdmin.mutation(createEventType, {
        name: 'Spiritual Retreat',
        color: '#22c55e',
      })
      const eventId = await asAdmin.mutation(createEvent, {
        name: 'Retreat 10',
        eventTypeId,
        date: Date.now(),
      })

      const attendeeId = await asAdmin.mutation(createAttendee, {
        firstName: 'Remove',
        lastName: 'Teacher',
        address: '123 Main St',
        status: 'Elder',
      })

      await asAdmin.mutation(addTeacher, { eventId, attendeeId })

      await asAdmin.mutation(removeTeacher, { eventId, attendeeId })

      const extension = await asAdmin.run(async (ctx) => {
        return await getRetreatExtension(ctx, eventId)
      })

      expect(extension?.teachers).toHaveLength(0)
    })

    it('throws error when teacher has lessons without forceRemove', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin',
        email: 'admin11@church.com',
      })

      const eventTypeId = await asAdmin.mutation(createEventType, {
        name: 'Spiritual Retreat',
        color: '#22c55e',
      })
      const eventId = await asAdmin.mutation(createEvent, {
        name: 'Retreat 11',
        eventTypeId,
        date: Date.now(),
      })

      const attendeeId = await asAdmin.mutation(createAttendee, {
        firstName: 'Teacher',
        lastName: 'WithLesson',
        address: '123 Main St',
        status: 'Deacon',
      })

      await asAdmin.mutation(addTeacher, { eventId, attendeeId })

      // Add a lesson assigned to this teacher using addLesson mutation
      await asAdmin.mutation(addLesson, {
        eventId,
        lesson: {
          id: 'lesson-1',
          title: 'Test Lesson',
          teacherId: attendeeId,
          day: 1,
          startTime: '09:00',
          endTime: '10:00',
          type: 'teaching',
        },
      })

      await expect(
        asAdmin.mutation(removeTeacher, { eventId, attendeeId }),
      ).rejects.toThrow('has assigned lessons')
    })

    it('force removes teacher and unassigns lessons', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin',
        email: 'admin12@church.com',
      })

      const eventTypeId = await asAdmin.mutation(createEventType, {
        name: 'Spiritual Retreat',
        color: '#22c55e',
      })
      const eventId = await asAdmin.mutation(createEvent, {
        name: 'Retreat 12',
        eventTypeId,
        date: Date.now(),
      })

      const attendeeId = await asAdmin.mutation(createAttendee, {
        firstName: 'Force',
        lastName: 'Remove',
        address: '123 Main St',
        status: 'Leader',
      })

      await asAdmin.mutation(addTeacher, { eventId, attendeeId })

      // Add a lesson assigned to this teacher
      await asAdmin.mutation(addLesson, {
        eventId,
        lesson: {
          id: 'lesson-2',
          title: 'Test Lesson',
          teacherId: attendeeId,
          day: 1,
          startTime: '09:00',
          endTime: '10:00',
          type: 'teaching',
        },
      })

      await asAdmin.mutation(removeTeacher, {
        eventId,
        attendeeId,
        forceRemove: true,
      })

      const extension = await asAdmin.run(async (ctx) => {
        return await getRetreatExtension(ctx, eventId)
      })

      expect(extension?.teachers).toHaveLength(0)
      expect(extension?.lessons?.[0].teacherId).toBeUndefined()
    })

    it('throws error when teacher not found', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin',
        email: 'admin13@church.com',
      })

      const eventTypeId = await asAdmin.mutation(createEventType, {
        name: 'Spiritual Retreat',
        color: '#22c55e',
      })
      const eventId = await asAdmin.mutation(createEvent, {
        name: 'Retreat 13',
        eventTypeId,
        date: Date.now(),
      })

      await expect(
        asAdmin.mutation(removeTeacher, {
          eventId,
          attendeeId: 'attendees:nonexistent' as any,
        }),
      ).rejects.toThrow('Teacher not found')
    })
  })

  describe('updateTeacher', () => {
    it('updates teacher subject and bio', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin',
        email: 'admin14@church.com',
      })

      const eventTypeId = await asAdmin.mutation(createEventType, {
        name: 'Spiritual Retreat',
        color: '#22c55e',
      })
      const eventId = await asAdmin.mutation(createEvent, {
        name: 'Retreat 14',
        eventTypeId,
        date: Date.now(),
      })

      const attendeeId = await asAdmin.mutation(createAttendee, {
        firstName: 'Update',
        lastName: 'Teacher',
        address: '123 Main St',
        status: 'Pastor',
      })

      await asAdmin.mutation(addTeacher, { eventId, attendeeId })

      await asAdmin.mutation(updateTeacher, {
        eventId,
        attendeeId,
        subject: 'Worship',
        bio: 'Updated bio',
      })

      const extension = await asAdmin.run(async (ctx) => {
        return await getRetreatExtension(ctx, eventId)
      })

      expect(extension?.teachers?.[0].subject).toBe('Worship')
      expect(extension?.teachers?.[0].bio).toBe('Updated bio')
    })

    it('throws error when teacher not found', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin',
        email: 'admin15@church.com',
      })

      const eventTypeId = await asAdmin.mutation(createEventType, {
        name: 'Spiritual Retreat',
        color: '#22c55e',
      })
      const eventId = await asAdmin.mutation(createEvent, {
        name: 'Retreat 15',
        eventTypeId,
        date: Date.now(),
      })

      await expect(
        asAdmin.mutation(updateTeacher, {
          eventId,
          attendeeId: 'attendees:nonexistent' as any,
        }),
      ).rejects.toThrow('Teacher not found')
    })
  })

  describe('addLesson', () => {
    it('adds lesson with valid times', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin',
        email: 'admin16@church.com',
      })

      const eventTypeId = await asAdmin.mutation(createEventType, {
        name: 'Spiritual Retreat',
        color: '#22c55e',
      })
      const eventId = await asAdmin.mutation(createEvent, {
        name: 'Retreat 16',
        eventTypeId,
        date: Date.now(),
      })

      await asAdmin.mutation(addLesson, {
        eventId,
        lesson: {
          id: 'lesson-1',
          title: 'Opening Session',
          day: 1,
          startTime: '09:00',
          endTime: '10:00',
          type: 'teaching',
        },
      })

      const extension = await asAdmin.run(async (ctx) => {
        return await getRetreatExtension(ctx, eventId)
      })

      expect(extension?.lessons).toHaveLength(1)
      expect(extension?.lessons?.[0].title).toBe('Opening Session')
    })

    it('rejects when end time before start time', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin',
        email: 'admin17@church.com',
      })

      const eventTypeId = await asAdmin.mutation(createEventType, {
        name: 'Spiritual Retreat',
        color: '#22c55e',
      })
      const eventId = await asAdmin.mutation(createEvent, {
        name: 'Retreat 17',
        eventTypeId,
        date: Date.now(),
      })

      await expect(
        asAdmin.mutation(addLesson, {
          eventId,
          lesson: {
            id: 'lesson-2',
            title: 'Invalid Times',
            day: 1,
            startTime: '10:00',
            endTime: '09:00',
            type: 'teaching',
          },
        }),
      ).rejects.toThrow('End time must be after start time')
    })

    it('rejects overlapping lessons on same day', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin',
        email: 'admin18@church.com',
      })

      const eventTypeId = await asAdmin.mutation(createEventType, {
        name: 'Spiritual Retreat',
        color: '#22c55e',
      })
      const eventId = await asAdmin.mutation(createEvent, {
        name: 'Retreat 18',
        eventTypeId,
        date: Date.now(),
      })

      await asAdmin.mutation(addLesson, {
        eventId,
        lesson: {
          id: 'lesson-a',
          title: 'Session 1',
          day: 1,
          startTime: '09:00',
          endTime: '10:00',
          type: 'teaching',
        },
      })

      await expect(
        asAdmin.mutation(addLesson, {
          eventId,
          lesson: {
            id: 'lesson-b',
            title: 'Session 2',
            day: 1,
            startTime: '09:30',
            endTime: '10:30',
            type: 'teaching',
          },
        }),
      ).rejects.toThrow('Time conflicts')
    })

    it('allows non-overlapping lessons on same day', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin',
        email: 'admin19@church.com',
      })

      const eventTypeId = await asAdmin.mutation(createEventType, {
        name: 'Spiritual Retreat',
        color: '#22c55e',
      })
      const eventId = await asAdmin.mutation(createEvent, {
        name: 'Retreat 19',
        eventTypeId,
        date: Date.now(),
      })

      await asAdmin.mutation(addLesson, {
        eventId,
        lesson: {
          id: 'lesson-c',
          title: 'Session 1',
          day: 1,
          startTime: '09:00',
          endTime: '10:00',
          type: 'teaching',
        },
      })

      await asAdmin.mutation(addLesson, {
        eventId,
        lesson: {
          id: 'lesson-d',
          title: 'Session 2',
          day: 1,
          startTime: '11:00',
          endTime: '12:00',
          type: 'teaching',
        },
      })

      const extension = await asAdmin.run(async (ctx) => {
        return await getRetreatExtension(ctx, eventId)
      })

      expect(extension?.lessons).toHaveLength(2)
    })

    it('allows same time on different days', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin',
        email: 'admin20@church.com',
      })

      const eventTypeId = await asAdmin.mutation(createEventType, {
        name: 'Spiritual Retreat',
        color: '#22c55e',
      })
      const eventId = await asAdmin.mutation(createEvent, {
        name: 'Retreat 20',
        eventTypeId,
        date: Date.now(),
      })

      await asAdmin.mutation(addLesson, {
        eventId,
        lesson: {
          id: 'lesson-e',
          title: 'Day 1 Session',
          day: 1,
          startTime: '09:00',
          endTime: '10:00',
          type: 'teaching',
        },
      })

      await asAdmin.mutation(addLesson, {
        eventId,
        lesson: {
          id: 'lesson-f',
          title: 'Day 2 Session',
          day: 2,
          startTime: '09:00',
          endTime: '10:00',
          type: 'teaching',
        },
      })

      const extension = await asAdmin.run(async (ctx) => {
        return await getRetreatExtension(ctx, eventId)
      })

      expect(extension?.lessons).toHaveLength(2)
    })

    it('allows back-to-back lessons', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin',
        email: 'admin21@church.com',
      })

      const eventTypeId = await asAdmin.mutation(createEventType, {
        name: 'Spiritual Retreat',
        color: '#22c55e',
      })
      const eventId = await asAdmin.mutation(createEvent, {
        name: 'Retreat 21',
        eventTypeId,
        date: Date.now(),
      })

      await asAdmin.mutation(addLesson, {
        eventId,
        lesson: {
          id: 'lesson-g',
          title: 'First Session',
          day: 1,
          startTime: '09:00',
          endTime: '10:00',
          type: 'teaching',
        },
      })

      await asAdmin.mutation(addLesson, {
        eventId,
        lesson: {
          id: 'lesson-h',
          title: 'Second Session',
          day: 1,
          startTime: '10:00',
          endTime: '11:00',
          type: 'teaching',
        },
      })

      const extension = await asAdmin.run(async (ctx) => {
        return await getRetreatExtension(ctx, eventId)
      })

      expect(extension?.lessons).toHaveLength(2)
    })

    it('validates teacher exists when provided', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin',
        email: 'admin22@church.com',
      })

      const eventTypeId = await asAdmin.mutation(createEventType, {
        name: 'Spiritual Retreat',
        color: '#22c55e',
      })
      const eventId = await asAdmin.mutation(createEvent, {
        name: 'Retreat 22',
        eventTypeId,
        date: Date.now(),
      })

      await expect(
        asAdmin.mutation(addLesson, {
          eventId,
          lesson: {
            id: 'lesson-i',
            title: 'With Teacher',
            day: 1,
            startTime: '09:00',
            endTime: '10:00',
            type: 'teaching',
            teacherId: 'attendees:nonexistent' as any,
          },
        }),
      ).rejects.toThrow('Teacher not found')
    })
  })

  describe('updateLesson', () => {
    it('updates lesson fields', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin',
        email: 'admin23@church.com',
      })

      const eventTypeId = await asAdmin.mutation(createEventType, {
        name: 'Spiritual Retreat',
        color: '#22c55e',
      })
      const eventId = await asAdmin.mutation(createEvent, {
        name: 'Retreat 23',
        eventTypeId,
        date: Date.now(),
      })

      await asAdmin.mutation(addLesson, {
        eventId,
        lesson: {
          id: 'lesson-j',
          title: 'Original Title',
          day: 1,
          startTime: '09:00',
          endTime: '10:00',
          type: 'teaching',
        },
      })

      await asAdmin.mutation(updateLesson, {
        eventId,
        lessonId: 'lesson-j',
        updates: {
          title: 'Updated Title',
          description: 'New description',
        },
      })

      const extension = await asAdmin.run(async (ctx) => {
        return await getRetreatExtension(ctx, eventId)
      })

      expect(extension?.lessons?.[0].title).toBe('Updated Title')
      expect(extension?.lessons?.[0].description).toBe('New description')
    })

    it('validates overlap when time changes', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin',
        email: 'admin24@church.com',
      })

      const eventTypeId = await asAdmin.mutation(createEventType, {
        name: 'Spiritual Retreat',
        color: '#22c55e',
      })
      const eventId = await asAdmin.mutation(createEvent, {
        name: 'Retreat 24',
        eventTypeId,
        date: Date.now(),
      })

      await asAdmin.mutation(addLesson, {
        eventId,
        lesson: {
          id: 'lesson-k',
          title: 'First',
          day: 1,
          startTime: '09:00',
          endTime: '10:00',
          type: 'teaching',
        },
      })

      await asAdmin.mutation(addLesson, {
        eventId,
        lesson: {
          id: 'lesson-l',
          title: 'Second',
          day: 1,
          startTime: '11:00',
          endTime: '12:00',
          type: 'teaching',
        },
      })

      await expect(
        asAdmin.mutation(updateLesson, {
          eventId,
          lessonId: 'lesson-l',
          updates: {
            startTime: '09:30',
            endTime: '10:30',
          },
        }),
      ).rejects.toThrow('Time conflicts')
    })

    it('throws error when lesson not found', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin',
        email: 'admin25@church.com',
      })

      const eventTypeId = await asAdmin.mutation(createEventType, {
        name: 'Spiritual Retreat',
        color: '#22c55e',
      })
      const eventId = await asAdmin.mutation(createEvent, {
        name: 'Retreat 25',
        eventTypeId,
        date: Date.now(),
      })

      await expect(
        asAdmin.mutation(updateLesson, {
          eventId,
          lessonId: 'nonexistent',
          updates: { title: 'Updated' },
        }),
      ).rejects.toThrow('Lesson not found')
    })
  })

  describe('removeLesson', () => {
    it('removes lesson', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin',
        email: 'admin26@church.com',
      })

      const eventTypeId = await asAdmin.mutation(createEventType, {
        name: 'Spiritual Retreat',
        color: '#22c55e',
      })
      const eventId = await asAdmin.mutation(createEvent, {
        name: 'Retreat 26',
        eventTypeId,
        date: Date.now(),
      })

      await asAdmin.mutation(addLesson, {
        eventId,
        lesson: {
          id: 'lesson-m',
          title: 'To Remove',
          day: 1,
          startTime: '09:00',
          endTime: '10:00',
          type: 'teaching',
        },
      })

      await asAdmin.mutation(removeLesson, { eventId, lessonId: 'lesson-m' })

      const extension = await asAdmin.run(async (ctx) => {
        return await getRetreatExtension(ctx, eventId)
      })

      expect(extension?.lessons).toHaveLength(0)
    })

    it('throws error when lesson not found', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin',
        email: 'admin27@church.com',
      })

      const eventTypeId = await asAdmin.mutation(createEventType, {
        name: 'Spiritual Retreat',
        color: '#22c55e',
      })
      const eventId = await asAdmin.mutation(createEvent, {
        name: 'Retreat 27',
        eventTypeId,
        date: Date.now(),
      })

      await expect(
        asAdmin.mutation(removeLesson, { eventId, lessonId: 'nonexistent' }),
      ).rejects.toThrow('Lesson not found')
    })
  })

  describe('reorderLessons', () => {
    it('reorders lessons', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin',
        email: 'admin28@church.com',
      })

      const eventTypeId = await asAdmin.mutation(createEventType, {
        name: 'Spiritual Retreat',
        color: '#22c55e',
      })
      const eventId = await asAdmin.mutation(createEvent, {
        name: 'Retreat 28',
        eventTypeId,
        date: Date.now(),
      })

      await asAdmin.mutation(addLesson, {
        eventId,
        lesson: {
          id: 'a',
          title: 'First',
          day: 1,
          startTime: '09:00',
          endTime: '10:00',
          type: 'teaching',
        },
      })
      await asAdmin.mutation(addLesson, {
        eventId,
        lesson: {
          id: 'b',
          title: 'Second',
          day: 1,
          startTime: '10:00',
          endTime: '11:00',
          type: 'teaching',
        },
      })
      await asAdmin.mutation(addLesson, {
        eventId,
        lesson: {
          id: 'c',
          title: 'Third',
          day: 1,
          startTime: '11:00',
          endTime: '12:00',
          type: 'teaching',
        },
      })

      await asAdmin.mutation(reorderLessons, {
        eventId,
        lessonIds: ['c', 'a', 'b'],
      })

      const extension = await asAdmin.run(async (ctx) => {
        return await getRetreatExtension(ctx, eventId)
      })

      expect(extension?.lessons?.[0].id).toBe('c')
      expect(extension?.lessons?.[1].id).toBe('a')
      expect(extension?.lessons?.[2].id).toBe('b')
    })

    it('throws error when some lesson IDs are invalid', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin',
        email: 'admin29@church.com',
      })

      const eventTypeId = await asAdmin.mutation(createEventType, {
        name: 'Spiritual Retreat',
        color: '#22c55e',
      })
      const eventId = await asAdmin.mutation(createEvent, {
        name: 'Retreat 29',
        eventTypeId,
        date: Date.now(),
      })

      // Add one lesson with id 'x'
      await asAdmin.mutation(addLesson, {
        eventId,
        lesson: {
          id: 'x',
          title: 'First',
          day: 1,
          startTime: '09:00',
          endTime: '10:00',
          type: 'teaching',
        },
      })

      // Try to reorder with only nonexistent ID (should fail - lengths don't match)
      await expect(
        asAdmin.mutation(reorderLessons, {
          eventId,
          lessonIds: ['nonexistent'],
        }),
      ).rejects.toThrow('Some lesson IDs are invalid')
    })
  })

  describe('addStaff', () => {
    it('adds any attendee as staff', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin',
        email: 'admin30@church.com',
      })

      const eventTypeId = await asAdmin.mutation(createEventType, {
        name: 'Spiritual Retreat',
        color: '#22c55e',
      })
      const eventId = await asAdmin.mutation(createEvent, {
        name: 'Retreat 30',
        eventTypeId,
        date: Date.now(),
      })

      const attendeeId = await asAdmin.mutation(createAttendee, {
        firstName: 'Staff',
        lastName: 'Member',
        address: '123 Main St',
        status: 'member',
      })

      await asAdmin.mutation(addStaff, {
        eventId,
        attendeeId,
        role: 'Sound Tech',
        responsibilities: 'Audio setup',
        isLead: true,
      })

      const extension = await asAdmin.run(async (ctx) => {
        return await getRetreatExtension(ctx, eventId)
      })

      expect(extension?.staff).toHaveLength(1)
      expect(extension?.staff?.[0].role).toBe('Sound Tech')
      expect(extension?.staff?.[0].isLead).toBe(true)
    })

    it('allows member status as staff', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin',
        email: 'admin31@church.com',
      })

      const eventTypeId = await asAdmin.mutation(createEventType, {
        name: 'Spiritual Retreat',
        color: '#22c55e',
      })
      const eventId = await asAdmin.mutation(createEvent, {
        name: 'Retreat 31',
        eventTypeId,
        date: Date.now(),
      })

      const attendeeId = await asAdmin.mutation(createAttendee, {
        firstName: 'Regular',
        lastName: 'Member',
        address: '123 Main St',
        status: 'member',
      })

      await asAdmin.mutation(addStaff, { eventId, attendeeId, role: 'Greeter' })

      const extension = await asAdmin.run(async (ctx) => {
        return await getRetreatExtension(ctx, eventId)
      })

      expect(extension?.staff).toHaveLength(1)
    })

    it('allows visitor as staff', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin',
        email: 'admin32@church.com',
      })

      const eventTypeId = await asAdmin.mutation(createEventType, {
        name: 'Spiritual Retreat',
        color: '#22c55e',
      })
      const eventId = await asAdmin.mutation(createEvent, {
        name: 'Retreat 32',
        eventTypeId,
        date: Date.now(),
      })

      const attendeeId = await asAdmin.mutation(createAttendee, {
        firstName: 'Visitor',
        lastName: 'Staff',
        address: '123 Main St',
        status: 'visitor',
      })

      await asAdmin.mutation(addStaff, {
        eventId,
        attendeeId,
        role: 'Volunteer',
      })

      const extension = await asAdmin.run(async (ctx) => {
        return await getRetreatExtension(ctx, eventId)
      })

      expect(extension?.staff).toHaveLength(1)
    })

    it('rejects duplicate staff', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin',
        email: 'admin33@church.com',
      })

      const eventTypeId = await asAdmin.mutation(createEventType, {
        name: 'Spiritual Retreat',
        color: '#22c55e',
      })
      const eventId = await asAdmin.mutation(createEvent, {
        name: 'Retreat 33',
        eventTypeId,
        date: Date.now(),
      })

      const attendeeId = await asAdmin.mutation(createAttendee, {
        firstName: 'Dup',
        lastName: 'Staff',
        address: '123 Main St',
        status: 'member',
      })

      await asAdmin.mutation(addStaff, {
        eventId,
        attendeeId,
        role: 'Staff',
      })

      await expect(
        asAdmin.mutation(addStaff, { eventId, attendeeId, role: 'Other' }),
      ).rejects.toThrow('already staff')
    })
  })

  describe('updateStaff', () => {
    it('updates staff role and responsibilities', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin',
        email: 'admin34@church.com',
      })

      const eventTypeId = await asAdmin.mutation(createEventType, {
        name: 'Spiritual Retreat',
        color: '#22c55e',
      })
      const eventId = await asAdmin.mutation(createEvent, {
        name: 'Retreat 34',
        eventTypeId,
        date: Date.now(),
      })

      const attendeeId = await asAdmin.mutation(createAttendee, {
        firstName: 'Update',
        lastName: 'Staff',
        address: '123 Main St',
        status: 'member',
      })

      await asAdmin.mutation(addStaff, {
        eventId,
        attendeeId,
        role: 'Original Role',
      })

      await asAdmin.mutation(updateStaff, {
        eventId,
        attendeeId,
        role: 'Updated Role',
        responsibilities: 'New responsibilities',
      })

      const extension = await asAdmin.run(async (ctx) => {
        return await getRetreatExtension(ctx, eventId)
      })

      expect(extension?.staff?.[0].role).toBe('Updated Role')
      expect(extension?.staff?.[0].responsibilities).toBe(
        'New responsibilities',
      )
    })

    it('throws error when staff not found', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin',
        email: 'admin35@church.com',
      })

      const eventTypeId = await asAdmin.mutation(createEventType, {
        name: 'Spiritual Retreat',
        color: '#22c55e',
      })
      const eventId = await asAdmin.mutation(createEvent, {
        name: 'Retreat 35',
        eventTypeId,
        date: Date.now(),
      })

      await expect(
        asAdmin.mutation(updateStaff, {
          eventId,
          attendeeId: 'attendees:nonexistent' as any,
        }),
      ).rejects.toThrow('Staff member not found')
    })
  })

  describe('removeStaff', () => {
    it('removes staff member', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin',
        email: 'admin36@church.com',
      })

      const eventTypeId = await asAdmin.mutation(createEventType, {
        name: 'Spiritual Retreat',
        color: '#22c55e',
      })
      const eventId = await asAdmin.mutation(createEvent, {
        name: 'Retreat 36',
        eventTypeId,
        date: Date.now(),
      })

      const attendeeId = await asAdmin.mutation(createAttendee, {
        firstName: 'Remove',
        lastName: 'Staff',
        address: '123 Main St',
        status: 'member',
      })

      await asAdmin.mutation(addStaff, {
        eventId,
        attendeeId,
        role: 'To Remove',
      })

      await asAdmin.mutation(removeStaff, { eventId, attendeeId })

      const extension = await asAdmin.run(async (ctx) => {
        return await getRetreatExtension(ctx, eventId)
      })

      expect(extension?.staff).toHaveLength(0)
    })

    it('throws error when staff not found', async () => {
      const t = convexTest(schema, modules)
      const asAdmin = t.withIdentity({
        name: 'Admin',
        email: 'admin37@church.com',
      })

      const eventTypeId = await asAdmin.mutation(createEventType, {
        name: 'Spiritual Retreat',
        color: '#22c55e',
      })
      const eventId = await asAdmin.mutation(createEvent, {
        name: 'Retreat 37',
        eventTypeId,
        date: Date.now(),
      })

      await expect(
        asAdmin.mutation(removeStaff, {
          eventId,
          attendeeId: 'attendees:nonexistent' as any,
        }),
      ).rejects.toThrow('Staff member not found')
    })
  })
})
