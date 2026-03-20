import { query } from '../_generated/server'
import { v } from 'convex/values'
import { paginationOptsValidator } from 'convex/server'
import { attendeeStatus } from './validators'

export const list = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(attendeeStatus),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query('attendees')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .order('desc')
        .paginate(args.paginationOpts)
    }

    return await ctx.db
      .query('attendees')
      .order('desc')
      .paginate(args.paginationOpts)
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

    return results
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
    let attendeesQuery = ctx.db.query('attendees')

    if (args.status) {
      return await attendeesQuery
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .collect()
    }

    return await attendeesQuery.collect()
  },
})
