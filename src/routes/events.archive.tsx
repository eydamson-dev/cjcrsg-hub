import { createFileRoute, useSearch } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Layout } from '~/components/layout/Layout'
import { ProtectedRoute } from '~/components/auth/ProtectedRoute'
import { EventArchive } from '~/features/events/components/EventArchive'
import {
  useArchivedEvents,
  useArchivedEventCount,
} from '~/features/events/hooks/useEvents'
import { useEventTypesList } from '~/features/events/hooks/useEventTypes'
import { useDebounce } from '~/hooks/useDebounce'
import { useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { requireAuth } from '~/lib/auth-guard'
import { ErrorState } from '~/components/ui/error-state'
import type { Event } from '~/features/events/types'

const searchSchema = z.object({
  q: z.string().optional(),
  type: z.string().optional(),
  status: z.enum(['upcoming', 'active', 'completed', 'cancelled']).optional(),
  page: z.coerce.number().optional().default(1),
})

type SearchParams = z.infer<typeof searchSchema>

export const Route = createFileRoute('/events/archive')({
  component: EventsArchivePage,
  validateSearch: searchSchema,
  beforeLoad: async ({ context }) => {
    requireAuth(context)
  },
})

function EventsArchivePage() {
  return (
    <ProtectedRoute>
      <Layout>
        <EventsArchiveContent />
      </Layout>
    </ProtectedRoute>
  )
}

const PAGE_SIZE_KEY = 'cjcrsg-events-archive-page-size'
const DEFAULT_PAGE_SIZE = 10
const AVAILABLE_PAGE_SIZES = [10, 25, 50]

function EventsArchiveContent() {
  const navigate = useNavigate()
  const searchParams = useSearch({ from: '/events/archive' }) as SearchParams

  // Local state for inputs (not debounced)
  const [localSearchQuery, setLocalSearchQuery] = useState(searchParams.q || '')
  const [localEventTypeFilter, setLocalEventTypeFilter] = useState<
    string | undefined
  >(searchParams.type)
  const [localStatusFilter, setLocalStatusFilter] = useState<
    string | undefined
  >(searchParams.status)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')

  // Pagination state
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  // Load page size from localStorage on client side only
  useEffect(() => {
    const saved = localStorage.getItem(PAGE_SIZE_KEY)
    if (saved) {
      setPageSize(parseInt(saved, 10))
    }
  }, [])

  const [cursorHistory, setCursorHistory] = useState<(string | null)[]>([null])
  const currentPage = searchParams.page || 1
  const currentCursor = cursorHistory[currentPage - 1] || null

  // Debounced search query (300ms delay)
  const debouncedSearchQuery = useDebounce(localSearchQuery, 300)

  // Fetch data
  const listQuery = useArchivedEvents({
    filters: {
      eventTypeId: localEventTypeFilter,
      status: localStatusFilter as any,
      search: debouncedSearchQuery,
    },
    paginationOpts: {
      numItems: pageSize,
      cursor: currentCursor,
    },
  })

  const countQuery = useArchivedEventCount({
    eventTypeId: localEventTypeFilter,
    status: localStatusFilter as any,
    search: debouncedSearchQuery,
  })

  const eventTypesQuery = useEventTypesList()

  const isPending = listQuery.isPending || countQuery.isPending

  // Transform events data
  const events: Event[] = (listQuery.data?.page || []).map((item: any) => ({
    _id: item._id,
    name: item.name,
    eventTypeId: item.eventTypeId,
    eventType: item.eventType
      ? {
          _id: item.eventType.name,
          name: item.eventType.name,
          color: item.eventType.color || '#3b82f6',
          isActive: true,
          createdAt: item._creationTime,
        }
      : undefined,
    description: item.description,
    date: item.date,
    startTime: item.startTime,
    endTime: item.endTime,
    location: item.location,
    status: item.status,
    bannerImage: item.bannerImage,
    media: item.media,
    isActive: item.isActive,
    createdAt: item._creationTime,
    updatedAt: item.updatedAt,
    completedAt: item.completedAt,
    attendanceCount: item.attendanceCount,
  }))

  const totalCount = countQuery.data || 0
  const isDone = listQuery.data?.isDone || false

  // Calculate pagination info
  const paginationInfo = {
    currentPage,
    totalCount,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
    startItem: (currentPage - 1) * pageSize + 1,
    endItem: Math.min(currentPage * pageSize, totalCount),
    hasNext: !isDone,
    hasPrevious: currentPage > 1,
    isDone,
  }

  // Update URL when debounced search or filters change
  useEffect(() => {
    const params: Partial<SearchParams> = {}

    // Only add search param if query is valid (>= 3 chars) or empty (cleared)
    if (debouncedSearchQuery.length >= 3) {
      params.q = debouncedSearchQuery
    }

    if (localEventTypeFilter) {
      params.type = localEventTypeFilter
    }

    if (localStatusFilter) {
      params.status = localStatusFilter as any
    }

    // Keep current page if no filters changed, otherwise reset to page 1
    params.page = 1

    // Reset cursor history when filters change
    setCursorHistory([null])

    // Update URL without triggering navigation (replace: true)
    navigate({
      to: '/events/archive',
      search: params,
      replace: true,
    })
  }, [debouncedSearchQuery, localEventTypeFilter, localStatusFilter, navigate])

  // Update cursor history when we get new data
  useEffect(() => {
    if (listQuery.data && !listQuery.isPending) {
      const continueCursor = listQuery.data.continueCursor
      if (continueCursor && !cursorHistory.includes(continueCursor)) {
        setCursorHistory((prev) => {
          const newHistory = [...prev]
          newHistory[currentPage] = continueCursor
          return newHistory
        })
      }
    }
  }, [listQuery.data, listQuery.isPending, currentPage, cursorHistory])

  const handleNextPage = () => {
    if (paginationInfo.hasNext) {
      navigate({
        to: '/events/archive',
        search: {
          ...searchParams,
          page: currentPage + 1,
        },
        replace: true,
      })
    }
  }

  const handlePreviousPage = () => {
    if (paginationInfo.hasPrevious) {
      navigate({
        to: '/events/archive',
        search: {
          ...searchParams,
          page: currentPage - 1,
        },
        replace: true,
      })
    }
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    localStorage.setItem(PAGE_SIZE_KEY, newSize.toString())
    setCursorHistory([null])
    navigate({
      to: '/events/archive',
      search: {
        ...searchParams,
        page: 1,
      },
      replace: true,
    })
  }

  const handleEventClick = (eventId: string) => {
    navigate({ to: '/events/$id', params: { id: eventId } })
  }

  const handleSearchChange = (query: string) => {
    setLocalSearchQuery(query)
  }

  const handleEventTypeFilterChange = (typeId: string | undefined) => {
    setLocalEventTypeFilter(typeId)
  }

  const handleStatusFilterChange = (status: string | undefined) => {
    setLocalStatusFilter(status)
  }

  const handleClearFilters = () => {
    setLocalSearchQuery('')
    setLocalEventTypeFilter(undefined)
    setLocalStatusFilter(undefined)
  }

  // Transform event types to ensure color is always a string
  const transformedEventTypes = eventTypesQuery.data?.map((et) => ({
    _id: et._id,
    name: et.name,
    description: et.description,
    color: et.color || '#3b82f6',
    isActive: et.isActive,
    createdAt: et.createdAt,
  }))

  // Show error state if any query failed
  const hasError = listQuery.error || countQuery.error || eventTypesQuery.error
  if (hasError) {
    return (
      <div className="mx-auto max-w-7xl p-4 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event Archive</h1>
          <p className="text-muted-foreground">Browse archived events</p>
        </div>
        <ErrorState
          type="error"
          error={
            (listQuery.error ||
              countQuery.error ||
              eventTypesQuery.error) as Error
          }
          onRetry={() => window.location.reload()}
        />
      </div>
    )
  }

  // Get parent event type info for breadcrumb context
  const parentEventType = searchParams.type
    ? eventTypesQuery.data?.find((et) => et._id === searchParams.type)
    : undefined

  return (
    <EventArchive
      events={events}
      eventTypes={transformedEventTypes}
      isLoading={isPending}
      paginationInfo={paginationInfo}
      searchQuery={localSearchQuery}
      eventTypeFilter={localEventTypeFilter}
      statusFilter={localStatusFilter}
      viewMode={viewMode}
      availablePageSizes={AVAILABLE_PAGE_SIZES}
      onEventClick={handleEventClick}
      onSearchChange={handleSearchChange}
      onEventTypeFilterChange={handleEventTypeFilterChange}
      onStatusFilterChange={handleStatusFilterChange}
      onClearFilters={handleClearFilters}
      onViewModeChange={setViewMode}
      onNextPage={handleNextPage}
      onPreviousPage={handlePreviousPage}
      onPageSizeChange={handlePageSizeChange}
      showBackLink={true}
      parentEventTypeId={parentEventType?._id}
      parentEventTypeName={parentEventType?.name}
    />
  )
}
