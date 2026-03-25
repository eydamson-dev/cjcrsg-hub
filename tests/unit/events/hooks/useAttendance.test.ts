import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import {
  useAttendanceByEvent,
  useAttendanceStats,
  useAttendanceByAttendee,
  useEventInviters,
  useCheckIn,
  useUnCheckIn,
  useBulkCheckIn,
} from '~/features/events/hooks/useAttendance'

// Mock sonner toast
const mockToastSuccess = vi.fn()
const mockToastError = vi.fn()

vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}))

// Mock the convex API
vi.mock('../../../../convex/_generated/api', () => ({
  api: {
    attendance: {
      queries: {
        getByEvent: 'attendance.getByEvent',
        getStats: 'attendance.getStats',
        getByAttendee: 'attendance.getByAttendee',
        getInviters: 'attendance.getInviters',
      },
      mutations: {
        checkIn: 'attendance.checkIn',
        unCheckIn: 'attendance.unCheckIn',
        bulkCheckIn: 'attendance.bulkCheckIn',
      },
    },
  },
}))

// Mock convex-dev/react-query
vi.mock('@convex-dev/react-query', () => ({
  convexQuery: vi.fn((funcRef, args) => ({
    queryKey: [funcRef, args],
    queryFn: vi.fn(),
  })),
  useConvexMutation: vi.fn(() => vi.fn()),
}))

// Mock TanStack Query
const mockInvalidateQueries = vi.fn()
const mockUseQuery = vi.fn()
const mockUseMutation = vi.fn()

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query')
  return {
    ...actual,
    useQuery: (...args: unknown[]) => mockUseQuery(...args),
    useMutation: (options: unknown) => {
      mockUseMutation(options)
      return {
        mutateAsync: vi.fn(),
        isPending: false,
        error: null,
      }
    },
    useQueryClient: () => ({
      invalidateQueries: mockInvalidateQueries,
    }),
  }
})

describe('useAttendanceByEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches attendance by eventId when provided', () => {
    const eventId = 'event_123'

    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    renderHook(() => useAttendanceByEvent(eventId))

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: [
          'attendance.getByEvent',
          {
            eventId,
            paginationOpts: { numItems: 10, cursor: null },
          },
        ],
        enabled: true,
      }),
    )
  })

  it('skips fetch when eventId is undefined', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    })

    renderHook(() => useAttendanceByEvent(undefined))

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      }),
    )
  })

  it('returns attendance data with attendee details', () => {
    const mockData = {
      page: [
        {
          _id: 'attendance_1',
          eventId: 'event_123',
          attendee: {
            _id: 'attendee_1',
            firstName: 'John',
            lastName: 'Doe',
            status: 'member',
          },
          checkedInAt: Date.now(),
        },
        {
          _id: 'attendance_2',
          eventId: 'event_123',
          attendee: {
            _id: 'attendee_2',
            firstName: 'Jane',
            lastName: 'Smith',
            status: 'visitor',
          },
          checkedInAt: Date.now(),
        },
      ],
      continueCursor: null,
      isDone: true,
    }

    mockUseQuery.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    })

    const { result } = renderHook(() => useAttendanceByEvent('event_123'))

    expect(result.current.data).toEqual(mockData)
    expect(result.current.data?.page).toHaveLength(2)
    expect(result.current.data?.page[0].attendee.firstName).toBe('John')
  })

  it('handles loading state', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    const { result } = renderHook(() => useAttendanceByEvent('event_123'))

    expect(result.current.isLoading).toBe(true)
  })
})

describe('useAttendanceStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches stats by eventId when provided', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    renderHook(() => useAttendanceStats('event_123'))

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['attendance.getStats', { eventId: 'event_123' }],
        enabled: true,
      }),
    )
  })

  it('returns stats with counts', () => {
    const mockStats = {
      total: 50,
      members: 35,
      visitors: 15,
      withInvite: 10,
    }

    mockUseQuery.mockReturnValue({
      data: mockStats,
      isLoading: false,
      error: null,
    })

    const { result } = renderHook(() => useAttendanceStats('event_123'))

    expect(result.current.data).toEqual(mockStats)
    expect(result.current.data?.total).toBe(50)
    expect(result.current.data?.members).toBe(35)
    expect(result.current.data?.visitors).toBe(15)
    expect(result.current.data?.withInvite).toBe(10)
  })

  it('handles empty attendance', () => {
    const mockStats = {
      total: 0,
      members: 0,
      visitors: 0,
      withInvite: 0,
    }

    mockUseQuery.mockReturnValue({
      data: mockStats,
      isLoading: false,
      error: null,
    })

    const { result } = renderHook(() => useAttendanceStats('event_123'))

    expect(result.current.data?.total).toBe(0)
    expect(result.current.data?.members).toBe(0)
  })
})

describe('useAttendanceByAttendee', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches attendance by attendeeId when provided', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    renderHook(() => useAttendanceByAttendee('attendee_123'))

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: [
          'attendance.getByAttendee',
          {
            attendeeId: 'attendee_123',
            paginationOpts: { numItems: 10, cursor: null },
          },
        ],
        enabled: true,
      }),
    )
  })

  it('skips fetch when attendeeId is undefined', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    })

    renderHook(() => useAttendanceByAttendee(undefined))

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      }),
    )
  })

  it('returns attendance history with event data', () => {
    const mockData = {
      page: [
        {
          _id: 'attendance_1',
          event: {
            _id: 'event_1',
            name: 'Sunday Service',
            date: Date.now(),
            eventType: { name: 'Sunday Service', color: '#3b82f6' },
          },
          checkedInAt: Date.now(),
        },
      ],
      continueCursor: null,
      isDone: true,
    }

    mockUseQuery.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    })

    const { result } = renderHook(() => useAttendanceByAttendee('attendee_123'))

    expect(result.current.data?.page[0].event.name).toBe('Sunday Service')
  })
})

describe('useEventInviters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches inviters by eventId when provided', () => {
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    })

    renderHook(() => useEventInviters('event_123'))

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['attendance.getInviters', { eventId: 'event_123' }],
        enabled: true,
      }),
    )
  })

  it('returns sorted inviter data', () => {
    const mockInviters = [
      {
        inviter: {
          _id: 'attendee_1',
          firstName: 'John',
          lastName: 'Doe',
        },
        count: 5,
      },
      {
        inviter: {
          _id: 'attendee_2',
          firstName: 'Jane',
          lastName: 'Smith',
        },
        count: 3,
      },
    ]

    mockUseQuery.mockReturnValue({
      data: mockInviters,
      isLoading: false,
      error: null,
    })

    const { result } = renderHook(() => useEventInviters('event_123'))

    expect(result.current.data).toEqual(mockInviters)
    expect(result.current.data?.[0].count).toBe(5)
    expect(result.current.data?.[1].count).toBe(3)
  })

  it('handles empty inviter list', () => {
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    })

    const { result } = renderHook(() => useEventInviters('event_123'))

    expect(result.current.data).toEqual([])
  })
})

describe('useCheckIn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows success toast on check-in', () => {
    renderHook(() => useCheckIn())
    const mutationOptions = mockUseMutation.mock.calls[0][0]

    mutationOptions.onSuccess()

    expect(mockToastSuccess).toHaveBeenCalledWith('Attendee checked in')
  })

  it('shows duplicate error message', () => {
    renderHook(() => useCheckIn())
    const mutationOptions = mockUseMutation.mock.calls[0][0]

    const error = new Error('already checked in')
    mutationOptions.onError(error)

    expect(mockToastError).toHaveBeenCalledWith(
      'Attendee is already checked in to this event',
    )
  })

  it('invalidates attendance queries on success', () => {
    renderHook(() => useCheckIn())
    const mutationOptions = mockUseMutation.mock.calls[0][0]

    mutationOptions.onSuccess()

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['attendance'],
    })
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['attendanceStats'],
    })
  })
})

describe('useUnCheckIn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows success toast on removal', () => {
    renderHook(() => useUnCheckIn())
    const mutationOptions = mockUseMutation.mock.calls[0][0]

    mutationOptions.onSuccess()

    expect(mockToastSuccess).toHaveBeenCalledWith('Attendee removed from event')
  })

  it('shows error toast on failure', () => {
    renderHook(() => useUnCheckIn())
    const mutationOptions = mockUseMutation.mock.calls[0][0]

    const error = new Error('Attendance record not found')
    mutationOptions.onError(error)

    expect(mockToastError).toHaveBeenCalledWith('Attendance record not found')
  })

  it('invalidates attendance queries on success', () => {
    renderHook(() => useUnCheckIn())
    const mutationOptions = mockUseMutation.mock.calls[0][0]

    mutationOptions.onSuccess()

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['attendance'],
    })
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['attendanceStats'],
    })
  })
})

describe('useBulkCheckIn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows success toast with counts', () => {
    renderHook(() => useBulkCheckIn())
    const mutationOptions = mockUseMutation.mock.calls[0][0]

    const result = {
      successCount: 5,
      skippedCount: 2,
    }
    mutationOptions.onSuccess(result)

    expect(mockToastSuccess).toHaveBeenCalledWith(
      '5 attendees checked in (2 already checked in)',
    )
  })

  it('shows error toast on failure', () => {
    renderHook(() => useBulkCheckIn())
    const mutationOptions = mockUseMutation.mock.calls[0][0]

    const error = new Error('Event not found')
    mutationOptions.onError(error)

    expect(mockToastError).toHaveBeenCalledWith('Event not found')
  })

  it('invalidates attendance queries on success', () => {
    renderHook(() => useBulkCheckIn())
    const mutationOptions = mockUseMutation.mock.calls[0][0]

    mutationOptions.onSuccess({ successCount: 3, skippedCount: 0 })

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['attendance'],
    })
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['attendanceStats'],
    })
  })
})
