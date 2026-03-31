import { v } from 'convex/values'

export const attendeeStatus = v.union(
  v.literal('member'),
  v.literal('visitor'),
  v.literal('inactive'),
  v.literal('Pastor'),
  v.literal('Leader'),
  v.literal('Elder'),
  v.literal('Deacon'),
)

export const attendeeFields = {
  firstName: v.string(),
  lastName: v.string(),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  dateOfBirth: v.optional(v.number()),
  address: v.string(),
  status: attendeeStatus,
  joinDate: v.optional(v.number()),
  notes: v.optional(v.string()),
}

export const createAttendeeArgs = {
  firstName: v.string(),
  lastName: v.string(),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  dateOfBirth: v.optional(v.number()),
  address: v.string(),
  status: attendeeStatus,
  joinDate: v.optional(v.number()),
  notes: v.optional(v.string()),
}

export const updateAttendeeArgs = {
  id: v.id('attendees'),
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  dateOfBirth: v.optional(v.number()),
  address: v.optional(v.string()),
  status: v.optional(attendeeStatus),
  joinDate: v.optional(v.number()),
  notes: v.optional(v.string()),
}
