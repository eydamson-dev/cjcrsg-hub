import { useQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'

/**
 * Hook to fetch all event types
 * - Returns event types ordered by name
 * - Filters by isActive status (defaults to true)
 */
export function useEventTypesList(options?: { isActive?: boolean }) {
  const { isActive = true } = options || {}

  return useQuery(
    convexQuery(api.eventTypes.queries.list, {
      isActive,
    }),
  )
}

/**
 * Hook to fetch a single event type by ID
 * - Returns null if not found
 * - Only fetches when id is provided
 */
export function useEventType(id?: string) {
  return useQuery({
    ...convexQuery(api.eventTypes.queries.getById, {
      id: id as Id<'eventTypes'>,
    }),
    enabled: !!id,
  })
}

/**
 * Hook to check if an event type has associated events
 * - Returns isDeletable flag (true if no events use this type)
 * - Returns event count and list of associated events
 * - Only fetches when id is provided
 */
export function useCheckEventTypeAssociations(id?: string) {
  return useQuery({
    ...convexQuery(api.eventTypes.queries.checkAssociations, {
      id: id as Id<'eventTypes'>,
    }),
    enabled: !!id,
  })
}
