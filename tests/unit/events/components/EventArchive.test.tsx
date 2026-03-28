import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EventArchive } from '~/features/events/components/EventArchive'
import type { Event, EventType } from '~/features/events/types'

// Mock child components - EventArchive now uses EventList
vi.mock('~/features/events/components/EventList', () => ({
  EventList: vi.fn(
    ({
      events,
      eventTypes,
      isPending,
      viewMode,
      searchQuery,
      eventTypeFilter,
      statusFilter,
      onSearchChange,
      onEventTypeFilterChange,
      onClearFilters,
      onViewModeChange,
      onEventClick,
      paginationInfo,
      onNextPage,
      onPreviousPage,
      title,
      description,
    }: any) => (
      <div data-testid="event-list">
        <div data-testid="event-list-title">{title}</div>
        <div data-testid="event-list-description">{description}</div>
        <div data-testid="event-count">{events.length} events found</div>
        <div data-testid="view-mode">{viewMode}</div>
        <div data-testid="search-query">{searchQuery}</div>
        <div data-testid="event-type-filter">{eventTypeFilter || 'all'}</div>
        <div data-testid="status-filter">{statusFilter || 'all'}</div>
        <div data-testid="loading-state">
          {isPending ? 'loading' : 'not-loading'}
        </div>

        {/* Filter controls simulation */}
        <select
          data-testid="event-type-select"
          value={eventTypeFilter || 'all'}
          onChange={(e) =>
            onEventTypeFilterChange?.(
              e.target.value === 'all' ? undefined : e.target.value,
            )
          }
        >
          <option value="all">All Types</option>
          {eventTypes?.map((type: EventType) => (
            <option key={type._id} value={type._id}>
              {type.name}
            </option>
          ))}
        </select>

        <input
          data-testid="search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Search events..."
        />

        {(eventTypeFilter || searchQuery) && (
          <button data-testid="clear-filters-btn" onClick={onClearFilters}>
            Clear Filters
          </button>
        )}

        {/* View mode toggle */}
        <button
          data-testid="table-view-btn"
          onClick={() => onViewModeChange?.('table')}
        >
          Table
        </button>
        <button
          data-testid="cards-view-btn"
          onClick={() => onViewModeChange?.('cards')}
        >
          Cards
        </button>

        {/* Event items */}
        <div data-testid="events-container">
          {events.map((event: Event) => (
            <div
              key={event._id}
              data-testid={`event-item-${event._id}`}
              onClick={() => onEventClick?.(event._id)}
            >
              {event.name}
            </div>
          ))}
        </div>

        {/* Pagination simulation */}
        {paginationInfo && (
          <div data-testid="pagination">
            <button
              data-testid="prev-page-btn"
              onClick={onPreviousPage}
              disabled={!paginationInfo.hasPrevious}
              aria-label="Go to previous page"
            >
              Previous
            </button>
            <span data-testid="pagination-info">
              {paginationInfo.startItem}-{paginationInfo.endItem} of{' '}
              {paginationInfo.totalCount}
            </span>
            <button
              data-testid="next-page-btn"
              onClick={onNextPage}
              disabled={!paginationInfo.hasNext}
              aria-label="Go to next page"
            >
              Next
            </button>
          </div>
        )}

        {/* Empty state */}
        {events.length === 0 && (
          <div data-testid="empty-state">
            <div>No events found</div>
            <div>Try adjusting your filters or search query</div>
          </div>
        )}
      </div>
    ),
  ),
}))

vi.mock('~/features/events/components/EventsBreadcrumb', () => ({
  EventsBreadcrumb: vi.fn(({ items }: { items: any[] }) => (
    <nav data-testid="events-breadcrumb">
      {items.map((item) => item.label).join(' > ')}
    </nav>
  )),
  BackLink: vi.fn(({ href, label }: { href: string; label: string }) => (
    <a data-testid="back-link" href={href}>
      {label}
    </a>
  )),
}))

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

vi.stubGlobal('ResizeObserver', MockResizeObserver)

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}))

describe('EventArchive', () => {
  const mockEventTypes: EventType[] = [
    {
      _id: 'type-1',
      name: 'Sunday Service',
      color: '#3b82f6',
      isActive: true,
      createdAt: Date.now(),
    },
    {
      _id: 'type-2',
      name: 'Youth Event',
      color: '#8b5cf6',
      isActive: true,
      createdAt: Date.now(),
    },
    {
      _id: 'type-3',
      name: 'Prayer Meeting',
      color: '#f97316',
      isActive: true,
      createdAt: Date.now(),
    },
  ]

  const mockEvents: Event[] = [
    {
      _id: 'event-1',
      name: 'Sunday Worship',
      eventTypeId: 'type-1',
      eventType: mockEventTypes[0],
      description: 'Weekly worship service',
      date: new Date('2026-03-30').getTime(),
      startTime: '09:00',
      endTime: '11:00',
      location: 'Main Sanctuary',
      status: 'completed',
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      attendanceCount: 45,
    },
    {
      _id: 'event-2',
      name: 'Youth Night',
      eventTypeId: 'type-2',
      eventType: mockEventTypes[1],
      description: 'Youth gathering',
      date: new Date('2026-03-25').getTime(),
      startTime: '19:00',
      endTime: '21:00',
      location: 'Youth Hall',
      status: 'completed',
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      attendanceCount: 30,
    },
    {
      _id: 'event-3',
      name: 'Prayer Meeting',
      eventTypeId: 'type-3',
      eventType: mockEventTypes[2],
      description: 'Evening prayer',
      date: new Date('2026-03-20').getTime(),
      startTime: '18:00',
      endTime: '19:00',
      location: 'Prayer Room',
      status: 'cancelled',
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      attendanceCount: 15,
    },
  ]

  const defaultProps = {
    events: mockEvents,
    eventTypes: mockEventTypes,
    isLoading: false,
    searchQuery: '',
    viewMode: 'table' as const,
    onEventClick: vi.fn(),
    onSearchChange: vi.fn(),
    onEventTypeFilterChange: vi.fn(),
    onStatusFilterChange: vi.fn(),
    onClearFilters: vi.fn(),
    onViewModeChange: vi.fn(),
    onNextPage: vi.fn(),
    onPreviousPage: vi.fn(),
    onPageSizeChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders with events in table view by default', () => {
      render(<EventArchive {...defaultProps} />)

      expect(screen.getByTestId('events-breadcrumb')).toBeInTheDocument()
      expect(screen.getByTestId('event-list-title')).toHaveTextContent(
        'Event Archive',
      )
      expect(screen.getByText('3 events found')).toBeInTheDocument()
      expect(screen.getByTestId('event-list')).toBeInTheDocument()
      expect(screen.getByTestId('view-mode')).toHaveTextContent('table')
    })

    it('renders with empty events array', () => {
      render(<EventArchive {...defaultProps} events={[]} />)

      expect(screen.getByText('0 events found')).toBeInTheDocument()
      expect(screen.getByText('No events found')).toBeInTheDocument()
      expect(
        screen.getByText('Try adjusting your filters or search query'),
      ).toBeInTheDocument()
    })

    it('renders with showBackLink', () => {
      render(<EventArchive {...defaultProps} showBackLink={true} />)

      expect(screen.getByTestId('back-link')).toBeInTheDocument()
      expect(screen.getByText('Back to Events')).toBeInTheDocument()
    })

    it('renders loading state', () => {
      render(<EventArchive {...defaultProps} isLoading={true} />)

      expect(screen.getByTestId('loading-state')).toHaveTextContent('loading')
    })
  })

  describe('View Mode Toggle', () => {
    it('switches from table to cards view when Cards button clicked', () => {
      const onViewModeChange = vi.fn()
      render(
        <EventArchive {...defaultProps} onViewModeChange={onViewModeChange} />,
      )

      const cardsButton = screen.getByTestId('cards-view-btn')
      fireEvent.click(cardsButton)

      expect(onViewModeChange).toHaveBeenCalledWith('cards')
    })

    it('switches back to table view when Table button clicked', () => {
      const onViewModeChange = vi.fn()
      render(
        <EventArchive
          {...defaultProps}
          viewMode="cards"
          onViewModeChange={onViewModeChange}
        />,
      )

      const tableButton = screen.getByTestId('table-view-btn')
      fireEvent.click(tableButton)

      expect(onViewModeChange).toHaveBeenCalledWith('table')
    })
  })

  describe('Filtering', () => {
    it('filters events by event type', () => {
      const onEventTypeFilterChange = vi.fn()
      render(
        <EventArchive
          {...defaultProps}
          onEventTypeFilterChange={onEventTypeFilterChange}
        />,
      )

      const typeSelect = screen.getByTestId('event-type-select')
      fireEvent.change(typeSelect, { target: { value: 'type-1' } })

      expect(onEventTypeFilterChange).toHaveBeenCalledWith('type-1')
    })

    it('filters events by search query', () => {
      const onSearchChange = vi.fn()
      render(<EventArchive {...defaultProps} onSearchChange={onSearchChange} />)

      const searchInput = screen.getByTestId('search-input')
      fireEvent.change(searchInput, { target: { value: 'Youth' } })

      expect(onSearchChange).toHaveBeenCalledWith('Youth')
    })

    it('clears filters when Clear Filters clicked', () => {
      const onClearFilters = vi.fn()
      render(
        <EventArchive
          {...defaultProps}
          searchQuery="test"
          eventTypeFilter="type-1"
          onClearFilters={onClearFilters}
        />,
      )

      const clearButton = screen.getByTestId('clear-filters-btn')
      fireEvent.click(clearButton)

      expect(onClearFilters).toHaveBeenCalled()
    })
  })

  describe('Empty States', () => {
    it('shows Clear Filters button when filters are active', () => {
      render(
        <EventArchive
          {...defaultProps}
          searchQuery="nonexistent"
          events={[]}
        />,
      )

      expect(screen.getByText('No events found')).toBeInTheDocument()
      expect(screen.getByTestId('clear-filters-btn')).toBeInTheDocument()
    })

    it('does not show clear filters when no filters active', () => {
      render(<EventArchive {...defaultProps} events={[]} />)

      expect(screen.getByText('No events found')).toBeInTheDocument()
      expect(screen.queryByTestId('clear-filters-btn')).not.toBeInTheDocument()
    })
  })

  describe('Pagination', () => {
    const mockPaginationInfo = {
      currentPage: 1,
      totalCount: 15,
      pageSize: 10,
      totalPages: 2,
      startItem: 1,
      endItem: 10,
      hasNext: true,
      hasPrevious: false,
      isDone: false,
    }

    it('renders pagination when events exceed page size', () => {
      render(
        <EventArchive {...defaultProps} paginationInfo={mockPaginationInfo} />,
      )

      expect(screen.getByTestId('pagination')).toBeInTheDocument()
      expect(screen.getByTestId('pagination-info')).toHaveTextContent(
        '1-10 of 15',
      )
    })

    it('navigates to next page when Next clicked', () => {
      const onNextPage = vi.fn()
      render(
        <EventArchive
          {...defaultProps}
          paginationInfo={mockPaginationInfo}
          onNextPage={onNextPage}
        />,
      )

      const nextButton = screen.getByTestId('next-page-btn')
      fireEvent.click(nextButton)

      expect(onNextPage).toHaveBeenCalled()
    })

    it('disables Previous button on first page', () => {
      render(
        <EventArchive {...defaultProps} paginationInfo={mockPaginationInfo} />,
      )

      const prevButton = screen.getByTestId('prev-page-btn')
      expect(prevButton).toBeDisabled()
    })

    it('disables Next button on last page', () => {
      render(
        <EventArchive
          {...defaultProps}
          paginationInfo={{
            ...mockPaginationInfo,
            currentPage: 2,
            hasNext: false,
            hasPrevious: true,
            startItem: 11,
            endItem: 15,
          }}
        />,
      )

      const nextButton = screen.getByTestId('next-page-btn')
      expect(nextButton).toBeDisabled()
    })
  })

  describe('Event Click', () => {
    it('calls onEventClick when provided', () => {
      const onEventClick = vi.fn()
      render(<EventArchive {...defaultProps} onEventClick={onEventClick} />)

      const eventItem = screen.getByTestId('event-item-event-1')
      fireEvent.click(eventItem)

      expect(onEventClick).toHaveBeenCalledWith('event-1')
    })

    it('navigates when onEventClick not provided', () => {
      render(<EventArchive {...defaultProps} onEventClick={undefined as any} />)

      const eventItem = screen.getByTestId('event-item-event-1')
      fireEvent.click(eventItem)

      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/events/$id',
        params: { id: 'event-1' },
      })
    })
  })
})
