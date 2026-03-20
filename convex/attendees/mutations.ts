import { mutation } from '../_generated/server'
import { v } from 'convex/values'
import { createAttendeeArgs, updateAttendeeArgs } from './validators'

export const create = mutation({
  args: createAttendeeArgs,
  handler: async (ctx, args) => {
    const now = Date.now()
    const id = await ctx.db.insert('attendees', {
      ...args,
      createdAt: now,
      updatedAt: now,
    })
    return id
  },
})

export const update = mutation({
  args: updateAttendeeArgs,
  handler: async (ctx, args) => {
    const { id, ...updates } = args
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    })
  },
})

export const archive = mutation({
  args: {
    id: v.id('attendees'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: 'inactive',
      updatedAt: Date.now(),
    })
  },
})
