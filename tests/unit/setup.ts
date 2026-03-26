import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock ResizeObserver for components that use it (e.g., Command)
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
const MockIntersectionObserver = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn(),
  takeRecords: vi.fn(() => []),
}))

global.IntersectionObserver =
  MockIntersectionObserver as unknown as typeof IntersectionObserver

// Suppress React act() warnings from Radix UI components
const originalError = console.error
console.error = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('was not wrapped in act') ||
      args[0].includes('An update to %s inside a test'))
  ) {
    return
  }
  originalError.apply(console, args)
}
