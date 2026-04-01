import { query } from '../_generated/server'
import { v } from 'convex/values'
import { Id } from '../_generated/dataModel'
import { paginationOptsValidator } from 'convex/server'

/**
 * Helper to resolve banner image URL from storage ID or return as-is.
 * - If bannerImage is a Convex storage ID, generates a CDN URL
 * - If bannerImage is an external URL, returns it unchanged
 * - If bannerImage is undefined/null, returns undefined
 */
async function resolveBannerUrl(
  ctx: { storage: { getUrl: (id: Id<'_storage'>) => Promise<string | null> } },
  bannerImage?: string,
): Promise<string | undefined> {
  if (!bannerImage) return undefined
  if (isConvexStorageId(bannerImage)) {
    const url = await ctx.storage.getUrl(bannerImage as Id<'_storage'>)
    return url || bannerImage
  }
  return bannerImage
}

/**
 * Helper to resolve media URLs from storage IDs or return as-is.
 * - If media URL is a Convex storage ID, generates a CDN URL
 * - If media URL is an external URL, returns it unchanged
 */
async function resolveMediaUrls(
  ctx: { storage: { getUrl: (id: Id<'_storage'>) => Promise<string | null> } },
  media?: Array<{ url: string; type: 'image' | 'video'; caption?: string }>,
): Promise<
  Array<{ url: string; type: 'image' | 'video'; caption?: string }> | undefined
> {
  if (!media || media.length === 0) return undefined
  const resolved = await Promise.all(
    media.map(async (item) => {
      if (isConvexStorageId(item.url)) {
        const url = await ctx.storage.getUrl(item.url as Id<'_storage'>)
        return { ...item, url: url || item.url }
      }
      return item
    }),
  )
  return resolved
}

/**
 * Check if a string looks like a Convex storage ID.
 * Convex storage IDs are typically 20+ char alphanumeric strings.
 */
function isConvexStorageId(id: string): boolean {
  return /^[a-z0-9]{20,}$/i.test(id)
}

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
          let q2: any = q
          if (dateFrom !== undefined) q2 = q2.gte('date', dateFrom)
          if (dateTo !== undefined) q2 = q2.lte('date', dateTo)
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
          let q2: any = q
          if (dateFrom !== undefined) q2 = q2.gte('date', dateFrom)
          if (dateTo !== undefined) q2 = q2.lte('date', dateTo)
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

    // Join eventType data and resolve banner URLs for each event
    const pageWithEventTypes = await Promise.all(
      result.page.map(async (event) => {
        const eventType = await ctx.db.get(event.eventTypeId)
        const bannerImage = await resolveBannerUrl(ctx, event.bannerImage)
        return {
          ...event,
          bannerImage,
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
 * - For Spiritual Retreat events, includes retreatData from extension table
 */
export const getById = query({
  args: {
    id: v.id('events'),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.id)
    if (!event) return null

    const eventType = await ctx.db.get(event.eventTypeId)

    // Resolve banner and media URLs from storage IDs
    const bannerImage = await resolveBannerUrl(ctx, event.bannerImage)
    const media = await resolveMediaUrls(ctx, event.media)

    // Fetch extension data for Spiritual Retreat events
    let retreatData = null
    if (eventType?.name === 'Spiritual Retreat') {
      const extension = await ctx.db
        .query('spiritualRetreatEventExtensions')
        .withIndex('by_event', (q) => q.eq('eventId', event._id))
        .first()

      if (extension) {
        retreatData = {
          teachers: extension.teachers,
          lessons: extension.lessons,
          staff: extension.staff,
        }
      }
    }

    return {
      ...event,
      bannerImage,
      media,
      eventType: eventType
        ? { name: eventType.name, color: eventType.color }
        : null,
      retreatData,
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

    if (!event) return null

    const eventType = await ctx.db.get(event.eventTypeId)

    // Get attendance count for display on dashboard
    const attendanceRecords = await ctx.db
      .query('attendanceRecords')
      .withIndex('by_event', (q) => q.eq('eventId', event._id))
      .collect()

    // Resolve banner and media URLs from storage IDs
    const bannerImage = await resolveBannerUrl(ctx, event.bannerImage)
    const media = await resolveMediaUrls(ctx, event.media)

    return {
      ...event,
      bannerImage,
      media,
      eventType: eventType
        ? { name: eventType.name, color: eventType.color }
        : null,
      attendanceCount: attendanceRecords.length,
    }
  },
})

/**
 * List active events (isActive=true) with optional filters and pagination.
 * - For Event History page
 * - Filters: eventTypeId, status, search, dateFrom, dateTo
 * - Uses by_active_date index
 * - Order: date descending (newest first)
 * - Each result includes joined eventType data and attendanceCount
 */
export const listActive = query({
  args: {
    paginationOpts: paginationOptsValidator,
    eventTypeId: v.optional(v.id('eventTypes')),
    status: v.optional(
      v.union(
        v.literal('upcoming'),
        v.literal('active'),
        v.literal('completed'),
        v.literal('cancelled'),
      ),
    ),
    search: v.optional(v.string()),
    dateFrom: v.optional(v.number()),
    dateTo: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { paginationOpts, eventTypeId, status, search, dateFrom, dateTo } =
      args

    // Use by_active_date index: ['isActive', 'date']
    let eventsQuery = ctx.db
      .query('events')
      .withIndex('by_active_date', (q) => {
        let q2: any = q.eq('isActive', true)
        if (dateFrom !== undefined) q2 = q2.gte('date', dateFrom)
        if (dateTo !== undefined) q2 = q2.lte('date', dateTo)
        return q2
      })

    // Apply status filter if provided
    if (status !== undefined) {
      eventsQuery = eventsQuery.filter((q) => q.eq(q.field('status'), status))
    }

    // Apply eventTypeId filter if provided
    if (eventTypeId !== undefined) {
      eventsQuery = eventsQuery.filter((q) =>
        q.eq(q.field('eventTypeId'), eventTypeId),
      )
    }

    // Apply search filter if provided (case-insensitive name search)
    if (search && search.trim().length > 0) {
      const searchLower = search.toLowerCase()
      eventsQuery = eventsQuery.filter((q) =>
        q.and(
          q.gte(q.field('name'), searchLower),
          q.lte(q.field('name'), searchLower + '\uffff'),
        ),
      )
    }

    const result = await eventsQuery.order('desc').paginate(paginationOpts)

    // Join eventType data, attendance count, and resolve banner URLs for each event
    const pageWithDetails = await Promise.all(
      result.page.map(async (event) => {
        const eventType = await ctx.db.get(event.eventTypeId)

        const attendanceRecords = await ctx.db
          .query('attendanceRecords')
          .withIndex('by_event', (q) => q.eq('eventId', event._id))
          .collect()

        const bannerImage = await resolveBannerUrl(ctx, event.bannerImage)

        return {
          ...event,
          bannerImage,
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
 * List archived events (isActive=false) with optional filters and pagination.
 * - Updated version with status filter and search support
 * - Filters: eventTypeId, status, search, dateFrom, dateTo
 * - Uses by_active_date index
 * - Order: date descending (most recent events first)
 * - Each result includes joined eventType data and attendanceCount
 */
export const listArchive = query({
  args: {
    paginationOpts: paginationOptsValidator,
    eventTypeId: v.optional(v.id('eventTypes')),
    status: v.optional(
      v.union(
        v.literal('upcoming'),
        v.literal('active'),
        v.literal('completed'),
        v.literal('cancelled'),
      ),
    ),
    search: v.optional(v.string()),
    dateFrom: v.optional(v.number()),
    dateTo: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { paginationOpts, eventTypeId, status, search, dateFrom, dateTo } =
      args

    // Use by_active_date index: ['isActive', 'date']
    let eventsQuery = ctx.db
      .query('events')
      .withIndex('by_active_date', (q) => {
        let q2: any = q.eq('isActive', false)
        if (dateFrom !== undefined) q2 = q2.gte('date', dateFrom)
        if (dateTo !== undefined) q2 = q2.lte('date', dateTo)
        return q2
      })

    // Apply status filter if provided
    if (status !== undefined) {
      eventsQuery = eventsQuery.filter((q) => q.eq(q.field('status'), status))
    }

    // Apply eventTypeId filter if provided
    if (eventTypeId !== undefined) {
      eventsQuery = eventsQuery.filter((q) =>
        q.eq(q.field('eventTypeId'), eventTypeId),
      )
    }

    // Apply search filter if provided
    if (search && search.trim().length > 0) {
      const searchLower = search.toLowerCase()
      eventsQuery = eventsQuery.filter((q) =>
        q.and(
          q.gte(q.field('name'), searchLower),
          q.lte(q.field('name'), searchLower + '\uffff'),
        ),
      )
    }

    const result = await eventsQuery.order('desc').paginate(paginationOpts)

    // Join eventType data, attendance count, and resolve banner URLs for each event
    const pageWithDetails = await Promise.all(
      result.page.map(async (event) => {
        const eventType = await ctx.db.get(event.eventTypeId)

        const attendanceRecords = await ctx.db
          .query('attendanceRecords')
          .withIndex('by_event', (q) => q.eq('eventId', event._id))
          .collect()

        const bannerImage = await resolveBannerUrl(ctx, event.bannerImage)

        return {
          ...event,
          bannerImage,
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
 * Count active events (isActive=true) with optional filters.
 * - Returns total count for pagination
 * - Supports: eventTypeId, status, search, dateFrom, dateTo
 */
export const countActive = query({
  args: {
    eventTypeId: v.optional(v.id('eventTypes')),
    status: v.optional(
      v.union(
        v.literal('upcoming'),
        v.literal('active'),
        v.literal('completed'),
        v.literal('cancelled'),
      ),
    ),
    search: v.optional(v.string()),
    dateFrom: v.optional(v.number()),
    dateTo: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { eventTypeId, status, search, dateFrom, dateTo } = args

    // Use by_active_date index
    let eventsQuery = ctx.db
      .query('events')
      .withIndex('by_active_date', (q) => {
        let q2: any = q.eq('isActive', true)
        if (dateFrom !== undefined) q2 = q2.gte('date', dateFrom)
        if (dateTo !== undefined) q2 = q2.lte('date', dateTo)
        return q2
      })

    if (status !== undefined) {
      eventsQuery = eventsQuery.filter((q) => q.eq(q.field('status'), status))
    }

    if (eventTypeId !== undefined) {
      eventsQuery = eventsQuery.filter((q) =>
        q.eq(q.field('eventTypeId'), eventTypeId),
      )
    }

    if (search && search.trim().length > 0) {
      const searchLower = search.toLowerCase()
      eventsQuery = eventsQuery.filter((q) =>
        q.and(
          q.gte(q.field('name'), searchLower),
          q.lte(q.field('name'), searchLower + '\uffff'),
        ),
      )
    }

    const events = await eventsQuery.collect()
    return events.length
  },
})

/**
 * Count archived events (isActive=false) with optional filters.
 * - Returns total count for pagination
 * - Supports: eventTypeId, status, search, dateFrom, dateTo
 */
export const countArchived = query({
  args: {
    eventTypeId: v.optional(v.id('eventTypes')),
    status: v.optional(
      v.union(
        v.literal('upcoming'),
        v.literal('active'),
        v.literal('completed'),
        v.literal('cancelled'),
      ),
    ),
    search: v.optional(v.string()),
    dateFrom: v.optional(v.number()),
    dateTo: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { eventTypeId, status, search, dateFrom, dateTo } = args

    // Use by_active_date index
    let eventsQuery = ctx.db
      .query('events')
      .withIndex('by_active_date', (q) => {
        let q2: any = q.eq('isActive', false)
        if (dateFrom !== undefined) q2 = q2.gte('date', dateFrom)
        if (dateTo !== undefined) q2 = q2.lte('date', dateTo)
        return q2
      })

    if (status !== undefined) {
      eventsQuery = eventsQuery.filter((q) => q.eq(q.field('status'), status))
    }

    if (eventTypeId !== undefined) {
      eventsQuery = eventsQuery.filter((q) =>
        q.eq(q.field('eventTypeId'), eventTypeId),
      )
    }

    if (search && search.trim().length > 0) {
      const searchLower = search.toLowerCase()
      eventsQuery = eventsQuery.filter((q) =>
        q.and(
          q.gte(q.field('name'), searchLower),
          q.lte(q.field('name'), searchLower + '\uffff'),
        ),
      )
    }

    const events = await eventsQuery.collect()
    return events.length
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

/**
 * Get the single currently active event filtered by event type.
 * - Uses by_status index with status='active'
 * - Filters by eventTypeId if provided
 * - Returns event with joined eventType and attendanceCount
 * - Returns null if no event of that type is currently active
 * - Used by Sunday Service page to get current event of type "Sunday Service"
 */
export const getCurrentEventByType = query({
  args: {
    eventTypeId: v.id('eventTypes'),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db
      .query('events')
      .withIndex('by_status', (q) => q.eq('status', 'active'))
      .filter((q) =>
        q.and(
          q.eq(q.field('isActive'), true),
          q.eq(q.field('eventTypeId'), args.eventTypeId),
        ),
      )
      .first()

    if (!event) return null

    const eventType = await ctx.db.get(event.eventTypeId)

    // Get attendance count for display on dashboard
    const attendanceRecords = await ctx.db
      .query('attendanceRecords')
      .withIndex('by_event', (q) => q.eq('eventId', event._id))
      .collect()

    // Resolve banner and media URLs from storage IDs
    const bannerImage = await resolveBannerUrl(ctx, event.bannerImage)
    const media = await resolveMediaUrls(ctx, event.media)

    return {
      ...event,
      bannerImage,
      media,
      eventType: eventType
        ? { name: eventType.name, color: eventType.color }
        : null,
      attendanceCount: attendanceRecords.length,
    }
  },
})

/**
 * Get event statistics filtered by event type for the dashboard.
 * - totalEvents: count of all non-archived events of this type
 * - byStatus: { upcoming, active, completed, cancelled } counts for this type
 * - thisMonth: count of events of this type in current calendar month
 * - nextUpcoming: nearest upcoming event of this type after today (name + date)
 * - Used by Sunday Service page to show stats for "Sunday Service" type only
 */
export const getStatsByEventType = query({
  args: {
    eventTypeId: v.id('eventTypes'),
  },
  handler: async (ctx, args) => {
    const allEvents = await ctx.db
      .query('events')
      .filter((q) =>
        q.and(
          q.eq(q.field('isActive'), true),
          q.eq(q.field('eventTypeId'), args.eventTypeId),
        ),
      )
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

    // Get the next upcoming event of this type after today
    const nextUpcoming = await ctx.db
      .query('events')
      .withIndex('by_date_status', (q) => q.gte('date', now))
      .filter((q) =>
        q.and(
          q.eq(q.field('status'), 'upcoming'),
          q.eq(q.field('isActive'), true),
          q.eq(q.field('eventTypeId'), args.eventTypeId),
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
