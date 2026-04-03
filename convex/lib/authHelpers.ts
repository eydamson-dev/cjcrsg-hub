import { query } from '../_generated/server'
import { v } from 'convex/values'

const ROLE_HIERARCHY: Record<string, number> = {
  super_admin: 4,
  admin: 3,
  moderator: 2,
  user: 1,
}

export type UserRole = 'super_admin' | 'admin' | 'moderator' | 'user'

async function getUserIdFromAuth(ctx: any): Promise<string | null> {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) return null

  const subject = identity.subject as string
  return subject.includes('|') ? subject.split('|')[0] : subject
}

export async function requireRole(
  ctx: any,
  minRole: UserRole,
): Promise<{ userId: string; role: UserRole }> {
  const userId = await getUserIdFromAuth(ctx)
  if (!userId) {
    throw new Error('Not authenticated')
  }

  // Query users table directly - role is now a field on users
  const user = await ctx.db.get(userId as any)
  if (!user) {
    throw new Error('User not found')
  }

  const userRole: UserRole = (user as any).role || 'user'

  if (ROLE_HIERARCHY[userRole] < ROLE_HIERARCHY[minRole]) {
    throw new Error(
      `Insufficient permissions. Required: ${minRole}, current: ${userRole}`,
    )
  }

  return { userId, role: userRole }
}

export async function requireAdmin(ctx: any) {
  return requireRole(ctx, 'admin')
}

export async function requireSuperAdmin(ctx: any) {
  return requireRole(ctx, 'super_admin')
}

export const getCurrentUserRole = query({
  args: {},
  handler: async (ctx): Promise<UserRole | null> => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    const userId = identity.subject as string
    const cleanUserId = userId.includes('|') ? userId.split('|')[0] : userId

    const user = await ctx.db.get(cleanUserId as any)
    if (!user) return null

    return (user as any).role || 'user'
  },
})

export const hasRole = query({
  args: {
    role: v.union(
      v.literal('super_admin'),
      v.literal('admin'),
      v.literal('moderator'),
      v.literal('user'),
    ),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return false

    const userId = identity.subject as string
    const cleanUserId = userId.includes('|') ? userId.split('|')[0] : userId

    const user = await ctx.db.get(cleanUserId as any)
    if (!user) return false

    const userRole: UserRole = (user as any).role || 'user'

    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[args.role]
  },
})

export const getUserIdByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args): Promise<string | null> => {
    const users = await ctx.db.query('users').collect()
    const user = users.find((u: any) => u.email === args.email)
    return user ? user._id : null
  },
})
