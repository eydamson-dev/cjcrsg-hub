import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { GenericEventForm } from '~/features/events/forms/GenericEventForm'

const mockToastSuccess = vi.fn()
const mockToastError = vi.fn()

vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}))

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}))

const mockCreateEvent = { mutateAsync: vi.fn(), isPending: false }
vi.mock('~/features/events/hooks/useEventMutations', () => ({
  useCreateEvent: () => mockCreateEvent,
  useUpdateEvent: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))

vi.mock('~/features/events/forms/fields/BannerUploadField', () => ({
  BannerUploadField: () => <div data-testid="banner-upload" />,
}))

vi.mock('~/components/ui/sonner', () => ({
  Toaster: () => null,
}))

describe('GenericEventForm', () => {
  const props = {
    mode: 'create' as const,
    eventTypeId: 'type-123',
    eventTypeName: 'Sunday Service',
  }

  beforeEach(() => vi.clearAllMocks())

  it('renders form fields', () => {
    render(<GenericEventForm {...props} />)
    expect(screen.getByLabelText(/event name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/start time/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/end time/i)).toBeInTheDocument()
  })

  it('renders description field', () => {
    render(<GenericEventForm {...props} />)
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
  })

  it('renders event type info', () => {
    render(<GenericEventForm {...props} />)
    expect(screen.getByText('Event Type: Sunday Service')).toBeInTheDocument()
  })

  it('renders submit and cancel buttons', () => {
    render(<GenericEventForm {...props} />)
    expect(
      screen.getByRole('button', { name: /create event/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('renders banner upload', () => {
    render(<GenericEventForm {...props} />)
    expect(screen.getByTestId('banner-upload')).toBeInTheDocument()
    expect(screen.getByText('Banner Image')).toBeInTheDocument()
  })

  it('renders section headers', () => {
    render(<GenericEventForm {...props} />)
    expect(screen.getByText('Basic Information')).toBeInTheDocument()
    expect(screen.getAllByText('Description').length).toBeGreaterThan(0)
  })

  it('calls createEvent mutation on submit', async () => {
    mockCreateEvent.mutateAsync.mockResolvedValue('new-id')
    render(<GenericEventForm {...props} />)
    fireEvent.change(screen.getByLabelText(/event name/i), {
      target: { value: 'Test Event' },
    })
    fireEvent.click(screen.getByRole('button', { name: /create event/i }))
    await waitFor(() => {
      expect(mockCreateEvent.mutateAsync).toHaveBeenCalled()
    })
  })

  it('shows success toast on success', async () => {
    mockCreateEvent.mutateAsync.mockResolvedValue('new-id')
    render(<GenericEventForm {...props} />)
    fireEvent.change(screen.getByLabelText(/event name/i), {
      target: { value: 'Test Event' },
    })
    fireEvent.click(screen.getByRole('button', { name: /create event/i }))
    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith(
        'Event created successfully',
      )
    })
  })

  it('shows error toast on failure', async () => {
    mockCreateEvent.mutateAsync.mockRejectedValue(new Error('error'))
    render(<GenericEventForm {...props} />)
    fireEvent.change(screen.getByLabelText(/event name/i), {
      target: { value: 'Test Event' },
    })
    fireEvent.click(screen.getByRole('button', { name: /create event/i }))
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Failed to save event')
    })
  })

  it('disables submit button while submitting', () => {
    mockCreateEvent.isPending = true
    render(<GenericEventForm {...props} />)
    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
    mockCreateEvent.isPending = false
  })

  it('renders edit mode with correct button text', () => {
    render(
      <GenericEventForm mode="edit" eventId="123" eventTypeId="type-123" />,
    )
    expect(
      screen.getByRole('button', { name: /save changes/i }),
    ).toBeInTheDocument()
  })

  it('pre-fills form with initial data in edit mode', () => {
    render(
      <GenericEventForm
        mode="edit"
        eventId="123"
        eventTypeId="type-123"
        initialData={{
          name: 'Existing',
          date: Date.now(),
          startTime: '09:00',
          endTime: '11:00',
          location: 'Hall',
          description: 'Desc',
          bannerImage: '',
        }}
      />,
    )
    expect(screen.getByLabelText(/event name/i)).toHaveValue('Existing')
    expect(screen.getByLabelText(/location/i)).toHaveValue('Hall')
  })

  it('renders start time options', () => {
    render(<GenericEventForm {...props} />)
    expect(screen.getByLabelText(/start time/i)).toBeInTheDocument()
  })

  it('renders end time options', () => {
    render(<GenericEventForm {...props} />)
    expect(screen.getByLabelText(/end time/i)).toBeInTheDocument()
  })
})
