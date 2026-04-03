import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import type { Id } from './_generated/dataModel'

export interface AuthMethodInfo {
  id: string
  provider: string
  isPassword: boolean
  linkedAt: number
}

export interface AccountInfo {
  userId: string
  name?: string
  email?: string
  image?: string
  attendeeProfile: {
    attendeeId: string
    firstName: string
    lastName: string
    status: string
    joinDate?: number
  } | null
  authMethods: AuthMethodInfo[]
}

export const getAccountInfo = query({
  args: {},
  handler: async (ctx): Promise<AccountInfo | null> => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return null
    }

    const userId = identity.subject.split('|')[0] as Id<'users'>
    const user = await ctx.db.get(userId)
    if (!user) {
      return null
    }

    const accounts = await ctx.db
      .query('authAccounts')
      .filter((q) => q.eq(q.field('userId'), userId))
      .collect()

    const authMethods: AuthMethodInfo[] = accounts.map((account) => ({
      id: account._id,
      provider: account.provider,
      isPassword: account.provider === 'password',
      linkedAt: account._creationTime,
    }))

    const attendees = await ctx.db
      .query('attendees')
      .filter((q) => q.eq(q.field('userId'), userId))
      .collect()

    const attendee = attendees[0] ?? null

    const attendeeProfile = attendee
      ? {
          attendeeId: attendee._id,
          firstName: attendee.firstName,
          lastName: attendee.lastName,
          status: attendee.status,
          joinDate: attendee.joinDate,
        }
      : null

    return {
      userId: user._id,
      name: user.name ?? undefined,
      email: user.email ?? undefined,
      image: user.image ?? undefined,
      attendeeProfile,
      authMethods,
    }
  },
})

export const unlinkAccount = mutation({
  args: {
    accountId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    const userId = identity.subject.split('|')[0] as Id<'users'>

    const account = await ctx.db.get(args.accountId as any)
    if (!account) {
      throw new Error('Account not found')
    }

    if ((account as any).userId !== userId) {
      throw new Error('Not your account')
    }

    const allAccounts = await ctx.db
      .query('authAccounts')
      .filter((q) => q.eq(q.field('userId'), userId))
      .collect()

    if (allAccounts.length <= 1) {
      throw new Error(
        'Cannot unlink: you need at least one sign-in method. Add another authentication method first.',
      )
    }

    await ctx.db.delete(args.accountId as any)

    return { success: true }
  },
})
