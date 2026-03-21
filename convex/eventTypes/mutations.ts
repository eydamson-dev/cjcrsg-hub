import { mutation } from '../_generated/server'
import { v } from 'convex/values'

/**
 * Create a new event type
 * - name: Required string (will be trimmed)
 * - description: Optional string
 * - color: Optional hex color string
 * - isActive: Auto-set to true
 * - createdAt: Auto-set to current timestamp
 */
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const trimmedName = args.name.trim()

    if (trimmedName.length === 0) {
      throw new Error('Event type name is required')
    }

    const now = Date.now()
    const id = await ctx.db.insert('eventTypes', {
      name: trimmedName,
      description: args.description,
      color: args.color,
      isActive: true,
      createdAt: now,
    })

    return id
  },
})

/**
 * Update an existing event type
 * - All fields are optional
 * - Only provided fields will be updated
 * - Throws error if event type not found
 */
export const update = mutation({
  args: {
    id: v.id('eventTypes'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args

    // Check if event type exists
    const existing = await ctx.db.get(id)
    if (!existing) {
      throw new Error('Event type not found')
    }

    // Build update object with only provided fields
    const updateData: Partial<typeof existing> = {}

    if (updates.name !== undefined) {
      const trimmedName = updates.name.trim()
      if (trimmedName.length === 0) {
        throw new Error('Event type name is required')
      }
      updateData.name = trimmedName
    }

    if (updates.description !== undefined) {
      updateData.description = updates.description
    }

    if (updates.color !== undefined) {
      updateData.color = updates.color
    }

    await ctx.db.patch(id, updateData)
  },
})

/**
 * Delete an event type
 * - Checks if event type has associated events
 * - Throws error if events are using this type
 * - Permanently deletes the event type if no associations
 */
export const remove = mutation({
  args: {
    id: v.id('eventTypes'),
  },
  handler: async (ctx, args) => {
    // Check if event type exists
    const existing = await ctx.db.get(args.id)
    if (!existing) {
      throw new Error('Event type not found')
    }

    // Check for associated events
    const events = await ctx.db
      .query('events')
      .withIndex('by_event_type', (q) => q.eq('eventTypeId', args.id))
      .collect()

    if (events.length > 0) {
      throw new Error('Cannot delete event type with associated events')
    }

    // Delete the event type
    await ctx.db.delete(args.id)
  },
})
