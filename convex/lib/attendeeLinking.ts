import type { MutationCtx } from '../_generated/server'
import type { Id } from '../_generated/dataModel'

export interface UserProfile {
  given_name?: string
  family_name?: string
  phone_number?: string
  picture?: string
}

export async function createOrLinkAttendee(
  ctx: MutationCtx,
  user: { _id: string; email?: string; name?: string },
  profile?: UserProfile,
): Promise<{ action: 'linked' | 'created'; attendeeId: string }> {
  if (!user.email) {
    return { action: 'created', attendeeId: '' }
  }

  const existingAttendee = await ctx.db
    .query('attendees')
    .withIndex('by_email', (q) => q.eq('email', user.email))
    .first()

  if (existingAttendee) {
    await ctx.db.patch(existingAttendee._id, {
      userId: user._id as Id<'users'>,
      updatedAt: Date.now(),
    })

    return { action: 'linked', attendeeId: existingAttendee._id }
  }

  const firstName = profile?.given_name || user.name?.split(' ')[0] || 'New'
  const lastName =
    profile?.family_name || user.name?.split(' ').slice(1).join(' ') || 'User'

  const attendeeId = await ctx.db.insert('attendees', {
    firstName,
    lastName,
    email: user.email,
    phone: profile?.phone_number,
    status: 'visitor',
    userId: user._id as Id<'users'>,
    searchField: `${firstName} ${lastName} ${user.email}`.toLowerCase(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  })

  return { action: 'created', attendeeId }
}
