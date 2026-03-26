import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { StatusAndTypeEditModal } from '~/features/events/components/StatusAndTypeEditModal'
import type { Event, EventType } from '~/features/events/types'

describe('StatusAndTypeEditModal', () => {
  const mockEvent: Event = {
    _id: 'event-123',
    name: 'Sunday Service',
    description: 'Weekly worship service',
    date: new Date('2026-03-30').getTime(),
    startTime: '09:00',
    endTime: '11:00',
    location: 'Main Sanctuary',
    status: 'upcoming',
    eventTypeId: 'type-123',
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    eventType: {
      _id: 'type-123',
      name: 'Sunday Service',
      color: '#3b82f6',
      isActive: true,
      createdAt: Date.now(),
    },
  }

  const mockEventTypes: EventType[] = [
    {
      _id: 'type-123',
      name: 'Sunday Service',
      color: '#3b82f6',
      isActive: true,
      createdAt: Date.now(),
    },
    {
      _id: 'type-456',
      name: 'Youth Group',
      color: '#8b5cf6',
      isActive: true,
      createdAt: Date.now(),
    },
    {
      _id: 'type-789',
      name: 'Prayer Meeting',
      color: '#f97316',
      isActive: true,
      createdAt: Date.now(),
    },
  ]

  const mockOnSave = vi.fn()
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders when open is true', () => {
      render(
        <StatusAndTypeEditModal
          open={true}
          event={mockEvent}
          eventTypes={mockEventTypes}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />,
      )

      expect(screen.getByText(/event status/i)).toBeInTheDocument()
    })

    it('does not render when open is false', () => {
      render(
        <StatusAndTypeEditModal
          open={false}
          event={mockEvent}
          eventTypes={mockEventTypes}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />,
      )

      expect(screen.queryByText(/event status/i)).not.toBeInTheDocument()
    })

    it('renders status and event type dropdowns', () => {
      render(
        <StatusAndTypeEditModal
          open={true}
          event={mockEvent}
          eventTypes={mockEventTypes}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />,
      )

      // Use getAllByLabelText since there are multiple elements with "status" text
      const statusElements = screen.getAllByLabelText(/status/i)
      expect(statusElements.length).toBeGreaterThan(0)

      const eventTypeElements = screen.getAllByLabelText(/event type/i)
      expect(eventTypeElements.length).toBeGreaterThan(0)
    })

    it('renders save and cancel buttons', () => {
      render(
        <StatusAndTypeEditModal
          open={true}
          event={mockEvent}
          eventTypes={mockEventTypes}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />,
      )

      expect(
        screen.getByRole('button', { name: /save changes/i }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /cancel/i }),
      ).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('shows error when event type is not selected', async () => {
      render(
        <StatusAndTypeEditModal
          open={true}
          event={{ ...mockEvent, eventTypeId: '' }}
          eventTypes={mockEventTypes}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />,
      )

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText(/event type is required/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('calls onSave with correct data when form is valid', async () => {
      render(
        <StatusAndTypeEditModal
          open={true}
          event={mockEvent}
          eventTypes={mockEventTypes}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />,
      )

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          status: 'upcoming',
          eventTypeId: 'type-123',
        })
      })
    })

    it('does not call onSave when validation fails', async () => {
      render(
        <StatusAndTypeEditModal
          open={true}
          event={{ ...mockEvent, eventTypeId: '' }}
          eventTypes={mockEventTypes}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />,
      )

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(mockOnSave).not.toHaveBeenCalled()
      })
    })
  })

  describe('Modal Close Behavior', () => {
    it('calls onClose when clicking cancel button', () => {
      render(
        <StatusAndTypeEditModal
          open={true}
          event={mockEvent}
          eventTypes={mockEventTypes}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />,
      )

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('clears errors when reopened', async () => {
      const { rerender } = render(
        <StatusAndTypeEditModal
          open={true}
          event={{ ...mockEvent, eventTypeId: '' }}
          eventTypes={mockEventTypes}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />,
      )

      // Trigger error
      const saveButton = screen.getByRole('button', { name: /save changes/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText(/event type is required/i)).toBeInTheDocument()
      })

      // Close and reopen
      rerender(
        <StatusAndTypeEditModal
          open={false}
          event={mockEvent}
          eventTypes={mockEventTypes}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />,
      )

      rerender(
        <StatusAndTypeEditModal
          open={true}
          event={mockEvent}
          eventTypes={mockEventTypes}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />,
      )

      // Error should be cleared
      expect(
        screen.queryByText(/event type is required/i),
      ).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty event types array', () => {
      render(
        <StatusAndTypeEditModal
          open={true}
          event={mockEvent}
          eventTypes={[]}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />,
      )

      // Should still render without crashing
      expect(screen.getByLabelText(/event type/i)).toBeInTheDocument()
    })

    it('handles all event statuses', () => {
      const statuses: Array<'upcoming' | 'active' | 'completed' | 'cancelled'> =
        ['upcoming', 'active', 'completed', 'cancelled']

      statuses.forEach((status) => {
        const { unmount } = render(
          <StatusAndTypeEditModal
            open={true}
            event={{ ...mockEvent, status }}
            eventTypes={mockEventTypes}
            onSave={mockOnSave}
            onClose={mockOnClose}
          />,
        )

        expect(screen.getByText(/event status/i)).toBeInTheDocument()
        unmount()
      })
    })
  })
})
