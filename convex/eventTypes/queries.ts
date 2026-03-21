import { query } from '../_generated/server'
import { v } from 'convex/values'

/**
 * List all event types
 * - Orders by name (ascending)
 * - Filters by isActive status (defaults to true)
 * - Returns full event type documents
 */
export const list = query({
  args: {
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { isActive = true } = args

    // Get all event types and sort by name in memory
    // (Convex doesn't support ordering by non-indexed fields directly)
    const eventTypes = await ctx.db
      .query('eventTypes')
      .withIndex('by_active', (q) => q.eq('isActive', isActive))
      .collect()

    return eventTypes.sort((a, b) => a.name.localeCompare(b.name))
  },
})

/**
 * Get single event type by ID
 * - Returns null if not found
 * - Returns full event type document
 */
export const getById = query({
  args: {
    id: v.id('eventTypes'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

/**
 * Check if event type has associated events
 * - Returns count of events using this type
 * - Returns isDeletable flag (true if count === 0)
 * - Used before deletion to prevent orphaned events
 */
export const checkAssociations = query({
  args: {
    id: v.id('eventTypes'),
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query('events')
      .withIndex('by_event_type', (q) => q.eq('eventTypeId', args.id))
      .collect()

    return {
      eventCount: events.length,
      isDeletable: events.length === 0,
      events: events.map((e) => ({ _id: e._id, name: e.name })),
    }
  },
})
