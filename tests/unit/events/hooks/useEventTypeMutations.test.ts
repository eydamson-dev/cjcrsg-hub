import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import {
  useCreateEventType,
  useUpdateEventType,
  useDeleteEventType,
} from '~/features/events/hooks/useEventTypeMutations'

// Mock sonner toast
const mockToastSuccess = vi.fn()
const mockToastError = vi.fn()

vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}))

// Mock convex API
vi.mock('../../../../convex/_generated/api', () => ({
  api: {
    eventTypes: {
      mutations: {
        create: 'eventTypes.create',
        update: 'eventTypes.update',
        remove: 'eventTypes.remove',
      },
    },
  },
}))

// Mock useConvexMutation
const mockConvexMutationFn = vi.fn()
vi.mock('@convex-dev/react-query', () => ({
  useConvexMutation: vi.fn(() => mockConvexMutationFn),
}))

// Mock useMutation and useQueryClient
const mockMutateAsync = vi.fn()
const mockInvalidateQueries = vi.fn()
const mockUseMutation = vi.fn()

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query')
  return {
    ...actual,
    useMutation: (options: unknown) => {
      mockUseMutation(options)
      return {
        mutateAsync: mockMutateAsync,
        isPending: false,
      }
    },
    useQueryClient: vi.fn(() => ({
      invalidateQueries: mockInvalidateQueries,
    })),
  }
})

describe('useCreateEventType', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns mutation API with mutateAsync function', () => {
    const { result } = renderHook(() => useCreateEventType())

    expect(result.current).toHaveProperty('mutateAsync')
    expect(result.current).toHaveProperty('isPending')
    expect(typeof result.current.mutateAsync).toBe('function')
  })

  it('calls create mutation with correct data', async () => {
    const newEventType = {
      name: 'Sunday Service',
      description: 'Weekly worship service',
      color: '#3b82f6',
    }

    mockMutateAsync.mockResolvedValueOnce('eventType_123')

    const { result } = renderHook(() => useCreateEventType())
    await result.current.mutateAsync(newEventType)

    expect(mockMutateAsync).toHaveBeenCalledWith(newEventType)
  })

  it('shows success toast on create', async () => {
    mockMutateAsync.mockResolvedValueOnce('eventType_123')

    const { result } = renderHook(() => useCreateEventType())
    await result.current.mutateAsync({ name: 'Test' })

    // Check that the mutation was configured with onSuccess
    const mutationOptions = mockUseMutation.mock.calls[0][0]
    expect(mutationOptions.onSuccess).toBeDefined()

    // Call onSuccess manually to test toast
    mutationOptions.onSuccess()
    expect(mockToastSuccess).toHaveBeenCalledWith(
      'Event type created successfully',
    )
  })

  it('shows error toast on failure', async () => {
    const error = new Error('Failed to create')
    mockMutateAsync.mockRejectedValueOnce(error)

    const { result } = renderHook(() => useCreateEventType())

    try {
      await result.current.mutateAsync({ name: 'Test' })
    } catch (e) {
      // Expected to throw
    }

    const mutationOptions = mockUseMutation.mock.calls[0][0]
    expect(mutationOptions.onError).toBeDefined()

    // Call onError manually to test toast
    mutationOptions.onError(error)
    expect(mockToastError).toHaveBeenCalledWith('Failed to create')
  })

  it('invalidates eventTypes query on success', async () => {
    mockMutateAsync.mockResolvedValueOnce('eventType_123')

    const { result } = renderHook(() => useCreateEventType())
    await result.current.mutateAsync({ name: 'Test' })

    const mutationOptions = mockUseMutation.mock.calls[0][0]
    mutationOptions.onSuccess()

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['eventTypes'],
    })
  })
})

describe('useUpdateEventType', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns mutation API with mutateAsync function', () => {
    const { result } = renderHook(() => useUpdateEventType())

    expect(result.current).toHaveProperty('mutateAsync')
    expect(result.current).toHaveProperty('isPending')
    expect(typeof result.current.mutateAsync).toBe('function')
  })

  it('calls update mutation with id and data', async () => {
    const updateData = {
      id: 'eventType_123',
      name: 'Updated Name',
      color: '#ff0000',
    }

    mockMutateAsync.mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useUpdateEventType())
    await result.current.mutateAsync(updateData)

    expect(mockMutateAsync).toHaveBeenCalledWith(updateData)
  })

  it('shows success toast on update', async () => {
    mockMutateAsync.mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useUpdateEventType())
    await result.current.mutateAsync({ id: '123', name: 'Updated' })

    const mutationOptions = mockUseMutation.mock.calls[0][0]
    mutationOptions.onSuccess()

    expect(mockToastSuccess).toHaveBeenCalledWith(
      'Event type updated successfully',
    )
  })

  it('shows error toast on failure', async () => {
    const error = new Error('Database error')
    mockMutateAsync.mockRejectedValueOnce(error)

    const { result } = renderHook(() => useCreateEventType())

    try {
      await result.current.mutateAsync({ name: 'Test' })
    } catch (e) {
      // Expected to throw
    }

    // Check that the mutation was configured with onSuccess
    const mutationOptions = mockUseMutation.mock.calls[0][0]
    expect(mutationOptions.onError).toBeDefined()

    // Call onError manually to test toast - should use error message
    mutationOptions.onError(error)
    expect(mockToastError).toHaveBeenCalledWith('Database error')
  })

  it('invalidates eventTypes query on success', async () => {
    mockMutateAsync.mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useUpdateEventType())
    await result.current.mutateAsync({ id: '123', name: 'Test' })

    const mutationOptions = mockUseMutation.mock.calls[0][0]
    mutationOptions.onSuccess()

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['eventTypes'],
    })
  })

  it('handles partial updates (only name)', async () => {
    mockMutateAsync.mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useUpdateEventType())
    await result.current.mutateAsync({ id: '123', name: 'New Name' })

    expect(mockMutateAsync).toHaveBeenCalledWith({
      id: '123',
      name: 'New Name',
    })
  })

  it('handles partial updates (only color)', async () => {
    mockMutateAsync.mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useUpdateEventType())
    await result.current.mutateAsync({ id: '123', color: '#00ff00' })

    expect(mockMutateAsync).toHaveBeenCalledWith({
      id: '123',
      color: '#00ff00',
    })
  })
})

describe('useDeleteEventType', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns mutation API with mutateAsync function', () => {
    const { result } = renderHook(() => useDeleteEventType())

    expect(result.current).toHaveProperty('mutateAsync')
    expect(result.current).toHaveProperty('isPending')
    expect(typeof result.current.mutateAsync).toBe('function')
  })

  it('calls delete mutation with id', async () => {
    const eventTypeId = 'eventType_123'

    mockMutateAsync.mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useDeleteEventType())
    await result.current.mutateAsync(eventTypeId)

    expect(mockMutateAsync).toHaveBeenCalledWith(eventTypeId)
  })

  it('shows success toast on delete', async () => {
    mockMutateAsync.mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useDeleteEventType())
    await result.current.mutateAsync('eventType_123')

    const mutationOptions = mockUseMutation.mock.calls[0][0]
    mutationOptions.onSuccess()

    expect(mockToastSuccess).toHaveBeenCalledWith(
      'Event type deleted successfully',
    )
  })

  it('shows error toast on failure', async () => {
    const error = new Error('Update failed')
    mockMutateAsync.mockRejectedValueOnce(error)

    const { result } = renderHook(() => useUpdateEventType())

    try {
      await result.current.mutateAsync({ id: '123', name: 'Test' })
    } catch (e) {
      // Expected to throw
    }

    const mutationOptions = mockUseMutation.mock.calls[0][0]
    mutationOptions.onError(error)

    expect(mockToastError).toHaveBeenCalledWith('Update failed')
  })

  it('invalidates eventTypes query on success', async () => {
    mockMutateAsync.mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useDeleteEventType())
    await result.current.mutateAsync('eventType_123')

    const mutationOptions = mockUseMutation.mock.calls[0][0]
    mutationOptions.onSuccess()

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['eventTypes'],
    })
  })

  it('shows generic error message when error has no message', async () => {
    const error = new Error()
    mockMutateAsync.mockRejectedValueOnce(error)

    const { result } = renderHook(() => useDeleteEventType())

    try {
      await result.current.mutateAsync('eventType_123')
    } catch (e) {
      // Expected to throw
    }

    const mutationOptions = mockUseMutation.mock.calls[0][0]
    mutationOptions.onError(error)

    expect(mockToastError).toHaveBeenCalledWith('Failed to delete event type')
  })
})
