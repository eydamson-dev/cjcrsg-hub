import { v } from 'convex/values'

/**
 * Validates image URL format only — no HEAD requests.
 * Valid: ends in .jpg, .jpeg, .png, .gif, .webp, .svg (case-insensitive)
 * Valid: starts with data:image/ (base64 data URI)
 * Invalid: any other format
 */
export function isValidImageUrl(url: string): boolean {
  if (url.startsWith('data:image/')) return true
  return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url)
}

/**
 * Event name validator
 * - Required string
 * - Minimum 2 characters enforced in mutation
 */
export const eventName = v.string()

/**
 * Event description validator
 * - Optional string
 */
export const eventDescription = v.optional(v.string())

/**
 * Event date validator
 * - Unix timestamp in milliseconds
 */
export const eventDate = v.number()

/**
 * Event start time validator
 * - Optional "HH:mm" 24-hour format string e.g. "09:00"
 */
export const eventStartTime = v.optional(v.string())

/**
 * Event end time validator
 * - Optional "HH:mm" 24-hour format string
 * - Must be after startTime — enforced in mutation logic, not schema
 */
export const eventEndTime = v.optional(v.string())

/**
 * Event location validator
 * - Optional string
 */
export const eventLocation = v.optional(v.string())

/**
 * Event status validator
 * - Only one event can be 'active' at a time (enforced in mutations)
 */
export const eventStatus = v.union(
  v.literal('upcoming'),
  v.literal('active'),
  v.literal('completed'),
  v.literal('cancelled'),
)

/**
 * Media item validator
 * - url: image or video URL (same format validation as bannerImage)
 * - type: 'image' or 'video'
 * - caption: optional description
 */
export const mediaItemValidator = v.object({
  url: v.string(),
  type: v.union(v.literal('image'), v.literal('video')),
  caption: v.optional(v.string()),
})

/**
 * Combined event fields for create operations
 * status is not included — always defaults to 'upcoming' in mutation
 */
export const eventFields = {
  name: eventName,
  eventTypeId: v.id('eventTypes'),
  description: eventDescription,
  date: eventDate,
  startTime: eventStartTime,
  endTime: eventEndTime,
  location: eventLocation,
  bannerImage: v.optional(v.string()),
  media: v.optional(v.array(mediaItemValidator)),
}

/**
 * Update event fields — all optional for partial updates
 * status is included here so specific status transitions can be made via update
 */
export const updateEventFields = {
  name: v.optional(eventName),
  eventTypeId: v.optional(v.id('eventTypes')),
  description: v.optional(eventDescription),
  date: v.optional(eventDate),
  startTime: v.optional(eventStartTime),
  endTime: v.optional(eventEndTime),
  location: v.optional(eventLocation),
  bannerImage: v.optional(v.string()),
  media: v.optional(v.array(mediaItemValidator)),
  status: v.optional(eventStatus),
}
