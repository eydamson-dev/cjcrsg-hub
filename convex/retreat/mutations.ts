import { mutation } from '../_generated/server'
import { v } from 'convex/values'
import {
  qualifiedTeacherStatuses,
  validateLessonTimes,
  validateLessonOverlap,
  type RetreatLessonValidation,
} from '../events/validators'

/**
 * Add a teacher to a retreat event.
 * - Validates attendee exists
 * - Validates attendee has qualified status (Pastor/Leader/Elder/Deacon)
 * - Prevents duplicate teachers
 * - Adds to retreatTeachers array
 */
export const addTeacher = mutation({
  args: {
    eventId: v.id('events'),
    attendeeId: v.id('attendees'),
    subject: v.optional(v.string()),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Not authenticated')

    const event = await ctx.db.get(args.eventId)
    if (!event) throw new Error('Event not found')

    const attendee = await ctx.db.get(args.attendeeId)
    if (!attendee) throw new Error('Attendee not found')

    const statusLower = attendee.status.toLowerCase()
    const isQualified = qualifiedTeacherStatuses.some(
      (qualified) => qualified.toLowerCase() === statusLower,
    )
    if (!isQualified) {
      throw new Error(
        `${attendee.status} is not a qualified teacher status. Must be Pastor, Leader, Elder, or Deacon.`,
      )
    }

    const teachers = event.retreatTeachers || []
    const isDuplicate = teachers.some(
      (teacher) => teacher.attendeeId === args.attendeeId,
    )
    if (isDuplicate) {
      throw new Error('This attendee is already a teacher for this retreat')
    }

    const newTeacher = {
      attendeeId: args.attendeeId,
      subject: args.subject,
      bio: args.bio,
    }

    await ctx.db.patch(args.eventId, {
      retreatTeachers: [...teachers, newTeacher],
      updatedAt: Date.now(),
    })
  },
})

/**
 * Remove a teacher from a retreat event.
 * - Validates event exists
 * - Validates teacher exists in retreatTeachers
 * - Optionally unassigns teacher from lessons if forceRemove is true
 */
export const removeTeacher = mutation({
  args: {
    eventId: v.id('events'),
    attendeeId: v.id('attendees'),
    forceRemove: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Not authenticated')

    const event = await ctx.db.get(args.eventId)
    if (!event) throw new Error('Event not found')

    const teachers = event.retreatTeachers || []
    const teacherIndex = teachers.findIndex(
      (teacher) => teacher.attendeeId === args.attendeeId,
    )
    if (teacherIndex === -1) {
      throw new Error('Teacher not found in this retreat')
    }

    let lessons = event.retreatLessons || []
    const hasAssignedLessons = lessons.some(
      (lesson) => lesson.teacherId === args.attendeeId,
    )

    if (hasAssignedLessons && args.forceRemove !== true) {
      throw new Error(
        'Teacher has assigned lessons. Use forceRemove to remove anyway and unassign lessons.',
      )
    }

    if (hasAssignedLessons && args.forceRemove === true) {
      lessons = lessons.map((lesson) =>
        lesson.teacherId === args.attendeeId
          ? { ...lesson, teacherId: undefined }
          : lesson,
      )
    }

    const updatedTeachers = teachers.filter(
      (teacher) => teacher.attendeeId !== args.attendeeId,
    )

    await ctx.db.patch(args.eventId, {
      retreatTeachers: updatedTeachers,
      retreatLessons: lessons,
      updatedAt: Date.now(),
    })
  },
})

/**
 * Update a teacher's subject and bio.
 */
export const updateTeacher = mutation({
  args: {
    eventId: v.id('events'),
    attendeeId: v.id('attendees'),
    subject: v.optional(v.string()),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Not authenticated')

    const event = await ctx.db.get(args.eventId)
    if (!event) throw new Error('Event not found')

    const teachers = event.retreatTeachers || []
    const teacherIndex = teachers.findIndex(
      (teacher) => teacher.attendeeId === args.attendeeId,
    )
    if (teacherIndex === -1) {
      throw new Error('Teacher not found in this retreat')
    }

    const updatedTeachers = teachers.map((teacher) =>
      teacher.attendeeId === args.attendeeId
        ? {
            ...teacher,
            subject: args.subject ?? teacher.subject,
            bio: args.bio ?? teacher.bio,
          }
        : teacher,
    )

    await ctx.db.patch(args.eventId, {
      retreatTeachers: updatedTeachers,
      updatedAt: Date.now(),
    })
  },
})

/**
 * Add a lesson/schedule item to a retreat event.
 * - Validates event exists
 * - Validates time format (HH:mm) and endTime > startTime
 * - Validates no overlap with existing lessons on same day
 * - Validates teacher exists if provided
 */
export const addLesson = mutation({
  args: {
    eventId: v.id('events'),
    lesson: v.object({
      id: v.string(),
      title: v.string(),
      description: v.optional(v.string()),
      teacherId: v.optional(v.id('attendees')),
      day: v.optional(v.number()),
      startTime: v.string(),
      endTime: v.string(),
      location: v.optional(v.string()),
      type: v.union(
        v.literal('teaching'),
        v.literal('meal'),
        v.literal('break'),
        v.literal('worship'),
        v.literal('registration'),
        v.literal('closing'),
        v.literal('other'),
      ),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Not authenticated')

    const event = await ctx.db.get(args.eventId)
    if (!event) throw new Error('Event not found')

    if (!validateLessonTimes(args.lesson.startTime, args.lesson.endTime)) {
      throw new Error('End time must be after start time')
    }

    if (args.lesson.teacherId) {
      const teacher = await ctx.db.get(args.lesson.teacherId)
      if (!teacher) throw new Error('Teacher not found')
    }

    const existingLessons: RetreatLessonValidation[] = (
      event.retreatLessons || []
    ).map((lesson) => ({
      id: lesson.id,
      day: lesson.day,
      startTime: lesson.startTime,
      endTime: lesson.endTime,
    }))

    const newLessonValidation: RetreatLessonValidation = {
      day: args.lesson.day,
      startTime: args.lesson.startTime,
      endTime: args.lesson.endTime,
    }

    const conflicts = validateLessonOverlap(
      existingLessons,
      newLessonValidation,
    )

    if (conflicts.length > 0) {
      throw new Error(
        `Time conflicts with ${conflicts.length} existing lesson(s) on this day`,
      )
    }

    const lessons = event.retreatLessons || []
    await ctx.db.patch(args.eventId, {
      retreatLessons: [...lessons, args.lesson],
      updatedAt: Date.now(),
    })
  },
})

/**
 * Update a lesson/schedule item.
 * - Validates event exists
 * - Validates lesson exists
 * - Validates time format and no overlap (if time/day changed)
 * - Validates teacher exists if changed
 */
export const updateLesson = mutation({
  args: {
    eventId: v.id('events'),
    lessonId: v.string(),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      teacherId: v.optional(v.id('attendees')),
      day: v.optional(v.number()),
      startTime: v.optional(v.string()),
      endTime: v.optional(v.string()),
      location: v.optional(v.string()),
      type: v.optional(
        v.union(
          v.literal('teaching'),
          v.literal('meal'),
          v.literal('break'),
          v.literal('worship'),
          v.literal('registration'),
          v.literal('closing'),
          v.literal('other'),
        ),
      ),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Not authenticated')

    const event = await ctx.db.get(args.eventId)
    if (!event) throw new Error('Event not found')

    const lessons = event.retreatLessons || []
    const lessonIndex = lessons.findIndex((l) => l.id === args.lessonId)
    if (lessonIndex === -1) {
      throw new Error('Lesson not found')
    }

    const existingLesson = lessons[lessonIndex]

    const newStartTime = args.updates.startTime ?? existingLesson.startTime
    const newEndTime = args.updates.endTime ?? existingLesson.endTime
    const newDay = args.updates.day ?? existingLesson.day

    if (!validateLessonTimes(newStartTime, newEndTime)) {
      throw new Error('End time must be after start time')
    }

    if (args.updates.teacherId) {
      const teacher = await ctx.db.get(args.updates.teacherId)
      if (!teacher) throw new Error('Teacher not found')
    }

    const existingLessonsForOverlap: RetreatLessonValidation[] = lessons
      .filter((l) => l.id !== args.lessonId)
      .map((lesson) => ({
        id: lesson.id,
        day: lesson.day,
        startTime: lesson.startTime,
        endTime: lesson.endTime,
      }))

    const newLessonValidation: RetreatLessonValidation = {
      day: newDay,
      startTime: newStartTime,
      endTime: newEndTime,
    }

    const conflicts = validateLessonOverlap(
      existingLessonsForOverlap,
      newLessonValidation,
    )

    if (conflicts.length > 0) {
      throw new Error(
        `Time conflicts with ${conflicts.length} existing lesson(s) on this day`,
      )
    }

    const updatedLessons = lessons.map((lesson) =>
      lesson.id === args.lessonId
        ? {
            ...lesson,
            title: args.updates.title ?? lesson.title,
            description: args.updates.description ?? lesson.description,
            teacherId: args.updates.teacherId ?? lesson.teacherId,
            day: args.updates.day ?? lesson.day,
            startTime: args.updates.startTime ?? lesson.startTime,
            endTime: args.updates.endTime ?? lesson.endTime,
            location: args.updates.location ?? lesson.location,
            type: args.updates.type ?? lesson.type,
          }
        : lesson,
    )

    await ctx.db.patch(args.eventId, {
      retreatLessons: updatedLessons,
      updatedAt: Date.now(),
    })
  },
})

/**
 * Remove a lesson/schedule item.
 */
export const removeLesson = mutation({
  args: {
    eventId: v.id('events'),
    lessonId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Not authenticated')

    const event = await ctx.db.get(args.eventId)
    if (!event) throw new Error('Event not found')

    const lessons = event.retreatLessons || []
    const lessonIndex = lessons.findIndex((l) => l.id === args.lessonId)
    if (lessonIndex === -1) {
      throw new Error('Lesson not found')
    }

    const updatedLessons = lessons.filter((l) => l.id !== args.lessonId)

    await ctx.db.patch(args.eventId, {
      retreatLessons: updatedLessons,
      updatedAt: Date.now(),
    })
  },
})

/**
 * Reorder lessons by updating their order in the array.
 */
export const reorderLessons = mutation({
  args: {
    eventId: v.id('events'),
    lessonIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Not authenticated')

    const event = await ctx.db.get(args.eventId)
    if (!event) throw new Error('Event not found')

    const lessons = event.retreatLessons || []
    const lessonsById = new Map(lessons.map((l) => [l.id, l]))

    const reorderedLessons = args.lessonIds
      .map((id) => lessonsById.get(id))
      .filter((l): l is NonNullable<typeof l> => l !== undefined)

    if (reorderedLessons.length !== lessons.length) {
      throw new Error('Some lesson IDs are invalid')
    }

    await ctx.db.patch(args.eventId, {
      retreatLessons: reorderedLessons,
      updatedAt: Date.now(),
    })
  },
})

/**
 * Add staff member to a retreat event.
 * - Any attendee can be staff (no status restriction)
 * - Prevents duplicate staff
 */
export const addStaff = mutation({
  args: {
    eventId: v.id('events'),
    attendeeId: v.id('attendees'),
    role: v.string(),
    responsibilities: v.optional(v.string()),
    isLead: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Not authenticated')

    const event = await ctx.db.get(args.eventId)
    if (!event) throw new Error('Event not found')

    const attendee = await ctx.db.get(args.attendeeId)
    if (!attendee) throw new Error('Attendee not found')

    const staff = event.retreatStaff || []
    const isDuplicate = staff.some(
      (member) => member.attendeeId === args.attendeeId,
    )
    if (isDuplicate) {
      throw new Error('This attendee is already staff for this retreat')
    }

    const newStaff = {
      attendeeId: args.attendeeId,
      role: args.role,
      responsibilities: args.responsibilities,
      isLead: args.isLead ?? false,
    }

    await ctx.db.patch(args.eventId, {
      retreatStaff: [...staff, newStaff],
      updatedAt: Date.now(),
    })
  },
})

/**
 * Update staff member role and responsibilities.
 */
export const updateStaff = mutation({
  args: {
    eventId: v.id('events'),
    attendeeId: v.id('attendees'),
    role: v.optional(v.string()),
    responsibilities: v.optional(v.string()),
    isLead: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Not authenticated')

    const event = await ctx.db.get(args.eventId)
    if (!event) throw new Error('Event not found')

    const staff = event.retreatStaff || []
    const staffIndex = staff.findIndex(
      (member) => member.attendeeId === args.attendeeId,
    )
    if (staffIndex === -1) {
      throw new Error('Staff member not found in this retreat')
    }

    const updatedStaff = staff.map((member) =>
      member.attendeeId === args.attendeeId
        ? {
            ...member,
            role: args.role ?? member.role,
            responsibilities: args.responsibilities ?? member.responsibilities,
            isLead: args.isLead ?? member.isLead,
          }
        : member,
    )

    await ctx.db.patch(args.eventId, {
      retreatStaff: updatedStaff,
      updatedAt: Date.now(),
    })
  },
})

/**
 * Remove staff member from retreat.
 */
export const removeStaff = mutation({
  args: {
    eventId: v.id('events'),
    attendeeId: v.id('attendees'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Not authenticated')

    const event = await ctx.db.get(args.eventId)
    if (!event) throw new Error('Event not found')

    const staff = event.retreatStaff || []
    const staffIndex = staff.findIndex(
      (member) => member.attendeeId === args.attendeeId,
    )
    if (staffIndex === -1) {
      throw new Error('Staff member not found in this retreat')
    }

    const updatedStaff = staff.filter(
      (member) => member.attendeeId !== args.attendeeId,
    )

    await ctx.db.patch(args.eventId, {
      retreatStaff: updatedStaff,
      updatedAt: Date.now(),
    })
  },
})
