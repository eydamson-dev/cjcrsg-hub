import { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { CalendarX } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Empty, EmptyDescription, EmptyTitle } from '~/components/ui/empty'
import { EventsBreadcrumb } from './EventsBreadcrumb'
import { BackLink } from './EventsBreadcrumb'
import { EventFilters } from './EventFilters'
import { EventArchiveTable } from './EventArchiveTable'
import { EventArchiveCards } from './EventArchiveCards'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '~/components/ui/pagination'
import { Skeleton } from '~/components/ui/skeleton'
import type { Event, EventType } from '../types'

type ViewMode = 'table' | 'cards'

const ITEMS_PER_PAGE = 10

interface EventArchiveProps {
  events?: Event[]
  eventTypes?: EventType[]
  onEventClick?: (eventId: string) => void
  showBackLink?: boolean
  isLoading?: boolean
}

export function EventArchive({
  events = [],
  eventTypes,
  onEventClick,
  showBackLink = false,
  isLoading = false,
}: EventArchiveProps) {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [selectedEventType, setSelectedEventType] = useState<
    string | undefined
  >()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesType =
        !selectedEventType || event.eventTypeId === selectedEventType
      const matchesSearch =
        !searchQuery ||
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.eventType?.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesType && matchesSearch
    })
  }, [events, selectedEventType, searchQuery])

  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE)
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredEvents.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredEvents, currentPage])

  const handleClearFilters = () => {
    setSelectedEventType(undefined)
    setSearchQuery('')
    setCurrentPage(1)
  }

  const handleEventClick = (eventId: string) => {
    if (onEventClick) {
      onEventClick(eventId)
    } else {
      navigate({ to: '/events/$id', params: { id: eventId } })
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="mx-auto max-w-7xl p-4">
      <EventsBreadcrumb items={[{ label: 'Archive' }]} />

      {showBackLink && <BackLink href="/events" label="Back to Events" />}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Event Archive</h1>
          <p className="text-sm text-muted-foreground">
            {filteredEvents.length} event
            {filteredEvents.length !== 1 ? 's' : ''} found
          </p>
        </div>

        <div className="flex gap-1 rounded-lg bg-muted p-1">
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
            className={
              viewMode === 'table'
                ? 'shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }
          >
            Table
          </Button>
          <Button
            variant={viewMode === 'cards' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('cards')}
            className={
              viewMode === 'cards'
                ? 'shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }
          >
            Cards
          </Button>
        </div>
      </div>

      <EventFilters
        eventTypes={eventTypes || []}
        selectedEventType={selectedEventType}
        onEventTypeChange={(type) => {
          setSelectedEventType(type)
          setCurrentPage(1)
        }}
        searchQuery={searchQuery}
        onSearchChange={(query) => {
          setSearchQuery(query)
          setCurrentPage(1)
        }}
        onClearFilters={handleClearFilters}
      />

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 border rounded-lg"
            >
              <Skeleton className="h-16 w-24 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <Empty className="mt-8">
          <EmptyTitle>No events found</EmptyTitle>
          <EmptyDescription>
            Try adjusting your filters or search query
          </EmptyDescription>
          {searchQuery || selectedEventType ? (
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          ) : (
            <CalendarX className="size-12 text-muted-foreground" />
          )}
        </Empty>
      ) : (
        <>
          {viewMode === 'table' ? (
            <EventArchiveTable
              events={paginatedEvents}
              onEventClick={handleEventClick}
            />
          ) : (
            <EventArchiveCards
              events={paginatedEvents}
              onEventClick={handleEventClick}
            />
          )}

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredEvents.length)}{' '}
                of {filteredEvents.length}
              </p>

              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={
                        currentPage === 1
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={
                        currentPage === totalPages
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  )
}
