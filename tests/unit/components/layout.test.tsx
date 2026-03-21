import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Layout } from '~/components/layout/Layout'

// Mock the child components to simplify testing
vi.mock('~/components/layout/Header', () => ({
  Header: ({ onMenuClick }: { onMenuClick: () => void }) => (
    <header data-testid="header">
      <button data-testid="menu-button" onClick={onMenuClick}>
        Menu
      </button>
    </header>
  ),
}))

vi.mock('~/components/layout/Sidebar', () => ({
  Sidebar: () => <aside data-testid="sidebar">Sidebar Content</aside>,
}))

vi.mock('~/components/layout/MobileNav', () => ({
  MobileNav: ({ open, onClose }: { open: boolean; onClose: () => void }) => (
    <div data-testid="mobile-nav" data-open={open}>
      Mobile Navigation
      <button data-testid="close-nav" onClick={onClose}>
        Close
      </button>
    </div>
  ),
}))

describe('Layout', () => {
  it('renders with navigation elements', () => {
    render(
      <Layout>
        <div data-testid="page-content">Test Content</div>
      </Layout>,
    )

    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('mobile-nav')).toBeInTheDocument()
  })

  it('renders children content', () => {
    render(
      <Layout>
        <div data-testid="page-content">Test Page Content</div>
      </Layout>,
    )

    expect(screen.getByTestId('page-content')).toBeInTheDocument()
    expect(screen.getByText('Test Page Content')).toBeInTheDocument()
  })

  it('renders main content area', () => {
    render(
      <Layout>
        <div>Child Content</div>
      </Layout>,
    )

    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()
    expect(main).toHaveClass('flex-1', 'overflow-y-auto')
  })

  it('renders without children', () => {
    render(<Layout />)

    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('renders multiple children', () => {
    render(
      <Layout>
        <div data-testid="child-1">First Child</div>
        <div data-testid="child-2">Second Child</div>
        <div data-testid="child-3">Third Child</div>
      </Layout>,
    )

    expect(screen.getByTestId('child-1')).toBeInTheDocument()
    expect(screen.getByTestId('child-2')).toBeInTheDocument()
    expect(screen.getByTestId('child-3')).toBeInTheDocument()
  })

  it('has proper layout structure', () => {
    const { container } = render(
      <Layout>
        <div>Content</div>
      </Layout>,
    )

    // Check root element has expected classes
    const rootDiv = container.firstChild as HTMLElement
    expect(rootDiv).toHaveClass('flex', 'h-screen', 'overflow-hidden')
  })
})
