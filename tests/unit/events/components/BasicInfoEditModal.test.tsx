import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BasicInfoEditModal } from '~/features/events/components/BasicInfoEditModal'
import type { Event } from '~/features/events/types'

// Mock ResizeObserver for floating-ui components
class MockResizeObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

vi.stubGlobal('ResizeObserver', MockResizeObserver)

describe('BasicInfoEditModal', () => {
  const mockOnSave = vi.fn()
  const mockOnClose = vi.fn()

  const mockEvent: Event = {
    _id: 'event-123',
    name: 'Sunday Service',
    eventTypeId: 'type-123',
    description: 'Weekly worship service',
    date: new Date('2026-03-30').getTime(),
    startTime: '09:00',
    endTime: '11:00',
    location: 'Main Sanctuary',
    status: 'upcoming',
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders with event data pre-populated', () => {
      render(
        <BasicInfoEditModal
          open={true}
          event={mockEvent}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />,
      )

      expect(screen.getByText('Edit Basic Info')).toBeInTheDocument()
      expect(screen.getByLabelText('Event Name *')).toHaveValue(
        'Sunday Service',
      )
      expect(screen.getByLabelText('Location')).toHaveValue('Main Sanctuary')
      expect(
        screen.getByRole('button', { name: /save changes/i }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /cancel/i }),
      ).toBeInTheDocument()
    })

    it('renders with empty optional fields when not provided', () => {
      const eventWithoutOptionals: Event = {
        ...mockEvent,
        startTime: undefined,
        endTime: undefined,
        location: undefined,
      }

      render(
        <BasicInfoEditModal
          open={true}
          event={eventWithoutOptionals}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />,
      )

      expect(screen.getByLabelText('Event Name *')).toHaveValue(
        'Sunday Service',
      )
      expect(screen.getByLabelText('Location')).toHaveValue('')
    })
  })

  describe('Validation', () => {
    it('validates required name field', async () => {
      render(
        <BasicInfoEditModal
          open={true}
          event={mockEvent}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />,
      )

      const nameInput = screen.getByLabelText('Event Name *')
      fireEvent.change(nameInput, { target: { value: '' } })
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(screen.getByText('Event name is required')).toBeInTheDocument()
      })
      expect(mockOnSave).not.toHaveBeenCalled()
    })

    it('validates minimum name length', async () => {
      render(
        <BasicInfoEditModal
          open={true}
          event={mockEvent}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />,
      )

      const nameInput = screen.getByLabelText('Event Name *')
      fireEvent.change(nameInput, { target: { value: 'A' } })
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(
          screen.getByText('Name must be at least 2 characters'),
        ).toBeInTheDocument()
      })
      expect(mockOnSave).not.toHaveBeenCalled()
    })

    it('validates end time is after start time', async () => {
      const eventWithTimes: Event = {
        ...mockEvent,
        startTime: '11:00',
        endTime: '09:00', // Invalid: end before start
      }

      render(
        <BasicInfoEditModal
          open={true}
          event={eventWithTimes}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />,
      )

      // Try to save with invalid times
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(
          screen.getByText('End time must be after start time'),
        ).toBeInTheDocument()
      })
      expect(mockOnSave).not.toHaveBeenCalled()
    })
  })

  describe('Form Submission', () => {
    it('calls onSave with updated data when form is valid', async () => {
      render(
        <BasicInfoEditModal
          open={true}
          event={mockEvent}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />,
      )

      const nameInput = screen.getByLabelText('Event Name *')
      fireEvent.change(nameInput, { target: { value: 'Updated Service Name' } })

      const locationInput = screen.getByLabelText('Location')
      fireEvent.change(locationInput, { target: { value: 'New Location' } })

      fireEvent.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Updated Service Name',
            location: 'New Location',
            date: mockEvent.date,
            startTime: mockEvent.startTime,
            endTime: mockEvent.endTime,
          }),
        )
      })
    })

    it('calls onSave without optional fields when they are empty', async () => {
      render(
        <BasicInfoEditModal
          open={true}
          event={mockEvent}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />,
      )

      // Clear optional fields
      const locationInput = screen.getByLabelText('Location')
      fireEvent.change(locationInput, { target: { value: '' } })

      fireEvent.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            name: mockEvent.name,
            location: undefined,
          }),
        )
      })
    })

    it('calls onClose when cancel button is clicked', async () => {
      render(
        <BasicInfoEditModal
          open={true}
          event={mockEvent}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />,
      )

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })
      expect(mockOnSave).not.toHaveBeenCalled()
    })
  })

  describe('Modal State', () => {
    it('updates state when open prop changes', async () => {
      const { rerender } = render(
        <BasicInfoEditModal
          open={false}
          event={mockEvent}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />,
      )

      expect(screen.queryByText('Edit Basic Info')).not.toBeInTheDocument()

      rerender(
        <BasicInfoEditModal
          open={true}
          event={mockEvent}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />,
      )

      expect(screen.getByText('Edit Basic Info')).toBeInTheDocument()
    })

    it('resets form when reopened with different event data', async () => {
      const { rerender } = render(
        <BasicInfoEditModal
          open={true}
          event={mockEvent}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />,
      )

      expect(screen.getByLabelText('Event Name *')).toHaveValue(
        'Sunday Service',
      )

      const updatedEvent = { ...mockEvent, name: 'Different Event' }
      rerender(
        <BasicInfoEditModal
          open={false}
          event={updatedEvent}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />,
      )

      // Reopen with new event
      rerender(
        <BasicInfoEditModal
          open={true}
          event={updatedEvent}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />,
      )

      await waitFor(() => {
        expect(screen.getByLabelText('Event Name *')).toHaveValue(
          'Different Event',
        )
      })
    })
  })
})
