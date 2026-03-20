import { mutation } from '../_generated/server'
import { v } from 'convex/values'
import { createAttendeeArgs, updateAttendeeArgs } from './validators'

function buildSearchField(args: {
  firstName: string
  lastName: string
  email?: string
  address?: string
}): string {
  return [args.firstName, args.lastName, args.email, args.address]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

export const create = mutation({
  args: createAttendeeArgs,
  handler: async (ctx, args) => {
    const now = Date.now()
    const searchField = buildSearchField(args)
    const id = await ctx.db.insert('attendees', {
      ...args,
      searchField,
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

    const existing = await ctx.db.get(id)
    if (!existing) {
      throw new Error('Attendee not found')
    }

    const searchFieldsChanged =
      updates.firstName !== undefined ||
      updates.lastName !== undefined ||
      updates.email !== undefined ||
      updates.address !== undefined

    let searchField = existing.searchField
    if (searchFieldsChanged) {
      searchField = buildSearchField({
        firstName: updates.firstName ?? existing.firstName,
        lastName: updates.lastName ?? existing.lastName,
        email: updates.email ?? existing.email,
        address: updates.address ?? existing.address,
      })
    }

    await ctx.db.patch(id, {
      ...updates,
      searchField,
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
