import { query } from '../_generated/server'
import { v } from 'convex/values'
import type { Id } from '../_generated/dataModel'
import { paginationOptsValidator } from 'convex/server'

/**
 * Get all attendance records for a specific event.
 * - Uses by_event index (eventId + checkedInAt)
 * - For each record, joins: attendee data + invitedBy attendee
 * - Order: checkedInAt descending (most recent first)
 * - Returns paginated results
 */
export const getByEvent = query({
  args: {
    eventId: v.id('events'),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const { eventId, paginationOpts } = args

    const result = await ctx.db
      .query('attendanceRecords')
      .withIndex('by_event', (q) => q.eq('eventId', eventId))
      .order('desc')
      .paginate(paginationOpts)

    // Join attendee and inviter data for each record
    const pageWithDetails = await Promise.all(
      result.page.map(async (record) => {
        const attendee = await ctx.db.get(record.attendeeId)
        let inviter = null
        if (record.invitedBy) {
          inviter = await ctx.db.get(record.invitedBy)
        }

        return {
          ...record,
          attendee: attendee
            ? {
                _id: attendee._id,
                firstName: attendee.firstName,
                lastName: attendee.lastName,
                status: attendee.status,
                email: attendee.email,
                phone: attendee.phone,
              }
            : null,
          inviter: inviter
            ? {
                _id: inviter._id,
                firstName: inviter.firstName,
                lastName: inviter.lastName,
              }
            : null,
        }
      }),
    )

    return { ...result, page: pageWithDetails }
  },
})

/**
 * Get attendance statistics for a specific event.
 * - total: total attendance records for this event
 * - members: count where attendee.status = 'member'
 * - visitors: count where attendee.status = 'visitor'
 * - withInvite: count where invitedBy is set
 */
export const getStats = query({
  args: {
    eventId: v.id('events'),
  },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query('attendanceRecords')
      .withIndex('by_event', (q) => q.eq('eventId', args.eventId))
      .collect()

    let members = 0
    let visitors = 0
    let withInvite = 0

    for (const record of records) {
      const attendee = await ctx.db.get(record.attendeeId)
      if (attendee) {
        if (attendee.status === 'member') {
          members++
        } else if (attendee.status === 'visitor') {
          visitors++
        }
      }
      if (record.invitedBy) {
        withInvite++
      }
    }

    return {
      total: records.length,
      members,
      visitors,
      withInvite,
    }
  },
})

/**
 * Get attendance history for a specific attendee.
 * - Uses by_attendee index (attendeeId + checkedInAt)
 * - For each record, joins event data + eventType
 * - Order: checkedInAt descending (most recent first)
 * - Returns paginated results
 */
export const getByAttendee = query({
  args: {
    attendeeId: v.id('attendees'),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const { attendeeId, paginationOpts } = args

    const result = await ctx.db
      .query('attendanceRecords')
      .withIndex('by_attendee', (q) => q.eq('attendeeId', attendeeId))
      .order('desc')
      .paginate(paginationOpts)

    // Join event and eventType data for each record
    const pageWithDetails = await Promise.all(
      result.page.map(async (record) => {
        const event = await ctx.db.get(record.eventId)
        let eventType = null
        if (event) {
          const et = await ctx.db.get(event.eventTypeId)
          eventType = et ? { name: et.name, color: et.color } : null
        }

        return {
          ...record,
          event: event
            ? {
                _id: event._id,
                name: event.name,
                date: event.date,
                startTime: event.startTime,
                location: event.location,
                status: event.status,
              }
            : null,
          eventType,
        }
      }),
    )

    return { ...result, page: pageWithDetails }
  },
})

/**
 * Get top inviters for a specific event.
 * - Groups attendance records by inviter
 * - Returns array with inviter details and count
 * - Order: count descending (top inviters first)
 */
export const getInviters = query({
  args: {
    eventId: v.id('events'),
  },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query('attendanceRecords')
      .withIndex('by_event', (q) => q.eq('eventId', args.eventId))
      .collect()

    // Group by inviter
    const inviterCounts = new Map<Id<'attendees'>, number>()

    for (const record of records) {
      if (record.invitedBy) {
        const current = inviterCounts.get(record.invitedBy) || 0
        inviterCounts.set(record.invitedBy, current + 1)
      }
    }

    // Get inviter details and sort by count
    const inviters = await Promise.all(
      Array.from(inviterCounts.entries()).map(async ([inviterId, count]) => {
        const inviter = await ctx.db.get(inviterId)
        return {
          inviter: inviter
            ? {
                _id: inviter._id,
                firstName: inviter.firstName,
                lastName: inviter.lastName,
              }
            : null,
          count,
        }
      }),
    )

    // Sort by count descending
    return inviters
      .filter((item) => item.inviter !== null)
      .sort((a, b) => b.count - a.count)
  },
})
