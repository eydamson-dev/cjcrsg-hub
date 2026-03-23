import { useQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import type { PaginationOptions } from 'convex/server'

interface EventFilters {
  status?: 'upcoming' | 'active' | 'completed' | 'cancelled'
  eventTypeId?: string
  dateFrom?: number
  dateTo?: number
}

/**
 * Hook to fetch a paginated list of events with optional filters.
 * - Returns events with joined eventType data
 * - Supports filtering by status, eventTypeId, date range
 */
export function useEventsList(options?: {
  filters?: EventFilters
  paginationOpts?: PaginationOptions
}) {
  const { filters, paginationOpts } = options || {}

  return useQuery(
    convexQuery(api.events.queries.list, {
      paginationOpts: paginationOpts || { numItems: 10, cursor: null },
      status: filters?.status,
      eventTypeId: filters?.eventTypeId
        ? (filters.eventTypeId as Id<'eventTypes'>)
        : undefined,
      dateFrom: filters?.dateFrom,
      dateTo: filters?.dateTo,
    }),
  )
}

/**
 * Hook to fetch a single event by ID with eventType data.
 * - Returns null if not found
 * - Only fetches when id is provided
 */
export function useEvent(id?: string) {
  return useQuery({
    ...convexQuery(
      api.events.queries.getById,
      id ? { id: id as Id<'events'> } : ('skip' as any),
    ),
    enabled: !!id,
  })
}

/**
 * Hook to get the currently active event for the dashboard.
 * - Returns null if no event is active
 * - Includes attendanceCount for display
 */
export function useCurrentEvent() {
  return useQuery(convexQuery(api.events.queries.getCurrentEvent, {}))
}

/**
 * Hook to fetch archived (completed) events with optional filters.
 * - Always filters to completed events
 * - Supports filtering by eventTypeId, date range
 */
export function useArchiveEvents(options?: {
  filters?: {
    eventTypeId?: string
    dateFrom?: number
    dateTo?: number
  }
  paginationOpts?: PaginationOptions
}) {
  const { filters, paginationOpts } = options || {}

  return useQuery(
    convexQuery(api.events.queries.listArchive, {
      paginationOpts: paginationOpts || { numItems: 10, cursor: null },
      eventTypeId: filters?.eventTypeId
        ? (filters.eventTypeId as Id<'eventTypes'>)
        : undefined,
      dateFrom: filters?.dateFrom,
      dateTo: filters?.dateTo,
    }),
  )
}

/**
 * Hook to get event statistics for the dashboard.
 * - Returns totalEvents, byStatus counts, thisMonth count, nextUpcoming event
 */
export function useEventStats() {
  return useQuery(convexQuery(api.events.queries.getStats, {}))
}
