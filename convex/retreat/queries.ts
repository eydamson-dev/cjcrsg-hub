import { query } from '../_generated/server'
import { v } from 'convex/values'
import {
  qualifiedTeacherStatuses,
  validateLessonOverlap,
  type RetreatLessonValidation,
} from '../events/validators'

/**
 * Get retreat details for an event with all related data joined.
 * - Fetches event and joins attendee data for teachers, staff, and lesson teachers
 * - Returns teachers with attendee info (name, email, status)
 * - Returns lessons with teacher info (name)
 * - Returns staff with attendee info (name, email)
 */
export const getRetreatDetails = query({
  args: {
    eventId: v.id('events'),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId)
    if (!event) {
      throw new Error('Event not found')
    }

    const teachers = event.retreatTeachers || []
    const lessons = event.retreatLessons || []
    const staff = event.retreatStaff || []

    const teachersWithAttendee = await Promise.all(
      teachers.map(async (teacher) => {
        const attendee = await ctx.db.get(teacher.attendeeId)
        return {
          ...teacher,
          attendee: attendee
            ? {
                _id: attendee._id,
                firstName: attendee.firstName,
                lastName: attendee.lastName,
                email: attendee.email,
                status: attendee.status,
              }
            : null,
        }
      }),
    )

    const lessonsWithTeacher = await Promise.all(
      lessons.map(async (lesson) => {
        const teacher = lesson.teacherId
          ? await ctx.db.get(lesson.teacherId)
          : null
        return {
          ...lesson,
          teacher: teacher
            ? {
                _id: teacher._id,
                firstName: teacher.firstName,
                lastName: teacher.lastName,
              }
            : null,
        }
      }),
    )

    const staffWithAttendee = await Promise.all(
      staff.map(async (member) => {
        const attendee = await ctx.db.get(member.attendeeId)
        return {
          ...member,
          attendee: attendee
            ? {
                _id: attendee._id,
                firstName: attendee.firstName,
                lastName: attendee.lastName,
                email: attendee.email,
              }
            : null,
        }
      }),
    )

    return {
      teachers: teachersWithAttendee,
      lessons: lessonsWithTeacher,
      staff: staffWithAttendee,
    }
  },
})

/**
 * Get all qualified teachers (attendees with Pastor/Leader/Elder/Deacon status).
 * - Used for teacher selection dropdown in retreat UI
 * - Returns attendees filtered by qualified statuses
 */
export const getQualifiedTeachers = query({
  args: {},
  handler: async (ctx) => {
    const allAttendees = await ctx.db.query('attendees').collect()

    return allAttendees
      .filter((attendee) => {
        const status = attendee.status
        return qualifiedTeacherStatuses.some(
          (qualified) => qualified.toLowerCase() === status,
        )
      })
      .map((attendee) => ({
        _id: attendee._id,
        firstName: attendee.firstName,
        lastName: attendee.lastName,
        email: attendee.email,
        status: attendee.status,
      }))
  },
})

/**
 * Check if a teacher has assigned lessons in a retreat event.
 * - Used before allowing teacher removal
 * - Returns list of lessons assigned to the teacher
 */
export const checkTeacherLessons = query({
  args: {
    eventId: v.id('events'),
    teacherAttendeeId: v.id('attendees'),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId)
    if (!event) {
      throw new Error('Event not found')
    }

    const lessons = event.retreatLessons || []
    const assignedLessons = lessons.filter(
      (lesson) => lesson.teacherId === args.teacherAttendeeId,
    )

    return {
      hasLessons: assignedLessons.length > 0,
      lessons: assignedLessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        day: lesson.day,
        startTime: lesson.startTime,
        endTime: lesson.endTime,
      })),
    }
  },
})

/**
 * Get conflicting lessons for a proposed lesson time.
 * - Used for real-time overlap validation in UI
 * - Returns list of lessons that would conflict with the proposed time
 */
export const getLessonConflicts = query({
  args: {
    eventId: v.id('events'),
    day: v.optional(v.number()),
    startTime: v.string(),
    endTime: v.string(),
    excludeLessonId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId)
    if (!event) {
      throw new Error('Event not found')
    }

    const existingLessons: RetreatLessonValidation[] = (
      event.retreatLessons || []
    ).map((lesson) => ({
      id: lesson.id,
      day: lesson.day,
      startTime: lesson.startTime,
      endTime: lesson.endTime,
    }))

    const newLesson: RetreatLessonValidation = {
      day: args.day,
      startTime: args.startTime,
      endTime: args.endTime,
    }

    const conflicts = validateLessonOverlap(
      existingLessons,
      newLesson,
      args.excludeLessonId,
    )

    return conflicts
  },
})
