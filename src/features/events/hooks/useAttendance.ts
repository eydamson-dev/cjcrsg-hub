import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import type { PaginationOptions } from 'convex/server'
import { toast } from 'sonner'

/**
 * Hook to fetch attendance records for an event.
 * - Returns paginated attendance records with attendee and inviter details
 * - Only fetches when eventId is provided
 */
export function useAttendanceByEvent(
  eventId?: string,
  paginationOpts?: PaginationOptions,
) {
  return useQuery({
    ...convexQuery(
      api.attendance.queries.getByEvent,
      eventId
        ? {
            eventId: eventId as Id<'events'>,
            paginationOpts: paginationOpts || { numItems: 10, cursor: null },
          }
        : ('skip' as any),
    ),
    enabled: !!eventId,
  })
}

/**
 * Hook to get attendance statistics for an event.
 * - Returns { total, members, visitors, withInvite }
 * - Only fetches when eventId is provided
 */
export function useAttendanceStats(eventId?: string) {
  return useQuery({
    ...convexQuery(
      api.attendance.queries.getStats,
      eventId ? { eventId: eventId as Id<'events'> } : ('skip' as any),
    ),
    enabled: !!eventId,
  })
}

/**
 * Hook to get attendance history for a specific attendee.
 * - Returns paginated attendance records with event and eventType data
 */
export function useAttendanceByAttendee(
  attendeeId?: string,
  paginationOpts?: PaginationOptions,
) {
  return useQuery({
    ...convexQuery(
      api.attendance.queries.getByAttendee,
      attendeeId
        ? {
            attendeeId: attendeeId as Id<'attendees'>,
            paginationOpts: paginationOpts || { numItems: 10, cursor: null },
          }
        : ('skip' as any),
    ),
    enabled: !!attendeeId,
  })
}

/**
 * Hook to get top inviters for an event.
 * - Returns array of { inviter: { _id, firstName, lastName }, count }
 */
export function useEventInviters(eventId?: string) {
  return useQuery({
    ...convexQuery(
      api.attendance.queries.getInviters,
      eventId ? { eventId: eventId as Id<'events'> } : ('skip' as any),
    ),
    enabled: !!eventId,
  })
}

/**
 * Hook to check in a single attendee to an event.
 * - On success: toast "Attendee checked in", invalidate attendance queries
 * - On error: toast specific message (e.g., "Already checked in")
 */
export function useCheckIn() {
  const queryClient = useQueryClient()
  const mutationFn = useConvexMutation(api.attendance.mutations.checkIn)

  return useMutation({
    mutationFn: async (input: {
      eventId: string
      attendeeId: string
      invitedBy?: string
      notes?: string
    }) => {
      return mutationFn({
        eventId: input.eventId as Id<'events'>,
        attendeeId: input.attendeeId as Id<'attendees'>,
        invitedBy: input.invitedBy
          ? (input.invitedBy as Id<'attendees'>)
          : undefined,
        notes: input.notes,
      })
    },
    onSuccess: () => {
      toast.success('Attendee checked in')
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
      queryClient.invalidateQueries({ queryKey: ['attendanceStats'] })
    },
    onError: (error: Error) => {
      if (error.message.includes('already checked in')) {
        toast.error('Attendee is already checked in to this event')
      } else {
        toast.error(error.message || 'Failed to check in attendee')
      }
    },
  })
}

/**
 * Hook to remove an attendee from an event (hard delete).
 * - On success: toast "Attendee removed from event"
 * - On error: toast error message
 */
export function useUnCheckIn() {
  const queryClient = useQueryClient()
  const mutationFn = useConvexMutation(api.attendance.mutations.unCheckIn)

  return useMutation({
    mutationFn: async (attendanceRecordId: string) => {
      return mutationFn({
        attendanceRecordId: attendanceRecordId as Id<'attendanceRecords'>,
      })
    },
    onSuccess: () => {
      toast.success('Attendee removed from event')
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
      queryClient.invalidateQueries({ queryKey: ['attendanceStats'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove attendee')
    },
  })
}

/**
 * Hook to bulk check in multiple attendees at once.
 * - On success: single toast "X attendees checked in (Y already checked in)"
 * - On error: toast error message
 */
export function useBulkCheckIn() {
  const queryClient = useQueryClient()
  const mutationFn = useConvexMutation(api.attendance.mutations.bulkCheckIn)

  return useMutation({
    mutationFn: async (input: {
      eventId: string
      attendees: Array<{ attendeeId: string; invitedBy?: string }>
    }) => {
      return mutationFn({
        eventId: input.eventId as Id<'events'>,
        attendees: input.attendees.map((a) => ({
          attendeeId: a.attendeeId as Id<'attendees'>,
          invitedBy: a.invitedBy ? (a.invitedBy as Id<'attendees'>) : undefined,
        })),
      })
    },
    onSuccess: (result) => {
      toast.success(
        `${result.successCount} attendees checked in (${
          result.skippedCount
        } already checked in)`,
      )
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
      queryClient.invalidateQueries({ queryKey: ['attendanceStats'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to check in attendees')
    },
  })
}

/**
 * Hook to update the inviter for an existing attendance record.
 * - On success: toast "Inviter assigned" or "Inviter removed"
 * - On error: toast error message
 */
export function useUpdateInviter() {
  const queryClient = useQueryClient()
  const mutationFn = useConvexMutation(api.attendance.mutations.updateInviter)

  return useMutation({
    mutationFn: async (input: {
      attendanceRecordId: string
      invitedBy?: string
    }) => {
      return mutationFn({
        attendanceRecordId: input.attendanceRecordId as Id<'attendanceRecords'>,
        invitedBy: input.invitedBy
          ? (input.invitedBy as Id<'attendees'>)
          : undefined,
      })
    },
    onSuccess: (_, variables) => {
      if (variables.invitedBy) {
        toast.success('Inviter assigned')
      } else {
        toast.success('Inviter removed')
      }
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
      queryClient.invalidateQueries({ queryKey: ['attendanceStats'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update inviter')
    },
  })
}
