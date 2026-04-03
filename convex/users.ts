import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import type { Id } from './_generated/dataModel'
import type { UserRole } from './lib/authHelpers'

// Query to get current authenticated user with role
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return null
    }

    // Parse userId from subject (format: "userId|accountId")
    const userId = identity.subject.split('|')[0] as Id<'users'>
    const user = await ctx.db.get(userId)

    if (!user) {
      return null
    }

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: (user.role || 'user') as UserRole,
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

// Get user by ID
export const getById = query({
  args: {
    id: v.id('users'),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id)
    if (!user) {
      return null
    }

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: (user.role || 'user') as UserRole,
    }
  },
})

// List all users (for admin linking)
export const listAll = query({
  args: {
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db.query('users').collect()

    const filtered = users.filter((user) => {
      if (args.search) {
        const search = args.search.toLowerCase()
        return (
          user.email?.toLowerCase().includes(search) ||
          user.name?.toLowerCase().includes(search)
        )
      }
      return true
    })

    return filtered.map((user) => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: (user.role || 'user') as UserRole,
    }))
  },
})
