import { useNavigate } from '@tanstack/react-router'
import { EventList } from './EventList'
import { EventsBreadcrumb } from './EventsBreadcrumb'
import { BackLink } from './EventsBreadcrumb'
import type { Event, EventType } from '../types'

interface PaginationInfo {
  currentPage: number
  totalCount: number
  pageSize: number
  totalPages: number
  startItem: number
  endItem: number
  hasNext: boolean
  hasPrevious: boolean
  isDone: boolean
}

interface EventArchiveProps {
  events: Event[]
  eventTypes?: EventType[]
  isLoading: boolean
  isPaginated?: boolean
  paginationInfo?: PaginationInfo
  searchQuery: string
  eventTypeFilter?: string
  statusFilter?: string
  viewMode: 'table' | 'cards'
  availablePageSizes?: number[]
  onEventClick: (eventId: string) => void
  onSearchChange: (query: string) => void
  onEventTypeFilterChange: (typeId: string | undefined) => void
  onStatusFilterChange: (status: string | undefined) => void
  onClearFilters: () => void
  onViewModeChange: (mode: 'table' | 'cards') => void
  onNextPage: () => void
  onPreviousPage: () => void
  onPageSizeChange: (size: number) => void
  showBackLink?: boolean
}

export function EventArchive({
  events,
  eventTypes,
  isLoading,
  paginationInfo,
  searchQuery,
  eventTypeFilter,
  statusFilter,
  viewMode,
  availablePageSizes = [10, 25, 50],
  onEventClick,
  onSearchChange,
  onEventTypeFilterChange,
  onStatusFilterChange,
  onClearFilters,
  onViewModeChange,
  onNextPage,
  onPreviousPage,
  onPageSizeChange,
  showBackLink = false,
}: EventArchiveProps) {
  const navigate = useNavigate()

  const handleEventClick = (eventId: string) => {
    if (onEventClick) {
      onEventClick(eventId)
    } else {
      navigate({ to: '/events/$id', params: { id: eventId } })
    }
  }

  return (
    <div className="mx-auto max-w-7xl p-4">
      <EventsBreadcrumb items={[{ label: 'Archive' }]} />

      {showBackLink && <BackLink href="/events" label="Back to Events" />}

      <EventList
        events={events}
        eventTypes={eventTypes}
        isPending={isLoading}
        isArchived={true}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        searchQuery={searchQuery}
        eventTypeFilter={eventTypeFilter}
        statusFilter={statusFilter}
        onSearchChange={onSearchChange}
        onEventTypeFilterChange={onEventTypeFilterChange}
        onStatusFilterChange={onStatusFilterChange}
        onClearFilters={onClearFilters}
        onEventClick={handleEventClick}
        paginationInfo={paginationInfo}
        availablePageSizes={availablePageSizes}
        onNextPage={onNextPage}
        onPreviousPage={onPreviousPage}
        onPageSizeChange={onPageSizeChange}
        title="Event Archive"
        description="Browse archived events"
      />
    </div>
  )
}
