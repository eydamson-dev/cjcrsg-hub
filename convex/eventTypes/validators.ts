import { v } from 'convex/values'

/**
 * Event type name validator
 * - Required string
 * - Minimum 1 character
 * - Maximum 100 characters
 */
export const eventTypeName = v.string()

/**
 * Event type description validator
 * - Optional string
 * - Maximum 500 characters (when provided)
 */
export const eventTypeDescription = v.optional(v.string())

/**
 * Event type color validator
 * - Optional hex color string (e.g., "#3b82f6")
 * - Validates 6-character hex format with # prefix
 * - Null/undefined allowed (falls back to default color)
 */
export const eventTypeColor = v.optional(v.union(v.string(), v.null()))

/**
 * Event type ID validator
 * - References the eventTypes table
 */
export const eventTypeId = v.id('eventTypes')

/**
 * Complete event type validator object
 * Used for inserting new event types
 */
export const eventTypeFields = {
  name: eventTypeName,
  description: eventTypeDescription,
  color: eventTypeColor,
}

/**
 * Update event type validator object
 * All fields are optional for updates
 */
export const updateEventTypeFields = {
  name: v.optional(eventTypeName),
  description: v.optional(eventTypeDescription),
  color: v.optional(v.union(v.string(), v.null())),
}
