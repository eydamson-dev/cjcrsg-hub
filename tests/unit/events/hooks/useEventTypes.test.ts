import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import {
  useEventTypesList,
  useEventType,
  useCheckEventTypeAssociations,
} from '~/features/events/hooks/useEventTypes'

// Mock the convex API
vi.mock('../../../../convex/_generated/api', () => ({
  api: {
    eventTypes: {
      queries: {
        list: 'eventTypes.list',
        getById: 'eventTypes.getById',
        checkAssociations: 'eventTypes.checkAssociations',
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

describe('useEventTypesList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches event types with default isActive=true', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    renderHook(() => useEventTypesList())

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['eventTypes.list', { isActive: true }],
      }),
    )
  })

  it('respects isActive filter option', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    renderHook(() => useEventTypesList({ isActive: false }))

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['eventTypes.list', { isActive: false }],
      }),
    )
  })

  it('returns loading state initially', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    const { result } = renderHook(() => useEventTypesList())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
  })

  it('returns data on success', () => {
    const mockData = [
      { _id: '1', name: 'Sunday Service', color: '#3b82f6', isActive: true },
      { _id: '2', name: 'Retreat', color: '#22c55e', isActive: true },
    ]

    mockUseQuery.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    })

    const { result } = renderHook(() => useEventTypesList())

    expect(result.current.data).toEqual(mockData)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('returns error on failure', () => {
    const mockError = new Error('Failed to fetch event types')

    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
    })

    const { result } = renderHook(() => useEventTypesList())

    expect(result.current.error).toBe(mockError)
    expect(result.current.isLoading).toBe(false)
  })
})

describe('useEventType', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not fetch when id is undefined', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    })

    renderHook(() => useEventType(undefined))

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      }),
    )
  })

  it('fetches single event type when id is provided', () => {
    const eventTypeId = 'eventType_123'

    mockUseQuery.mockReturnValue({
      data: { _id: eventTypeId, name: 'Sunday Service', color: '#3b82f6' },
      isLoading: false,
      error: null,
    })

    renderHook(() => useEventType(eventTypeId))

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['eventTypes.getById', { id: eventTypeId }],
        enabled: true,
      }),
    )
  })

  it('returns null for non-existent id', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    })

    const { result } = renderHook(() => useEventType('non-existent'))

    expect(result.current.data).toBeNull()
  })

  it('returns event type data when found', () => {
    const mockEventType = {
      _id: 'eventType_123',
      name: 'Youth Event',
      description: 'Weekly youth gathering',
      color: '#8b5cf6',
      isActive: true,
      createdAt: 1234567890,
    }

    mockUseQuery.mockReturnValue({
      data: mockEventType,
      isLoading: false,
      error: null,
    })

    const { result } = renderHook(() => useEventType('eventType_123'))

    expect(result.current.data).toEqual(mockEventType)
  })
})

describe('useCheckEventTypeAssociations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not fetch when id is undefined', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    })

    renderHook(() => useCheckEventTypeAssociations(undefined))

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      }),
    )
  })

  it('returns deletable status and event count', () => {
    const mockAssociations = {
      isDeletable: true,
      eventCount: 0,
      events: [],
    }

    mockUseQuery.mockReturnValue({
      data: mockAssociations,
      isLoading: false,
      error: null,
    })

    const { result } = renderHook(() =>
      useCheckEventTypeAssociations('eventType_123'),
    )

    expect(result.current.data).toEqual(mockAssociations)
  })

  it('identifies event types with associations', () => {
    const mockAssociations = {
      isDeletable: false,
      eventCount: 3,
      events: [
        { _id: 'event_1', name: 'Sunday Service - Jan 1' },
        { _id: 'event_2', name: 'Sunday Service - Jan 8' },
        { _id: 'event_3', name: 'Sunday Service - Jan 15' },
      ],
    }

    mockUseQuery.mockReturnValue({
      data: mockAssociations,
      isLoading: false,
      error: null,
    })

    const { result } = renderHook(() =>
      useCheckEventTypeAssociations('eventType_123'),
    )

    expect(result.current.data?.isDeletable).toBe(false)
    expect(result.current.data?.eventCount).toBe(3)
  })

  it('fetches associations when id is provided', () => {
    const eventTypeId = 'eventType_456'

    mockUseQuery.mockReturnValue({
      data: { isDeletable: true, eventCount: 0, events: [] },
      isLoading: false,
      error: null,
    })

    renderHook(() => useCheckEventTypeAssociations(eventTypeId))

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['eventTypes.checkAssociations', { id: eventTypeId }],
        enabled: true,
      }),
    )
  })
})
