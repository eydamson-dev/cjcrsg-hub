import { v } from 'convex/values'

/**
 * Attendance record ID validator
 */
export const attendanceRecordId = v.id('attendanceRecords')

/**
 * Event ID validator for attendance operations
 */
export const eventId = v.id('events')

/**
 * Attendee ID validator for attendance operations
 */
export const attendeeId = v.id('attendees')

/**
 * Optional inviter ID validator
 * - Who invited this attendee to THIS specific event
 */
export const inviterId = v.optional(v.id('attendees'))

/**
 * Notes validator for attendance records
 */
export const attendanceNotes = v.optional(v.string())

/**
 * Single attendee for bulk check-in
 */
export const bulkAttendeeItem = v.object({
  attendeeId: v.id('attendees'),
  invitedBy: v.optional(v.id('attendees')),
})

/**
 * Bulk check-in attendees array
 */
export const bulkAttendees = v.array(bulkAttendeeItem)
