import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BannerUploader } from '~/features/events/components/BannerUploader'

describe('BannerUploader', () => {
  const mockOnUpload = vi.fn()
  const mockOnClose = vi.fn()
  const mockBannerUrl = 'https://example.com/banner.jpg'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('renders when open is true', () => {
      render(
        <BannerUploader
          open={true}
          onUpload={mockOnUpload}
          onClose={mockOnClose}
        />,
      )

      expect(screen.getByText(/banner image/i)).toBeInTheDocument()
    })

    it('does not render when open is false', () => {
      render(
        <BannerUploader
          open={false}
          onUpload={mockOnUpload}
          onClose={mockOnClose}
        />,
      )

      expect(screen.queryByText(/banner image/i)).not.toBeInTheDocument()
    })

    it('shows empty state when no banner image', () => {
      render(
        <BannerUploader
          open={true}
          onUpload={mockOnUpload}
          onClose={mockOnClose}
        />,
      )

      expect(screen.getByText(/no banner uploaded/i)).toBeInTheDocument()
    })

    it('shows banner preview when banner image exists', () => {
      render(
        <BannerUploader
          open={true}
          bannerImage={mockBannerUrl}
          onUpload={mockOnUpload}
          onClose={mockOnClose}
        />,
      )

      const img = screen.getByAltText(/event banner/i)
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', mockBannerUrl)
    })

    it('renders upload and url buttons', () => {
      render(
        <BannerUploader
          open={true}
          onUpload={mockOnUpload}
          onClose={mockOnClose}
        />,
      )

      expect(
        screen.getByRole('button', { name: /upload image/i }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /enter url/i }),
      ).toBeInTheDocument()
    })

    it('renders cancel button', () => {
      render(
        <BannerUploader
          open={true}
          onUpload={mockOnUpload}
          onClose={mockOnClose}
        />,
      )

      expect(
        screen.getByRole('button', { name: /cancel/i }),
      ).toBeInTheDocument()
    })
  })

  describe('URL Input', () => {
    it('shows url input when clicking Enter URL button', () => {
      render(
        <BannerUploader
          open={true}
          onUpload={mockOnUpload}
          onClose={mockOnClose}
        />,
      )

      const enterUrlButton = screen.getByRole('button', { name: /enter url/i })
      fireEvent.click(enterUrlButton)

      expect(screen.getByLabelText(/banner image url/i)).toBeInTheDocument()
    })

    it('hides url input when clicking Enter URL button again', () => {
      render(
        <BannerUploader
          open={true}
          onUpload={mockOnUpload}
          onClose={mockOnClose}
        />,
      )

      const enterUrlButton = screen.getByRole('button', { name: /enter url/i })

      // Show
      fireEvent.click(enterUrlButton)
      expect(screen.getByLabelText(/banner image url/i)).toBeInTheDocument()

      // Hide
      fireEvent.click(enterUrlButton)
      expect(
        screen.queryByLabelText(/banner image url/i),
      ).not.toBeInTheDocument()
    })

    it('pre-populates url input with existing banner image', () => {
      render(
        <BannerUploader
          open={true}
          bannerImage={mockBannerUrl}
          onUpload={mockOnUpload}
          onClose={mockOnClose}
        />,
      )

      const enterUrlButton = screen.getByRole('button', { name: /enter url/i })
      fireEvent.click(enterUrlButton)

      const urlInput = screen.getByLabelText(/banner image url/i)
      expect(urlInput).toHaveValue(mockBannerUrl)
    })
  })

  describe('Modal Close Behavior', () => {
    it('calls onClose when clicking cancel button', () => {
      render(
        <BannerUploader
          open={true}
          onUpload={mockOnUpload}
          onClose={mockOnClose}
        />,
      )

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('resets state when reopened', () => {
      const { rerender } = render(
        <BannerUploader
          open={true}
          onUpload={mockOnUpload}
          onClose={mockOnClose}
        />,
      )

      // Show URL input
      const enterUrlButton = screen.getByRole('button', { name: /enter url/i })
      fireEvent.click(enterUrlButton)

      expect(screen.getByLabelText(/banner image url/i)).toBeInTheDocument()

      // Close
      rerender(
        <BannerUploader
          open={false}
          onUpload={mockOnUpload}
          onClose={mockOnClose}
        />,
      )

      // Reopen
      rerender(
        <BannerUploader
          open={true}
          onUpload={mockOnUpload}
          onClose={mockOnClose}
        />,
      )

      // URL input should be hidden again
      expect(
        screen.queryByLabelText(/banner image url/i),
      ).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles null banner image', () => {
      render(
        <BannerUploader
          open={true}
          bannerImage={null as any}
          onUpload={mockOnUpload}
          onClose={mockOnClose}
        />,
      )

      expect(screen.getByText(/no banner uploaded/i)).toBeInTheDocument()
    })

    it('handles undefined banner image', () => {
      render(
        <BannerUploader
          open={true}
          bannerImage={undefined}
          onUpload={mockOnUpload}
          onClose={mockOnClose}
        />,
      )

      expect(screen.getByText(/no banner uploaded/i)).toBeInTheDocument()
    })
  })
})
