import { describe, it, expect } from 'vitest'
import { convexTest } from 'convex-test'
import schema from '../../../../convex/schema.js'
import {
  list,
  getById,
  searchLegacy,
  count,
} from '../../../../convex/attendees/queries.js'
import { create } from '../../../../convex/attendees/mutations.js'

// Create a mock modules object that convex-test expects
const modules = import.meta.glob('../../../../convex/**/*.ts', { eager: true })

describe('attendees queries', () => {
  describe('list', () => {
    it('returns paginated results', async () => {
      const t = convexTest(schema, modules)

      // Create 5 attendees
      const ids: string[] = []
      for (let i = 0; i < 5; i++) {
        const id = await t.mutation(create, {
          firstName: `User${i}`,
          lastName: 'Test',
          status: 'visitor',
          address: '',
        })
        ids.push(id)
      }

      const result = await t.query(list, {
        paginationOpts: { numItems: 2, cursor: null },
      })

      expect(result.page).toHaveLength(2)
      expect(result.isDone).toBe(false)
      expect(result.continueCursor).toBeDefined()
    })

    it('filters by status', async () => {
      const t = convexTest(schema, modules)

      // Create members and visitors
      await t.mutation(create, {
        firstName: 'Member1',
        lastName: 'Test',
        status: 'member',
        address: '',
      })

      await t.mutation(create, {
        firstName: 'Visitor1',
        lastName: 'Test',
        status: 'visitor',
        address: '',
      })

      await t.mutation(create, {
        firstName: 'Member2',
        lastName: 'Test',
        status: 'member',
        address: '',
      })

      const result = await t.query(list, {
        paginationOpts: { numItems: 10, cursor: null },
        status: 'member',
      })

      expect(result.page).toHaveLength(2)
      expect(result.page.every((a) => a.status === 'member')).toBe(true)
    })

    it('orders by creation date descending', async () => {
      const t = convexTest(schema, modules)

      const id1 = await t.mutation(create, {
        firstName: 'First',
        lastName: 'Test',
        status: 'visitor',
        address: '',
      })

      // Small delay to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10))

      const id2 = await t.mutation(create, {
        firstName: 'Second',
        lastName: 'Test',
        status: 'visitor',
        address: '',
      })

      const result = await t.query(list, {
        paginationOpts: { numItems: 10, cursor: null },
      })

      // Most recent should be first
      expect(result.page[0]._id).toBe(id2)
      expect(result.page[1]._id).toBe(id1)
    })
  })

  describe('getById', () => {
    it('returns attendee by id', async () => {
      const t = convexTest(schema, modules)

      const id = await t.mutation(create, {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        status: 'visitor',
        address: '',
      })

      const attendee = await t.query(getById, { id })

      expect(attendee).toBeDefined()
      expect(attendee?.firstName).toBe('John')
      expect(attendee?.lastName).toBe('Doe')
      expect(attendee?.email).toBe('john@test.com')
    })

    it('returns null for non-existent id', async () => {
      const t = convexTest(schema, modules)

      const attendee = await t.query(getById, {
        id: 'attendees:nonexistent123' as any,
      })

      expect(attendee).toBeNull()
    })
  })

  describe('searchLegacy', () => {
    it('finds attendees by first name', async () => {
      const t = convexTest(schema, modules)

      await t.mutation(create, {
        firstName: 'Johnathan',
        lastName: 'Doe',
        status: 'visitor',
        address: '',
      })

      await t.mutation(create, {
        firstName: 'Jane',
        lastName: 'Smith',
        status: 'visitor',
        address: '',
      })

      const results = await t.query(searchLegacy, { query: 'john' })

      expect(results).toHaveLength(1)
      expect(results[0].firstName).toBe('Johnathan')
    })

    it('finds attendees by last name', async () => {
      const t = convexTest(schema, modules)

      await t.mutation(create, {
        firstName: 'John',
        lastName: 'Smithson',
        status: 'visitor',
        address: '',
      })

      await t.mutation(create, {
        firstName: 'Jane',
        lastName: 'Doe',
        status: 'visitor',
        address: '',
      })

      const results = await t.query(searchLegacy, { query: 'smith' })

      expect(results).toHaveLength(1)
      expect(results[0].lastName).toBe('Smithson')
    })

    it('finds attendees by email', async () => {
      const t = convexTest(schema, modules)

      await t.mutation(create, {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        status: 'visitor',
        address: '',
      })

      await t.mutation(create, {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@test.com',
        status: 'visitor',
        address: '',
      })

      const results = await t.query(searchLegacy, { query: 'example.com' })

      expect(results).toHaveLength(1)
      expect(results[0].email).toBe('john.doe@example.com')
    })

    it('filters search results by status', async () => {
      const t = convexTest(schema, modules)

      await t.mutation(create, {
        firstName: 'John',
        lastName: 'Doe',
        status: 'member',
        address: '',
      })

      await t.mutation(create, {
        firstName: 'John',
        lastName: 'Smith',
        status: 'visitor',
        address: '',
      })

      const results = await t.query(searchLegacy, {
        query: 'john',
        status: 'member',
      })

      expect(results).toHaveLength(1)
      expect(results[0].status).toBe('member')
      expect(results[0].lastName).toBe('Doe')
    })

    it('returns empty array when no matches found', async () => {
      const t = convexTest(schema, modules)

      await t.mutation(create, {
        firstName: 'John',
        lastName: 'Doe',
        status: 'visitor',
        address: '',
      })

      const results = await t.query(searchLegacy, {
        query: 'xyz123nonexistent',
      })

      expect(results).toHaveLength(0)
    })

    it('is case insensitive', async () => {
      const t = convexTest(schema, modules)

      await t.mutation(create, {
        firstName: 'John',
        lastName: 'Doe',
        status: 'visitor',
        address: '',
      })

      const resultsLower = await t.query(searchLegacy, { query: 'john' })
      const resultsUpper = await t.query(searchLegacy, { query: 'JOHN' })
      const resultsMixed = await t.query(searchLegacy, { query: 'JoHn' })

      expect(resultsLower).toHaveLength(1)
      expect(resultsUpper).toHaveLength(1)
      expect(resultsMixed).toHaveLength(1)
    })

    it('limits results to 50', async () => {
      const t = convexTest(schema, modules)

      // Create 60 attendees with similar names
      for (let i = 0; i < 60; i++) {
        await t.mutation(create, {
          firstName: `TestUser${i}`,
          lastName: 'CommonLastName',
          status: 'visitor',
          address: '',
        })
      }

      const results = await t.query(searchLegacy, { query: 'common' })

      expect(results.length).toBeLessThanOrEqual(50)
    })
  })

  describe('count', () => {
    it('returns total count of all attendees', async () => {
      const t = convexTest(schema, modules)

      // Create attendees
      await t.mutation(create, {
        firstName: 'User1',
        lastName: 'Test',
        status: 'visitor',
        address: '',
      })

      await t.mutation(create, {
        firstName: 'User2',
        lastName: 'Test',
        status: 'member',
        address: '',
      })

      const totalCount = await t.query(count, {})

      expect(totalCount).toBe(2)
    })

    it('returns count filtered by status', async () => {
      const t = convexTest(schema, modules)

      // Create members and visitors
      await t.mutation(create, {
        firstName: 'Member1',
        lastName: 'Test',
        status: 'member',
        address: '',
      })

      await t.mutation(create, {
        firstName: 'Visitor1',
        lastName: 'Test',
        status: 'visitor',
        address: '',
      })

      await t.mutation(create, {
        firstName: 'Member2',
        lastName: 'Test',
        status: 'member',
        address: '',
      })

      const memberCount = await t.query(count, { status: 'member' })
      const visitorCount = await t.query(count, { status: 'visitor' })

      expect(memberCount).toBe(2)
      expect(visitorCount).toBe(1)
    })

    it('returns 0 when no attendees exist', async () => {
      const t = convexTest(schema, modules)

      const totalCount = await t.query(count, {})
      const memberCount = await t.query(count, { status: 'member' })

      expect(totalCount).toBe(0)
      expect(memberCount).toBe(0)
    })
  })
})
