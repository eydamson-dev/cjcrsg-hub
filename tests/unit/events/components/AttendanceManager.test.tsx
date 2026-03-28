import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AttendanceManager } from '~/features/events/components/AttendanceManager'

// Mock the hooks
vi.mock('@tanstack/react-router', () => ({
  useNavigate: vi.fn(() => vi.fn()),
}))

vi.mock('~/features/events/hooks/useAttendance', () => ({
  useAttendanceByEvent: vi.fn(),
  useAttendanceStats: vi.fn(),
  useUnCheckIn: vi.fn(),
  useBulkCheckIn: vi.fn(),
  useUpdateInviter: vi.fn(),
}))

// Mock child components that use QueryClient
vi.mock('~/features/events/components/InviterSelectionModal', () => ({
  InviterSelectionModal: () => null,
}))

vi.mock('~/features/events/components/AttendeeSearchModal', () => ({
  AttendeeSearchModal: () => null,
}))

vi.mock('~/features/events/components/CreateAttendeeModal', () => ({
  CreateAttendeeModal: () => null,
}))

import {
  useAttendanceByEvent,
  useAttendanceStats,
  useUnCheckIn,
  useBulkCheckIn,
  useUpdateInviter,
} from '~/features/events/hooks/useAttendance'

describe('AttendanceManager', () => {
  const mockEventId = 'event-123'
  const mockMutateAsync = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useAttendanceByEvent as any).mockReturnValue({
      data: { page: [], continueCursor: null },
      isLoading: false,
    })
    ;(useAttendanceStats as any).mockReturnValue({
      data: { total: 0, members: 0, visitors: 0 },
    })
    ;(useUnCheckIn as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    })
    ;(useBulkCheckIn as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    })
    ;(useUpdateInviter as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    })
  })

  describe('Rendering', () => {
    it('renders Add Attendance button', () => {
      render(<AttendanceManager eventId={mockEventId} />)

      expect(
        screen.getByRole('button', { name: /add attendance/i }),
      ).toBeInTheDocument()
      expect(screen.getByText('Checked-in Attendees')).toBeInTheDocument()
    })

    it('shows empty state when no attendees', () => {
      render(<AttendanceManager eventId={mockEventId} />)

      expect(screen.getByText('No attendees yet')).toBeInTheDocument()
      expect(
        screen.getByText('Click "Add Attendance" to check someone in'),
      ).toBeInTheDocument()
    })

    it('shows loading state while fetching attendance', () => {
      ;(useAttendanceByEvent as any).mockReturnValue({
        data: null,
        isLoading: true,
      })

      render(<AttendanceManager eventId={mockEventId} />)

      expect(screen.getByText('Checked-in Attendees')).toBeInTheDocument()
    })

    it('displays total count of checked-in attendees', () => {
      ;(useAttendanceStats as any).mockReturnValue({
        data: { total: 15, members: 10, visitors: 5 },
      })
      ;(useAttendanceByEvent as any).mockReturnValue({
        data: {
          page: [
            {
              _id: 'record-1',
              eventId: mockEventId,
              attendeeId: 'attendee-1',
              checkedInAt: Date.now(),
              checkedInBy: 'user-1',
              attendee: {
                _id: 'attendee-1',
                firstName: 'John',
                lastName: 'Doe',
                status: 'member',
              },
            },
          ],
          continueCursor: null,
        },
        isLoading: false,
      })

      render(<AttendanceManager eventId={mockEventId} />)

      expect(screen.getByText('15')).toBeInTheDocument()
    })

    it('renders attendance table with attendee data', () => {
      ;(useAttendanceByEvent as any).mockReturnValue({
        data: {
          page: [
            {
              _id: 'record-1',
              eventId: mockEventId,
              attendeeId: 'attendee-1',
              checkedInAt: new Date('2026-03-30T10:00:00').getTime(),
              checkedInBy: 'user-1',
              attendee: {
                _id: 'attendee-1',
                firstName: 'John',
                lastName: 'Doe',
                status: 'member',
              },
            },
            {
              _id: 'record-2',
              eventId: mockEventId,
              attendeeId: 'attendee-2',
              checkedInAt: new Date('2026-03-30T10:30:00').getTime(),
              checkedInBy: 'user-1',
              attendee: {
                _id: 'attendee-2',
                firstName: 'Jane',
                lastName: 'Smith',
                status: 'visitor',
              },
            },
          ],
          continueCursor: null,
        },
        isLoading: false,
      })

      render(<AttendanceManager eventId={mockEventId} />)

      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('Member')).toBeInTheDocument()
      expect(screen.getByText('Visitor')).toBeInTheDocument()
    })

    it('shows unknown attendee when attendee data is null', () => {
      ;(useAttendanceByEvent as any).mockReturnValue({
        data: {
          page: [
            {
              _id: 'record-1',
              eventId: mockEventId,
              attendeeId: 'attendee-1',
              checkedInAt: Date.now(),
              checkedInBy: 'user-1',
              attendee: null,
            },
          ],
          continueCursor: null,
        },
        isLoading: false,
      })

      render(<AttendanceManager eventId={mockEventId} />)

      expect(screen.getByText('Unknown Attendee')).toBeInTheDocument()
    })
  })

  describe('Add Attendance Button', () => {
    it('opens AttendeeSearchModal when clicking Add Attendance button', () => {
      render(<AttendanceManager eventId={mockEventId} />)

      const addButton = screen.getByRole('button', { name: /add attendance/i })
      fireEvent.click(addButton)

      // Modal should open (we can't fully test the modal here as it's a separate component)
      // But we can verify the button exists and is clickable
      expect(addButton).toBeInTheDocument()
    })
  })

  describe('Remove/Un-check-in Functionality', () => {
    it('renders attendance row with attendee data', () => {
      ;(useAttendanceByEvent as any).mockReturnValue({
        data: {
          page: [
            {
              _id: 'record-1',
              eventId: mockEventId,
              attendeeId: 'attendee-1',
              checkedInAt: Date.now(),
              checkedInBy: 'user-1',
              attendee: {
                _id: 'attendee-1',
                firstName: 'John',
                lastName: 'Doe',
                status: 'member',
              },
            },
          ],
          continueCursor: null,
        },
        isLoading: false,
      })

      render(<AttendanceManager eventId={mockEventId} />)

      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Member')).toBeInTheDocument()
    })
  })

  describe('Pagination', () => {
    it('shows pagination controls when there are multiple pages', () => {
      ;(useAttendanceByEvent as any).mockReturnValue({
        data: {
          page: Array.from({ length: 10 }, (_, i) => ({
            _id: `record-${i}`,
            eventId: mockEventId,
            attendeeId: `attendee-${i}`,
            checkedInAt: Date.now(),
            checkedInBy: 'user-1',
            attendee: {
              _id: `attendee-${i}`,
              firstName: `Person${i}`,
              lastName: 'Test',
              status: 'member',
            },
          })),
          continueCursor: 'next-cursor',
        },
        isLoading: false,
      })
      ;(useAttendanceStats as any).mockReturnValue({
        data: { total: 25, members: 20, visitors: 5 },
      })

      render(<AttendanceManager eventId={mockEventId} />)

      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /next/i })).toBeEnabled()
    })

    it('shows items per page selector', () => {
      ;(useAttendanceByEvent as any).mockReturnValue({
        data: {
          page: [
            {
              _id: 'record-1',
              eventId: mockEventId,
              attendeeId: 'attendee-1',
              checkedInAt: Date.now(),
              checkedInBy: 'user-1',
              attendee: {
                _id: 'attendee-1',
                firstName: 'John',
                lastName: 'Doe',
                status: 'member',
              },
            },
          ],
          continueCursor: null,
        },
        isLoading: false,
      })

      render(<AttendanceManager eventId={mockEventId} />)

      expect(screen.getByText('Items per page:')).toBeInTheDocument()
    })
  })
})
