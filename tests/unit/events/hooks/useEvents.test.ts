import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import {
  useEventsList,
  useEvent,
  useCurrentEvent,
  useArchiveEvents,
  useEventStats,
} from '~/features/events/hooks/useEvents'

// Mock the convex API
vi.mock('../../../../convex/_generated/api', () => ({
  api: {
    events: {
      queries: {
        list: 'events.list',
        getById: 'events.getById',
        getCurrentEvent: 'events.getCurrentEvent',
        listArchive: 'events.listArchive',
        getStats: 'events.getStats',
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
}))

// Mock TanStack Query's useQuery
const mockUseQuery = vi.fn()
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query')
  return {
    ...actual,
    useQuery: (...args: unknown[]) => mockUseQuery(...args),
  }
})

describe('useEventsList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches events with default pagination (10 items)', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    renderHook(() => useEventsList())

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: [
          'events.list',
          {
            paginationOpts: { numItems: 10, cursor: null },
            status: undefined,
            eventTypeId: undefined,
            dateFrom: undefined,
            dateTo: undefined,
          },
        ],
      }),
    )
  })

  it('fetches events with custom pagination options', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    const paginationOpts = { numItems: 25, cursor: 'some-cursor' }
    renderHook(() => useEventsList({ paginationOpts }))

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: [
          'events.list',
          expect.objectContaining({
            paginationOpts: { numItems: 25, cursor: 'some-cursor' },
          }),
        ],
      }),
    )
  })

  it('applies status filter', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    renderHook(() => useEventsList({ filters: { status: 'upcoming' } }))

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: [
          'events.list',
          expect.objectContaining({
            status: 'upcoming',
          }),
        ],
      }),
    )
  })

  it('applies eventTypeId filter', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    renderHook(() =>
      useEventsList({ filters: { eventTypeId: 'eventType_123' } }),
    )

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: [
          'events.list',
          expect.objectContaining({
            eventTypeId: 'eventType_123',
          }),
        ],
      }),
    )
  })

  it('applies date range filter', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    const dateFrom = Date.now() - 86400000 // 1 day ago
    const dateTo = Date.now() + 86400000 // 1 day from now
    renderHook(() => useEventsList({ filters: { dateFrom, dateTo } }))

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: [
          'events.list',
          expect.objectContaining({
            dateFrom,
            dateTo,
          }),
        ],
      }),
    )
  })

  it('applies multiple filters simultaneously', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    renderHook(() =>
      useEventsList({
        filters: {
          status: 'active',
          eventTypeId: 'eventType_456',
        },
      }),
    )

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: [
          'events.list',
          expect.objectContaining({
            status: 'active',
            eventTypeId: 'eventType_456',
          }),
        ],
      }),
    )
  })

  it('returns paginated data with page structure', () => {
    const mockData = {
      page: [
        {
          _id: 'event_1',
          name: 'Sunday Service',
          status: 'upcoming',
          eventType: {
            _id: 'type_1',
            name: 'Sunday Service',
            color: '#3b82f6',
          },
        },
        {
          _id: 'event_2',
          name: 'Youth Night',
          status: 'active',
          eventType: { _id: 'type_2', name: 'Youth', color: '#8b5cf6' },
        },
      ],
      continueCursor: 'next-cursor',
      isDone: false,
    }

    mockUseQuery.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    })

    const { result } = renderHook(() => useEventsList())

    expect(result.current.data).toEqual(mockData)
    expect(result.current.data.page).toHaveLength(2)
    expect(result.current.data.continueCursor).toBe('next-cursor')
    expect(result.current.data.isDone).toBe(false)
  })

  it('returns loading state initially', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    const { result } = renderHook(() => useEventsList())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
  })

  it('returns error state on failure', () => {
    const mockError = new Error('Failed to fetch events')

    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
    })

    const { result } = renderHook(() => useEventsList())

    expect(result.current.error).toBe(mockError)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toBeUndefined()
  })
})

describe('useEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches event by id when provided', () => {
    const eventId = 'event_123'

    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    renderHook(() => useEvent(eventId))

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['events.getById', { id: eventId }],
        enabled: true,
      }),
    )
  })

  it('skips fetch when id is undefined', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    })

    renderHook(() => useEvent(undefined))

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      }),
    )
  })

  it('returns event data with joined eventType', () => {
    const mockEvent = {
      _id: 'event_123',
      name: 'Sunday Service',
      description: 'Weekly worship service',
      status: 'upcoming',
      date: Date.now(),
      eventType: {
        _id: 'type_1',
        name: 'Sunday Service',
        color: '#3b82f6',
      },
    }

    mockUseQuery.mockReturnValue({
      data: mockEvent,
      isLoading: false,
      error: null,
    })

    const { result } = renderHook(() => useEvent('event_123'))

    expect(result.current.data).toEqual(mockEvent)
    expect(result.current.data?.eventType).toBeDefined()
    expect(result.current.data?.eventType.name).toBe('Sunday Service')
  })

  it('returns null for non-existent event', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    })

    const { result } = renderHook(() => useEvent('non-existent'))

    expect(result.current.data).toBeNull()
  })
})

describe('useCurrentEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches currently active event', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    renderHook(() => useCurrentEvent())

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['events.getCurrentEvent', {}],
      }),
    )
  })

  it('returns active event with attendance count', () => {
    const mockEvent = {
      _id: 'event_123',
      name: 'Sunday Service',
      status: 'active',
      attendanceCount: 45,
      eventType: {
        _id: 'type_1',
        name: 'Sunday Service',
        color: '#3b82f6',
      },
    }

    mockUseQuery.mockReturnValue({
      data: mockEvent,
      isLoading: false,
      error: null,
    })

    const { result } = renderHook(() => useCurrentEvent())

    expect(result.current.data).toEqual(mockEvent)
    expect(result.current.data?.attendanceCount).toBe(45)
    expect(result.current.data?.status).toBe('active')
  })

  it('returns null when no event is active', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    })

    const { result } = renderHook(() => useCurrentEvent())

    expect(result.current.data).toBeNull()
  })
})

describe('useArchiveEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches archived (completed) events', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    renderHook(() => useArchiveEvents())

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: [
          'events.listArchive',
          {
            paginationOpts: { numItems: 10, cursor: null },
            eventTypeId: undefined,
            dateFrom: undefined,
            dateTo: undefined,
          },
        ],
      }),
    )
  })

  it('applies filters to archived events', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    renderHook(() =>
      useArchiveEvents({
        filters: { eventTypeId: 'type_123' },
      }),
    )

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: [
          'events.listArchive',
          expect.objectContaining({
            eventTypeId: 'type_123',
          }),
        ],
      }),
    )
  })

  it('returns archived events with attendance counts', () => {
    const mockData = {
      page: [
        {
          _id: 'event_1',
          name: 'Past Sunday Service',
          status: 'completed',
          attendanceCount: 52,
          eventType: {
            _id: 'type_1',
            name: 'Sunday Service',
            color: '#3b82f6',
          },
        },
        {
          _id: 'event_2',
          name: 'Youth Camp',
          status: 'completed',
          attendanceCount: 28,
          eventType: { _id: 'type_2', name: 'Youth', color: '#8b5cf6' },
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

    const { result } = renderHook(() => useArchiveEvents())

    expect(result.current.data).toEqual(mockData)
    expect(result.current.data?.page[0].attendanceCount).toBe(52)
    expect(result.current.data?.page[1].attendanceCount).toBe(28)
  })
})

describe('useEventStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches event statistics', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    renderHook(() => useEventStats())

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['events.getStats', {}],
      }),
    )
  })

  it('returns dashboard statistics', () => {
    const mockStats = {
      totalEvents: 50,
      byStatus: {
        upcoming: 3,
        active: 1,
        completed: 45,
        cancelled: 1,
      },
      thisMonth: 4,
      nextUpcoming: {
        _id: 'event_123',
        name: 'Next Sunday Service',
        date: Date.now() + 86400000,
        eventType: { name: 'Sunday Service', color: '#3b82f6' },
      },
    }

    mockUseQuery.mockReturnValue({
      data: mockStats,
      isLoading: false,
      error: null,
    })

    const { result } = renderHook(() => useEventStats())

    expect(result.current.data).toEqual(mockStats)
    expect(result.current.data?.totalEvents).toBe(50)
    expect(result.current.data?.byStatus.completed).toBe(45)
    expect(result.current.data?.thisMonth).toBe(4)
  })

  it('returns null for nextUpcoming when no upcoming events', () => {
    const mockStats = {
      totalEvents: 45,
      byStatus: {
        upcoming: 0,
        active: 0,
        completed: 45,
        cancelled: 0,
      },
      thisMonth: 0,
      nextUpcoming: null,
    }

    mockUseQuery.mockReturnValue({
      data: mockStats,
      isLoading: false,
      error: null,
    })

    const { result } = renderHook(() => useEventStats())

    expect(result.current.data?.nextUpcoming).toBeNull()
  })
})
