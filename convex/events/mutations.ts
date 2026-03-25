import { mutation } from '../_generated/server'
import { v } from 'convex/values'
import { isValidImageUrl, mediaItemValidator, eventStatus } from './validators'

/**
 * Create a new event.
 * - Required: name (min 2 chars), eventTypeId, date
 * - Optional: description, startTime, endTime, location, bannerImage, media
 * - status always defaults to 'upcoming' — not accepted from input
 * - Validates eventTypeId exists and is active
 * - Validates bannerImage URL format if provided
 * - Validates each media[].url format if provided
 * - Validates endTime > startTime if both provided
 * - Sets createdAt, updatedAt to Date.now(), isActive: true
 * - Returns created event _id
 */
export const create = mutation({
  args: {
    name: v.string(),
    eventTypeId: v.id('eventTypes'),
    description: v.optional(v.string()),
    date: v.number(),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    location: v.optional(v.string()),
    bannerImage: v.optional(v.string()),
    media: v.optional(v.array(mediaItemValidator)),
  },
  handler: async (ctx, args) => {
    const trimmedName = args.name.trim()
    if (trimmedName.length < 2) {
      throw new Error('Event name must be at least 2 characters')
    }

    // Validate eventTypeId exists and is active
    const eventType = await ctx.db.get(args.eventTypeId)
    if (!eventType) {
      throw new Error('Event type not found')
    }
    if (!eventType.isActive) {
      throw new Error('Event type is inactive')
    }

    // Validate bannerImage format if provided
    if (args.bannerImage !== undefined && !isValidImageUrl(args.bannerImage)) {
      throw new Error(
        'Invalid banner image URL. Must be a valid image file URL or data URI.',
      )
    }

    // Validate each media item URL if provided
    if (args.media !== undefined) {
      for (const item of args.media) {
        if (!isValidImageUrl(item.url)) {
          throw new Error(
            `Invalid media URL: ${item.url}. Must be a valid image/video file URL or data URI.`,
          )
        }
      }
    }

    // Validate endTime > startTime if both provided
    if (args.startTime !== undefined && args.endTime !== undefined) {
      if (args.endTime <= args.startTime) {
        throw new Error('End time must be after start time')
      }
    }

    const now = Date.now()
    const id = await ctx.db.insert('events', {
      name: trimmedName,
      eventTypeId: args.eventTypeId,
      description: args.description,
      date: args.date,
      startTime: args.startTime,
      endTime: args.endTime,
      location: args.location,
      bannerImage: args.bannerImage,
      media: args.media,
      // Always default to 'upcoming' regardless of date
      status: 'upcoming',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    })

    return id
  },
})

/**
 * Partially update an event.
 * - All fields optional
 * - Validates event exists
 * - Validates bannerImage format if provided
 * - Validates eventTypeId exists and is active if provided
 * - Validates endTime > startTime if both provided
 * - If status is being changed to 'active', checks no other event is active
 * - Always updates updatedAt: Date.now()
 */
export const update = mutation({
  args: {
    id: v.id('events'),
    name: v.optional(v.string()),
    eventTypeId: v.optional(v.id('eventTypes')),
    description: v.optional(v.string()),
    date: v.optional(v.number()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    location: v.optional(v.string()),
    bannerImage: v.optional(v.string()),
    media: v.optional(v.array(mediaItemValidator)),
    status: v.optional(eventStatus),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args

    const existing = await ctx.db.get(id)
    if (!existing) {
      throw new Error('Event not found')
    }

    const patchData: Record<string, unknown> = {}

    if (updates.name !== undefined) {
      const trimmedName = updates.name.trim()
      if (trimmedName.length < 2) {
        throw new Error('Event name must be at least 2 characters')
      }
      patchData.name = trimmedName
    }

    if (updates.eventTypeId !== undefined) {
      const eventType = await ctx.db.get(updates.eventTypeId)
      if (!eventType) throw new Error('Event type not found')
      if (!eventType.isActive) throw new Error('Event type is inactive')
      patchData.eventTypeId = updates.eventTypeId
    }

    if (updates.bannerImage !== undefined) {
      if (!isValidImageUrl(updates.bannerImage)) {
        throw new Error(
          'Invalid banner image URL. Must be a valid image file URL or data URI.',
        )
      }
      patchData.bannerImage = updates.bannerImage
    }

    if (updates.media !== undefined) {
      for (const item of updates.media) {
        if (!isValidImageUrl(item.url)) {
          throw new Error(
            `Invalid media URL: ${item.url}. Must be a valid image/video file URL or data URI.`,
          )
        }
      }
      patchData.media = updates.media
    }

    // Validate endTime > startTime — use updated or existing values
    const startTime = updates.startTime ?? existing.startTime
    const endTime = updates.endTime ?? existing.endTime
    if (startTime !== undefined && endTime !== undefined) {
      if (endTime <= startTime) {
        throw new Error('End time must be after start time')
      }
    }

    if (updates.status === 'active') {
      // Ensure no other event is currently active
      const activeEvent = await ctx.db
        .query('events')
        .withIndex('by_status', (q) => q.eq('status', 'active'))
        .filter((q) =>
          q.and(q.eq(q.field('isActive'), true), q.neq(q.field('_id'), id)),
        )
        .first()

      if (activeEvent) {
        throw new Error(
          'Another event is currently active. Complete or cancel it first.',
        )
      }
    }

    // Apply remaining simple field updates
    if (updates.description !== undefined)
      patchData.description = updates.description
    if (updates.date !== undefined) patchData.date = updates.date
    if (updates.startTime !== undefined) patchData.startTime = updates.startTime
    if (updates.endTime !== undefined) patchData.endTime = updates.endTime
    if (updates.location !== undefined) patchData.location = updates.location
    if (updates.status !== undefined) patchData.status = updates.status

    await ctx.db.patch(id, { ...patchData, updatedAt: Date.now() })
  },
})

/**
 * Start an event — transition to 'active'.
 * - Validates event exists
 * - Validates event is currently 'upcoming' or 'cancelled'
 * - Checks no other event is currently active
 * - Sets status='active', updatedAt=Date.now()
 */
export const startEvent = mutation({
  args: {
    id: v.id('events'),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.id)
    if (!event) throw new Error('Event not found')

    if (event.status === 'active') {
      throw new Error('Event is already active')
    }
    if (event.status === 'completed') {
      throw new Error('Cannot start a completed event')
    }

    // Check no other event is currently active
    const activeEvent = await ctx.db
      .query('events')
      .withIndex('by_status', (q) => q.eq('status', 'active'))
      .filter((q) =>
        q.and(q.eq(q.field('isActive'), true), q.neq(q.field('_id'), args.id)),
      )
      .first()

    if (activeEvent) {
      throw new Error(
        'Another event is currently active. Complete or cancel it first.',
      )
    }

    await ctx.db.patch(args.id, {
      status: 'active',
      updatedAt: Date.now(),
    })
  },
})

/**
 * Complete an event — transition to 'completed'.
 * - Validates event exists
 * - Validates event is currently 'active'
 * - Sets status='completed', completedAt=Date.now(), updatedAt=Date.now()
 */
export const completeEvent = mutation({
  args: {
    id: v.id('events'),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.id)
    if (!event) throw new Error('Event not found')

    if (event.status !== 'active') {
      throw new Error('Only active events can be completed')
    }

    const now = Date.now()
    await ctx.db.patch(args.id, {
      status: 'completed',
      completedAt: now,
      updatedAt: now,
    })
  },
})

/**
 * Cancel an event.
 * - Validates event exists
 * - Validates event is 'upcoming' or 'active' (cannot cancel completed/already cancelled)
 * - Sets status='cancelled', updatedAt=Date.now()
 */
export const cancelEvent = mutation({
  args: {
    id: v.id('events'),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.id)
    if (!event) throw new Error('Event not found')

    if (event.status === 'completed') {
      throw new Error('Cannot cancel a completed event')
    }
    if (event.status === 'cancelled') {
      throw new Error('Event is already cancelled')
    }

    await ctx.db.patch(args.id, {
      status: 'cancelled',
      updatedAt: Date.now(),
    })
  },
})

/**
 * Archive an event — soft delete (hide from all lists).
 * - Validates event exists
 * - Sets isActive=false, updatedAt=Date.now()
 * - Event remains in database but filtered out of all queries
 */
export const archive = mutation({
  args: {
    id: v.id('events'),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.id)
    if (!event) throw new Error('Event not found')

    await ctx.db.patch(args.id, {
      isActive: false,
      updatedAt: Date.now(),
    })
  },
})
