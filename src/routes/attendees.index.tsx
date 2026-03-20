import { createFileRoute, useSearch } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Layout } from '~/components/layout/Layout'
import { ProtectedRoute } from '~/components/auth/ProtectedRoute'
import { AttendeeList } from '~/features/attendees/components/AttendeeList'
import {
  useAttendees,
  useSearchAttendees,
  useArchiveAttendee,
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

function AttendeesContent() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const searchParams = useSearch({ from: '/attendees/' }) as SearchParams

  // Local state for inputs (not debounced)
  const [localSearchQuery, setLocalSearchQuery] = useState(searchParams.q || '')
  const [localStatusFilter, setLocalStatusFilter] = useState<
    string | undefined
  >(searchParams.status)

  // Debounced search query (300ms delay)
  const debouncedSearchQuery = useDebounce(localSearchQuery, 300)

  // Determine if we should use search or list query
  const hasValidSearchQuery = debouncedSearchQuery.length >= 3

  // Fetch data based on search state
  const listQuery = useAttendees(localStatusFilter)
  const searchQuery = useSearchAttendees(
    hasValidSearchQuery ? debouncedSearchQuery : '',
    localStatusFilter,
  )

  // Use search results when there's a valid query, otherwise use list
  const isSearching = hasValidSearchQuery && searchQuery.isPending
  const isPending = listQuery.isPending || isSearching

  const attendees =
    hasValidSearchQuery && searchQuery.data
      ? searchQuery.data
      : (listQuery.data as any)?.page || []

  const archiveAttendee = useArchiveAttendee()

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

    // Update URL without triggering navigation (replace: true)
    navigate({
      to: '/attendees',
      search: params,
      replace: true,
    })
  }, [debouncedSearchQuery, localStatusFilter, navigate])

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
        onNavigate={(path) => navigate({ to: path as any })}
        onArchive={handleArchive}
        onSearchChange={handleSearchChange}
        onStatusFilterChange={handleStatusFilterChange}
        onClearSearch={handleClearSearch}
      />
    </div>
  )
}
