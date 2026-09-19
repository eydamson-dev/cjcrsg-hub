import { describe, it, expect } from 'vitest'
import { convexTest } from 'convex-test'
import schema from '../../../../convex/schema.js'
import { setPassword, changePassword } from '../../../../convex/account.js'
import { Scrypt } from 'lucia'

const modules = import.meta.glob('../../../../convex/**/*.ts', { eager: true })

async function createUser(t: any, email: string) {
  return await t.run(async (ctx: any) => {
    return await ctx.db.insert('users', { email })
  })
}

function asUser(t: any, userId: string, email: string) {
  return t.withIdentity({
    subject: `${userId}|session-123`,
    email,
    name: 'Test User',
  })
}

describe('account mutations', () => {
  describe('setPassword', () => {
    it('adds a password account for an authenticated user', async () => {
      const t = convexTest(schema, modules)
      const userId = await createUser(t, 'user@example.com')
      const auth = asUser(t, userId, 'user@example.com')

      const result = await auth.mutation(setPassword, {
        password: 'password123',
      })

      expect(result).toEqual({ success: true })

      const account = await t.run(async (ctx: any) => {
        return await ctx.db
          .query('authAccounts')
          .withIndex('providerAndAccountId', (q: any) =>
            q
              .eq('provider', 'password')
              .eq('providerAccountId', 'user@example.com'),
          )
          .unique()
      })

      expect(account).not.toBeNull()
      expect(account.userId).toBe(userId)
      expect(account.provider).toBe('password')
      expect(account.providerAccountId).toBe('user@example.com')
      // Secret must be a hashed value, not the plaintext password
      expect(account.secret).toBeDefined()
      expect(account.secret).not.toBe('password123')

      const isValid = await new Scrypt().verify(
        account.secret ?? '',
        'password123',
      )
      expect(isValid).toBe(true)
    })

    it('rejects passwords shorter than 8 characters', async () => {
      const t = convexTest(schema, modules)
      const userId = await createUser(t, 'user@example.com')
      const auth = asUser(t, userId, 'user@example.com')

      await expect(
        auth.mutation(setPassword, { password: 'short' }),
      ).rejects.toThrow('at least 8 characters')
    })

    it('rejects when a password is already set', async () => {
      const t = convexTest(schema, modules)
      const userId = await createUser(t, 'user@example.com')
      const auth = asUser(t, userId, 'user@example.com')

      await auth.mutation(setPassword, { password: 'password123' })

      await expect(
        auth.mutation(setPassword, { password: 'anotherpassword' }),
      ).rejects.toThrow('already set')
    })

    it('rejects unauthenticated requests', async () => {
      const t = convexTest(schema, modules)

      await expect(
        t.mutation(setPassword, { password: 'password123' }),
      ).rejects.toThrow('Not authenticated')
    })
  })

  describe('changePassword', () => {
    it('changes the password when the current password is correct', async () => {
      const t = convexTest(schema, modules)
      const userId = await createUser(t, 'user@example.com')
      const auth = asUser(t, userId, 'user@example.com')

      await auth.mutation(setPassword, { password: 'oldpassword' })

      const result = await auth.mutation(changePassword, {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword',
      })

      expect(result).toEqual({ success: true })

      const account = await t.run(async (ctx: any) => {
        return await ctx.db
          .query('authAccounts')
          .withIndex('providerAndAccountId', (q: any) =>
            q
              .eq('provider', 'password')
              .eq('providerAccountId', 'user@example.com'),
          )
          .unique()
      })

      const scrypt = new Scrypt()
      expect(await scrypt.verify(account?.secret ?? '', 'newpassword')).toBe(
        true,
      )
      expect(await scrypt.verify(account?.secret ?? '', 'oldpassword')).toBe(
        false,
      )
    })

    it('rejects an incorrect current password', async () => {
      const t = convexTest(schema, modules)
      const userId = await createUser(t, 'user@example.com')
      const auth = asUser(t, userId, 'user@example.com')

      await auth.mutation(setPassword, { password: 'oldpassword' })

      await expect(
        auth.mutation(changePassword, {
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword',
        }),
      ).rejects.toThrow('Current password is incorrect')
    })

    it('rejects when no password is set', async () => {
      const t = convexTest(schema, modules)
      const userId = await createUser(t, 'user@example.com')
      const auth = asUser(t, userId, 'user@example.com')

      await expect(
        auth.mutation(changePassword, {
          currentPassword: 'anything',
          newPassword: 'newpassword',
        }),
      ).rejects.toThrow('No password is set')
    })

    it('rejects new passwords shorter than 8 characters', async () => {
      const t = convexTest(schema, modules)
      const userId = await createUser(t, 'user@example.com')
      const auth = asUser(t, userId, 'user@example.com')

      await auth.mutation(setPassword, { password: 'oldpassword' })

      await expect(
        auth.mutation(changePassword, {
          currentPassword: 'oldpassword',
          newPassword: 'short',
        }),
      ).rejects.toThrow('at least 8 characters')
    })
  })
})
