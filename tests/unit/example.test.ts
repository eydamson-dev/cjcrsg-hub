import { describe, it, expect } from 'vitest'

describe('Setup', () => {
  it('vitest works', () => {
    expect(true).toBe(true)
  })

  it('can import testing-library', () => {
    expect(() => require('@testing-library/react')).not.toThrow()
  })

  it('can import convex-test', () => {
    expect(() => require('convex-test')).not.toThrow()
  })
})
