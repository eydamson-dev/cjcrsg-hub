import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import type { Id } from './_generated/dataModel'
import { Scrypt } from 'lucia'

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

export const setPassword = mutation({
  args: {
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    const userId = identity.subject.split('|')[0] as Id<'users'>
    const user = await ctx.db.get(userId)
    if (!user) {
      throw new Error('User not found')
    }

    const email = user.email
    if (!email) {
      throw new Error('No email address is associated with your account')
    }

    if (!args.password || args.password.length < 8) {
      throw new Error('Password must be at least 8 characters')
    }

    const existing = await ctx.db
      .query('authAccounts')
      .withIndex('providerAndAccountId', (q) =>
        q.eq('provider', 'password').eq('providerAccountId', email),
      )
      .unique()

    if (existing) {
      throw new Error('A password is already set for this account')
    }

    const secret = await new Scrypt().hash(args.password)
    await ctx.db.insert('authAccounts', {
      userId,
      provider: 'password',
      providerAccountId: email,
      secret,
    })

    return { success: true }
  },
})

export const changePassword = mutation({
  args: {
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    const userId = identity.subject.split('|')[0] as Id<'users'>
    const user = await ctx.db.get(userId)
    if (!user) {
      throw new Error('User not found')
    }

    const email = user.email
    if (!email) {
      throw new Error('No email address is associated with your account')
    }

    if (!args.newPassword || args.newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters')
    }

    const account = await ctx.db
      .query('authAccounts')
      .withIndex('providerAndAccountId', (q) =>
        q.eq('provider', 'password').eq('providerAccountId', email),
      )
      .unique()

    if (!account) {
      throw new Error('No password is set for this account')
    }

    const isValid = await new Scrypt().verify(
      account.secret ?? '',
      args.currentPassword,
    )
    if (!isValid) {
      throw new Error('Current password is incorrect')
    }

    const secret = await new Scrypt().hash(args.newPassword)
    await ctx.db.patch(account._id, { secret })

    return { success: true }
  },
})
