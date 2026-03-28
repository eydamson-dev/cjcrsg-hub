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

interface ActiveEventFilters {
  eventTypeId?: string
  status?: 'upcoming' | 'active' | 'completed' | 'cancelled'
  search?: string
  dateFrom?: number
  dateTo?: number
}

interface ArchivedEventFilters {
  eventTypeId?: string
  status?: 'upcoming' | 'active' | 'completed' | 'cancelled'
  search?: string
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
 * - When eventTypeId is provided, filters by that event type
 */
export function useCurrentEvent(options?: { eventTypeId?: string }) {
  const { eventTypeId } = options || {}

  if (eventTypeId) {
    return useQuery(
      convexQuery(api.events.queries.getCurrentEventByType, {
        eventTypeId: eventTypeId as Id<'eventTypes'>,
      }),
    )
  }

  return useQuery(convexQuery(api.events.queries.getCurrentEvent, {}))
}

/**
 * Hook to fetch active events (isActive=true) with optional filters and pagination.
 * - For Event History page
 * - Supports filtering by eventTypeId, status, search, date range
 * - Returns paginated events with joined eventType data and attendanceCount
 */
export function useActiveEvents(options?: {
  filters?: ActiveEventFilters
  paginationOpts?: PaginationOptions
}) {
  const { filters, paginationOpts } = options || {}

  return useQuery(
    convexQuery(api.events.queries.listActive, {
      paginationOpts: paginationOpts || { numItems: 10, cursor: null },
      eventTypeId: filters?.eventTypeId
        ? (filters.eventTypeId as Id<'eventTypes'>)
        : undefined,
      status: filters?.status,
      search: filters?.search,
      dateFrom: filters?.dateFrom,
      dateTo: filters?.dateTo,
    }),
  )
}

/**
 * Hook to count active events (isActive=true) with optional filters.
 * - Returns total count for pagination
 * - Supports filtering by eventTypeId, status, search, date range
 */
export function useActiveEventCount(filters?: ActiveEventFilters) {
  return useQuery(
    convexQuery(api.events.queries.countActive, {
      eventTypeId: filters?.eventTypeId
        ? (filters.eventTypeId as Id<'eventTypes'>)
        : undefined,
      status: filters?.status,
      search: filters?.search,
      dateFrom: filters?.dateFrom,
      dateTo: filters?.dateTo,
    }),
  )
}

/**
 * Hook to fetch archived events (isActive=false) with optional filters and pagination.
 * - For Event Archive page
 * - Supports filtering by eventTypeId, status, search, date range
 * - Returns paginated events with joined eventType data and attendanceCount
 */
export function useArchivedEvents(options?: {
  filters?: ArchivedEventFilters
  paginationOpts?: PaginationOptions
}) {
  const { filters, paginationOpts } = options || {}

  return useQuery(
    convexQuery(api.events.queries.listArchive, {
      paginationOpts: paginationOpts || { numItems: 10, cursor: null },
      eventTypeId: filters?.eventTypeId
        ? (filters.eventTypeId as Id<'eventTypes'>)
        : undefined,
      status: filters?.status,
      search: filters?.search,
      dateFrom: filters?.dateFrom,
      dateTo: filters?.dateTo,
    }),
  )
}

/**
 * Hook to count archived events (isActive=false) with optional filters.
 * - Returns total count for pagination
 * - Supports filtering by eventTypeId, status, search, date range
 */
export function useArchivedEventCount(filters?: ArchivedEventFilters) {
  return useQuery(
    convexQuery(api.events.queries.countArchived, {
      eventTypeId: filters?.eventTypeId
        ? (filters.eventTypeId as Id<'eventTypes'>)
        : undefined,
      status: filters?.status,
      search: filters?.search,
      dateFrom: filters?.dateFrom,
      dateTo: filters?.dateTo,
    }),
  )
}

/**
 * @deprecated Use useArchivedEvents instead
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
 * - When eventTypeId is provided, returns stats filtered by that event type
 */
export function useEventStats(options?: { eventTypeId?: string }) {
  const { eventTypeId } = options || {}

  if (eventTypeId) {
    return useQuery(
      convexQuery(api.events.queries.getStatsByEventType, {
        eventTypeId: eventTypeId as Id<'eventTypes'>,
      }),
    )
  }

  return useQuery(convexQuery(api.events.queries.getStats, {}))
}
