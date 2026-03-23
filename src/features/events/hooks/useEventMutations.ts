import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useConvexMutation } from '@convex-dev/react-query'
import { toast } from 'sonner'
import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'

interface CreateEventInput {
  name: string
  eventTypeId: string
  description?: string
  date: number
  startTime?: string
  endTime?: string
  location?: string
  bannerImage?: string
  media?: Array<{
    url: string
    type: 'image' | 'video'
    caption?: string
  }>
}

interface UpdateEventInput {
  id: string
  name?: string
  eventTypeId?: string
  description?: string
  date?: number
  startTime?: string
  endTime?: string
  location?: string
  bannerImage?: string
  media?: Array<{
    url: string
    type: 'image' | 'video'
    caption?: string
  }>
  status?: 'upcoming' | 'active' | 'completed' | 'cancelled'
}

/**
 * Hook to create a new event.
 * - On success: toast "Event created successfully", navigate to event detail
 * - On error: toast error message from Convex
 */
export function useCreateEvent() {
  const queryClient = useQueryClient()
  const mutationFn = useConvexMutation(api.events.mutations.create)

  return useMutation({
    mutationFn: async (input: CreateEventInput) => {
      return mutationFn({
        name: input.name,
        eventTypeId: input.eventTypeId as Id<'eventTypes'>,
        description: input.description,
        date: input.date,
        startTime: input.startTime,
        endTime: input.endTime,
        location: input.location,
        bannerImage: input.bannerImage,
        media: input.media,
      })
    },
    onSuccess: () => {
      toast.success('Event created successfully')
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create event')
    },
  })
}

/**
 * Hook to update an event.
 * - On success: toast "Event updated", invalidate queries
 * - On error: toast error message
 */
export function useUpdateEvent() {
  const queryClient = useQueryClient()
  const mutationFn = useConvexMutation(api.events.mutations.update)

  return useMutation({
    mutationFn: async (input: UpdateEventInput) => {
      return mutationFn({
        id: input.id as Id<'events'>,
        name: input.name,
        eventTypeId: input.eventTypeId
          ? (input.eventTypeId as Id<'eventTypes'>)
          : undefined,
        description: input.description,
        date: input.date,
        startTime: input.startTime,
        endTime: input.endTime,
        location: input.location,
        bannerImage: input.bannerImage,
        media: input.media,
        status: input.status,
      })
    },
    onSuccess: (_, variables) => {
      toast.success('Event updated')
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({
        queryKey: ['event', { id: variables.id }],
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update event')
    },
  })
}

/**
 * Hook to start an event (set to active).
 * - On success: toast "Event started — now live!"
 * - On error: toast specific message if another event is active
 */
export function useStartEvent() {
  const queryClient = useQueryClient()
  const mutationFn = useConvexMutation(api.events.mutations.startEvent)

  return useMutation({
    mutationFn: async (id: string) => {
      return mutationFn({ id: id as Id<'events'> })
    },
    onSuccess: () => {
      toast.success('Event started — now live!')
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['currentEvent'] })
    },
    onError: (error: Error) => {
      if (error.message.includes('Another event is currently active')) {
        toast.error(
          'Another event is currently active. Complete or cancel it first.',
        )
      } else {
        toast.error(error.message || 'Failed to start event')
      }
    },
  })
}

/**
 * Hook to complete an event.
 * - On success: toast "Event completed successfully"
 * - Invalidates currentEvent and archive queries
 */
export function useCompleteEvent() {
  const queryClient = useQueryClient()
  const mutationFn = useConvexMutation(api.events.mutations.completeEvent)

  return useMutation({
    mutationFn: async (id: string) => {
      return mutationFn({ id: id as Id<'events'> })
    },
    onSuccess: () => {
      toast.success('Event completed successfully')
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['currentEvent'] })
      queryClient.invalidateQueries({ queryKey: ['archiveEvents'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to complete event')
    },
  })
}

/**
 * Hook to cancel an event.
 * - On success: toast "Event cancelled"
 * - Invalidates event queries
 */
export function useCancelEvent() {
  const queryClient = useQueryClient()
  const mutationFn = useConvexMutation(api.events.mutations.cancelEvent)

  return useMutation({
    mutationFn: async (id: string) => {
      return mutationFn({ id: id as Id<'events'> })
    },
    onSuccess: () => {
      toast.success('Event cancelled')
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['currentEvent'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel event')
    },
  })
}

/**
 * Hook to archive (soft delete) an event.
 * - On success: toast "Event archived"
 * - Invalidates list and archive queries
 */
export function useArchiveEvent() {
  const queryClient = useQueryClient()
  const mutationFn = useConvexMutation(api.events.mutations.archive)

  return useMutation({
    mutationFn: async (id: string) => {
      return mutationFn({ id: id as Id<'events'> })
    },
    onSuccess: () => {
      toast.success('Event archived')
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['archiveEvents'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to archive event')
    },
  })
}
