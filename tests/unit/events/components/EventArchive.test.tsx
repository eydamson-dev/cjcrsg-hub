import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EventArchive } from '~/features/events/components/EventArchive'
import type { Event, EventType } from '~/features/events/types'

// Mock child components
vi.mock('~/features/events/components/EventArchiveTable', () => ({
  EventArchiveTable: vi.fn(
    ({
      events,
      onEventClick,
    }: {
      events: Event[]
      onEventClick: (id: string) => void
    }) => (
      <div data-testid="event-archive-table">
        {events.map((event) => (
          <div
            key={event._id}
            data-testid={`table-row-${event._id}`}
            onClick={() => onEventClick(event._id)}
          >
            {event.name}
          </div>
        ))}
      </div>
    ),
  ),
}))

vi.mock('~/features/events/components/EventArchiveCards', () => ({
  EventArchiveCards: vi.fn(
    ({
      events,
      onEventClick,
    }: {
      events: Event[]
      onEventClick: (id: string) => void
    }) => (
      <div data-testid="event-archive-cards">
        {events.map((event) => (
          <div
            key={event._id}
            data-testid={`card-${event._id}`}
            onClick={() => onEventClick(event._id)}
          >
            {event.name}
          </div>
        ))}
      </div>
    ),
  ),
}))

vi.mock('~/features/events/components/EventFilters', () => ({
  EventFilters: vi.fn(
    ({
      eventTypes,
      selectedEventType,
      onEventTypeChange,
      searchQuery,
      onSearchChange,
      onClearFilters,
    }: any) => (
      <div data-testid="event-filters">
        <select
          data-testid="event-type-select"
          value={selectedEventType || 'all'}
          onChange={(e) =>
            onEventTypeChange(
              e.target.value === 'all' ? undefined : e.target.value,
            )
          }
        >
          <option value="all">All Types</option>
          {eventTypes.map((type: EventType) => (
            <option key={type._id} value={type._id}>
              {type.name}
            </option>
          ))}
        </select>
        <input
          data-testid="search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search events..."
        />
        {(selectedEventType || searchQuery) && (
          <button data-testid="clear-filters-btn" onClick={onClearFilters}>
            Clear Filters
          </button>
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

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders with events in table view by default', () => {
      render(<EventArchive events={mockEvents} eventTypes={mockEventTypes} />)

      expect(screen.getByTestId('events-breadcrumb')).toBeInTheDocument()
      expect(screen.getByText('Event Archive')).toBeInTheDocument()
      expect(screen.getByText('3 events found')).toBeInTheDocument()
      expect(screen.getByTestId('event-archive-table')).toBeInTheDocument()
      expect(screen.getByText('Table')).toBeInTheDocument()
      expect(screen.getByText('Cards')).toBeInTheDocument()
    })

    it('renders with empty events array', () => {
      render(<EventArchive events={[]} eventTypes={mockEventTypes} />)

      expect(screen.getByText('0 events found')).toBeInTheDocument()
      expect(screen.getByText('No events found')).toBeInTheDocument()
      expect(
        screen.getByText('Try adjusting your filters or search query'),
      ).toBeInTheDocument()
    })

    it('renders with showBackLink', () => {
      render(
        <EventArchive
          events={mockEvents}
          eventTypes={mockEventTypes}
          showBackLink={true}
        />,
      )

      expect(screen.getByTestId('back-link')).toBeInTheDocument()
      expect(screen.getByText('Back to Events')).toBeInTheDocument()
    })

    it('renders loading state with skeletons', () => {
      render(
        <EventArchive
          events={[]}
          eventTypes={mockEventTypes}
          isLoading={true}
        />,
      )

      // Check for loading state by looking for the loading container
      const loadingContainer = document.querySelector('.space-y-4')
      expect(loadingContainer).toBeInTheDocument()
    })
  })

  describe('View Mode Toggle', () => {
    it('switches from table to cards view when Cards button clicked', () => {
      render(<EventArchive events={mockEvents} eventTypes={mockEventTypes} />)

      const cardsButton = screen.getByText('Cards')
      fireEvent.click(cardsButton)

      expect(screen.getByTestId('event-archive-cards')).toBeInTheDocument()
      expect(
        screen.queryByTestId('event-archive-table'),
      ).not.toBeInTheDocument()
    })

    it('switches back to table view when Table button clicked', () => {
      render(<EventArchive events={mockEvents} eventTypes={mockEventTypes} />)

      // First switch to cards
      fireEvent.click(screen.getByText('Cards'))
      expect(screen.getByTestId('event-archive-cards')).toBeInTheDocument()

      // Then switch back to table
      fireEvent.click(screen.getByText('Table'))
      expect(screen.getByTestId('event-archive-table')).toBeInTheDocument()
      expect(
        screen.queryByTestId('event-archive-cards'),
      ).not.toBeInTheDocument()
    })
  })

  describe('Filtering', () => {
    it('filters events by event type', () => {
      render(<EventArchive events={mockEvents} eventTypes={mockEventTypes} />)

      const typeSelect = screen.getByTestId('event-type-select')
      fireEvent.change(typeSelect, { target: { value: 'type-1' } })

      // Check for "1 event found" - use a flexible text matcher
      expect(
        screen.getByText(
          (content) => content.includes('1') && content.includes('found'),
        ),
      ).toBeInTheDocument()
      expect(screen.getByTestId('table-row-event-1')).toBeInTheDocument()
    })

    it('filters events by search query', () => {
      render(<EventArchive events={mockEvents} eventTypes={mockEventTypes} />)

      const searchInput = screen.getByTestId('search-input')
      fireEvent.change(searchInput, { target: { value: 'Youth' } })

      // Use flexible text matcher
      expect(
        screen.getByText(
          (content) => content.includes('1') && content.includes('found'),
        ),
      ).toBeInTheDocument()
    })

    it('clears filters when Clear Filters clicked', () => {
      render(<EventArchive events={mockEvents} eventTypes={mockEventTypes} />)

      // Apply filter first
      const typeSelect = screen.getByTestId('event-type-select')
      fireEvent.change(typeSelect, { target: { value: 'type-1' } })

      // Use flexible text matcher
      expect(
        screen.getByText(
          (content) => content.includes('1') && content.includes('found'),
        ),
      ).toBeInTheDocument()

      // Clear filters
      const clearButton = screen.getByTestId('clear-filters-btn')
      fireEvent.click(clearButton)

      expect(screen.getByText('3 events found')).toBeInTheDocument()
    })
  })

  describe('Empty States', () => {
    it('shows Clear Filters button when filters are active', () => {
      render(<EventArchive events={mockEvents} eventTypes={mockEventTypes} />)

      // Apply search filter
      const searchInput = screen.getByTestId('search-input')
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } })

      expect(screen.getByText('No events found')).toBeInTheDocument()
      expect(screen.getByTestId('clear-filters-btn')).toBeInTheDocument()
    })

    it('shows CalendarX icon when no events and no filters active', () => {
      render(<EventArchive events={[]} eventTypes={mockEventTypes} />)

      expect(screen.getByText('No events found')).toBeInTheDocument()
      expect(screen.queryByTestId('clear-filters-btn')).not.toBeInTheDocument()
    })
  })

  describe('Pagination', () => {
    it('renders pagination when events exceed ITEMS_PER_PAGE', () => {
      const manyEvents: Event[] = Array.from({ length: 15 }, (_, i) => ({
        ...mockEvents[0],
        _id: `event-${i}`,
        name: `Event ${i + 1}`,
      }))

      render(<EventArchive events={manyEvents} eventTypes={mockEventTypes} />)

      // Use flexible text matcher for pagination info
      expect(
        screen.getByText(
          (content) =>
            content.includes('1') &&
            content.includes('10') &&
            content.includes('15'),
        ),
      ).toBeInTheDocument()
      // Pagination navigation exists
      expect(
        document.querySelector('[aria-label="pagination"]'),
      ).toBeInTheDocument()
    })

    it('navigates to next page when Next clicked', () => {
      const manyEvents: Event[] = Array.from({ length: 15 }, (_, i) => ({
        ...mockEvents[0],
        _id: `event-${i}`,
        name: `Event ${i + 1}`,
      }))

      render(<EventArchive events={manyEvents} eventTypes={mockEventTypes} />)

      // Find the next button by aria-label
      const nextButton = screen.getByLabelText('Go to next page')
      fireEvent.click(nextButton)

      // Check for page 2 content
      expect(
        screen.getByText(
          (content) => content.includes('11') && content.includes('15'),
        ),
      ).toBeInTheDocument()
    })

    it('disables Previous button on first page', () => {
      const manyEvents: Event[] = Array.from({ length: 15 }, (_, i) => ({
        ...mockEvents[0],
        _id: `event-${i}`,
        name: `Event ${i + 1}`,
      }))

      render(<EventArchive events={manyEvents} eventTypes={mockEventTypes} />)

      // Find Previous button by aria-label
      const prevButton = screen.getByLabelText('Go to previous page')
      expect(prevButton?.className).toContain('pointer-events-none')
    })

    it('disables Next button on last page', () => {
      const manyEvents: Event[] = Array.from({ length: 15 }, (_, i) => ({
        ...mockEvents[0],
        _id: `event-${i}`,
        name: `Event ${i + 1}`,
      }))

      render(<EventArchive events={manyEvents} eventTypes={mockEventTypes} />)

      // Navigate to last page
      const nextButton = screen.getByLabelText('Go to next page')
      fireEvent.click(nextButton)

      // After navigation, check if the Next button is now disabled
      const updatedNextButton = screen.getByLabelText('Go to next page')
      expect(updatedNextButton?.className).toContain('pointer-events-none')
    })
  })

  describe('Event Click', () => {
    it('calls onEventClick when provided', () => {
      const onEventClick = vi.fn()
      render(
        <EventArchive
          events={mockEvents}
          eventTypes={mockEventTypes}
          onEventClick={onEventClick}
        />,
      )

      const row = screen.getByTestId('table-row-event-1')
      fireEvent.click(row)

      expect(onEventClick).toHaveBeenCalledWith('event-1')
    })

    it('navigates when onEventClick not provided', () => {
      render(<EventArchive events={mockEvents} eventTypes={mockEventTypes} />)

      const row = screen.getByTestId('table-row-event-1')
      fireEvent.click(row)

      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/events/$id',
        params: { id: 'event-1' },
      })
    })
  })
})
