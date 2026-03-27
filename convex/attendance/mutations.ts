import { mutation } from '../_generated/server'
import { v } from 'convex/values'

/**
 * Check in a single attendee to an event.
 * - Requires authentication — sets checkedInBy to current user
 * - Validates event and attendee exist
 * - Checks for duplicate check-in using by_event_attendee index
 * - Sets checkedInvokedAt timestamp and optional invitedBy
 * - Returns created attendance record ID
 */
export const checkIn = mutation({
  args: {
    eventId: v.id('events'),
    attendeeId: v.id('attendees'),
    invitedBy: v.optional(v.id('attendees')),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }
    const userId = identity.subject.split('|')[0] as string

    const event = await ctx.db.get(args.eventId)
    if (!event) {
      throw new Error('Event not found')
    }

    const attendee = await ctx.db.get(args.attendeeId)
    if (!attendee) {
      throw new Error('Attendee not found')
    }

    if (args.invitedBy) {
      const inviter = await ctx.db.get(args.invitedBy)
      if (!inviter) {
        throw new Error('Inviter not found')
      }
    }

    const existing = await ctx.db
      .query('attendanceRecords')
      .withIndex('by_event_attendee', (q) =>
        q.eq('eventId', args.eventId).eq('attendeeId', args.attendeeId),
      )
      .first()

    if (existing) {
      throw new Error('Attendee is already checked in to this event')
    }

    const id = await ctx.db.insert('attendanceRecords', {
      eventId: args.eventId,
      attendeeId: args.attendeeId,
      checkedInAt: Date.now(),
      checkedInBy: userId as string,
      invitedBy: args.invitedBy,
      notes: args.notes,
    })

    return id
  },
})

/**
 * Remove an attendee from an event (hard delete).
 * - Requires authentication
 * - Validates attendance record exists
 * - Permanently deletes the record
 * - No soft delete or undo
 */
export const unCheckIn = mutation({
  args: {
    attendanceRecordId: v.id('attendanceRecords'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    const record = await ctx.db.get(args.attendanceRecordId)
    if (!record) {
      throw new Error('Attendance record not found')
    }

    await ctx.db.delete(args.attendanceRecordId)
  },
})

/**
 * Bulk check in multiple attendees at once.
 * - For each attendee: checks for duplicate, creates record if not exists
 * - Returns successCount and skippedCount
 * - Frontend shows single toast: "X attendees checked in (Y already checked in)"
 */
export const bulkCheckIn = mutation({
  args: {
    eventId: v.id('events'),
    attendees: v.array(
      v.object({
        attendeeId: v.id('attendees'),
        invitedBy: v.optional(v.id('attendees')),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }
    const userId = identity.subject.split('|')[0] as string

    const event = await ctx.db.get(args.eventId)
    if (!event) {
      throw new Error('Event not found')
    }

    let successCount = 0
    let skippedCount = 0
    const now = Date.now()

    for (const item of args.attendees) {
      const attendee = await ctx.db.get(item.attendeeId)
      if (!attendee) continue

      if (item.invitedBy) {
        const inviter = await ctx.db.get(item.invitedBy)
        if (!inviter) continue
      }

      const existing = await ctx.db
        .query('attendanceRecords')
        .withIndex('by_event_attendee', (q) =>
          q.eq('eventId', args.eventId).eq('attendeeId', item.attendeeId),
        )
        .first()

      if (existing) {
        skippedCount++
        continue
      }

      await ctx.db.insert('attendanceRecords', {
        eventId: args.eventId,
        attendeeId: item.attendeeId,
        checkedInAt: now,
        checkedInBy: userId as string,
        invitedBy: item.invitedBy,
      })

      successCount++
    }

    return { successCount, skippedCount }
  },
})

/**
 * Update the inviter for an existing attendance record.
 * - Requires authentication
 * - Validates attendance record exists
 * - Validates inviter exists (if provided)
 * - Updates invitedBy field (or removes it if null)
 * - Returns updated attendance record ID
 */
export const updateInviter = mutation({
  args: {
    attendanceRecordId: v.id('attendanceRecords'),
    invitedBy: v.optional(v.id('attendees')),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    const record = await ctx.db.get(args.attendanceRecordId)
    if (!record) {
      throw new Error('Attendance record not found')
    }

    // Validate inviter exists if provided
    if (args.invitedBy) {
      const inviter = await ctx.db.get(args.invitedBy)
      if (!inviter) {
        throw new Error('Inviter not found')
      }
    }

    await ctx.db.patch(args.attendanceRecordId, {
      invitedBy: args.invitedBy,
    })

    return args.attendanceRecordId
  },
})
