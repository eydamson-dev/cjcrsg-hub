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
    // Who originally invited this person to church (permanent record)
    // Only relevant for visitors; undefined for founding members
    // Stays on their profile even after they become a member
    invitedBy: v.optional(v.id('attendees')),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_status', ['status'])
    .index('by_email', ['email'])
    .index('by_phone', ['phone'])
    // Use case: "Show all people originally invited by John"
    .index('by_invited_by', ['invitedBy'])
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
    startTime: v.optional(v.string()), // "HH:mm" 24-hour format e.g. "09:00"
    endTime: v.optional(v.string()), // "HH:mm" 24-hour format; must be after startTime
    location: v.optional(v.string()),
    // Event lifecycle status — only ONE event can be 'active' at a time
    status: v.union(
      v.literal('upcoming'), // Default for ALL new events (even if date is in the past)
      v.literal('active'), // Currently happening
      v.literal('completed'), // Event ended — completedAt is set
      v.literal('cancelled'), // Event was cancelled
    ),
    // Banner image URL — validated by format only (extension or data: URI)
    bannerImage: v.optional(v.string()),
    // Photos/videos from the event
    media: v.optional(
      v.array(
        v.object({
          url: v.string(),
          type: v.union(v.literal('image'), v.literal('video')),
          caption: v.optional(v.string()),
        }),
      ),
    ),
    isActive: v.boolean(), // Soft delete flag
    createdAt: v.number(),
    updatedAt: v.number(), // Set on every mutation
    completedAt: v.optional(v.number()), // Set when status becomes 'completed'
  })
    .index('by_date', ['date'])
    .index('by_event_type', ['eventTypeId'])
    .index('by_active_date', ['isActive', 'date'])
    // Use case: "Get all upcoming events", "Get all cancelled events"
    .index('by_status', ['status'])
    // Use case: "Get upcoming events after today ordered by date"
    .index('by_date_status', ['date', 'status'])
    // Use case: "Get the single currently active event quickly"
    .index('by_active', ['isActive', 'status']),
  attendanceRecords: defineTable({
    eventId: v.id('events'),
    attendeeId: v.id('attendees'),
    checkedInAt: v.number(),
    checkedInBy: v.string(), // Auth identity subject string (not a DB ID reference)
    // Who invited this attendee to THIS specific event (per-event, not permanent)
    // Different from attendees.invitedBy (which is who brought them to church overall)
    // Example: John brought Mary to church (attendees.invitedBy = John)
    //          but Peter invited Mary to this retreat (attendanceRecords.invitedBy = Peter)
    invitedBy: v.optional(v.id('attendees')),
    notes: v.optional(v.string()),
  })
    // Use case: "Get all attendees for an event ordered by check-in time"
    .index('by_event', ['eventId', 'checkedInAt'])
    // Use case: "Get full attendance history for a person"
    .index('by_attendee', ['attendeeId', 'checkedInAt'])
    // Use case: "Check if attendee is already checked in (prevent duplicates)"
    .index('by_event_attendee', ['eventId', 'attendeeId'])
    // Use case: "Top inviters leaderboard", "How many people did Peter invite this month?"
    .index('by_invited_by', ['invitedBy', 'checkedInAt']),
})
