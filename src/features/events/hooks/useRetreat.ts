import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { toast } from 'sonner'
import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'

/**
 * Hook to fetch retreat details for an event.
 * - Returns teachers, lessons, and staff with joined attendee data
 * - Returns null if event not found
 */
export function useRetreatDetails(eventId?: string) {
  return useQuery({
    ...convexQuery(
      api.retreat.queries.getRetreatDetails,
      eventId ? { eventId: eventId as Id<'events'> } : ('skip' as any),
    ),
    enabled: !!eventId,
  })
}

/**
 * Hook to fetch all qualified teachers (Pastor/Leader/Elder/Deacon).
 * - Used for teacher selection dropdown
 * - No arguments needed
 */
export function useQualifiedTeachers() {
  return useQuery(convexQuery(api.retreat.queries.getQualifiedTeachers, {}))
}

/**
 * Hook to check if a teacher has assigned lessons.
 * - Returns hasLessons boolean and list of assigned lessons
 * - Used for warning dialog before removing teacher
 */
export function useCheckTeacherLessons(
  eventId?: string,
  teacherAttendeeId?: string,
) {
  return useQuery({
    ...convexQuery(
      api.retreat.queries.checkTeacherLessons,
      eventId && teacherAttendeeId
        ? {
            eventId: eventId as Id<'events'>,
            teacherAttendeeId: teacherAttendeeId as Id<'attendees'>,
          }
        : ('skip' as any),
    ),
    enabled: !!eventId && !!teacherAttendeeId,
  })
}

/**
 * Hook to get conflicting lessons for a proposed time.
 * - Used for real-time overlap validation in UI
 * - Returns array of conflicting lessons
 */
export function useLessonConflicts(options: {
  eventId?: string
  day?: number
  startTime?: string
  endTime?: string
  excludeLessonId?: string
}) {
  const { eventId, day, startTime, endTime, excludeLessonId } = options

  return useQuery({
    ...convexQuery(
      api.retreat.queries.getLessonConflicts,
      eventId && day && startTime && endTime
        ? {
            eventId: eventId as Id<'events'>,
            day,
            startTime,
            endTime,
            excludeLessonId,
          }
        : ('skip' as any),
    ),
    enabled: !!eventId && !!day && !!startTime && !!endTime,
  })
}

/**
 * Hook to add a teacher to a retreat.
 * - Validates attendee has qualified status
 * - Prevents duplicates
 * - On success: invalidate retreat details
 */
export function useAddTeacher() {
  const queryClient = useQueryClient()
  const mutationFn = useConvexMutation(api.retreat.mutations.addTeacher)

  return useMutation({
    mutationFn,
    onSuccess: () => {
      toast.success('Teacher added successfully')
      queryClient.invalidateQueries({
        queryKey: [api.retreat.queries.getRetreatDetails],
      })
      queryClient.invalidateQueries({
        queryKey: [api.retreat.queries.getQualifiedTeachers],
      })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

/**
 * Hook to remove a teacher from a retreat.
 * - Can force remove even with assigned lessons
 * - On success: invalidate retreat details
 */
export function useRemoveTeacher() {
  const queryClient = useQueryClient()
  const mutationFn = useConvexMutation(api.retreat.mutations.removeTeacher)

  return useMutation({
    mutationFn,
    onSuccess: () => {
      toast.success('Teacher removed successfully')
      queryClient.invalidateQueries({
        queryKey: [api.retreat.queries.getRetreatDetails],
      })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

/**
 * Hook to update a teacher's subject and bio.
 */
export function useUpdateTeacher() {
  const queryClient = useQueryClient()
  const mutationFn = useConvexMutation(api.retreat.mutations.updateTeacher)

  return useMutation({
    mutationFn,
    onSuccess: () => {
      toast.success('Teacher updated successfully')
      queryClient.invalidateQueries({
        queryKey: [api.retreat.queries.getRetreatDetails],
      })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

/**
 * Hook to add a lesson/schedule item to a retreat.
 * - Validates time format and no overlap
 * - On success: invalidate retreat details
 */
export function useAddLesson() {
  const queryClient = useQueryClient()
  const mutationFn = useConvexMutation(api.retreat.mutations.addLesson)

  return useMutation({
    mutationFn,
    onSuccess: () => {
      toast.success('Lesson added successfully')
      queryClient.invalidateQueries({
        queryKey: [api.retreat.queries.getRetreatDetails],
      })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

/**
 * Hook to update a lesson/schedule item.
 * - Validates time format and no overlap
 * - On success: invalidate retreat details
 */
export function useUpdateLesson() {
  const queryClient = useQueryClient()
  const mutationFn = useConvexMutation(api.retreat.mutations.updateLesson)

  return useMutation({
    mutationFn,
    onSuccess: () => {
      toast.success('Lesson updated successfully')
      queryClient.invalidateQueries({
        queryKey: [api.retreat.queries.getRetreatDetails],
      })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

/**
 * Hook to remove a lesson/schedule item.
 */
export function useRemoveLesson() {
  const queryClient = useQueryClient()
  const mutationFn = useConvexMutation(api.retreat.mutations.removeLesson)

  return useMutation({
    mutationFn,
    onSuccess: () => {
      toast.success('Lesson removed successfully')
      queryClient.invalidateQueries({
        queryKey: [api.retreat.queries.getRetreatDetails],
      })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

/**
 * Hook to reorder lessons.
 */
export function useReorderLessons() {
  const queryClient = useQueryClient()
  const mutationFn = useConvexMutation(api.retreat.mutations.reorderLessons)

  return useMutation({
    mutationFn,
    onSuccess: () => {
      toast.success('Lessons reordered successfully')
      queryClient.invalidateQueries({
        queryKey: [api.retreat.queries.getRetreatDetails],
      })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

/**
 * Hook to add a staff member to a retreat.
 * - Any attendee can be staff (no status restriction)
 * - On success: invalidate retreat details
 */
export function useAddStaff() {
  const queryClient = useQueryClient()
  const mutationFn = useConvexMutation(api.retreat.mutations.addStaff)

  return useMutation({
    mutationFn,
    onSuccess: () => {
      toast.success('Staff member added successfully')
      queryClient.invalidateQueries({
        queryKey: [api.retreat.queries.getRetreatDetails],
      })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

/**
 * Hook to update a staff member's role and responsibilities.
 */
export function useUpdateStaff() {
  const queryClient = useQueryClient()
  const mutationFn = useConvexMutation(api.retreat.mutations.updateStaff)

  return useMutation({
    mutationFn,
    onSuccess: () => {
      toast.success('Staff member updated successfully')
      queryClient.invalidateQueries({
        queryKey: [api.retreat.queries.getRetreatDetails],
      })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

/**
 * Hook to remove a staff member from a retreat.
 */
export function useRemoveStaff() {
  const queryClient = useQueryClient()
  const mutationFn = useConvexMutation(api.retreat.mutations.removeStaff)

  return useMutation({
    mutationFn,
    onSuccess: () => {
      toast.success('Staff member removed successfully')
      queryClient.invalidateQueries({
        queryKey: [api.retreat.queries.getRetreatDetails],
      })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

/**
 * Convenience hook that provides all retreat mutations.
 * Use individual hooks if you need more control over onSuccess/onError.
 */
export function useRetreatMutations() {
  return {
    addTeacher: useAddTeacher(),
    removeTeacher: useRemoveTeacher(),
    updateTeacher: useUpdateTeacher(),
    addLesson: useAddLesson(),
    updateLesson: useUpdateLesson(),
    removeLesson: useRemoveLesson(),
    reorderLessons: useReorderLessons(),
    addStaff: useAddStaff(),
    updateStaff: useUpdateStaff(),
    removeStaff: useRemoveStaff(),
  }
}
