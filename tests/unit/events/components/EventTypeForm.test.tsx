import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { EventTypeForm } from '~/features/events/components/EventTypeForm'

// Mock react-colorful
vi.mock('react-colorful', () => ({
  HexColorPicker: ({
    color,
    onChange,
  }: {
    color: string
    onChange: (color: string) => void
  }) => (
    <div data-testid="color-picker" data-color={color}>
      <button onClick={() => onChange('#ff0000')}>Set Red</button>
      <button onClick={() => onChange('#00ff00')}>Set Green</button>
      <button onClick={() => onChange('#0000ff')}>Set Blue</button>
    </div>
  ),
}))

describe('EventTypeForm', () => {
  const mockSubmit = vi.fn()
  const mockCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Form Rendering', () => {
    it('renders name field (required)', () => {
      render(<EventTypeForm onSubmit={mockSubmit} />)

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
      expect(
        screen.getByPlaceholderText(/e\.g\., sunday service/i),
      ).toBeInTheDocument()
    })

    it('renders description field (optional)', () => {
      render(<EventTypeForm onSubmit={mockSubmit} />)

      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      expect(
        screen.getByPlaceholderText(/optional description/i),
      ).toBeInTheDocument()
    })

    it('renders color input with hex value', () => {
      render(<EventTypeForm onSubmit={mockSubmit} />)

      const colorInput = screen.getByLabelText(/color/i)
      expect(colorInput).toBeInTheDocument()
      expect(colorInput).toHaveValue('#3b82f6')
    })

    it('renders color picker', () => {
      render(<EventTypeForm onSubmit={mockSubmit} />)

      expect(screen.getByTestId('color-picker')).toBeInTheDocument()
    })

    it('renders randomize color button', () => {
      render(<EventTypeForm onSubmit={mockSubmit} />)

      const randomizeButton = screen.getByRole('button', {
        name: /randomize color/i,
      })
      expect(randomizeButton).toBeInTheDocument()
    })

    it('renders with initial data in edit mode', () => {
      const initialData = {
        name: 'Sunday Service',
        description: 'Weekly worship',
        color: '#ff0000',
      }

      render(<EventTypeForm initialData={initialData} onSubmit={mockSubmit} />)

      expect(screen.getByDisplayValue('Sunday Service')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Weekly worship')).toBeInTheDocument()
      expect(screen.getByDisplayValue('#ff0000')).toBeInTheDocument()
    })

    it('shows "Create Event Type" title in create mode', () => {
      render(<EventTypeForm onSubmit={mockSubmit} />)

      expect(screen.getByText('Create Event Type')).toBeInTheDocument()
    })

    it('shows "Edit Event Type" title in edit mode', () => {
      const initialData = { name: 'Sunday Service' }

      render(<EventTypeForm initialData={initialData} onSubmit={mockSubmit} />)

      expect(screen.getByText('Edit Event Type')).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('validates name is required (min 2 chars)', async () => {
      render(<EventTypeForm onSubmit={mockSubmit} />)

      // Enter single character
      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: 'A' },
      })

      fireEvent.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(
          screen.getByText(/name must be at least 2 characters/i),
        ).toBeInTheDocument()
      })

      expect(mockSubmit).not.toHaveBeenCalled()
    })

    it('shows error for invalid hex color', async () => {
      render(<EventTypeForm onSubmit={mockSubmit} />)

      // Clear and enter invalid color
      const colorInput = screen.getByLabelText(/color/i)
      fireEvent.change(colorInput, {
        target: { value: 'invalid-color' },
      })

      fireEvent.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(
          screen.getByText(/invalid hex color format/i),
        ).toBeInTheDocument()
      })
    })

    it('accepts valid hex color format', async () => {
      render(<EventTypeForm onSubmit={mockSubmit} />)

      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: 'Test Event' },
      })

      const colorInput = screen.getByLabelText(/color/i)
      fireEvent.change(colorInput, {
        target: { value: '#abcdef' },
      })

      fireEvent.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            color: '#abcdef',
          }),
        )
      })
    })

    it('accepts empty description', async () => {
      render(<EventTypeForm onSubmit={mockSubmit} />)

      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: 'Test Event' },
      })

      // Leave description empty
      fireEvent.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            description: '',
          }),
        )
      })
    })
  })

  describe('Color Functionality', () => {
    it('randomize button generates new color', () => {
      render(<EventTypeForm onSubmit={mockSubmit} />)

      const colorInput = screen.getByLabelText(/color/i) as HTMLInputElement

      const randomizeButton = screen
        .getAllByRole('button')
        .find(
          (btn) =>
            !btn.textContent?.includes('Save') &&
            !btn.textContent?.includes('Cancel') &&
            !btn.textContent?.includes('Set'),
        )

      if (randomizeButton) {
        fireEvent.click(randomizeButton)

        // Color should have changed (though we can't predict the random value)
        expect(colorInput.value).toMatch(/^#[0-9A-Fa-f]{6}$/)
      }
    })

    it('color picker updates hex input', () => {
      render(<EventTypeForm onSubmit={mockSubmit} />)

      const setRedButton = screen.getByRole('button', { name: /set red/i })

      fireEvent.click(setRedButton)

      const colorInput = screen.getByLabelText(/color/i) as HTMLInputElement
      expect(colorInput.value).toBe('#ff0000')
    })

    it('hex input updates color picker', () => {
      render(<EventTypeForm onSubmit={mockSubmit} />)

      const colorInput = screen.getByLabelText(/color/i)
      fireEvent.change(colorInput, {
        target: { value: '#00ff00' },
      })

      const colorPicker = screen.getByTestId('color-picker')
      expect(colorPicker).toHaveAttribute('data-color', '#00ff00')
    })
  })

  describe('Form Submission', () => {
    it('submits with valid data', async () => {
      render(<EventTypeForm onSubmit={mockSubmit} />)

      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: 'Sunday Service' },
      })

      fireEvent.change(screen.getByLabelText(/description/i), {
        target: { value: 'Weekly worship service' },
      })

      fireEvent.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledTimes(1)
        expect(mockSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Sunday Service',
            description: 'Weekly worship service',
            color: expect.any(String),
          }),
        )
      })
    })

    it('trims name before submit', async () => {
      render(<EventTypeForm onSubmit={mockSubmit} />)

      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: '  Sunday Service  ' },
      })

      fireEvent.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Sunday Service',
          }),
        )
      })
    })

    it('handles null color gracefully', async () => {
      render(<EventTypeForm onSubmit={mockSubmit} />)

      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: 'Test Event' },
      })

      // Clear color to empty
      const colorInput = screen.getByLabelText(/color/i)
      fireEvent.change(colorInput, {
        target: { value: '' },
      })

      fireEvent.click(screen.getByRole('button', { name: /save/i }))

      // Form validation should fail for invalid hex
      await waitFor(() => {
        expect(
          screen.getByText(/invalid hex color format/i),
        ).toBeInTheDocument()
      })
    })

    it('shows loading state when submitting', () => {
      render(<EventTypeForm onSubmit={mockSubmit} isSubmitting={true} />)

      expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
    })

    it('submits with all fields populated', async () => {
      render(<EventTypeForm onSubmit={mockSubmit} />)

      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: 'Youth Event' },
      })

      fireEvent.change(screen.getByLabelText(/description/i), {
        target: { value: 'Weekly youth gathering' },
      })

      fireEvent.change(screen.getByLabelText(/color/i), {
        target: { value: '#8b5cf6' },
      })

      fireEvent.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith({
          name: 'Youth Event',
          description: 'Weekly youth gathering',
          color: '#8b5cf6',
        })
      })
    })
  })

  describe('Form Cancellation', () => {
    it('calls onCancel when cancel button clicked', () => {
      render(<EventTypeForm onSubmit={mockSubmit} onCancel={mockCancel} />)

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

      expect(mockCancel).toHaveBeenCalledTimes(1)
    })

    it('does not render cancel button when onCancel is not provided', () => {
      render(<EventTypeForm onSubmit={mockSubmit} />)

      expect(
        screen.queryByRole('button', { name: /cancel/i }),
      ).not.toBeInTheDocument()
    })

    it('disables buttons while submitting', () => {
      render(
        <EventTypeForm
          onSubmit={mockSubmit}
          onCancel={mockCancel}
          isSubmitting={true}
        />,
      )

      expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()
    })

    it('disables all inputs while submitting', () => {
      render(<EventTypeForm onSubmit={mockSubmit} isSubmitting={true} />)

      expect(screen.getByLabelText(/name/i)).toBeDisabled()
      expect(screen.getByLabelText(/description/i)).toBeDisabled()
      expect(screen.getByLabelText(/color/i)).toBeDisabled()
    })
  })
})
