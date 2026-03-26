import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DescriptionEditModal } from '~/features/events/components/DescriptionEditModal'

describe('DescriptionEditModal', () => {
  const mockOnSave = vi.fn()
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders when open is true', () => {
      render(
        <DescriptionEditModal
          open={true}
          description="Initial description"
          onSave={mockOnSave}
          onClose={mockOnClose}
        />,
      )

      expect(screen.getByText(/edit description/i)).toBeInTheDocument()
    })

    it('does not render when open is false', () => {
      render(
        <DescriptionEditModal
          open={false}
          description="Initial description"
          onSave={mockOnSave}
          onClose={mockOnClose}
        />,
      )

      expect(screen.queryByText(/edit description/i)).not.toBeInTheDocument()
    })

    it('renders description textarea', () => {
      render(
        <DescriptionEditModal
          open={true}
          description="Initial description"
          onSave={mockOnSave}
          onClose={mockOnClose}
        />,
      )

      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('pre-populates textarea with initial description', () => {
      render(
        <DescriptionEditModal
          open={true}
          description="Test description content"
          onSave={mockOnSave}
          onClose={mockOnClose}
        />,
      )

      expect(screen.getByRole('textbox')).toHaveValue(
        'Test description content',
      )
    })

    it('renders save and cancel buttons', () => {
      render(
        <DescriptionEditModal
          open={true}
          description="Initial description"
          onSave={mockOnSave}
          onClose={mockOnClose}
        />,
      )

      expect(
        screen.getByRole('button', { name: /save changes/i }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /cancel/i }),
      ).toBeInTheDocument()
    })
  })

  describe('Form Behavior', () => {
    it('updates description when typing', () => {
      render(
        <DescriptionEditModal
          open={true}
          description=""
          onSave={mockOnSave}
          onClose={mockOnClose}
        />,
      )

      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: 'New description text' } })

      expect(textarea).toHaveValue('New description text')
    })

    it('allows empty description', async () => {
      render(
        <DescriptionEditModal
          open={true}
          description="Existing description"
          onSave={mockOnSave}
          onClose={mockOnClose}
        />,
      )

      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: '' } })

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith('')
      })
    })

    it('allows long descriptions', async () => {
      const longDescription = 'A'.repeat(1000)

      render(
        <DescriptionEditModal
          open={true}
          description=""
          onSave={mockOnSave}
          onClose={mockOnClose}
        />,
      )

      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: longDescription } })

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(longDescription)
      })
    })
  })

  describe('Form Submission', () => {
    it('calls onSave with description when clicking save', async () => {
      render(
        <DescriptionEditModal
          open={true}
          description="Initial description"
          onSave={mockOnSave}
          onClose={mockOnClose}
        />,
      )

      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: 'Updated description' } })

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith('Updated description')
      })
    })

    it('calls onSave with empty string when description is cleared', async () => {
      render(
        <DescriptionEditModal
          open={true}
          description="Initial description"
          onSave={mockOnSave}
          onClose={mockOnClose}
        />,
      )

      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: '' } })

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith('')
      })
    })
  })

  describe('Modal Close Behavior', () => {
    it('calls onClose when clicking cancel button', () => {
      render(
        <DescriptionEditModal
          open={true}
          description="Initial description"
          onSave={mockOnSave}
          onClose={mockOnClose}
        />,
      )

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('does not call onSave when clicking cancel', () => {
      render(
        <DescriptionEditModal
          open={true}
          description="Initial description"
          onSave={mockOnSave}
          onClose={mockOnClose}
        />,
      )

      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: 'Changed description' } })

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)

      expect(mockOnSave).not.toHaveBeenCalled()
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('resets description when reopened', () => {
      const { rerender } = render(
        <DescriptionEditModal
          open={true}
          description="Original description"
          onSave={mockOnSave}
          onClose={mockOnClose}
        />,
      )

      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: 'Modified description' } })

      // Close modal
      rerender(
        <DescriptionEditModal
          open={false}
          description="Original description"
          onSave={mockOnSave}
          onClose={mockOnClose}
        />,
      )

      // Reopen modal
      rerender(
        <DescriptionEditModal
          open={true}
          description="Original description"
          onSave={mockOnSave}
          onClose={mockOnClose}
        />,
      )

      // Should reset to original value
      expect(screen.getByRole('textbox')).toHaveValue('Original description')
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined description prop', () => {
      render(
        <DescriptionEditModal
          open={true}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />,
      )

      expect(screen.getByRole('textbox')).toHaveValue('')
    })

    it('handles null description prop', () => {
      render(
        <DescriptionEditModal
          open={true}
          description={null as any}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />,
      )

      expect(screen.getByRole('textbox')).toHaveValue('')
    })

    it('handles description with special characters', async () => {
      const specialDescription =
        'Description with <html> & "quotes" and \'apostrophes\''

      render(
        <DescriptionEditModal
          open={true}
          description=""
          onSave={mockOnSave}
          onClose={mockOnClose}
        />,
      )

      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: specialDescription } })

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(specialDescription)
      })
    })

    it('handles multiline descriptions', async () => {
      const multilineDescription = 'Line 1\nLine 2\nLine 3'

      render(
        <DescriptionEditModal
          open={true}
          description=""
          onSave={mockOnSave}
          onClose={mockOnClose}
        />,
      )

      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: multilineDescription } })

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(multilineDescription)
      })
    })
  })
})
