import { createFileRoute, useSearch } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Layout } from '~/components/layout/Layout'
import { ProtectedRoute } from '~/components/auth/ProtectedRoute'
import { AttendeeList } from '~/features/attendees/components/AttendeeList'
import {
  useAttendees,
  useSearchAttendees,
  useArchiveAttendee,
  useAttendeeCount,
} from '~/features/attendees/hooks/useAttendees'
import type { Id } from '../../convex/_generated/dataModel'
import { useDebounce } from '~/hooks/useDebounce'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

const searchSchema = z.object({
  q: z.string().optional(),
  status: z.enum(['member', 'visitor', 'inactive']).optional(),
  page: z.coerce.number().optional().default(1),
})

type SearchParams = z.infer<typeof searchSchema>

export const Route = createFileRoute('/attendees/')({
  component: AttendeesPage,
  validateSearch: searchSchema,
})

function AttendeesPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <AttendeesContent />
      </Layout>
    </ProtectedRoute>
  )
}

const PAGE_SIZE_KEY = 'cjcrsg-attendees-page-size'
const DEFAULT_PAGE_SIZE = 10
const AVAILABLE_PAGE_SIZES = [10, 25, 50]

function AttendeesContent() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const searchParams = useSearch({ from: '/attendees/' }) as SearchParams

  // Local state for inputs (not debounced)
  const [localSearchQuery, setLocalSearchQuery] = useState(searchParams.q || '')
  const [localStatusFilter, setLocalStatusFilter] = useState<
    string | undefined
  >(searchParams.status)

  // Pagination state
  const [pageSize, setPageSize] = useState(() => {
    const saved = localStorage.getItem(PAGE_SIZE_KEY)
    return saved ? parseInt(saved, 10) : DEFAULT_PAGE_SIZE
  })
  const [cursorHistory, setCursorHistory] = useState<(string | null)[]>([null])
  const currentPage = searchParams.page || 1
  const currentCursor = cursorHistory[currentPage - 1] || null

  // Debounced search query (300ms delay)
  const debouncedSearchQuery = useDebounce(localSearchQuery, 300)

  // Determine if we should use search or list query
  const hasValidSearchQuery = debouncedSearchQuery.length >= 3

  // Fetch data based on search state
  const listQuery = useAttendees(localStatusFilter, currentCursor, pageSize)
  const searchQuery = useSearchAttendees(
    hasValidSearchQuery ? debouncedSearchQuery : '',
    localStatusFilter,
  )
  const countQuery = useAttendeeCount(localStatusFilter)

  // Use search results when there's a valid query, otherwise use list
  const isSearching = hasValidSearchQuery && searchQuery.isPending
  const isPending =
    (hasValidSearchQuery ? searchQuery.isPending : listQuery.isPending) ||
    countQuery.isPending

  const attendees =
    hasValidSearchQuery && searchQuery.data
      ? searchQuery.data
      : (listQuery.data as any)?.page || []

  const archiveAttendee = useArchiveAttendee()

  // Calculate pagination info
  const paginationInfo = {
    currentPage,
    totalCount: countQuery.data || 0,
    pageSize,
    totalPages: Math.ceil((countQuery.data || 0) / pageSize),
    startItem: (currentPage - 1) * pageSize + 1,
    endItem: Math.min(currentPage * pageSize, countQuery.data || 0),
    hasNext: hasValidSearchQuery ? false : !(listQuery.data as any)?.isDone,
    hasPrevious: currentPage > 1,
    isDone: (listQuery.data as any)?.isDone || false,
  }

  // Update URL when debounced search or status changes
  useEffect(() => {
    const params: Partial<SearchParams> = {}

    // Only add search param if query is valid (>= 3 chars) or empty (cleared)
    if (debouncedSearchQuery.length >= 3) {
      params.q = debouncedSearchQuery
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
      to: '/attendees',
      search: params,
      replace: true,
    })
  }, [debouncedSearchQuery, localStatusFilter, navigate])

  // Update cursor history when we get new data
  useEffect(() => {
    if (!hasValidSearchQuery && listQuery.data && !listQuery.isPending) {
      const continueCursor = (listQuery.data as any)?.continueCursor
      if (continueCursor && !cursorHistory.includes(continueCursor)) {
        setCursorHistory((prev) => {
          const newHistory = [...prev]
          newHistory[currentPage] = continueCursor
          return newHistory
        })
      }
    }
  }, [
    hasValidSearchQuery,
    listQuery.data,
    listQuery.isPending,
    currentPage,
    cursorHistory,
  ])

  const handleNextPage = () => {
    if (paginationInfo.hasNext) {
      navigate({
        to: '/attendees',
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
        to: '/attendees',
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
      to: '/attendees',
      search: {
        ...searchParams,
        page: 1,
      },
      replace: true,
    })
  }

  const handleArchive = async (id: string) => {
    try {
      await archiveAttendee.mutate({ id: id as Id<'attendees'> })
      toast.success('Attendee archived successfully!')
      // Refetch the attendees list to show updated status
      queryClient.invalidateQueries({ queryKey: ['attendees'] })
    } catch (error: any) {
      console.error('Failed to archive attendee:', error)
      toast.error(error.message || 'Failed to archive attendee')
    }
  }

  const handleSearchChange = (query: string) => {
    setLocalSearchQuery(query)
  }

  const handleStatusFilterChange = (status: string | undefined) => {
    setLocalStatusFilter(status)
  }

  const handleClearSearch = () => {
    setLocalSearchQuery('')
    setLocalStatusFilter(undefined)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendees</h1>
        <p className="text-muted-foreground">
          Manage church members and visitors
        </p>
      </div>

      <AttendeeList
        attendees={attendees}
        isPending={isPending}
        isSearching={isSearching}
        searchQuery={localSearchQuery}
        statusFilter={localStatusFilter}
        isPaginated={!hasValidSearchQuery}
        paginationInfo={paginationInfo}
        availablePageSizes={AVAILABLE_PAGE_SIZES}
        onNavigate={(path) => navigate({ to: path as any })}
        onArchive={handleArchive}
        onSearchChange={handleSearchChange}
        onStatusFilterChange={handleStatusFilterChange}
        onClearSearch={handleClearSearch}
        onNextPage={handleNextPage}
        onPreviousPage={handlePreviousPage}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  )
}
