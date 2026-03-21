import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useConvexMutation } from '@convex-dev/react-query'
import { toast } from 'sonner'
import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'

/**
 * Hook to create a new event type
 * - Invalidates eventTypes list query on success
 * - Shows toast notifications
 */
export function useCreateEventType() {
  const queryClient = useQueryClient()
  const mutationFn = useConvexMutation(api.eventTypes.mutations.create)

  return useMutation({
    mutationFn,
    onSuccess: () => {
      toast.success('Event type created successfully')
      // Invalidate the list query to refresh data
      queryClient.invalidateQueries({ queryKey: ['eventTypes'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create event type')
    },
  })
}

/**
 * Hook to update an existing event type
 * - Invalidates eventTypes queries on success
 * - Shows toast notifications
 */
export function useUpdateEventType() {
  const queryClient = useQueryClient()
  const mutationFn = useConvexMutation(api.eventTypes.mutations.update)

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string
      name?: string
      description?: string
      color?: string
    }) => {
      return mutationFn({
        id: id as Id<'eventTypes'>,
        ...data,
      })
    },
    onSuccess: () => {
      toast.success('Event type updated successfully')
      // Invalidate all eventTypes queries
      queryClient.invalidateQueries({ queryKey: ['eventTypes'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update event type')
    },
  })
}

/**
 * Hook to delete an event type
 * - Invalidates eventTypes queries on success
 * - Shows toast notifications
 * - Use useCheckEventTypeAssociations first to verify it's deletable
 */
export function useDeleteEventType() {
  const queryClient = useQueryClient()
  const mutationFn = useConvexMutation(api.eventTypes.mutations.remove)

  return useMutation({
    mutationFn: async (id: string) => {
      return mutationFn({ id: id as Id<'eventTypes'> })
    },
    onSuccess: () => {
      toast.success('Event type deleted successfully')
      // Invalidate all eventTypes queries
      queryClient.invalidateQueries({ queryKey: ['eventTypes'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete event type')
    },
  })
}
