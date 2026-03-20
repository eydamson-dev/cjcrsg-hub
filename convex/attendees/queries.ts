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
    let results = await ctx.db
      .query('attendees')
      .withSearchIndex('search_name', (q) => q.search('firstName', args.query))
      .take(50)

    if (args.status) {
      results = results.filter((attendee) => attendee.status === args.status)
    }

    return results
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
