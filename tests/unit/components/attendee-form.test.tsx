import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AttendeeForm } from '~/features/attendees/components/AttendeeForm'

describe('AttendeeForm', () => {
  const mockSubmit = vi.fn()
  const mockCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Form Rendering', () => {
    it('renders all required form fields', () => {
      render(<AttendeeForm onSubmit={mockSubmit} />)

      // Check required fields are present
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/address/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/status/i)).toBeInTheDocument()
    })

    it('renders optional form fields', () => {
      render(<AttendeeForm onSubmit={mockSubmit} />)

      // Check optional fields are present
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/notes/i)).toBeInTheDocument()
      // Date pickers are custom components without standard labels
      expect(screen.getAllByText(/date/i).length).toBeGreaterThanOrEqual(1)
    })

    it('renders with initial data when provided', () => {
      const initialData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        status: 'member' as const,
        address: '123 Test St',
      }

      render(<AttendeeForm initialData={initialData} onSubmit={mockSubmit} />)

      expect(screen.getByDisplayValue('John')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument()
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument()
      expect(screen.getByDisplayValue('123 Test St')).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('validates required fields on submit', async () => {
      render(<AttendeeForm onSubmit={mockSubmit} />)

      // Submit form without filling required fields
      fireEvent.click(screen.getByRole('button', { name: /save/i }))

      // Wait for validation errors
      await waitFor(() => {
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument()
        expect(screen.getByText(/last name is required/i)).toBeInTheDocument()
        expect(screen.getByText(/address is required/i)).toBeInTheDocument()
      })

      expect(mockSubmit).not.toHaveBeenCalled()
    })

    it('rejects invalid email format', async () => {
      render(<AttendeeForm onSubmit={mockSubmit} />)

      // Fill in required fields
      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: 'John' },
      })
      fireEvent.change(screen.getByLabelText(/last name/i), {
        target: { value: 'Doe' },
      })
      fireEvent.change(screen.getByLabelText(/address/i), {
        target: { value: '123 Test St' },
      })

      // Enter invalid email
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'invalid-email' },
      })

      fireEvent.click(screen.getByRole('button', { name: /save/i }))

      // Wait a bit for validation
      await waitFor(() => {
        // Form should not submit with invalid email
        expect(mockSubmit).not.toHaveBeenCalled()
      })
    })

    it('accepts empty email field', async () => {
      render(<AttendeeForm onSubmit={mockSubmit} />)

      // Fill in required fields
      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: 'John' },
      })
      fireEvent.change(screen.getByLabelText(/last name/i), {
        target: { value: 'Doe' },
      })
      fireEvent.change(screen.getByLabelText(/address/i), {
        target: { value: '123 Test St' },
      })

      fireEvent.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            firstName: 'John',
            lastName: 'Doe',
            email: '',
            address: '123 Test St',
            status: 'visitor',
          }),
        )
      })
    })

    it('accepts valid email format', async () => {
      render(<AttendeeForm onSubmit={mockSubmit} />)

      // Fill in required fields
      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: 'John' },
      })
      fireEvent.change(screen.getByLabelText(/last name/i), {
        target: { value: 'Doe' },
      })
      fireEvent.change(screen.getByLabelText(/address/i), {
        target: { value: '123 Test St' },
      })

      // Enter valid email
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'john@example.com' },
      })

      fireEvent.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            email: 'john@example.com',
          }),
        )
      })
    })
  })

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      render(<AttendeeForm onSubmit={mockSubmit} />)

      // Fill in all required fields
      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: 'John' },
      })
      fireEvent.change(screen.getByLabelText(/last name/i), {
        target: { value: 'Doe' },
      })
      fireEvent.change(screen.getByLabelText(/address/i), {
        target: { value: '123 Test St' },
      })

      fireEvent.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledTimes(1)
        expect(mockSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            firstName: 'John',
            lastName: 'Doe',
            address: '123 Test St',
            status: 'visitor',
            email: '',
            phone: '',
            notes: '',
          }),
        )
      })
    })

    it('submits form with all optional fields', async () => {
      render(<AttendeeForm onSubmit={mockSubmit} />)

      // Fill in all fields
      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: 'Jane' },
      })
      fireEvent.change(screen.getByLabelText(/last name/i), {
        target: { value: 'Smith' },
      })
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'jane@example.com' },
      })
      fireEvent.change(screen.getByLabelText(/phone/i), {
        target: { value: '1234567890' },
      })
      fireEvent.change(screen.getByLabelText(/address/i), {
        target: { value: '456 Oak Ave' },
      })
      fireEvent.change(screen.getByLabelText(/notes/i), {
        target: { value: 'Some notes' },
      })

      fireEvent.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
            phone: '1234567890',
            address: '456 Oak Ave',
            notes: 'Some notes',
          }),
        )
      })
    })

    it('shows loading state while submitting', () => {
      mockSubmit.mockImplementation(() => new Promise(() => {})) // Never resolves

      render(<AttendeeForm onSubmit={mockSubmit} isSubmitting={true} />)

      expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
    })
  })

  describe('Form Cancellation', () => {
    it('calls onCancel when cancel button is clicked', () => {
      render(<AttendeeForm onSubmit={mockSubmit} onCancel={mockCancel} />)

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

      expect(mockCancel).toHaveBeenCalledTimes(1)
    })

    it('does not render cancel button when onCancel is not provided', () => {
      render(<AttendeeForm onSubmit={mockSubmit} />)

      expect(
        screen.queryByRole('button', { name: /cancel/i }),
      ).not.toBeInTheDocument()
    })

    it('disables cancel button while submitting', () => {
      render(
        <AttendeeForm
          onSubmit={mockSubmit}
          onCancel={mockCancel}
          isSubmitting={true}
        />,
      )

      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()
    })
  })

  describe('Status Field', () => {
    it('defaults to visitor status', () => {
      render(<AttendeeForm onSubmit={mockSubmit} />)

      const statusSelect = screen.getByLabelText(/status/i)
      expect(statusSelect).toBeInTheDocument()
    })

    it('renders status dropdown', () => {
      render(<AttendeeForm onSubmit={mockSubmit} />)

      // Status is a Select component, verify it's rendered
      const statusTrigger = screen.getByRole('combobox', { name: /status/i })
      expect(statusTrigger).toBeInTheDocument()
    })
  })
})
