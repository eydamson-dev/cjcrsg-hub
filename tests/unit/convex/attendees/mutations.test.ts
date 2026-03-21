import { describe, it, expect } from 'vitest'
import { convexTest } from 'convex-test'
import schema from '../../../../convex/schema.js'
import {
  create,
  update,
  archive,
} from '../../../../convex/attendees/mutations.js'
import { getById } from '../../../../convex/attendees/queries.js'

// Create a mock modules object that convex-test expects
const modules = import.meta.glob('../../../../convex/**/*.ts', { eager: true })

describe('attendees mutations', () => {
  describe('create', () => {
    it('creates attendee with valid data', async () => {
      const t = convexTest(schema, modules)

      const id = await t.mutation(create, {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        status: 'visitor',
        address: '',
      })

      expect(id).toBeDefined()
      expect(typeof id).toBe('string')

      // Verify the attendee was created
      const attendee = await t.query(getById, { id })
      expect(attendee).toBeDefined()
      expect(attendee?.firstName).toBe('John')
      expect(attendee?.lastName).toBe('Doe')
      expect(attendee?.email).toBe('john@test.com')
      expect(attendee?.status).toBe('visitor')
    })

    it('creates attendee with minimal fields', async () => {
      const t = convexTest(schema, modules)

      const id = await t.mutation(create, {
        firstName: 'Jane',
        lastName: 'Smith',
        status: 'member',
        address: '',
      })

      expect(id).toBeDefined()

      const attendee = await t.query(getById, { id })
      expect(attendee?.firstName).toBe('Jane')
      expect(attendee?.lastName).toBe('Smith')
      expect(attendee?.email).toBeUndefined()
      expect(attendee?.status).toBe('member')
    })

    it('creates attendee with all fields', async () => {
      const t = convexTest(schema, modules)
      const now = Date.now()

      const id = await t.mutation(create, {
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob@example.com',
        phone: '+1234567890',
        address: '123 Main St',
        status: 'member',
        joinDate: now,
        notes: 'Test notes',
      })

      const attendee = await t.query(getById, { id })
      expect(attendee?.firstName).toBe('Bob')
      expect(attendee?.lastName).toBe('Johnson')
      expect(attendee?.email).toBe('bob@example.com')
      expect(attendee?.phone).toBe('+1234567890')
      expect(attendee?.address).toBe('123 Main St')
      expect(attendee?.status).toBe('member')
      expect(attendee?.joinDate).toBe(now)
      expect(attendee?.notes).toBe('Test notes')
    })
  })

  describe('update', () => {
    it('updates attendee first name', async () => {
      const t = convexTest(schema, modules)

      const id = await t.mutation(create, {
        firstName: 'John',
        lastName: 'Doe',
        status: 'visitor',
        address: '',
      })

      await t.mutation(update, {
        id,
        firstName: 'Jane',
      })

      const attendee = await t.query(getById, { id })
      expect(attendee?.firstName).toBe('Jane')
      expect(attendee?.lastName).toBe('Doe')
    })

    it('throws error when updating non-existent attendee', async () => {
      const t = convexTest(schema, modules)

      await expect(
        t.mutation(update, {
          id: 'attendees:nonexistent123' as any,
          firstName: 'Test',
        }),
      ).rejects.toThrow('Attendee not found')
    })
  })

  describe('archive', () => {
    it('archives attendee by setting status to inactive', async () => {
      const t = convexTest(schema, modules)

      const id = await t.mutation(create, {
        firstName: 'John',
        lastName: 'Doe',
        status: 'member',
        address: '',
      })

      await t.mutation(archive, { id })

      const attendee = await t.query(getById, { id })
      expect(attendee?.status).toBe('inactive')
    })

    it('preserves all other fields when archiving', async () => {
      const t = convexTest(schema, modules)

      const id = await t.mutation(create, {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        phone: '+1234567890',
        status: 'member',
        address: '',
      })

      await t.mutation(archive, { id })

      const attendee = await t.query(getById, { id })
      expect(attendee?.firstName).toBe('John')
      expect(attendee?.lastName).toBe('Doe')
      expect(attendee?.email).toBe('john@test.com')
      expect(attendee?.phone).toBe('+1234567890')
    })
  })
})
