import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorState } from '~/components/ui/error-state'

describe('ErrorState', () => {
  const mockRetry = vi.fn()
  const mockBack = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Error Type Rendering', () => {
    it('renders not-found error type with correct content', () => {
      render(<ErrorState type="not-found" />)

      expect(screen.getByText('Not Found')).toBeInTheDocument()
      expect(
        screen.getByText(
          "The item you're looking for doesn't exist or has been removed.",
        ),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /back to attendees/i }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /try again/i }),
      ).toBeInTheDocument()
    })

    it('renders error type with correct content', () => {
      render(<ErrorState type="error" />)

      expect(screen.getByText('Something Went Wrong')).toBeInTheDocument()
      expect(
        screen.getByText('An unexpected error occurred. Please try again.'),
      ).toBeInTheDocument()
    })

    it('renders network error type with correct content', () => {
      render(<ErrorState type="network" />)

      expect(screen.getByText('Connection Error')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Unable to connect to the server. Please check your connection.',
        ),
      ).toBeInTheDocument()
    })

    it('renders unauthorized error type with correct content', () => {
      render(<ErrorState type="unauthorized" />)

      expect(screen.getByText('Access Denied')).toBeInTheDocument()
      expect(
        screen.getByText("You don't have permission to access this resource."),
      ).toBeInTheDocument()
    })

    it('defaults to error type when no type specified', () => {
      render(<ErrorState />)

      expect(screen.getByText('Something Went Wrong')).toBeInTheDocument()
    })
  })

  describe('Custom Content', () => {
    it('renders custom title when provided', () => {
      render(<ErrorState type="not-found" title="Custom Title" />)

      expect(screen.getByText('Custom Title')).toBeInTheDocument()
      expect(screen.queryByText('Not Found')).not.toBeInTheDocument()
    })

    it('renders custom description when provided', () => {
      render(<ErrorState type="error" description="Custom error description" />)

      expect(screen.getByText('Custom error description')).toBeInTheDocument()
    })

    it('renders error message when error object provided', () => {
      const testError = new Error('Test error message')
      render(<ErrorState type="error" error={testError} />)

      expect(screen.getByText(/test error message/i)).toBeInTheDocument()
    })

    it('renders both custom description and error message', () => {
      const testError = new Error('Detailed error')
      render(
        <ErrorState
          type="error"
          description="Custom description"
          error={testError}
        />,
      )

      expect(screen.getByText('Custom description')).toBeInTheDocument()
      expect(screen.getByText(/detailed error/i)).toBeInTheDocument()
    })
  })

  describe('Button Actions', () => {
    it('calls onRetry when retry button clicked', () => {
      render(<ErrorState type="error" onRetry={mockRetry} />)

      fireEvent.click(screen.getByRole('button', { name: /try again/i }))

      expect(mockRetry).toHaveBeenCalledTimes(1)
    })

    it('calls onBack when back button clicked', () => {
      render(<ErrorState type="not-found" onBack={mockBack} />)

      fireEvent.click(
        screen.getByRole('button', { name: /back to attendees/i }),
      )

      expect(mockBack).toHaveBeenCalledTimes(1)
    })

    it('hides retry button when showRetry is false', () => {
      render(<ErrorState type="error" showRetry={false} />)

      expect(
        screen.queryByRole('button', { name: /try again/i }),
      ).not.toBeInTheDocument()
    })

    it('hides back button when showBack is false', () => {
      render(<ErrorState type="error" showBack={false} />)

      expect(
        screen.queryByRole('button', { name: /back to attendees/i }),
      ).not.toBeInTheDocument()
    })

    it('renders custom retry label when provided', () => {
      render(
        <ErrorState
          type="error"
          retryLabel="Custom Retry"
          onRetry={mockRetry}
        />,
      )

      expect(
        screen.getByRole('button', { name: /custom retry/i }),
      ).toBeInTheDocument()
    })

    it('renders custom back label when provided', () => {
      render(
        <ErrorState type="error" backLabel="Custom Back" onBack={mockBack} />,
      )

      expect(
        screen.getByRole('button', { name: /custom back/i }),
      ).toBeInTheDocument()
    })

    it('renders only retry button when showBack is false', () => {
      render(<ErrorState type="error" showBack={false} />)

      expect(
        screen.getByRole('button', { name: /try again/i }),
      ).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: /back/i }),
      ).not.toBeInTheDocument()
    })

    it('renders only back button when showRetry is false', () => {
      render(<ErrorState type="error" showRetry={false} />)

      expect(
        screen.getByRole('button', { name: /back to attendees/i }),
      ).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: /try again/i }),
      ).not.toBeInTheDocument()
    })

    it('renders no buttons when both showRetry and showBack are false', () => {
      render(<ErrorState type="error" showRetry={false} showBack={false} />)

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  describe('Default Behaviors', () => {
    it('reloads page when retry clicked without onRetry handler', () => {
      const reloadSpy = vi.fn()
      Object.defineProperty(window, 'location', {
        value: { reload: reloadSpy },
        writable: true,
      })

      render(<ErrorState type="error" />)

      fireEvent.click(screen.getByRole('button', { name: /try again/i }))

      expect(reloadSpy).toHaveBeenCalledTimes(1)
    })

    it('navigates to attendees when back clicked without onBack handler', () => {
      Object.defineProperty(window, 'location', {
        value: { href: '' },
        writable: true,
      })

      render(<ErrorState type="not-found" />)

      fireEvent.click(
        screen.getByRole('button', { name: /back to attendees/i }),
      )

      expect(window.location.href).toBe('/attendees')
    })
  })
})
