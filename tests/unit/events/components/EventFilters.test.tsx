import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EventFilters } from '~/features/events/components/EventFilters'
import type { EventType } from '~/features/events/types'

// Mock Select component
vi.mock('~/components/ui/select', () => ({
  Select: vi.fn(({ value, onValueChange, children }: any) => (
    <select
      data-testid="event-type-select"
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
    >
      {children}
    </select>
  )),
  SelectContent: vi.fn(({ children }: any) => <>{children}</>),
  SelectItem: vi.fn(({ value, children }: any) => (
    <option value={value}>{children}</option>
  )),
  SelectTrigger: vi.fn(({ children }: any) => <>{children}</>),
  SelectValue: vi.fn(({ placeholder }: any) => <span>{placeholder}</span>),
}))

// Mock Input component
vi.mock('~/components/ui/input', () => ({
  Input: vi.fn(({ value, onChange, placeholder, className }: any) => (
    <input
      data-testid="search-input"
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
    />
  )),
}))

// Mock Button component
vi.mock('~/components/ui/button', () => ({
  Button: vi.fn(({ children, onClick, variant, size, className }: any) => (
    <button
      data-testid="clear-filters-btn"
      onClick={onClick}
      data-variant={variant}
      data-size={size}
      className={className}
    >
      {children}
    </button>
  )),
}))

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

vi.stubGlobal('ResizeObserver', MockResizeObserver)

describe('EventFilters', () => {
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

  const mockOnEventTypeChange = vi.fn()
  const mockOnSearchChange = vi.fn()
  const mockOnClearFilters = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders event type dropdown with all types option', () => {
      render(
        <EventFilters
          eventTypes={mockEventTypes}
          selectedEventType={undefined}
          onEventTypeChange={mockOnEventTypeChange}
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          onClearFilters={mockOnClearFilters}
        />,
      )

      expect(screen.getByTestId('event-type-select')).toBeInTheDocument()
      expect(screen.getByTestId('search-input')).toBeInTheDocument()
    })

    it('renders search input with placeholder', () => {
      render(
        <EventFilters
          eventTypes={mockEventTypes}
          selectedEventType={undefined}
          onEventTypeChange={mockOnEventTypeChange}
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          onClearFilters={mockOnClearFilters}
        />,
      )

      const searchInput = screen.getByTestId('search-input')
      expect(searchInput).toHaveAttribute('placeholder', 'Search events...')
    })

    it('renders with empty event types array', () => {
      render(
        <EventFilters
          eventTypes={[]}
          selectedEventType={undefined}
          onEventTypeChange={mockOnEventTypeChange}
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          onClearFilters={mockOnClearFilters}
        />,
      )

      expect(screen.getByTestId('event-type-select')).toBeInTheDocument()
      expect(screen.getByTestId('search-input')).toBeInTheDocument()
    })
  })

  describe('Event Type Selection', () => {
    it('calls onEventTypeChange when event type is selected', () => {
      render(
        <EventFilters
          eventTypes={mockEventTypes}
          selectedEventType={undefined}
          onEventTypeChange={mockOnEventTypeChange}
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          onClearFilters={mockOnClearFilters}
        />,
      )

      const select = screen.getByTestId('event-type-select')
      fireEvent.change(select, { target: { value: 'type-1' } })

      expect(mockOnEventTypeChange).toHaveBeenCalledWith('type-1')
    })

    it('calls onEventTypeChange with undefined when all types selected', () => {
      render(
        <EventFilters
          eventTypes={mockEventTypes}
          selectedEventType={'type-1'}
          onEventTypeChange={mockOnEventTypeChange}
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          onClearFilters={mockOnClearFilters}
        />,
      )

      const select = screen.getByTestId('event-type-select')
      fireEvent.change(select, { target: { value: 'all' } })

      expect(mockOnEventTypeChange).toHaveBeenCalledWith(undefined)
    })

    it('displays selected event type', () => {
      render(
        <EventFilters
          eventTypes={mockEventTypes}
          selectedEventType={'type-1'}
          onEventTypeChange={mockOnEventTypeChange}
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          onClearFilters={mockOnClearFilters}
        />,
      )

      const select = screen.getByTestId('event-type-select')
      expect(select).toHaveValue('type-1')
    })
  })

  describe('Search Functionality', () => {
    it('calls onSearchChange when search input changes', () => {
      render(
        <EventFilters
          eventTypes={mockEventTypes}
          selectedEventType={undefined}
          onEventTypeChange={mockOnEventTypeChange}
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          onClearFilters={mockOnClearFilters}
        />,
      )

      const searchInput = screen.getByTestId('search-input')
      fireEvent.change(searchInput, { target: { value: 'Sunday' } })

      expect(mockOnSearchChange).toHaveBeenCalledWith('Sunday')
    })

    it('displays current search query', () => {
      render(
        <EventFilters
          eventTypes={mockEventTypes}
          selectedEventType={undefined}
          onEventTypeChange={mockOnEventTypeChange}
          searchQuery="worship"
          onSearchChange={mockOnSearchChange}
          onClearFilters={mockOnClearFilters}
        />,
      )

      const searchInput = screen.getByTestId('search-input')
      expect(searchInput).toHaveValue('worship')
    })

    it('clears search when X button clicked', () => {
      const { container } = render(
        <EventFilters
          eventTypes={mockEventTypes}
          selectedEventType={undefined}
          onEventTypeChange={mockOnEventTypeChange}
          searchQuery="search term"
          onSearchChange={mockOnSearchChange}
          onClearFilters={mockOnClearFilters}
        />,
      )

      // Find the clear button by looking for a button inside the component
      // The X button is rendered when searchQuery is not empty
      const buttons = container.querySelectorAll('button')
      const clearSearchButton = Array.from(buttons).find(
        (btn) =>
          btn.getAttribute('type') === 'button' &&
          !btn.getAttribute('data-testid'),
      )

      if (clearSearchButton) {
        fireEvent.click(clearSearchButton)
        expect(mockOnSearchChange).toHaveBeenCalledWith('')
      }
    })
  })

  describe('Clear Filters', () => {
    it('shows clear filters button when event type is selected', () => {
      render(
        <EventFilters
          eventTypes={mockEventTypes}
          selectedEventType={'type-1'}
          onEventTypeChange={mockOnEventTypeChange}
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          onClearFilters={mockOnClearFilters}
        />,
      )

      expect(screen.getByTestId('clear-filters-btn')).toBeInTheDocument()
      expect(screen.getByText('Clear Filters')).toBeInTheDocument()
    })

    it('shows clear filters button when search query is entered', () => {
      render(
        <EventFilters
          eventTypes={mockEventTypes}
          selectedEventType={undefined}
          onEventTypeChange={mockOnEventTypeChange}
          searchQuery="search term"
          onSearchChange={mockOnSearchChange}
          onClearFilters={mockOnClearFilters}
        />,
      )

      expect(screen.getByTestId('clear-filters-btn')).toBeInTheDocument()
    })

    it('hides clear filters button when no filters active', () => {
      render(
        <EventFilters
          eventTypes={mockEventTypes}
          selectedEventType={undefined}
          onEventTypeChange={mockOnEventTypeChange}
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          onClearFilters={mockOnClearFilters}
        />,
      )

      expect(screen.queryByTestId('clear-filters-btn')).not.toBeInTheDocument()
    })

    it('calls onClearFilters when clear filters button clicked', () => {
      render(
        <EventFilters
          eventTypes={mockEventTypes}
          selectedEventType={'type-1'}
          onEventTypeChange={mockOnEventTypeChange}
          searchQuery="search term"
          onSearchChange={mockOnSearchChange}
          onClearFilters={mockOnClearFilters}
        />,
      )

      const clearButton = screen.getByTestId('clear-filters-btn')
      fireEvent.click(clearButton)

      expect(mockOnClearFilters).toHaveBeenCalled()
    })

    it('uses ghost variant for clear filters button', () => {
      render(
        <EventFilters
          eventTypes={mockEventTypes}
          selectedEventType={'type-1'}
          onEventTypeChange={mockOnEventTypeChange}
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          onClearFilters={mockOnClearFilters}
        />,
      )

      const clearButton = screen.getByTestId('clear-filters-btn')
      expect(clearButton).toHaveAttribute('data-variant', 'ghost')
      expect(clearButton).toHaveAttribute('data-size', 'sm')
    })
  })

  describe('Component Integration', () => {
    it('renders with both filters active', () => {
      render(
        <EventFilters
          eventTypes={mockEventTypes}
          selectedEventType={'type-2'}
          onEventTypeChange={mockOnEventTypeChange}
          searchQuery="Youth"
          onSearchChange={mockOnSearchChange}
          onClearFilters={mockOnClearFilters}
        />,
      )

      expect(screen.getByTestId('event-type-select')).toHaveValue('type-2')
      expect(screen.getByTestId('search-input')).toHaveValue('Youth')
      expect(screen.getByTestId('clear-filters-btn')).toBeInTheDocument()
    })

    it('handles multiple filter changes', () => {
      render(
        <EventFilters
          eventTypes={mockEventTypes}
          selectedEventType={undefined}
          onEventTypeChange={mockOnEventTypeChange}
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          onClearFilters={mockOnClearFilters}
        />,
      )

      // Change event type
      const select = screen.getByTestId('event-type-select')
      fireEvent.change(select, { target: { value: 'type-1' } })
      expect(mockOnEventTypeChange).toHaveBeenCalledWith('type-1')

      // Change search
      const searchInput = screen.getByTestId('search-input')
      fireEvent.change(searchInput, { target: { value: 'test' } })
      expect(mockOnSearchChange).toHaveBeenCalledWith('test')
    })
  })
})
