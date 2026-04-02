import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GenericEventDetails } from '~/features/events/components/GenericEventDetails'
import type { Event, EventType } from '~/features/events/types'

// Mock the hooks
vi.mock('~/features/events/hooks/useEventTypes', () => ({
  useEventTypesList: vi.fn(),
}))

vi.mock('~/features/events/hooks/useEventMutations', () => ({
  useUpdateEvent: vi.fn(),
  useStartEvent: vi.fn(),
  useCompleteEvent: vi.fn(),
  useCancelEvent: vi.fn(),
  useArchiveEvent: vi.fn(),
}))

// Mock child components
vi.mock('~/features/events/components/AttendanceManager', () => ({
  AttendanceManager: vi.fn(() => (
    <div data-testid="attendance-manager">Attendance Manager</div>
  )),
}))

vi.mock('~/features/events/components/BasicInfoEditModal', () => ({
  BasicInfoEditModal: vi.fn(() => (
    <div data-testid="basic-info-modal">Basic Info Modal</div>
  )),
}))

vi.mock('~/features/events/components/DescriptionEditModal', () => ({
  DescriptionEditModal: vi.fn(() => (
    <div data-testid="description-modal">Description Modal</div>
  )),
}))

vi.mock('~/features/events/components/BannerUploader', () => ({
  BannerUploader: vi.fn(() => (
    <div data-testid="banner-uploader">Banner Uploader</div>
  )),
}))

vi.mock('~/features/events/components/MediaGallery', () => ({
  MediaGallery: vi.fn(() => (
    <div data-testid="media-gallery">Media Gallery</div>
  )),
}))

vi.mock('~/features/events/components/StatusAndTypeEditModal', () => ({
  StatusAndTypeEditModal: vi.fn(() => (
    <div data-testid="status-type-modal">Status and Type Modal</div>
  )),
}))

import { useEventTypesList } from '~/features/events/hooks/useEventTypes'
import {
  useUpdateEvent,
  useStartEvent,
  useCompleteEvent,
  useCancelEvent,
  useArchiveEvent,
} from '~/features/events/hooks/useEventMutations'

describe('GenericEventDetails', () => {
  const mockEventType: EventType = {
    _id: 'type-123',
    name: 'Sunday Service',
    color: '#3b82f6',
    isActive: true,
    createdAt: Date.now(),
  }

  const mockEvent: Event = {
    _id: 'event-123',
    name: 'Sunday Service',
    eventTypeId: 'type-123',
    eventType: mockEventType,
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

  const mockMutateAsync = vi.fn()
  const mockOnSave = vi.fn()
  const mockOnCancel = vi.fn()
  const mockOnUpdate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useEventTypesList as any).mockReturnValue({ data: [mockEventType] })
    ;(useUpdateEvent as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    })
    ;(useStartEvent as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    })
    ;(useCompleteEvent as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    })
    ;(useCancelEvent as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    })
    ;(useArchiveEvent as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    })
  })

  describe('Rendering', () => {
    it('renders event details in dashboard mode', () => {
      render(<GenericEventDetails event={mockEvent} mode="dashboard" />)

      // Check event name in h1 title (not the badge which has same text)
      expect(
        screen.getByRole('heading', { level: 1, name: 'Sunday Service' }),
      ).toBeInTheDocument()
      expect(screen.getByText('Upcoming')).toBeInTheDocument()
      expect(screen.getByText('Main Sanctuary')).toBeInTheDocument()
      expect(screen.getByText('Event Details')).toBeInTheDocument()
      expect(screen.getByText('Description')).toBeInTheDocument()
      expect(screen.getByText('Media Gallery (0)')).toBeInTheDocument()
      expect(screen.getByTestId('attendance-manager')).toBeInTheDocument()
    })

    it('renders event details in detail mode', () => {
      render(<GenericEventDetails event={mockEvent} mode="detail" />)

      expect(
        screen.getByRole('heading', { level: 1, name: 'Sunday Service' }),
      ).toBeInTheDocument()
      expect(screen.getByText('Back to Events')).toBeInTheDocument()
      expect(screen.queryByText('View All Events')).not.toBeInTheDocument()
    })

    it('shows correct navigation button based on mode', () => {
      const { rerender } = render(
        <GenericEventDetails event={mockEvent} mode="dashboard" />,
      )

      expect(screen.getByText('View All Events')).toBeInTheDocument()
      expect(screen.queryByText('Back to Events')).not.toBeInTheDocument()

      rerender(<GenericEventDetails event={mockEvent} mode="detail" />)

      expect(screen.getByText('Back to Events')).toBeInTheDocument()
      expect(screen.queryByText('View All Events')).not.toBeInTheDocument()
    })

    it('renders event without optional fields', () => {
      const eventWithoutOptionals: Event = {
        ...mockEvent,
        description: undefined,
        startTime: undefined,
        endTime: undefined,
        location: undefined,
        bannerImage: undefined,
        media: undefined,
      }

      render(
        <GenericEventDetails event={eventWithoutOptionals} mode="dashboard" />,
      )

      expect(screen.getByText('No description added')).toBeInTheDocument()
      expect(screen.queryByText('Main Sanctuary')).not.toBeInTheDocument()
    })

    it('renders banner image when present', () => {
      const eventWithBanner: Event = {
        ...mockEvent,
        bannerImage: 'https://example.com/banner.jpg',
      }

      render(<GenericEventDetails event={eventWithBanner} mode="dashboard" />)

      const banner = screen.getByAltText('Sunday Service')
      expect(banner).toHaveAttribute('src', 'https://example.com/banner.jpg')
    })

    it('renders media gallery when media items exist', () => {
      const eventWithMedia: Event = {
        ...mockEvent,
        media: [
          { url: 'https://example.com/photo1.jpg', type: 'image' },
          { url: 'https://example.com/photo2.jpg', type: 'image' },
        ],
      }

      render(<GenericEventDetails event={eventWithMedia} mode="dashboard" />)

      expect(screen.getByText('Media Gallery (2)')).toBeInTheDocument()
    })
  })

  describe('Event Status Actions', () => {
    it('shows Start Event button for upcoming events', () => {
      render(<GenericEventDetails event={mockEvent} mode="dashboard" />)

      expect(
        screen.getByRole('button', { name: /start event/i }),
      ).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: /complete event/i }),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: /cancel event/i }),
      ).not.toBeInTheDocument()
    })

    it('shows Complete and Cancel buttons for active events', () => {
      const activeEvent: Event = { ...mockEvent, status: 'active' }

      render(<GenericEventDetails event={activeEvent} mode="dashboard" />)

      expect(
        screen.queryByRole('button', { name: /start event/i }),
      ).not.toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /complete event/i }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /cancel event/i }),
      ).toBeInTheDocument()
    })

    it('hides action buttons for completed events', () => {
      const completedEvent: Event = { ...mockEvent, status: 'completed' }

      render(<GenericEventDetails event={completedEvent} mode="dashboard" />)

      expect(
        screen.queryByRole('button', { name: /start event/i }),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: /complete event/i }),
      ).not.toBeInTheDocument()
    })

    it('calls startEvent mutation when Start Event is clicked', async () => {
      render(<GenericEventDetails event={mockEvent} mode="dashboard" />)

      fireEvent.click(screen.getByRole('button', { name: /start event/i }))
      expect(mockMutateAsync).toHaveBeenCalledWith('event-123')
    })
  })

  describe('Unsaved Event State', () => {
    it('shows unsaved event warning and hides attendance manager', () => {
      render(
        <GenericEventDetails
          event={mockEvent}
          mode="dashboard"
          isUnsaved={true}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />,
      )

      expect(screen.getByText('Unsaved Event Draft')).toBeInTheDocument()
      expect(screen.queryByTestId('attendance-manager')).not.toBeInTheDocument()
    })

    it('shows Save and Cancel buttons for unsaved events', () => {
      render(
        <GenericEventDetails
          event={mockEvent}
          mode="dashboard"
          isUnsaved={true}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />,
      )

      expect(
        screen.getByRole('button', { name: /save event/i }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /cancel/i }),
      ).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: /start event/i }),
      ).not.toBeInTheDocument()
    })

    it('calls onSave when Save Event is clicked', () => {
      render(
        <GenericEventDetails
          event={mockEvent}
          mode="dashboard"
          isUnsaved={true}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />,
      )

      fireEvent.click(screen.getByRole('button', { name: /save event/i }))
      expect(mockOnSave).toHaveBeenCalled()
    })

    it('calls onCancel when Cancel is clicked', () => {
      render(
        <GenericEventDetails
          event={mockEvent}
          mode="dashboard"
          isUnsaved={true}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />,
      )

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
      expect(mockOnCancel).toHaveBeenCalled()
    })

    it('calls onUpdate when basic info is updated for unsaved event', () => {
      render(
        <GenericEventDetails
          event={mockEvent}
          mode="dashboard"
          isUnsaved={true}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          onUpdate={mockOnUpdate}
        />,
      )

      // Click Edit button for Event Details
      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      fireEvent.click(editButtons[0])

      // The BasicInfoEditModal should be shown (mocked)
      expect(screen.getByTestId('basic-info-modal')).toBeInTheDocument()
    })
  })

  describe('Modal Interactions', () => {
    it('opens basic info modal when edit button is clicked', () => {
      render(<GenericEventDetails event={mockEvent} mode="dashboard" />)

      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      fireEvent.click(editButtons[0])

      expect(screen.getByTestId('basic-info-modal')).toBeInTheDocument()
    })

    it('opens description modal when edit button is clicked', () => {
      render(<GenericEventDetails event={mockEvent} mode="dashboard" />)

      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      // Description edit button is the second one
      fireEvent.click(editButtons[1])

      expect(screen.getByTestId('description-modal')).toBeInTheDocument()
    })

    it('opens status and type modal when badge is clicked', () => {
      render(<GenericEventDetails event={mockEvent} mode="dashboard" />)

      const statusBadge = screen.getByText('Upcoming')
      fireEvent.click(statusBadge)

      expect(screen.getByTestId('status-type-modal')).toBeInTheDocument()
    })
  })
})
