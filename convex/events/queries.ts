import { query } from '../_generated/server'
import { v } from 'convex/values'
import { paginationOptsValidator } from 'convex/server'

/**
 * List events with optional filters and pagination.
 * - Filters: status, eventTypeId, dateFrom, dateTo
 * - Uses by_date_status index when status filter is provided
 * - Uses by_date index for date-range-only queries
 * - Order: date descending (newest first)
 * - Each result includes joined eventType data: { name, color }
 */
export const list = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(
      v.union(
        v.literal('upcoming'),
        v.literal('active'),
        v.literal('completed'),
        v.literal('cancelled'),
      ),
    ),
    eventTypeId: v.optional(v.id('eventTypes')),
    dateFrom: v.optional(v.number()),
    dateTo: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { paginationOpts, status, eventTypeId, dateFrom, dateTo } = args

    let eventsQuery

    if (status !== undefined) {
      // Use by_date_status index when filtering by status
      eventsQuery = ctx.db
        .query('events')
        .withIndex('by_date_status', (q) => {
          let q2 = q
          if (dateFrom !== undefined) q2 = q2.gte('date', dateFrom) as typeof q
          if (dateTo !== undefined) q2 = q2.lte('date', dateTo) as typeof q
          return q2
        })
        .filter((q) =>
          q.and(
            q.eq(q.field('status'), status),
            q.eq(q.field('isActive'), true),
          ),
        )
    } else if (dateFrom !== undefined || dateTo !== undefined) {
      // Use by_date index for date-range-only queries
      eventsQuery = ctx.db
        .query('events')
        .withIndex('by_date', (q) => {
          let q2 = q
          if (dateFrom !== undefined) q2 = q2.gte('date', dateFrom) as typeof q
          if (dateTo !== undefined) q2 = q2.lte('date', dateTo) as typeof q
          return q2
        })
        .filter((q) => q.eq(q.field('isActive'), true))
    } else {
      eventsQuery = ctx.db
        .query('events')
        .withIndex('by_date')
        .filter((q) => q.eq(q.field('isActive'), true))
    }

    // Apply eventTypeId filter if provided
    if (eventTypeId !== undefined) {
      eventsQuery = eventsQuery.filter((q) =>
        q.eq(q.field('eventTypeId'), eventTypeId),
      )
    }

    const result = await eventsQuery.order('desc').paginate(paginationOpts)

    // Join eventType data for each event
    const pageWithEventTypes = await Promise.all(
      result.page.map(async (event) => {
        const eventType = await ctx.db.get(event.eventTypeId)
        return {
          ...event,
          eventType: eventType
            ? { name: eventType.name, color: eventType.color }
            : null,
        }
      }),
    )

    return { ...result, page: pageWithEventTypes }
  },
})

/**
 * Get a single event by ID with joined eventType data.
 * - Returns event with eventType: { name, color }
 * - Returns null if not found
 */
export const getById = query({
  args: {
    id: v.id('events'),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.id)
    if (!event) return null

    const eventType = await ctx.db.get(event.eventTypeId)

    return {
      ...event,
      eventType: eventType
        ? { name: eventType.name, color: eventType.color }
        : null,
    }
  },
})

/**
 * Get the single currently active event.
 * - Uses by_status index with status='active'
 * - Returns event with joined eventType and attendanceCount
 * - Returns null if no event is currently active
 * - UI uses this to decide: show dashboard or show EmptyEventState
 */
export const getCurrentEvent = query({
  args: {},
  handler: async (ctx) => {
    const event = await ctx.db
      .query('events')
      .withIndex('by_status', (q) => q.eq('status', 'active'))
      .filter((q) => q.eq(q.field('isActive'), true))
      .first()

      console.log({event})

    if (!event) return null

    const eventType = await ctx.db.get(event.eventTypeId)

    // Get attendance count for display on dashboard
    const attendanceRecords = await ctx.db
      .query('attendanceRecords')
      .withIndex('by_event', (q) => q.eq('eventId', event._id))
      .collect()

    return {
      ...event,
      eventType: eventType
        ? { name: eventType.name, color: eventType.color }
        : null,
      attendanceCount: attendanceRecords.length,
    }
  },
})

/**
 * Get completed events for the archive page.
 * - Always filters status='completed'
 * - Optional additional filters: eventTypeId, dateFrom, dateTo
 * - Order: date descending (most recent past events first)
 * - Includes joined eventType: { name, color } and attendanceCount
 */
export const listArchive = query({
  args: {
    paginationOpts: paginationOptsValidator,
    eventTypeId: v.optional(v.id('eventTypes')),
    dateFrom: v.optional(v.number()),
    dateTo: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { paginationOpts, eventTypeId, dateFrom, dateTo } = args

    let eventsQuery = ctx.db
      .query('events')
      .withIndex('by_date_status', (q) => {
        let q2 = q
        if (dateFrom !== undefined) q2 = q2.gte('date', dateFrom) as typeof q
        if (dateTo !== undefined) q2 = q2.lte('date', dateTo) as typeof q
        return q2
      })
      .filter((q) =>
        q.and(
          q.eq(q.field('status'), 'completed'),
          q.eq(q.field('isActive'), true),
        ),
      )

    if (eventTypeId !== undefined) {
      eventsQuery = eventsQuery.filter((q) =>
        q.eq(q.field('eventTypeId'), eventTypeId),
      )
    }

    const result = await eventsQuery.order('desc').paginate(paginationOpts)

    // Join eventType data and attendance count for each event
    const pageWithDetails = await Promise.all(
      result.page.map(async (event) => {
        const eventType = await ctx.db.get(event.eventTypeId)

        const attendanceRecords = await ctx.db
          .query('attendanceRecords')
          .withIndex('by_event', (q) => q.eq('eventId', event._id))
          .collect()

        return {
          ...event,
          eventType: eventType
            ? { name: eventType.name, color: eventType.color }
            : null,
          attendanceCount: attendanceRecords.length,
        }
      }),
    )

    return { ...result, page: pageWithDetails }
  },
})

/**
 * Get event statistics for the dashboard.
 * - totalEvents: count of all non-archived events
 * - byStatus: { upcoming, active, completed, cancelled } counts
 * - thisMonth: count of events in current calendar month
 * - nextUpcoming: nearest upcoming event after today (name + date)
 */
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const allEvents = await ctx.db
      .query('events')
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect()

    const byStatus = {
      upcoming: 0,
      active: 0,
      completed: 0,
      cancelled: 0,
    }

    const now = Date.now()
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    const startOfMonthTs = startOfMonth.getTime()

    let thisMonth = 0

    for (const event of allEvents) {
      byStatus[event.status]++
      if (event.date >= startOfMonthTs && event.date <= now) {
        thisMonth++
      }
    }

    // Get the next upcoming event after today
    const nextUpcoming = await ctx.db
      .query('events')
      .withIndex('by_date_status', (q) => q.gte('date', now))
      .filter((q) =>
        q.and(
          q.eq(q.field('status'), 'upcoming'),
          q.eq(q.field('isActive'), true),
        ),
      )
      .order('asc')
      .first()

    return {
      totalEvents: allEvents.length,
      byStatus,
      thisMonth,
      nextUpcoming: nextUpcoming
        ? { name: nextUpcoming.name, date: nextUpcoming.date }
        : null,
    }
  },
})
