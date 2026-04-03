import { mutation, query } from '../_generated/server'
import { v } from 'convex/values'
import { requireAdmin } from '../lib/authHelpers'

export const linkToUser = mutation({
  args: {
    attendeeId: v.id('attendees'),
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)

    const attendee = await ctx.db.get(args.attendeeId)
    const user = await ctx.db.get(args.userId)

    if (!attendee) {
      throw new Error('Attendee not found')
    }

    if (!user) {
      throw new Error('User not found')
    }

    if (attendee.userId) {
      throw new Error('Attendee is already linked to a user account')
    }

    await ctx.db.patch(args.attendeeId, {
      userId: args.userId,
      updatedAt: Date.now(),
    })

    return {
      success: true,
      attendeeId: args.attendeeId,
      userId: args.userId,
    }
  },
})

export const unlinkFromUser = mutation({
  args: {
    attendeeId: v.id('attendees'),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)

    const attendee = await ctx.db.get(args.attendeeId)

    if (!attendee) {
      throw new Error('Attendee not found')
    }

    if (!attendee.userId) {
      throw new Error('Attendee is not linked to any user account')
    }

    const accounts = await ctx.db
      .query('authAccounts')
      .filter((q) => q.eq(q.field('userId'), attendee.userId))
      .collect()

    if (accounts.length <= 1) {
      throw new Error(
        'Cannot unlink: user needs at least one sign-in method. Add another authentication method first.',
      )
    }

    await ctx.db.patch(args.attendeeId, {
      userId: undefined,
      updatedAt: Date.now(),
    })

    return {
      success: true,
      attendeeId: args.attendeeId,
    }
  },
})

export const listUnlinked = query({
  args: {
    count: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)

    const attendees = await ctx.db
      .query('attendees')
      .filter((q) => q.eq(q.field('userId'), undefined))
      .take(args.count || 50)

    return attendees
  },
})

export const listLinked = query({
  args: {
    count: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)

    const attendees = await ctx.db
      .query('attendees')
      .filter((q) => q.neq(q.field('userId'), undefined))
      .take(args.count || 50)

    return attendees
  },
})

export const getAttendeeUserLink = query({
  args: {
    attendeeId: v.id('attendees'),
  },
  handler: async (ctx, args) => {
    const attendee = await ctx.db.get(args.attendeeId)

    if (!attendee) {
      return null
    }

    if (!attendee.userId) {
      return { linked: false }
    }

    const user = await ctx.db.get(attendee.userId)

    return {
      linked: true,
      userId: attendee.userId,
      userEmail: user?.email,
      userName: user?.name,
    }
  },
})

export const countLinked = query({
  args: {},
  handler: async (ctx) => {
    const attendees = await ctx.db.query('attendees').collect()
    return attendees.filter((a) => a.userId !== undefined).length
  },
})

export const countUnlinked = query({
  args: {},
  handler: async (ctx) => {
    const attendees = await ctx.db.query('attendees').collect()
    return attendees.filter((a) => a.userId === undefined).length
  },
})
