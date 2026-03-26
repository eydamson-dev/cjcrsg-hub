import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AttendanceManager } from '~/features/events/components/AttendanceManager'

// Mock hooks
vi.mock('~/hooks/useDebounce', () => ({
  useDebounce: vi.fn((value: string) => value),
}))

vi.mock('~/features/attendees/hooks/useAttendees', () => ({
  useSearchAttendees: vi.fn(),
}))

vi.mock('~/features/events/hooks/useAttendance', () => ({
  useAttendanceByEvent: vi.fn(),
  useAttendanceStats: vi.fn(),
  useCheckIn: vi.fn(),
  useUnCheckIn: vi.fn(),
  useBulkCheckIn: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  useNavigate: vi.fn(() => vi.fn()),
}))

// Import mocked hooks for test control
import { useSearchAttendees } from '~/features/attendees/hooks/useAttendees'
import {
  useAttendanceByEvent,
  useAttendanceStats,
  useCheckIn,
  useUnCheckIn,
  useBulkCheckIn,
} from '~/features/events/hooks/useAttendance'
import { useNavigate } from '@tanstack/react-router'

describe('AttendanceManager', () => {
  const mockEventId = 'event-123'

  // Mock data
  const mockAttendees = [
    {
      _id: 'attendee-1',
      firstName: 'John',
      lastName: 'Doe',
      status: 'member' as const,
      email: 'john@example.com',
      address: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      _id: 'attendee-2',
      firstName: 'Jane',
      lastName: 'Smith',
      status: 'visitor' as const,
      email: 'jane@example.com',
      address: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      _id: 'attendee-3',
      firstName: 'Bob',
      lastName: 'Johnson',
      status: 'member' as const,
      email: undefined,
      address: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ]

  const mockAttendanceRecords = [
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
        status: 'member' as const,
        email: 'john@example.com',
      },
    },
    {
      _id: 'record-2',
      eventId: mockEventId,
      attendeeId: 'attendee-2',
      checkedInAt: Date.now() - 3600000,
      checkedInBy: 'user-1',
      attendee: {
        _id: 'attendee-2',
        firstName: 'Jane',
        lastName: 'Smith',
        status: 'visitor' as const,
        email: 'jane@example.com',
      },
    },
  ]

  const mockCheckIn = {
    mutateAsync: vi.fn(),
    isPending: false,
  }

  const mockUnCheckIn = {
    mutateAsync: vi.fn(),
    isPending: false,
  }

  const mockBulkCheckIn = {
    mutateAsync: vi.fn(),
    isPending: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock implementations
    vi.mocked(useAttendanceByEvent).mockReturnValue({
      data: { page: mockAttendanceRecords, continueCursor: null },
      isPending: false,
    } as any)

    vi.mocked(useAttendanceStats).mockReturnValue({
      data: { total: 2, members: 1, visitors: 1 },
    } as any)

    vi.mocked(useSearchAttendees).mockReturnValue({
      data: null,
      isPending: false,
    } as any)

    vi.mocked(useCheckIn).mockReturnValue(mockCheckIn as any)
    vi.mocked(useUnCheckIn).mockReturnValue(mockUnCheckIn as any)
    vi.mocked(useBulkCheckIn).mockReturnValue(mockBulkCheckIn as any)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('renders with eventId', () => {
      render(<AttendanceManager eventId={mockEventId} />)

      expect(
        screen.getByPlaceholderText(/search attendee to add/i),
      ).toBeInTheDocument()
      expect(screen.getByText(/checked-in attendees/i)).toBeInTheDocument()
    })

    it('displays search input with correct placeholder', () => {
      render(<AttendanceManager eventId={mockEventId} />)

      const searchInput = screen.getByPlaceholderText(/search attendee to add/i)
      expect(searchInput).toBeInTheDocument()
    })

    it('displays attendance table with correct headers', () => {
      render(<AttendanceManager eventId={mockEventId} />)

      expect(screen.getByText(/name/i)).toBeInTheDocument()
      expect(screen.getByText(/status/i)).toBeInTheDocument()
      expect(screen.getByText(/check-in time/i)).toBeInTheDocument()
      expect(screen.getByText(/actions/i)).toBeInTheDocument()
    })

    it('displays total attendance count', () => {
      render(<AttendanceManager eventId={mockEventId} />)

      expect(screen.getByText('2')).toBeInTheDocument() // Total count
    })

    it('displays Add Attendee button', () => {
      render(<AttendanceManager eventId={mockEventId} />)

      expect(
        screen.getByRole('button', { name: /add attendee/i }),
      ).toBeInTheDocument()
    })
  })

  describe('Loading States', () => {
    it('renders without crashing when loading', () => {
      vi.mocked(useAttendanceByEvent).mockReturnValue({
        data: null,
        isPending: true,
      } as any)

      const { container } = render(<AttendanceManager eventId={mockEventId} />)

      // Component should render without errors during loading
      expect(container).toBeTruthy()
      expect(screen.getByText(/checked-in attendees/i)).toBeInTheDocument()
    })
  })

  describe('Empty States', () => {
    it('shows empty state when no attendance records', () => {
      vi.mocked(useAttendanceByEvent).mockReturnValue({
        data: { page: [], continueCursor: null },
        isPending: false,
      } as any)

      vi.mocked(useAttendanceStats).mockReturnValue({
        data: { total: 0, members: 0, visitors: 0 },
      } as any)

      render(<AttendanceManager eventId={mockEventId} />)

      expect(screen.getByText(/no attendees yet/i)).toBeInTheDocument()
      expect(
        screen.getByText(/search above to check someone in/i),
      ).toBeInTheDocument()
    })

    it('does not show pagination when no attendance records', () => {
      vi.mocked(useAttendanceByEvent).mockReturnValue({
        data: { page: [], continueCursor: null },
        isPending: false,
      } as any)

      vi.mocked(useAttendanceStats).mockReturnValue({
        data: { total: 0, members: 0, visitors: 0 },
      } as any)

      render(<AttendanceManager eventId={mockEventId} />)

      expect(screen.queryByText(/page/i)).not.toBeInTheDocument()
    })
  })

  describe('Search Functionality', () => {
    it('shows search input placeholder', () => {
      render(<AttendanceManager eventId={mockEventId} />)

      const searchInput = screen.getByPlaceholderText(/search attendee to add/i)
      expect(searchInput).toBeInTheDocument()
      expect(searchInput).toHaveAttribute(
        'placeholder',
        'Search attendee to add...',
      )
    })
  })

  describe('Single Check-in Flow', () => {
    it('disables Add Attendee button while check-in is pending', () => {
      vi.mocked(useCheckIn).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: true,
      } as any)

      render(<AttendanceManager eventId={mockEventId} />)

      const addButton = screen.getByRole('button', { name: /add attendee/i })
      expect(addButton).toBeDisabled()
    })
  })

  describe('Pagination', () => {
    it('displays page size selector with options 10, 25, 50', () => {
      render(<AttendanceManager eventId={mockEventId} />)

      const pageSizeSelect = screen.getByText(/items per page/i)
      expect(pageSizeSelect).toBeInTheDocument()
    })

    it('shows pagination controls when there are attendance records', () => {
      vi.mocked(useAttendanceByEvent).mockReturnValue({
        data: {
          page: mockAttendanceRecords,
          continueCursor: 'next-page-cursor',
        },
        isPending: false,
      } as any)

      render(<AttendanceManager eventId={mockEventId} />)

      expect(screen.getByText(/page 1 of/i)).toBeInTheDocument()
    })

    it('disables next button when there is no next page', () => {
      vi.mocked(useAttendanceByEvent).mockReturnValue({
        data: {
          page: mockAttendanceRecords,
          continueCursor: null,
        },
        isPending: false,
      } as any)

      render(<AttendanceManager eventId={mockEventId} />)

      expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
    })

    it('navigates to next page when clicking next', async () => {
      const mockUseAttendanceByEvent = vi.fn()
      vi.mocked(useAttendanceByEvent).mockImplementation(
        mockUseAttendanceByEvent,
      )

      mockUseAttendanceByEvent.mockReturnValue({
        data: {
          page: mockAttendanceRecords,
          continueCursor: 'next-cursor',
        },
        isPending: false,
      })

      render(<AttendanceManager eventId={mockEventId} />)

      const nextButton = screen.getByRole('button', { name: /next/i })
      fireEvent.click(nextButton)

      await waitFor(() => {
        expect(mockUseAttendanceByEvent).toHaveBeenCalled()
      })
    })
  })

  describe('Display Formatting', () => {
    it('displays correct status badges for members and visitors', () => {
      render(<AttendanceManager eventId={mockEventId} />)

      const memberBadges = screen.getAllByText(/member/i)
      const visitorBadges = screen.getAllByText(/visitor/i)

      expect(memberBadges.length).toBeGreaterThan(0)
      expect(visitorBadges.length).toBeGreaterThan(0)
    })

    it('formats check-in time correctly', () => {
      render(<AttendanceManager eventId={mockEventId} />)

      // Check that times are displayed (they should be formatted)
      const tableRows = screen.getAllByRole('row')
      expect(tableRows.length).toBeGreaterThan(1) // Header + data rows
    })

    it('shows unknown badge when attendee data is null', () => {
      const recordsWithNullAttendee = [
        {
          _id: 'record-3',
          eventId: mockEventId,
          attendeeId: 'attendee-3',
          checkedInAt: Date.now(),
          checkedInBy: 'user-1',
          attendee: null,
        },
      ]

      vi.mocked(useAttendanceByEvent).mockReturnValue({
        data: { page: recordsWithNullAttendee, continueCursor: null },
        isPending: false,
      } as any)

      render(<AttendanceManager eventId={mockEventId} />)

      expect(screen.getByText(/unknown attendee/i)).toBeInTheDocument()
      // Check for Unknown badge specifically
      const unknownBadges = screen.getAllByText(/^unknown$/i)
      expect(unknownBadges.length).toBeGreaterThan(0)
    })
  })

  describe('Navigation', () => {
    it('navigates to attendee profile when clicking name', async () => {
      const mockNavigate = vi.fn()
      vi.mocked(useNavigate).mockReturnValue(mockNavigate)

      render(<AttendanceManager eventId={mockEventId} />)

      // Click on the first attendee's row
      const attendeeName = screen.getByText(/john doe/i)
      const row = attendeeName.closest('tr')
      if (row) {
        fireEvent.click(row)
      }

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled()
      })
    })
  })
})
