import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QuickStats } from '~/features/events/components/QuickStats'

describe('QuickStats', () => {
  const defaultProps = {
    eventsThisMonth: 5,
    totalEvents: 42,
    lastEvent: 'March 25',
    nextScheduled: 'March 30',
  }

  describe('Rendering', () => {
    it('renders all four stat items', () => {
      render(<QuickStats {...defaultProps} />)

      expect(screen.getByText(/events this month/i)).toBeInTheDocument()
      expect(screen.getByText(/total events/i)).toBeInTheDocument()
      expect(screen.getByText(/last event/i)).toBeInTheDocument()
      expect(screen.getByText(/next scheduled/i)).toBeInTheDocument()
    })

    it('displays correct stat values', () => {
      render(<QuickStats {...defaultProps} />)

      expect(screen.getByText('5')).toBeInTheDocument() // eventsThisMonth
      expect(screen.getByText('42')).toBeInTheDocument() // totalEvents
      expect(screen.getByText('March 25')).toBeInTheDocument() // lastEvent
      expect(screen.getByText('March 30')).toBeInTheDocument() // nextScheduled
    })

    it('renders icons for each stat', () => {
      render(<QuickStats {...defaultProps} />)

      // Check that icons are rendered (by class name or svg elements)
      const icons = document.querySelectorAll('svg')
      expect(icons.length).toBe(4)
    })

    it('applies custom className when provided', () => {
      render(<QuickStats {...defaultProps} className="custom-class" />)

      const container =
        screen.getByText(/events this month/i).parentElement?.parentElement
      expect(container).toHaveClass('custom-class')
    })

    it('renders in responsive grid layout', () => {
      render(<QuickStats {...defaultProps} />)

      const container =
        screen.getByText(/events this month/i).parentElement?.parentElement
      expect(container).toHaveClass('grid')
      expect(container).toHaveClass('grid-cols-2')
      expect(container).toHaveClass('sm:grid-cols-4')
    })
  })

  describe('Stat Values Display', () => {
    it('displays zero values correctly', () => {
      render(
        <QuickStats
          eventsThisMonth={0}
          totalEvents={0}
          lastEvent="None"
          nextScheduled="TBD"
        />,
      )

      const zeroElements = screen.getAllByText('0')
      expect(zeroElements.length).toBeGreaterThanOrEqual(2)
      expect(screen.getByText('None')).toBeInTheDocument()
      expect(screen.getByText('TBD')).toBeInTheDocument()
    })

    it('displays large numbers correctly', () => {
      render(
        <QuickStats
          eventsThisMonth={999}
          totalEvents={9999}
          lastEvent="December 31, 2025"
          nextScheduled="January 1, 2026"
        />,
      )

      expect(screen.getByText('999')).toBeInTheDocument()
      expect(screen.getByText('9999')).toBeInTheDocument()
      expect(screen.getByText('December 31, 2025')).toBeInTheDocument()
      expect(screen.getByText('January 1, 2026')).toBeInTheDocument()
    })

    it('displays single digit values correctly', () => {
      render(
        <QuickStats
          eventsThisMonth={1}
          totalEvents={1}
          lastEvent="Today"
          nextScheduled="Tomorrow"
        />,
      )

      expect(screen.getAllByText('1').length).toBe(2)
      expect(screen.getByText('Today')).toBeInTheDocument()
      expect(screen.getByText('Tomorrow')).toBeInTheDocument()
    })
  })

  describe('Responsive Behavior', () => {
    it('uses tabular nums for consistent number alignment', () => {
      render(<QuickStats {...defaultProps} />)

      const valueElements = screen.getAllByText(/\d+/).filter((el) => {
        return el.classList.contains('tabular-nums')
      })

      expect(valueElements.length).toBeGreaterThan(0)
    })

    it('has responsive text sizing', () => {
      render(<QuickStats {...defaultProps} />)

      const valueElements = screen.getAllByText(/\d+|March/).filter((el) => {
        return (
          el.classList.contains('text-lg') ||
          el.classList.contains('sm:text-2xl')
        )
      })

      expect(valueElements.length).toBeGreaterThan(0)
    })

    it('has responsive icon sizing', () => {
      render(<QuickStats {...defaultProps} />)

      const icons = document.querySelectorAll('svg')
      icons.forEach((icon) => {
        expect(icon.classList.contains('size-4')).toBe(true)
      })
    })
  })

  describe('StatItem Component', () => {
    it('displays label and value together', () => {
      render(<QuickStats {...defaultProps} />)

      const eventsThisMonthLabel = screen.getByText(/events this month/i)
      expect(eventsThisMonthLabel).toBeInTheDocument()
      expect(eventsThisMonthLabel.tagName.toLowerCase()).toBe('span')

      const eventsThisMonthValue = screen.getByText('5')
      expect(eventsThisMonthValue).toBeInTheDocument()
    })

    it('centers content within each stat item', () => {
      render(<QuickStats {...defaultProps} />)

      const statContainers = screen
        .getByText(/events this month/i)
        .closest('div')
        ?.parentElement?.querySelectorAll(':scope > div')

      expect(statContainers?.length).toBe(4)

      statContainers?.forEach((container) => {
        expect(container.classList.contains('flex')).toBe(true)
        expect(container.classList.contains('flex-col')).toBe(true)
        expect(container.classList.contains('items-center')).toBe(true)
        expect(container.classList.contains('text-center')).toBe(true)
      })
    })

    it('applies muted foreground color to icons and labels', () => {
      render(<QuickStats {...defaultProps} />)

      const icons = document.querySelectorAll('svg')
      icons.forEach((icon) => {
        expect(icon.classList.contains('text-muted-foreground')).toBe(true)
      })

      const labels = screen.getAllByText(
        /events this month|total events|last event|next scheduled/i,
      )
      labels.forEach((label) => {
        expect(label.classList.contains('text-muted-foreground')).toBe(true)
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles empty string values gracefully', () => {
      render(
        <QuickStats
          eventsThisMonth={0}
          totalEvents={0}
          lastEvent=""
          nextScheduled=""
        />,
      )

      // Component should still render without crashing
      expect(screen.getByText(/events this month/i)).toBeInTheDocument()
      expect(screen.getByText(/total events/i)).toBeInTheDocument()
      expect(screen.getByText(/last event/i)).toBeInTheDocument()
      expect(screen.getByText(/next scheduled/i)).toBeInTheDocument()
    })

    it('handles negative numbers gracefully', () => {
      render(
        <QuickStats
          eventsThisMonth={-5}
          totalEvents={-10}
          lastEvent="None"
          nextScheduled="TBD"
        />,
      )

      expect(screen.getByText('-5')).toBeInTheDocument()
      expect(screen.getByText('-10')).toBeInTheDocument()
    })

    it('handles very long date strings', () => {
      render(
        <QuickStats
          eventsThisMonth={1}
          totalEvents={100}
          lastEvent="Wednesday, December 25, 2024 at 9:00 AM"
          nextScheduled="Thursday, January 2, 2025 at 10:30 AM"
        />,
      )

      expect(
        screen.getByText('Wednesday, December 25, 2024 at 9:00 AM'),
      ).toBeInTheDocument()
      expect(
        screen.getByText('Thursday, January 2, 2025 at 10:30 AM'),
      ).toBeInTheDocument()
    })
  })
})
