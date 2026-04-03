import { query } from '../_generated/server'
import { v } from 'convex/values'
import { paginationOptsValidator } from 'convex/server'
import { attendeeStatus } from './validators'
import type { Id } from '../_generated/dataModel'

async function enrichWithUserInfo(ctx: any, attendees: any[]) {
  return Promise.all(
    attendees.map(async (attendee: any) => {
      if (!attendee.userId) return attendee

      const user = await ctx.db.get(attendee.userId as Id<'users'>)
      return {
        ...attendee,
        userEmail: user?.email,
        userName: user?.name,
      }
    }),
  )
}

export const list = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(attendeeStatus),
  },
  handler: async (ctx, args) => {
    let page
    if (args.status) {
      page = await ctx.db
        .query('attendees')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .order('desc')
        .paginate(args.paginationOpts)
    } else {
      page = await ctx.db
        .query('attendees')
        .order('desc')
        .paginate(args.paginationOpts)
    }

    const enrichedPage = await enrichWithUserInfo(ctx, page.page)

    return {
      ...page,
      page: enrichedPage,
    }
  },
})

export const getById = query({
  args: {
    id: v.id('attendees'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

export const search = query({
  args: {
    query: v.string(),
    status: v.optional(attendeeStatus),
  },
  handler: async (ctx, args) => {
    const normalizedQuery = args.query.toLowerCase().trim()

    let results = await ctx.db
      .query('attendees')
      .withSearchIndex('search_attendees', (q) =>
        q.search('searchField', normalizedQuery),
      )
      .take(50)

    if (args.status) {
      results = results.filter((attendee) => attendee.status === args.status)
    }

    return await enrichWithUserInfo(ctx, results)
  },
})

export const searchLegacy = query({
  args: {
    query: v.string(),
    status: v.optional(attendeeStatus),
  },
  handler: async (ctx, args) => {
    const normalizedQuery = args.query.toLowerCase().trim()

    let results = await ctx.db.query('attendees').take(100)

    // Filter by searchable fields
    results = results.filter((attendee) => {
      const searchableText = [
        attendee.firstName,
        attendee.lastName,
        attendee.email,
        attendee.address,
        attendee.searchField,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return searchableText.includes(normalizedQuery)
    })

    if (args.status) {
      results = results.filter((attendee) => attendee.status === args.status)
    }

    return results.slice(0, 50)
  },
})

export const count = query({
  args: {
    status: v.optional(attendeeStatus),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      const results = await ctx.db
        .query('attendees')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .collect()
      return results.length
    }

    return (await ctx.db.query('attendees').collect()).length
  },
})
