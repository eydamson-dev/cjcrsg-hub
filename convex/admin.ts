import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import type { UserRole } from './lib/authHelpers'

export const promoteUser = mutation({
  args: {
    email: v.string(),
    role: v.union(
      v.literal('super_admin'),
      v.literal('admin'),
      v.literal('moderator'),
      v.literal('user'),
    ),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db.query('users').collect()
    const user = users.find((u: any) => u.email === args.email)

    if (!user) {
      throw new Error(`User not found with email: ${args.email}`)
    }

    // Update role directly on the users table
    await ctx.db.patch(user._id, {
      role: args.role,
    })

    return {
      success: true,
      userId: user._id,
      email: args.email,
      newRole: args.role,
    }
  },
})

export const listUsersWithRoles = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query('users').collect()

    return users.map((user: any) => {
      return {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: (user.role || 'user') as UserRole,
        createdAt: user._creationTime,
      }
    })
  },
})

export const demoteUser = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db.query('users').collect()
    const user = users.find((u: any) => u.email === args.email)

    if (!user) {
      throw new Error(`User not found with email: ${args.email}`)
    }

    // Update role directly on the users table
    await ctx.db.patch(user._id, {
      role: 'user' as UserRole,
    })

    return {
      success: true,
      userId: user._id,
      email: args.email,
      newRole: 'user',
    }
  },
})
