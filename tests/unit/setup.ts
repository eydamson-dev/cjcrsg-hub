import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock ResizeObserver for components that use it (e.g., Command)
class MockResizeObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver

// Mock IntersectionObserver
const MockIntersectionObserver = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn(),
  takeRecords: vi.fn(() => []),
}))

global.IntersectionObserver =
  MockIntersectionObserver as unknown as typeof IntersectionObserver

// Mock scrollIntoView for Command component
Element.prototype.scrollIntoView = vi.fn()

// Suppress React act() warnings from Radix UI components
const originalError = console.error
console.error = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('was not wrapped in act') ||
      args[0].includes('An update to %s inside a test') ||
      args[0].includes('hydration') ||
      args[0].includes('Hydration') ||
      args[0].includes(
        'Convex functions should not directly call other Convex',
      ))
  ) {
    return
  }
  originalError.apply(console, args)
}

// Suppress convex-test warnings
const originalWarn = console.warn
console.warn = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes(
      'Convex functions should not directly call other Convex',
    ) ||
      args[0].includes('Consider calling a helper function instead'))
  ) {
    return
  }
  originalWarn.apply(console, args)
}

// Suppress stderr warnings from convex-test in Node environment
if (typeof process !== 'undefined' && process.stderr) {
  const originalStderrWrite = process.stderr.write
  process.stderr.write = function (chunk: any, encoding?: any, callback?: any) {
    const str = chunk.toString()
    if (
      str.includes('Convex functions should not directly call other Convex') ||
      str.includes('Consider calling a helper function instead')
    ) {
      return true
    }
    return originalStderrWrite.apply(process.stderr, [
      chunk,
      encoding,
      callback,
    ])
  } as any
}
