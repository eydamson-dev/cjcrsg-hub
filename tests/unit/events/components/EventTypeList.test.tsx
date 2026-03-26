import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock the hooks first, before importing the component
const mockUseEventTypesList = vi.fn()
const mockDeleteMutate = vi.fn()
let isDeletePending = false

vi.mock('~/features/events/hooks/useEventTypes', () => ({
  useEventTypesList: () => mockUseEventTypesList(),
}))

vi.mock('~/features/events/hooks/useEventTypeMutations', () => ({
  useDeleteEventType: () => ({
    mutate: mockDeleteMutate,
    isPending: isDeletePending,
  }),
}))

// Now import the component after mocks are set up
import { EventTypeList } from '~/features/events/components/EventTypeList'

// Create a wrapper with QueryClientProvider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('EventTypeList', () => {
  const mockOnEdit = vi.fn()
  const mockOnCreate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset the module-level mock
    mockDeleteMutate.mockClear()
  })

  describe('Loading State', () => {
    it('shows skeleton loader when loading', () => {
      mockUseEventTypesList.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      })

      render(<EventTypeList onEdit={mockOnEdit} onCreate={mockOnCreate} />, {
        wrapper: createWrapper(),
      })

      expect(screen.getByTestId('event-type-list-skeleton')).toBeInTheDocument()
    })

    it('shows loading button state', () => {
      mockUseEventTypesList.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      })

      render(<EventTypeList onEdit={mockOnEdit} onCreate={mockOnCreate} />, {
        wrapper: createWrapper(),
      })

      expect(screen.getByRole('button', { name: /loading/i })).toBeDisabled()
    })
  })

  describe('Error State', () => {
    it('displays error message', () => {
      mockUseEventTypesList.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to fetch'),
      })

      render(<EventTypeList onEdit={mockOnEdit} onCreate={mockOnCreate} />, {
        wrapper: createWrapper(),
      })

      expect(screen.getByText(/error loading event types/i)).toBeInTheDocument()
    })

    it('shows retry button', () => {
      mockUseEventTypesList.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to fetch'),
      })

      render(<EventTypeList onEdit={mockOnEdit} onCreate={mockOnCreate} />, {
        wrapper: createWrapper(),
      })

      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
    })

    it('reloads page when retry clicked', () => {
      const reloadMock = vi.fn()
      Object.defineProperty(window, 'location', {
        value: { reload: reloadMock },
        writable: true,
      })

      mockUseEventTypesList.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to fetch'),
      })

      render(<EventTypeList onEdit={mockOnEdit} onCreate={mockOnCreate} />, {
        wrapper: createWrapper(),
      })

      fireEvent.click(screen.getByRole('button', { name: /retry/i }))

      expect(reloadMock).toHaveBeenCalled()
    })
  })

  describe('Empty State', () => {
    it('shows empty message when no event types', () => {
      mockUseEventTypesList.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      })

      render(<EventTypeList onEdit={mockOnEdit} onCreate={mockOnCreate} />, {
        wrapper: createWrapper(),
      })

      expect(screen.getByText(/no event types yet/i)).toBeInTheDocument()
    })

    it('shows "Add Event Type" button', () => {
      mockUseEventTypesList.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      })

      render(<EventTypeList onEdit={mockOnEdit} onCreate={mockOnCreate} />, {
        wrapper: createWrapper(),
      })

      expect(
        screen.getByRole('button', { name: /add event type/i }),
      ).toBeInTheDocument()
    })

    it('calls onCreate when add button clicked in empty state', () => {
      mockUseEventTypesList.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      })

      render(<EventTypeList onEdit={mockOnEdit} onCreate={mockOnCreate} />, {
        wrapper: createWrapper(),
      })

      fireEvent.click(screen.getByRole('button', { name: /add event type/i }))

      expect(mockOnCreate).toHaveBeenCalledTimes(1)
    })
  })

  describe('Table Rendering', () => {
    const mockEventTypes = [
      {
        _id: 'eventType_1',
        name: 'Sunday Service',
        description: 'Weekly worship service',
        color: '#3b82f6',
        isActive: true,
      },
      {
        _id: 'eventType_2',
        name: 'Retreat',
        description: 'Annual church retreat',
        color: '#22c55e',
        isActive: true,
      },
    ]

    beforeEach(() => {
      mockUseEventTypesList.mockReturnValue({
        data: mockEventTypes,
        isLoading: false,
        error: null,
      })
    })

    it('renders event types in table', () => {
      render(<EventTypeList onEdit={mockOnEdit} onCreate={mockOnCreate} />, {
        wrapper: createWrapper(),
      })

      expect(screen.getByText('Sunday Service')).toBeInTheDocument()
      expect(screen.getByText('Retreat')).toBeInTheDocument()
    })

    it('displays color circle with hex value', () => {
      render(<EventTypeList onEdit={mockOnEdit} onCreate={mockOnCreate} />, {
        wrapper: createWrapper(),
      })

      const colorCircle1 = screen.getByTestId('color-circle-eventType_1')
      expect(colorCircle1).toHaveStyle({ backgroundColor: '#3b82f6' })

      const colorCircle2 = screen.getByTestId('color-circle-eventType_2')
      expect(colorCircle2).toHaveStyle({ backgroundColor: '#22c55e' })
    })

    it('shows hex value next to color circle', () => {
      render(<EventTypeList onEdit={mockOnEdit} onCreate={mockOnCreate} />, {
        wrapper: createWrapper(),
      })

      expect(screen.getByText('#3b82f6')).toBeInTheDocument()
      expect(screen.getByText('#22c55e')).toBeInTheDocument()
    })

    it('shows name and description', () => {
      render(<EventTypeList onEdit={mockOnEdit} onCreate={mockOnCreate} />, {
        wrapper: createWrapper(),
      })

      expect(screen.getByText('Weekly worship service')).toBeInTheDocument()
      expect(screen.getByText('Annual church retreat')).toBeInTheDocument()
    })

    it('shows dash for missing description', () => {
      mockUseEventTypesList.mockReturnValue({
        data: [
          {
            _id: 'eventType_3',
            name: 'Prayer Meeting',
            description: null,
            color: '#f97316',
            isActive: true,
          },
        ],
        isLoading: false,
        error: null,
      })

      render(<EventTypeList onEdit={mockOnEdit} onCreate={mockOnCreate} />, {
        wrapper: createWrapper(),
      })

      const cells = screen.getAllByRole('cell')
      const descriptionCell = cells.find((cell) => cell.textContent === '-')
      expect(descriptionCell).toBeInTheDocument()
    })

    it('shows delete button per row', () => {
      render(<EventTypeList onEdit={mockOnEdit} onCreate={mockOnCreate} />, {
        wrapper: createWrapper(),
      })

      const deleteButtons = screen
        .getAllByRole('button')
        .filter((btn) => btn.querySelector('svg'))
      expect(deleteButtons.length).toBeGreaterThanOrEqual(2)
    })

    it('makes rows clickable for editing', () => {
      render(<EventTypeList onEdit={mockOnEdit} onCreate={mockOnCreate} />, {
        wrapper: createWrapper(),
      })

      const row = screen.getByTestId('event-type-row-eventType_1')
      fireEvent.click(row)

      expect(mockOnEdit).toHaveBeenCalledWith('eventType_1')
    })

    it('has cursor-pointer class on rows', () => {
      render(<EventTypeList onEdit={mockOnEdit} onCreate={mockOnCreate} />, {
        wrapper: createWrapper(),
      })

      const row = screen.getByTestId('event-type-row-eventType_1')
      expect(row).toHaveClass('cursor-pointer')
    })
  })

  describe('Delete Functionality', () => {
    const mockEventTypes = [
      {
        _id: 'eventType_1',
        name: 'Sunday Service',
        description: 'Weekly worship',
        color: '#3b82f6',
        isActive: true,
      },
    ]

    beforeEach(() => {
      mockUseEventTypesList.mockReturnValue({
        data: mockEventTypes,
        isLoading: false,
        error: null,
      })
      // Reset delete pending state
      isDeletePending = false
    })

    it('opens confirmation dialog on delete click', async () => {
      render(<EventTypeList onEdit={mockOnEdit} onCreate={mockOnCreate} />, {
        wrapper: createWrapper(),
      })

      const deleteButton = screen.getByTestId('delete-button-eventType_1')
      fireEvent.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument()
      })
      expect(screen.getByText(/confirm deletion/i)).toBeInTheDocument()
    })

    it('shows event type name in confirmation', async () => {
      render(<EventTypeList onEdit={mockOnEdit} onCreate={mockOnCreate} />, {
        wrapper: createWrapper(),
      })

      const deleteButton = screen.getByTestId('delete-button-eventType_1')
      fireEvent.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument()
      })
      // Check that the name appears in the dialog description (confirmation message)
      const dialog = screen.getByRole('alertdialog')
      expect(dialog.textContent).toMatch(/sunday service/i)
    })

    it('calls delete mutation on confirm', async () => {
      render(<EventTypeList onEdit={mockOnEdit} onCreate={mockOnCreate} />, {
        wrapper: createWrapper(),
      })

      const deleteButton = screen.getByTestId('delete-button-eventType_1')
      fireEvent.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument()
      })

      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(mockDeleteMutate).toHaveBeenCalledWith('eventType_1')
      })
    })

    it('closes dialog on cancel', async () => {
      render(<EventTypeList onEdit={mockOnEdit} onCreate={mockOnCreate} />, {
        wrapper: createWrapper(),
      })

      const deleteButton = screen.getByTestId('delete-button-eventType_1')
      fireEvent.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument()
      })

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
      })
    })

    it('shows loading state during delete', async () => {
      isDeletePending = true

      render(<EventTypeList onEdit={mockOnEdit} onCreate={mockOnCreate} />, {
        wrapper: createWrapper(),
      })

      const deleteButton = screen.getByTestId('delete-button-eventType_1')
      fireEvent.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument()
      })

      expect(screen.getByText(/deleting/i)).toBeInTheDocument()
    })

    it('disables buttons while deleting', async () => {
      isDeletePending = true

      render(<EventTypeList onEdit={mockOnEdit} onCreate={mockOnCreate} />, {
        wrapper: createWrapper(),
      })

      const deleteButton = screen.getByTestId('delete-button-eventType_1')
      fireEvent.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument()
      })

      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /deleting/i })).toBeDisabled()
    })

    it('prevents row click when clicking delete button', () => {
      render(<EventTypeList onEdit={mockOnEdit} onCreate={mockOnCreate} />, {
        wrapper: createWrapper(),
      })

      const deleteButton = screen.getByTestId('delete-button-eventType_1')
      fireEvent.click(deleteButton)

      // onEdit should not be called when clicking delete
      expect(mockOnEdit).not.toHaveBeenCalled()
    })
  })

  describe('Create Action', () => {
    const mockEventTypes = [
      {
        _id: 'eventType_1',
        name: 'Sunday Service',
        description: 'Weekly worship',
        color: '#3b82f6',
        isActive: true,
      },
    ]

    beforeEach(() => {
      mockUseEventTypesList.mockReturnValue({
        data: mockEventTypes,
        isLoading: false,
        error: null,
      })
    })

    it('calls onCreate when add button clicked', () => {
      render(<EventTypeList onEdit={mockOnEdit} onCreate={mockOnCreate} />, {
        wrapper: createWrapper(),
      })

      fireEvent.click(screen.getByRole('button', { name: /add event type/i }))

      expect(mockOnCreate).toHaveBeenCalledTimes(1)
    })

    it('shows add button at top of list', () => {
      render(<EventTypeList onEdit={mockOnEdit} onCreate={mockOnCreate} />, {
        wrapper: createWrapper(),
      })

      const addButton = screen.getByRole('button', { name: /add event type/i })
      expect(addButton).toBeInTheDocument()
    })
  })

  describe('Default Color Handling', () => {
    it('uses gray color when color is null or undefined', () => {
      mockUseEventTypesList.mockReturnValue({
        data: [
          {
            _id: 'eventType_no_color',
            name: 'No Color Event',
            description: 'Test',
            color: null,
            isActive: true,
          },
        ],
        isLoading: false,
        error: null,
      })

      render(<EventTypeList onEdit={mockOnEdit} onCreate={mockOnCreate} />, {
        wrapper: createWrapper(),
      })

      const colorCircle = screen.getByTestId('color-circle-eventType_no_color')
      expect(colorCircle).toHaveStyle({ backgroundColor: '#6b7280' })
      expect(screen.getByText('#6b7280')).toBeInTheDocument()
    })
  })
})
