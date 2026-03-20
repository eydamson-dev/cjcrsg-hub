import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import type { Id } from './_generated/dataModel'

// Query to get current authenticated user
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return null
    }

    // The subject field contains "userId|accountId", extract just the userId
    const userId = identity.subject.split('|')[0] as Id<'users'>
    const user = await ctx.db.get(userId)

    if (!user) {
      return null
    }

    return {
      name: user.name,
      email: user.email,
      image: user.image,
    }
  },
})

// Delete user from the database
export const deleteUser = mutation({
  args: {
    id: v.id('users'),
  },
  handler: async (ctx, args) => {
    // Check if the current user is authenticated
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    // Delete the user from the database
    await ctx.db.delete(args.id)

    console.log('Deleted user with id:', args.id)
  },
})
