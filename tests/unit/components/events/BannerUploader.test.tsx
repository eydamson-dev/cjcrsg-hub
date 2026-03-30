import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BannerUploader } from '~/features/events/components/BannerUploader'

vi.mock('~/features/events/hooks/useFileUpload', () => ({
  useFileUpload: () => ({
    handleUploadBanner: vi.fn().mockResolvedValue('storage123'),
    handleSetBannerUrl: vi.fn().mockResolvedValue(undefined),
    handleRemoveMedia: vi.fn().mockResolvedValue(undefined),
    handleUploadMedia: vi.fn().mockResolvedValue('storage123'),
    isUploading: false,
    uploadProgress: 'idle',
  }),
}))

describe('BannerUploader', () => {
  const mockOnClose = vi.fn()
  const mockEventId = 'event123'
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
          eventId={mockEventId}
          onClose={mockOnClose}
        />,
      )

      expect(screen.getByText(/banner image/i)).toBeInTheDocument()
    })

    it('does not render when open is false', () => {
      render(
        <BannerUploader
          open={false}
          eventId={mockEventId}
          onClose={mockOnClose}
        />,
      )

      expect(screen.queryByText(/banner image/i)).not.toBeInTheDocument()
    })

    it('shows empty state when no banner image', () => {
      render(
        <BannerUploader
          open={true}
          eventId={mockEventId}
          onClose={mockOnClose}
        />,
      )

      expect(screen.getByText(/no banner uploaded/i)).toBeInTheDocument()
    })

    it('shows banner preview when banner image exists', () => {
      render(
        <BannerUploader
          open={true}
          eventId={mockEventId}
          bannerImage={mockBannerUrl}
          onClose={mockOnClose}
        />,
      )

      const img = screen.getByAltText('Event banner')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', mockBannerUrl)
    })

    it('renders upload and url buttons', () => {
      render(
        <BannerUploader
          open={true}
          eventId={mockEventId}
          onClose={mockOnClose}
        />,
      )

      expect(screen.getByText(/upload image/i)).toBeInTheDocument()
      expect(screen.getByText(/enter url/i)).toBeInTheDocument()
    })

    it('renders cancel button', () => {
      render(
        <BannerUploader
          open={true}
          eventId={mockEventId}
          onClose={mockOnClose}
        />,
      )

      expect(screen.getByText(/cancel/i)).toBeInTheDocument()
    })
  })

  describe('URL Input', () => {
    it('shows url input when clicking Enter URL button', () => {
      render(
        <BannerUploader
          open={true}
          eventId={mockEventId}
          onClose={mockOnClose}
        />,
      )

      fireEvent.click(screen.getByText(/enter url/i))

      expect(screen.getByLabelText(/banner image url/i)).toBeInTheDocument()
    })

    it('hides url input when clicking Enter URL button again', () => {
      render(
        <BannerUploader
          open={true}
          eventId={mockEventId}
          onClose={mockOnClose}
        />,
      )

      fireEvent.click(screen.getByText(/enter url/i))
      fireEvent.click(screen.getByText(/enter url/i))

      expect(
        screen.queryByLabelText(/banner image url/i),
      ).not.toBeInTheDocument()
    })

    it('pre-populates url input with existing banner image', () => {
      render(
        <BannerUploader
          open={true}
          eventId={mockEventId}
          bannerImage={mockBannerUrl}
          onClose={mockOnClose}
        />,
      )

      fireEvent.click(screen.getByText(/enter url/i))

      const input = screen.getByLabelText(
        /banner image url/i,
      ) as HTMLInputElement
      expect(input.value).toBe(mockBannerUrl)
    })
  })

  describe('Modal Close Behavior', () => {
    it('calls onClose when clicking cancel button', () => {
      render(
        <BannerUploader
          open={true}
          eventId={mockEventId}
          onClose={mockOnClose}
        />,
      )

      fireEvent.click(screen.getByText(/cancel/i))

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('resets state when reopened', () => {
      const { rerender } = render(
        <BannerUploader
          open={true}
          eventId={mockEventId}
          bannerImage={mockBannerUrl}
          onClose={mockOnClose}
        />,
      )

      fireEvent.click(screen.getByText(/enter url/i))
      expect(screen.getByLabelText(/banner image url/i)).toBeInTheDocument()

      rerender(
        <BannerUploader
          open={false}
          eventId={mockEventId}
          bannerImage={mockBannerUrl}
          onClose={mockOnClose}
        />,
      )

      rerender(
        <BannerUploader
          open={true}
          eventId={mockEventId}
          bannerImage={mockBannerUrl}
          onClose={mockOnClose}
        />,
      )

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
          eventId={mockEventId}
          bannerImage={null as any}
          onClose={mockOnClose}
        />,
      )

      expect(screen.getByText(/no banner uploaded/i)).toBeInTheDocument()
    })

    it('handles undefined banner image', () => {
      render(
        <BannerUploader
          open={true}
          eventId={mockEventId}
          bannerImage={undefined}
          onClose={mockOnClose}
        />,
      )

      expect(screen.getByText(/no banner uploaded/i)).toBeInTheDocument()
    })
  })
})
