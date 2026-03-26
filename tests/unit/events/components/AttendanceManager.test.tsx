import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AttendanceManager } from '~/features/events/components/AttendanceManager'

// Mock the hooks
vi.mock('@tanstack/react-router', () => ({
  useNavigate: vi.fn(() => vi.fn()),
}))

vi.mock('~/hooks/useDebounce', () => ({
  useDebounce: (value: string) => value,
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

import { useSearchAttendees } from '~/features/attendees/hooks/useAttendees'
import {
  useAttendanceByEvent,
  useAttendanceStats,
  useCheckIn,
  useUnCheckIn,
  useBulkCheckIn,
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
    ;(useSearchAttendees as any).mockReturnValue({
      data: [],
      isLoading: false,
    })
    ;(useCheckIn as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    })
    ;(useUnCheckIn as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    })
    ;(useBulkCheckIn as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    })
  })

  describe('Rendering', () => {
    it('renders search input and add button', () => {
      render(<AttendanceManager eventId={mockEventId} />)

      expect(
        screen.getByPlaceholderText('Search attendee to add...'),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /add attendee/i }),
      ).toBeInTheDocument()
      expect(screen.getByText('Checked-in Attendees')).toBeInTheDocument()
    })

    it('shows empty state when no attendees', () => {
      render(<AttendanceManager eventId={mockEventId} />)

      expect(screen.getByText('No attendees yet')).toBeInTheDocument()
      expect(
        screen.getByText('Search above to check someone in'),
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

  describe('Search Functionality', () => {
    it('shows search results when typing', async () => {
      const mockSearchResults = [
        {
          _id: 'attendee-1',
          firstName: 'John',
          lastName: 'Doe',
          status: 'member',
        },
        {
          _id: 'attendee-2',
          firstName: 'Jane',
          lastName: 'Smith',
          status: 'visitor',
        },
      ]
      ;(useSearchAttendees as any).mockReturnValue({
        data: mockSearchResults,
        isLoading: false,
      })

      render(<AttendanceManager eventId={mockEventId} />)

      const searchInput = screen.getByPlaceholderText(
        'Search attendee to add...',
      )
      fireEvent.change(searchInput, { target: { value: 'john' } })

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      })
    })

    it('shows empty message when no search results found', async () => {
      ;(useSearchAttendees as any).mockReturnValue({
        data: [],
        isLoading: false,
      })

      render(<AttendanceManager eventId={mockEventId} />)

      const searchInput = screen.getByPlaceholderText(
        'Search attendee to add...',
      )
      fireEvent.change(searchInput, { target: { value: 'xyz' } })

      await waitFor(() => {
        expect(screen.getByText('No attendees found')).toBeInTheDocument()
      })
    })

    it('filters out already checked-in attendees from search results', async () => {
      const mockSearchResults = [
        {
          _id: 'attendee-1',
          firstName: 'John',
          lastName: 'Doe',
          status: 'member',
        },
        {
          _id: 'attendee-2',
          firstName: 'Jane',
          lastName: 'Smith',
          status: 'visitor',
        },
      ]
      ;(useSearchAttendees as any).mockReturnValue({
        data: mockSearchResults,
        isLoading: false,
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

      const searchInput = screen.getByPlaceholderText(
        'Search attendee to add...',
      )
      fireEvent.change(searchInput, { target: { value: 'test' } })

      // Should only show Jane Smith (1 available) since John Doe is already checked in
      await waitFor(() => {
        expect(screen.getByText('1 available')).toBeInTheDocument()
      })
    })
  })

  describe('Check-in Functionality', () => {
    it('calls checkIn mutation when clicking on attendee in search results', async () => {
      const mockSearchResults = [
        {
          _id: 'attendee-1',
          firstName: 'John',
          lastName: 'Doe',
          status: 'member',
        },
      ]
      ;(useSearchAttendees as any).mockReturnValue({
        data: mockSearchResults,
        isLoading: false,
      })

      render(<AttendanceManager eventId={mockEventId} />)

      const searchInput = screen.getByPlaceholderText(
        'Search attendee to add...',
      )
      fireEvent.change(searchInput, { target: { value: 'john' } })

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('John Doe'))

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          eventId: mockEventId,
          attendeeId: 'attendee-1',
        })
      })
    })

    it('allows selecting multiple attendees for bulk check-in', async () => {
      const mockSearchResults = [
        {
          _id: 'attendee-1',
          firstName: 'John',
          lastName: 'Doe',
          status: 'member',
        },
        {
          _id: 'attendee-2',
          firstName: 'Jane',
          lastName: 'Smith',
          status: 'visitor',
        },
      ]
      ;(useSearchAttendees as any).mockReturnValue({
        data: mockSearchResults,
        isLoading: false,
      })

      render(<AttendanceManager eventId={mockEventId} />)

      const searchInput = screen.getByPlaceholderText(
        'Search attendee to add...',
      )
      fireEvent.change(searchInput, { target: { value: 'test' } })

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })

      // Select multiple attendees via checkbox
      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[0])
      fireEvent.click(checkboxes[1])

      await waitFor(() => {
        expect(screen.getByText('2 selected')).toBeInTheDocument()
        expect(
          screen.getByRole('button', { name: /add 2/i }),
        ).toBeInTheDocument()
      })
    })

    it('calls bulkCheckIn mutation when clicking bulk add button', async () => {
      const mockSearchResults = [
        {
          _id: 'attendee-1',
          firstName: 'John',
          lastName: 'Doe',
          status: 'member',
        },
        {
          _id: 'attendee-2',
          firstName: 'Jane',
          lastName: 'Smith',
          status: 'visitor',
        },
      ]
      ;(useSearchAttendees as any).mockReturnValue({
        data: mockSearchResults,
        isLoading: false,
      })

      render(<AttendanceManager eventId={mockEventId} />)

      const searchInput = screen.getByPlaceholderText(
        'Search attendee to add...',
      )
      fireEvent.change(searchInput, { target: { value: 'test' } })

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })

      // Select attendees
      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[0])
      fireEvent.click(checkboxes[1])

      // Click bulk add button
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /add 2/i }),
        ).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /add 2/i }))

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          eventId: mockEventId,
          attendees: [
            { attendeeId: 'attendee-1' },
            { attendeeId: 'attendee-2' },
          ],
        })
      })
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
