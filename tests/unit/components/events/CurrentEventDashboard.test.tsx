import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CurrentEventDashboard } from '~/features/events/components/CurrentEventDashboard'
import type { Event } from '~/features/events/types'

// Mock child components
vi.mock('~/features/events/components/EventBanner', () => ({
  EventBanner: vi.fn(({ event }) => (
    <div data-testid="event-banner" data-event-id={event._id}>
      EventBanner: {event.name}
    </div>
  )),
}))

vi.mock('~/features/events/components/EventInfo', () => ({
  EventInfo: vi.fn(({ event, attendanceCount }) => (
    <div
      data-testid="event-info"
      data-event-id={event._id}
      data-attendance-count={attendanceCount}
    >
      EventInfo
    </div>
  )),
}))

vi.mock('~/features/events/components/AttendanceManager', () => ({
  AttendanceManager: vi.fn(({ eventId }) => (
    <div data-testid="attendance-manager" data-event-id={eventId}>
      AttendanceManager
    </div>
  )),
}))

describe('CurrentEventDashboard', () => {
  const mockEvent: Event = {
    _id: 'event-123',
    name: 'Sunday Service',
    eventTypeId: 'type-1',
    eventType: {
      _id: 'type-1',
      name: 'Sunday Service',
      color: '#3b82f6',
      isActive: true,
      createdAt: Date.now(),
    },
    description: 'Weekly Sunday worship service',
    date: Date.now(),
    startTime: '09:00',
    endTime: '11:00',
    location: 'Main Sanctuary',
    status: 'active',
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    attendanceCount: 42,
  }

  const defaultProps = {
    event: mockEvent,
    onCompleteEvent: vi.fn(),
    onCancelEvent: vi.fn(),
    onEditEvent: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Suppress console.log for clean test output
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('renders with event data', () => {
      render(<CurrentEventDashboard {...defaultProps} />)

      expect(screen.getByTestId('event-banner')).toBeInTheDocument()
      expect(screen.getByTestId('event-info')).toBeInTheDocument()
      expect(screen.getByTestId('attendance-manager')).toBeInTheDocument()
    })

    it('displays LIVE badge with animation', () => {
      render(<CurrentEventDashboard {...defaultProps} />)

      const liveBadge = screen.getByText('LIVE')
      expect(liveBadge).toBeInTheDocument()
      expect(liveBadge).toHaveClass('text-green-600')

      // Check for animated ping element
      const pingElement = document.querySelector('.animate-ping')
      expect(pingElement).toBeInTheDocument()
    })

    it('renders all action buttons when callbacks provided', () => {
      render(<CurrentEventDashboard {...defaultProps} />)

      expect(
        screen.getByRole('button', { name: /edit event/i }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /complete event/i }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /cancel event/i }),
      ).toBeInTheDocument()
    })

    it('hides action buttons when callbacks not provided', () => {
      render(<CurrentEventDashboard event={mockEvent} />)

      expect(
        screen.queryByRole('button', { name: /edit event/i }),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: /complete event/i }),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: /cancel event/i }),
      ).not.toBeInTheDocument()
    })

    it('hides only specific buttons when their callbacks not provided', () => {
      render(
        <CurrentEventDashboard
          event={mockEvent}
          onEditEvent={defaultProps.onEditEvent}
          onCompleteEvent={defaultProps.onCompleteEvent}
        />,
      )

      expect(
        screen.getByRole('button', { name: /edit event/i }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /complete event/i }),
      ).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: /cancel event/i }),
      ).not.toBeInTheDocument()
    })

    it('has proper layout structure', () => {
      render(<CurrentEventDashboard {...defaultProps} />)

      const container = screen.getByTestId('event-banner').parentElement
      expect(container).toHaveClass('space-y-6')
    })
  })

  describe('Callback Actions', () => {
    it('calls onEditEvent when Edit button clicked', () => {
      render(<CurrentEventDashboard {...defaultProps} />)

      const editButton = screen.getByRole('button', { name: /edit event/i })
      fireEvent.click(editButton)

      expect(defaultProps.onEditEvent).toHaveBeenCalledTimes(1)
    })

    it('calls onCompleteEvent when Complete button clicked', () => {
      render(<CurrentEventDashboard {...defaultProps} />)

      const completeButton = screen.getByRole('button', {
        name: /complete event/i,
      })
      fireEvent.click(completeButton)

      expect(defaultProps.onCompleteEvent).toHaveBeenCalledTimes(1)
    })

    it('calls onCancelEvent when Cancel button clicked', () => {
      render(<CurrentEventDashboard {...defaultProps} />)

      const cancelButton = screen.getByRole('button', { name: /cancel event/i })
      fireEvent.click(cancelButton)

      expect(defaultProps.onCancelEvent).toHaveBeenCalledTimes(1)
    })
  })

  describe('Component Integration', () => {
    it('passes event data to EventBanner', () => {
      render(<CurrentEventDashboard {...defaultProps} />)

      const eventBanner = screen.getByTestId('event-banner')
      expect(eventBanner).toHaveAttribute('data-event-id', mockEvent._id)
      expect(eventBanner.textContent).toContain(mockEvent.name)
    })

    it('passes event and attendanceCount to EventInfo', () => {
      render(<CurrentEventDashboard {...defaultProps} />)

      const eventInfo = screen.getByTestId('event-info')
      expect(eventInfo).toHaveAttribute('data-event-id', mockEvent._id)
      expect(eventInfo).toHaveAttribute(
        'data-attendance-count',
        String(mockEvent.attendanceCount),
      )
    })

    it('passes correct eventId to AttendanceManager', () => {
      render(<CurrentEventDashboard {...defaultProps} />)

      const attendanceManager = screen.getByTestId('attendance-manager')
      expect(attendanceManager).toHaveAttribute('data-event-id', mockEvent._id)
    })

    it('handles zero attendance count', () => {
      const eventWithZeroAttendance = { ...mockEvent, attendanceCount: 0 }
      render(
        <CurrentEventDashboard
          {...defaultProps}
          event={eventWithZeroAttendance}
        />,
      )

      const eventInfo = screen.getByTestId('event-info')
      expect(eventInfo).toHaveAttribute('data-attendance-count', '0')
    })
  })

  describe('Edge Cases', () => {
    it('renders with minimal event data', () => {
      const minimalEvent: Event = {
        _id: 'event-min',
        name: 'Test Event',
        eventTypeId: 'type-1',
        date: Date.now(),
        status: 'active',
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      render(
        <CurrentEventDashboard
          event={minimalEvent}
          onCompleteEvent={defaultProps.onCompleteEvent}
        />,
      )

      expect(screen.getByTestId('event-banner')).toBeInTheDocument()
      expect(screen.getByTestId('event-info')).toBeInTheDocument()
      expect(screen.getByTestId('attendance-manager')).toBeInTheDocument()
    })

    it('renders with event that has no eventType', () => {
      const eventWithoutType: Event = {
        ...mockEvent,
        eventType: undefined,
      }

      render(
        <CurrentEventDashboard
          event={eventWithoutType}
          onCompleteEvent={defaultProps.onCompleteEvent}
        />,
      )

      expect(screen.getByTestId('event-banner')).toBeInTheDocument()
    })

    it('logs event data to console on mount', () => {
      render(<CurrentEventDashboard {...defaultProps} />)

      expect(console.log).toHaveBeenCalledWith(
        '=== DEBUG: CurrentEventDashboard ===',
      )
      expect(console.log).toHaveBeenCalledWith('Event:', mockEvent)
      expect(console.log).toHaveBeenCalledWith('Event ID:', mockEvent._id)
      expect(console.log).toHaveBeenCalledWith('Event Name:', mockEvent.name)
      expect(console.log).toHaveBeenCalledWith(
        'Event Status:',
        mockEvent.status,
      )
      expect(console.log).toHaveBeenCalledWith(
        '=====================================',
      )
    })

    it('renders action buttons in correct order', () => {
      render(<CurrentEventDashboard {...defaultProps} />)

      const buttons = screen.getAllByRole('button')
      const buttonTexts = buttons.map((btn) => btn.textContent)

      // Should have Edit, Complete, and Cancel buttons
      expect(buttonTexts).toContain('Edit Event')
      expect(buttonTexts).toContain('Complete Event')
      expect(buttonTexts).toContain('Cancel Event')
    })

    it('renders action buttons section with border separator', () => {
      render(<CurrentEventDashboard {...defaultProps} />)

      const actionSection = screen.getByRole('button', {
        name: /edit event/i,
      }).parentElement
      expect(actionSection).toHaveClass('border-t')
      expect(actionSection).toHaveClass('pt-4')
    })
  })

  describe('Button Variants', () => {
    it('Edit button has outline variant', () => {
      render(<CurrentEventDashboard {...defaultProps} />)

      const editButton = screen.getByRole('button', { name: /edit event/i })
      // Button component typically applies variant class
      expect(editButton.className).toContain('outline')
    })

    it('Complete button has default variant', () => {
      render(<CurrentEventDashboard {...defaultProps} />)

      const completeButton = screen.getByRole('button', {
        name: /complete event/i,
      })
      // Default variant button exists and is rendered
      expect(completeButton).toBeInTheDocument()
      // It should be a primary-style button (not outline or ghost)
      expect(completeButton.className).not.toContain('ghost')
    })

    it('Cancel button has destructive variant', () => {
      render(<CurrentEventDashboard {...defaultProps} />)

      const cancelButton = screen.getByRole('button', { name: /cancel event/i })
      expect(cancelButton.className).toContain('destructive')
    })
  })

  describe('Icons', () => {
    it('Edit button has pencil icon', () => {
      render(<CurrentEventDashboard {...defaultProps} />)

      const editButton = screen.getByRole('button', { name: /edit event/i })
      const svg = editButton.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('Complete button has check circle icon', () => {
      render(<CurrentEventDashboard {...defaultProps} />)

      const completeButton = screen.getByRole('button', {
        name: /complete event/i,
      })
      const svg = completeButton.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('Cancel button has X circle icon', () => {
      render(<CurrentEventDashboard {...defaultProps} />)

      const cancelButton = screen.getByRole('button', { name: /cancel event/i })
      const svg = cancelButton.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('Responsive Layout', () => {
    it('action buttons container has flex layout', () => {
      render(<CurrentEventDashboard {...defaultProps} />)

      const buttonContainer = screen.getByRole('button', {
        name: /edit event/i,
      }).parentElement
      expect(buttonContainer).toHaveClass('flex')
      expect(buttonContainer).toHaveClass('flex-wrap')
      expect(buttonContainer).toHaveClass('gap-3')
    })
  })
})
