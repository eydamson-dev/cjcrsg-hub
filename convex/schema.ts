import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'
import { authTables } from '@convex-dev/auth/server'

export default defineSchema({
  ...authTables,
  attendees: defineTable({
    firstName: v.string(),
    lastName: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    dateOfBirth: v.optional(v.number()),
    address: v.optional(v.string()),
    searchField: v.optional(v.string()),
    status: v.union(
      v.literal('member'),
      v.literal('visitor'),
      v.literal('inactive'),
    ),
    joinDate: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_status', ['status'])
    .index('by_email', ['email'])
    .index('by_phone', ['phone'])
    .searchIndex('search_attendees', {
      searchField: 'searchField',
      filterFields: ['status'],
    }),
  eventTypes: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index('by_active', ['isActive'])
    .index('by_name', ['name']),
  events: defineTable({
    name: v.string(),
    eventTypeId: v.id('eventTypes'),
    description: v.optional(v.string()),
    date: v.number(),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    location: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index('by_date', ['date'])
    .index('by_event_type', ['eventTypeId'])
    .index('by_active_date', ['isActive', 'date']),
  attendanceRecords: defineTable({
    eventId: v.id('events'),
    attendeeId: v.id('attendees'),
    checkedInAt: v.number(),
    checkedInBy: v.id('users'),
    notes: v.optional(v.string()),
  })
    .index('by_event', ['eventId', 'checkedInAt'])
    .index('by_attendee', ['attendeeId', 'checkedInAt'])
    .index('by_event_attendee', ['eventId', 'attendeeId']),
})
