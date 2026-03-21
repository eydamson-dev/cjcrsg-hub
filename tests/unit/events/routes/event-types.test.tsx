import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

// Mock the dependencies
const mockCreateEventType = vi.fn()
const mockUpdateEventType = vi.fn()

vi.mock('~/features/events/components/EventTypeList', () => ({
  EventTypeList: vi.fn(
    ({
      onEdit,
      onCreate,
    }: {
      onEdit: (id: string) => void
      onCreate: () => void
    }) => (
      <div data-testid="event-type-list">
        <button data-testid="mock-create-btn" onClick={onCreate}>
          Add Event Type
        </button>
        <button
          data-testid="mock-edit-btn"
          onClick={() => onEdit('test-id-123')}
        >
          Edit Event Type
        </button>
      </div>
    ),
  ),
}))

vi.mock('~/features/events/components/EventTypeForm', () => ({
  EventTypeForm: vi.fn(
    ({ onSubmit, onCancel, initialData, isSubmitting }: any) => (
      <div data-testid="event-type-form">
        <span data-testid="form-mode">
          {initialData?.name ? 'Edit Mode' : 'Create Mode'}
        </span>
        <span data-testid="form-submitting">
          {isSubmitting ? 'true' : 'false'}
        </span>
        <button
          data-testid="form-submit"
          onClick={() =>
            onSubmit({
              name: 'Test Event',
              description: 'Test',
              color: '#ff0000',
            })
          }
          disabled={isSubmitting}
        >
          Submit
        </button>
        <button data-testid="form-cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>
    ),
  ),
}))

vi.mock('~/features/events/hooks/useEventTypes', () => ({
  useEventType: vi.fn(() => ({ data: null, isLoading: false })),
}))

vi.mock('~/features/events/hooks/useEventTypeMutations', () => ({
  useCreateEventType: vi.fn(() => ({
    mutateAsync: mockCreateEventType,
    isPending: false,
  })),
  useUpdateEventType: vi.fn(() => ({
    mutateAsync: mockUpdateEventType,
    isPending: false,
  })),
}))

vi.mock('~/components/layout/Layout', () => ({
  Layout: vi.fn(({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout">{children}</div>
  )),
}))

vi.mock('~/components/auth/ProtectedRoute', () => ({
  ProtectedRoute: vi.fn(({ children }: { children: React.ReactNode }) => (
    <div data-testid="protected-route">{children}</div>
  )),
}))

// Import the actual component
import { EventTypesContent } from '~/routes/event-types'

describe('EventTypesContent', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
    vi.clearAllMocks()
    mockCreateEventType.mockResolvedValue(undefined)
    mockUpdateEventType.mockResolvedValue(undefined)
  })

  describe('Initial Render', () => {
    it('renders page header with title and description', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <EventTypesContent />
        </QueryClientProvider>,
      )

      expect(screen.getByText('Event Types')).toBeInTheDocument()
      expect(screen.getByText(/manage event types/i)).toBeInTheDocument()
    })

    it('renders EventTypeList component', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <EventTypesContent />
        </QueryClientProvider>,
      )

      expect(screen.getByTestId('event-type-list')).toBeInTheDocument()
    })

    it('renders dialog closed by default', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <EventTypesContent />
        </QueryClientProvider>,
      )

      expect(screen.queryByTestId('event-type-form')).not.toBeInTheDocument()
    })
  })

  describe('Dialog State Management', () => {
    it('opens dialog when onCreate is called', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <EventTypesContent />
        </QueryClientProvider>,
      )

      fireEvent.click(screen.getByTestId('mock-create-btn'))

      await waitFor(() => {
        expect(screen.getByTestId('event-type-form')).toBeInTheDocument()
      })
    })

    it('opens dialog in create mode when onCreate is called', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <EventTypesContent />
        </QueryClientProvider>,
      )

      fireEvent.click(screen.getByTestId('mock-create-btn'))

      await waitFor(() => {
        expect(screen.getByTestId('form-mode')).toHaveTextContent('Create Mode')
      })
    })

    it('closes dialog when onCancel is called', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <EventTypesContent />
        </QueryClientProvider>,
      )

      fireEvent.click(screen.getByTestId('mock-create-btn'))

      await waitFor(() => {
        expect(screen.getByTestId('event-type-form')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByTestId('form-cancel'))

      await waitFor(() => {
        expect(screen.queryByTestId('event-type-form')).not.toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('calls create mutation when submitting in create mode', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <EventTypesContent />
        </QueryClientProvider>,
      )

      fireEvent.click(screen.getByTestId('mock-create-btn'))

      await waitFor(() => {
        expect(screen.getByTestId('event-type-form')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByTestId('form-submit'))

      await waitFor(() => {
        expect(mockCreateEventType).toHaveBeenCalledWith({
          name: 'Test Event',
          description: 'Test',
          color: '#ff0000',
        })
      })
    })

    it('closes dialog after successful create', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <EventTypesContent />
        </QueryClientProvider>,
      )

      fireEvent.click(screen.getByTestId('mock-create-btn'))

      await waitFor(() => {
        expect(screen.getByTestId('event-type-form')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByTestId('form-submit'))

      await waitFor(() => {
        expect(screen.queryByTestId('event-type-form')).not.toBeInTheDocument()
      })
    })
  })
})
