import { v } from 'convex/values'

/**
 * Validates image URL format.
 * Valid: data URIs (data:image/...), blob URLs (blob:...), or any http(s) URL
 * This is permissive because we can't reliably validate without fetching.
 */
export function isValidImageUrl(url: string): boolean {
  if (url.startsWith('data:image/')) return true
  if (url.startsWith('blob:')) return true
  if (url.startsWith('http://') || url.startsWith('https://')) return true
  return false
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

// ============================================================================
// Retreat (Spiritual Retreat) Validators
// ============================================================================

/**
 * Qualified teacher statuses for Spiritual Retreat
 * Only attendees with these statuses can be assigned as teachers
 */
export const qualifiedTeacherStatuses = [
  'Pastor',
  'Leader',
  'Elder',
  'Deacon',
] as const

export type QualifiedTeacherStatus = (typeof qualifiedTeacherStatuses)[number]

/**
 * Retreat lesson type union for schedule items
 */
export const retreatLessonType = v.union(
  v.literal('teaching'),
  v.literal('meal'),
  v.literal('break'),
  v.literal('worship'),
  v.literal('registration'),
  v.literal('closing'),
  v.literal('other'),
)

export type RetreatLessonType =
  | 'teaching'
  | 'meal'
  | 'break'
  | 'worship'
  | 'registration'
  | 'closing'
  | 'other'

/**
 * Retreat teacher validator
 */
export const retreatTeacherValidator = v.object({
  attendeeId: v.id('attendees'),
  subject: v.optional(v.string()),
  bio: v.optional(v.string()),
})

/**
 * Retreat lesson validator
 */
export const retreatLessonValidator = v.object({
  id: v.string(),
  title: v.string(),
  description: v.optional(v.string()),
  teacherId: v.optional(v.id('attendees')),
  day: v.optional(v.number()),
  startTime: v.string(),
  endTime: v.string(),
  location: v.optional(v.string()),
  type: retreatLessonType,
})

/**
 * Retreat staff validator
 */
export const retreatStaffValidator = v.object({
  attendeeId: v.id('attendees'),
  role: v.string(),
  responsibilities: v.optional(v.string()),
  isLead: v.optional(v.boolean()),
})

/**
 * Retreat teachers field validator
 */
export const retreatTeachersValidator = v.optional(
  v.array(retreatTeacherValidator),
)

/**
 * Retreat lessons field validator
 */
export const retreatLessonsValidator = v.optional(
  v.array(retreatLessonValidator),
)

/**
 * Retreat staff field validator
 */
export const retreatStaffValidatorField = v.optional(
  v.array(retreatStaffValidator),
)

/**
 * Validates that a time string is in "HH:mm" format
 */
export function isValidTimeFormat(time: string): boolean {
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/
  return regex.test(time)
}

/**
 * Validates that end time is after start time
 */
export function validateLessonTimes(
  startTime: string,
  endTime: string,
): boolean {
  if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
    return false
  }
  return startTime < endTime
}

/**
 * Checks if two time ranges overlap
 * Both ranges are assumed to be valid (start < end)
 */
export function doTimesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string,
): boolean {
  return start1 < end2 && end1 > start2
}

/**
 * Interface for retreat lesson in validation context
 */
export interface RetreatLessonValidation {
  id?: string
  day?: number
  startTime: string
  endTime: string
}

/**
 * Validates that a new lesson does not overlap with existing lessons on the same day
 * @param existingLessons - Array of existing lessons
 * @param newLesson - The new lesson to validate
 * @param excludeLessonId - Optional lesson ID to exclude (for updates)
 * @returns Array of conflicting lessons
 */
export function validateLessonOverlap(
  existingLessons: RetreatLessonValidation[],
  newLesson: RetreatLessonValidation,
  excludeLessonId?: string,
): RetreatLessonValidation[] {
  const newDay = newLesson.day ?? 1

  return existingLessons.filter((existing) => {
    if (existing.id && existing.id === excludeLessonId) return false
    if (existing.day !== undefined && existing.day !== newDay) return false

    return doTimesOverlap(
      newLesson.startTime,
      newLesson.endTime,
      existing.startTime,
      existing.endTime,
    )
  })
}

/**
 * Helper to get a display name for lesson type
 */
export function getLessonTypeLabel(type: RetreatLessonType): string {
  const labels: Record<RetreatLessonType, string> = {
    teaching: 'Teaching',
    meal: 'Meal',
    break: 'Break',
    worship: 'Worship',
    registration: 'Registration',
    closing: 'Closing',
    other: 'Other',
  }
  return labels[type]
}

/**
 * Helper to get color class for lesson type (Tailwind classes)
 */
export function getLessonTypeColorClass(type: RetreatLessonType): string {
  const colors: Record<RetreatLessonType, string> = {
    teaching: 'bg-green-100 text-green-700 border-green-200',
    meal: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    break: 'bg-gray-100 text-gray-700 border-gray-200',
    worship: 'bg-green-100 text-green-700 border-green-200',
    registration: 'bg-blue-100 text-blue-700 border-blue-200',
    closing: 'bg-purple-100 text-purple-700 border-purple-200',
    other: 'bg-gray-100 text-gray-700 border-gray-200',
  }
  return colors[type]
}
