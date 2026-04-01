import { describe, it, expect } from 'vitest'
import {
  eventBasicInfoSchema,
  eventDescriptionSchema,
  eventBannerSchema,
  eventFullSchema,
  isValidImageUrl,
} from '~/features/events/forms/schemas/eventSchemas'

describe('eventBasicInfoSchema', () => {
  it('validates valid basic info', () => {
    const result = eventBasicInfoSchema.safeParse({
      name: 'Sunday Service',
      date: Date.now(),
      startTime: '09:00',
      endTime: '11:00',
      location: 'Main Sanctuary',
    })
    expect(result.success).toBe(true)
  })

  it('validates minimal required fields', () => {
    const result = eventBasicInfoSchema.safeParse({
      name: 'Event',
      date: Date.now(),
    })
    expect(result.success).toBe(true)
  })

  it('rejects name less than 2 characters', () => {
    const result = eventBasicInfoSchema.safeParse({
      name: 'A',
      date: Date.now(),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Event name must be at least 2 characters',
      )
    }
  })

  it('rejects missing date', () => {
    const result = eventBasicInfoSchema.safeParse({
      name: 'Event',
      date: 0,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Date is required')
    }
  })

  it('rejects end time before start time', () => {
    const result = eventBasicInfoSchema.safeParse({
      name: 'Event',
      date: Date.now(),
      startTime: '11:00',
      endTime: '09:00',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'End time must be after start time',
      )
    }
  })

  it('rejects end time equal to start time', () => {
    const result = eventBasicInfoSchema.safeParse({
      name: 'Event',
      date: Date.now(),
      startTime: '09:00',
      endTime: '09:00',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'End time must be after start time',
      )
    }
  })

  it('trims whitespace from name', () => {
    const result = eventBasicInfoSchema.safeParse({
      name: '  Event  ',
      date: Date.now(),
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('Event')
    }
  })
})

describe('eventDescriptionSchema', () => {
  it('validates empty description', () => {
    const result = eventDescriptionSchema.safeParse({ description: '' })
    expect(result.success).toBe(true)
  })

  it('validates undefined description', () => {
    const result = eventDescriptionSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('validates description with text', () => {
    const result = eventDescriptionSchema.safeParse({
      description: 'A wonderful event description',
    })
    expect(result.success).toBe(true)
  })
})

describe('eventBannerSchema', () => {
  it('validates empty banner image', () => {
    const result = eventBannerSchema.safeParse({ bannerImage: '' })
    expect(result.success).toBe(true)
  })

  it('validates undefined banner image', () => {
    const result = eventBannerSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('validates banner image URL', () => {
    const result = eventBannerSchema.safeParse({
      bannerImage: 'https://example.com/image.jpg',
    })
    expect(result.success).toBe(true)
  })
})

describe('eventFullSchema', () => {
  it('validates full event data', () => {
    const result = eventFullSchema.safeParse({
      name: 'Sunday Service',
      date: Date.now(),
      startTime: '09:00',
      endTime: '11:00',
      location: 'Main Sanctuary',
      description: 'Weekly worship service',
      bannerImage: 'https://example.com/banner.jpg',
    })
    expect(result.success).toBe(true)
  })

  it('validates full schema with minimal fields', () => {
    const result = eventFullSchema.safeParse({
      name: 'Event',
      date: Date.now(),
    })
    expect(result.success).toBe(true)
  })

  it('applies same validation as basic info in full schema', () => {
    const result = eventFullSchema.safeParse({
      name: 'A',
      date: Date.now(),
    })
    expect(result.success).toBe(false)
  })
})

describe('isValidImageUrl', () => {
  it('returns false for empty string', () => {
    expect(isValidImageUrl('')).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isValidImageUrl(undefined as any)).toBe(false)
  })

  it('returns true for https URL', () => {
    expect(isValidImageUrl('https://example.com/image.jpg')).toBe(true)
  })

  it('returns true for http URL', () => {
    expect(isValidImageUrl('http://example.com/image.jpg')).toBe(true)
  })

  it('returns true for data URL', () => {
    expect(isValidImageUrl('data:image/png;base64,abc123')).toBe(true)
  })

  it('returns true for blob URL', () => {
    expect(isValidImageUrl('blob:http://localhost:3000/image')).toBe(true)
  })

  it('returns false for invalid URL', () => {
    expect(isValidImageUrl('invalid-url')).toBe(false)
  })

  it('returns false for ftp URL', () => {
    expect(isValidImageUrl('ftp://example.com/image.jpg')).toBe(false)
  })
})
