import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import {
  useCreateEvent,
  useUpdateEvent,
  useStartEvent,
  useCompleteEvent,
  useCancelEvent,
  useArchiveEvent,
} from '~/features/events/hooks/useEventMutations'

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
    events: {
      mutations: {
        create: 'events.create',
        update: 'events.update',
        startEvent: 'events.startEvent',
        completeEvent: 'events.completeEvent',
        cancelEvent: 'events.cancelEvent',
        archive: 'events.archive',
      },
    },
  },
}))

// Mock convex-dev/react-query
const mockMutationFn = vi.fn()
vi.mock('@convex-dev/react-query', () => ({
  useConvexMutation: vi.fn(() => mockMutationFn),
}))

// Mock TanStack Query's useMutation and useQueryClient
const mockInvalidateQueries = vi.fn()
const mockUseMutation = vi.fn()

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query')
  return {
    ...actual,
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

describe('useCreateEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls mutation with correct event data', () => {
    renderHook(() => useCreateEvent())
    const mutationOptions = mockUseMutation.mock.calls[0][0]

    const input = {
      name: 'Sunday Service',
      eventTypeId: 'type_123',
      description: 'Weekly worship',
      date: Date.now(),
      startTime: '09:00',
      endTime: '11:00',
      location: 'Main Sanctuary',
    }

    mutationOptions.mutationFn(input)

    expect(mockMutationFn).toHaveBeenCalledWith({
      name: input.name,
      eventTypeId: input.eventTypeId,
      description: input.description,
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      location: input.location,
      bannerImage: undefined,
      media: undefined,
    })
  })

  it('shows success toast on successful creation', () => {
    renderHook(() => useCreateEvent())
    const mutationOptions = mockUseMutation.mock.calls[0][0]

    mutationOptions.onSuccess()

    expect(mockToastSuccess).toHaveBeenCalledWith('Event created successfully')
  })

  it('invalidates events cache on success', () => {
    renderHook(() => useCreateEvent())
    const mutationOptions = mockUseMutation.mock.calls[0][0]

    mutationOptions.onSuccess()

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['events'] })
  })

  it('shows error toast on mutation failure', () => {
    renderHook(() => useCreateEvent())
    const mutationOptions = mockUseMutation.mock.calls[0][0]

    const error = new Error('Event type not found')
    mutationOptions.onError(error)

    expect(mockToastError).toHaveBeenCalledWith('Event type not found')
  })
})

describe('useUpdateEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls mutation with correct update data', () => {
    renderHook(() => useUpdateEvent())
    const mutationOptions = mockUseMutation.mock.calls[0][0]

    const input = {
      id: 'event_123',
      name: 'Updated Sunday Service',
      location: 'New Location',
    }

    mutationOptions.mutationFn(input)

    expect(mockMutationFn).toHaveBeenCalledWith({
      id: input.id,
      name: input.name,
      eventTypeId: undefined,
      description: undefined,
      date: undefined,
      startTime: undefined,
      endTime: undefined,
      location: input.location,
      bannerImage: undefined,
      media: undefined,
      status: undefined,
    })
  })

  it('shows success toast on successful update', () => {
    renderHook(() => useUpdateEvent())
    const mutationOptions = mockUseMutation.mock.calls[0][0]

    mutationOptions.onSuccess(undefined, { id: 'event_123' })

    expect(mockToastSuccess).toHaveBeenCalledWith('Event updated')
  })

  it('invalidates events cache and specific event on success', () => {
    renderHook(() => useUpdateEvent())
    const mutationOptions = mockUseMutation.mock.calls[0][0]

    mutationOptions.onSuccess(undefined, { id: 'event_123' })

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['events'] })
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['event', { id: 'event_123' }],
    })
  })

  it('shows error toast on mutation failure', () => {
    renderHook(() => useUpdateEvent())
    const mutationOptions = mockUseMutation.mock.calls[0][0]

    const error = new Error('Event not found')
    mutationOptions.onError(error)

    expect(mockToastError).toHaveBeenCalledWith('Event not found')
  })
})

describe('useStartEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls mutation with event id', () => {
    renderHook(() => useStartEvent())
    const mutationOptions = mockUseMutation.mock.calls[0][0]

    mutationOptions.mutationFn('event_123')

    expect(mockMutationFn).toHaveBeenCalledWith({ id: 'event_123' })
  })

  it('shows success toast when event starts', () => {
    renderHook(() => useStartEvent())
    const mutationOptions = mockUseMutation.mock.calls[0][0]

    mutationOptions.onSuccess()

    expect(mockToastSuccess).toHaveBeenCalledWith('Event started — now live!')
  })

  it('shows specific error when another event is active', () => {
    renderHook(() => useStartEvent())
    const mutationOptions = mockUseMutation.mock.calls[0][0]

    const error = new Error('Another event is currently active')
    mutationOptions.onError(error)

    expect(mockToastError).toHaveBeenCalledWith(
      'Another event is currently active. Complete or cancel it first.',
    )
  })

  it('invalidates events and currentEvent cache on success', () => {
    renderHook(() => useStartEvent())
    const mutationOptions = mockUseMutation.mock.calls[0][0]

    mutationOptions.onSuccess()

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['events'] })
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['currentEvent'],
    })
  })
})

describe('useCompleteEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls mutation with event id', () => {
    renderHook(() => useCompleteEvent())
    const mutationOptions = mockUseMutation.mock.calls[0][0]

    mutationOptions.mutationFn('event_123')

    expect(mockMutationFn).toHaveBeenCalledWith({ id: 'event_123' })
  })

  it('shows success toast when event completes', () => {
    renderHook(() => useCompleteEvent())
    const mutationOptions = mockUseMutation.mock.calls[0][0]

    mutationOptions.onSuccess()

    expect(mockToastSuccess).toHaveBeenCalledWith(
      'Event completed successfully',
    )
  })

  it('shows error toast on failure', () => {
    renderHook(() => useCompleteEvent())
    const mutationOptions = mockUseMutation.mock.calls[0][0]

    const error = new Error('Cannot complete non-active event')
    mutationOptions.onError(error)

    expect(mockToastError).toHaveBeenCalledWith(
      'Cannot complete non-active event',
    )
  })

  it('invalidates events, currentEvent, and archive cache on success', () => {
    renderHook(() => useCompleteEvent())
    const mutationOptions = mockUseMutation.mock.calls[0][0]

    mutationOptions.onSuccess()

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['events'] })
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['currentEvent'],
    })
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['archiveEvents'],
    })
  })
})

describe('useCancelEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls mutation with event id', () => {
    renderHook(() => useCancelEvent())
    const mutationOptions = mockUseMutation.mock.calls[0][0]

    mutationOptions.mutationFn('event_123')

    expect(mockMutationFn).toHaveBeenCalledWith({ id: 'event_123' })
  })

  it('shows success toast when event is cancelled', () => {
    renderHook(() => useCancelEvent())
    const mutationOptions = mockUseMutation.mock.calls[0][0]

    mutationOptions.onSuccess()

    expect(mockToastSuccess).toHaveBeenCalledWith('Event cancelled')
  })

  it('shows error toast on failure', () => {
    renderHook(() => useCancelEvent())
    const mutationOptions = mockUseMutation.mock.calls[0][0]

    const error = new Error('Cannot cancel completed event')
    mutationOptions.onError(error)

    expect(mockToastError).toHaveBeenCalledWith('Cannot cancel completed event')
  })

  it('invalidates events and currentEvent cache on success', () => {
    renderHook(() => useCancelEvent())
    const mutationOptions = mockUseMutation.mock.calls[0][0]

    mutationOptions.onSuccess()

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['events'] })
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['currentEvent'],
    })
  })
})

describe('useArchiveEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls mutation with event id', () => {
    renderHook(() => useArchiveEvent())
    const mutationOptions = mockUseMutation.mock.calls[0][0]

    mutationOptions.mutationFn('event_123')

    expect(mockMutationFn).toHaveBeenCalledWith({ id: 'event_123' })
  })

  it('shows success toast when event is archived', () => {
    renderHook(() => useArchiveEvent())
    const mutationOptions = mockUseMutation.mock.calls[0][0]

    mutationOptions.onSuccess()

    expect(mockToastSuccess).toHaveBeenCalledWith('Event archived')
  })

  it('shows error toast on failure', () => {
    renderHook(() => useArchiveEvent())
    const mutationOptions = mockUseMutation.mock.calls[0][0]

    const error = new Error('Event not found')
    mutationOptions.onError(error)

    expect(mockToastError).toHaveBeenCalledWith('Event not found')
  })

  it('invalidates events and archiveEvents cache on success', () => {
    renderHook(() => useArchiveEvent())
    const mutationOptions = mockUseMutation.mock.calls[0][0]

    mutationOptions.onSuccess()

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['events'] })
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['archiveEvents'],
    })
  })
})
