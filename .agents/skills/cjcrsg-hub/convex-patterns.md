# Convex Backend Patterns

## Query Patterns

### Basic Query

```typescript
// convex/attendees/queries.ts
import { query } from './_generated/server'
import { v } from 'convex/values'

export const list = query({
  args: {
    count: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.query('attendees').order('desc').take(args.count)
  },
})
```

### Paginated Query

```typescript
import { paginationOptsValidator } from 'convex/server'

export const listPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('attendees')
      .order('desc')
      .paginate(args.paginationOpts)
  },
})
```

### Query with Filters

```typescript
export const listByStatus = query({
  args: {
    status: v.union(
      v.literal('member'),
      v.literal('visitor'),
      v.literal('inactive'),
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('attendees')
      .withIndex('by_status', (q) => q.eq('status', args.status))
      .order('desc')
      .collect()
  },
})
```

### Get by ID

```typescript
export const getById = query({
  args: {
    id: v.id('attendees'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})
```

### Search with Text

```typescript
export const search = query({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('attendees')
      .withSearchIndex('search_name', (q) => q.search('fullName', args.query))
      .take(50)
  },
})
```

### Related Data (Join)

```typescript
export const getEventWithAttendance = query({
  args: { eventId: v.id('events') },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId)
    if (!event) return null

    // Get attendance records
    const attendance = await ctx.db
      .query('attendance_records')
      .withIndex('by_event', (q) => q.eq('eventId', args.eventId))
      .collect()

    // Get attendee details (parallel fetch)
    const attendees = await Promise.all(
      attendance.map(async (record) => {
        const attendee = await ctx.db.get(record.attendeeId)
        return attendee ? { ...record, attendee } : null
      }),
    )

    return {
      event,
      attendees: attendees.filter(Boolean),
      count: attendance.length,
    }
  },
})
```

---

## Mutation Patterns

### Create

```typescript
import { mutation } from './_generated/server'

export const create = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    status: v.union(
      v.literal('member'),
      v.literal('visitor'),
      v.literal('inactive'),
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const id = await ctx.db.insert('attendees', {
      ...args,
      createdAt: now,
      updatedAt: now,
    })
    return id
  },
})
```

### Update

```typescript
export const update = mutation({
  args: {
    id: v.id('attendees'),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    status: v.optional(
      v.union(v.literal('member'), v.literal('visitor'), v.literal('inactive')),
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    })
  },
})
```

### Soft Delete

```typescript
export const archive = mutation({
  args: { id: v.id('attendees') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: 'inactive',
      updatedAt: Date.now(),
    })
  },
})
```

### Check-in Attendee

```typescript
export const checkIn = mutation({
  args: {
    eventId: v.id('events'),
    attendeeId: v.id('attendees'),
  },
  handler: async (ctx, args) => {
    // Get current user
    const userId = await ctx.auth.getUserId()
    if (!userId) throw new Error('Not authenticated')

    // Check if already checked in
    const existing = await ctx.db
      .query('attendance_records')
      .withIndex('by_event_attendee', (q) =>
        q.eq('eventId', args.eventId).eq('attendeeId', args.attendeeId),
      )
      .first()

    if (existing) {
      throw new Error('Already checked in')
    }

    // Create attendance record
    const id = await ctx.db.insert('attendance_records', {
      ...args,
      checkedInAt: Date.now(),
      checkedInBy: userId,
    })

    return id
  },
})
```

### Bulk Check-in

```typescript
export const bulkCheckIn = mutation({
  args: {
    eventId: v.id('events'),
    attendeeIds: v.array(v.id('attendees')),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserId()
    if (!userId) throw new Error('Not authenticated')

    const now = Date.now()
    const results = []

    for (const attendeeId of args.attendeeIds) {
      // Check if already checked in
      const existing = await ctx.db
        .query('attendance_records')
        .withIndex('by_event_attendee', (q) =>
          q.eq('eventId', args.eventId).eq('attendeeId', attendeeId),
        )
        .first()

      if (!existing) {
        const id = await ctx.db.insert('attendance_records', {
          eventId: args.eventId,
          attendeeId,
          checkedInAt: now,
          checkedInBy: userId,
        })
        results.push({ attendeeId, id, status: 'checked_in' })
      } else {
        results.push({ attendeeId, status: 'already_checked_in' })
      }
    }

    return results
  },
})
```

---

## Authentication Patterns

### Check Authentication

```typescript
export const getSecretData = query({
  args: {},
  handler: async (ctx) => {
    const userId = await ctx.auth.getUserId()
    if (!userId) {
      throw new Error('Not authenticated')
    }
    // ... fetch and return data
  },
})
```

### Get Current User

```typescript
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await ctx.auth.getUserId()
    if (!userId) return null
    return await ctx.db.get(userId)
  },
})
```

### Frontend Auth Check

```typescript
import { useAuth } from '@convex-dev/auth/react';

function ProtectedComponent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <Loading />;
  if (!isAuthenticated) return <Redirect to="/login" />;

  return <ProtectedContent />;
}
```

### Protected Query from Frontend

```typescript
const { data, error } = useQuery(
  isAuthenticated ? convexQuery(api.attendees.list, { count: 10 }) : 'skip',
)
```

---

## Schema Patterns

### Table with Indexes

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  attendees: defineTable({
    firstName: v.string(),
    lastName: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    status: v.union(
      v.literal('member'),
      v.literal('visitor'),
      v.literal('inactive'),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_status', ['status'])
    .index('by_email', ['email'])
    .index('by_phone', ['phone'])
    .searchIndex('search_name', {
      searchField: 'fullName',
      filterFields: ['status'],
    }),
})
```

### Composite Index

```typescript
events: defineTable({
  name: v.string(),
  eventTypeId: v.id('event_types'),
  date: v.number(),
  isActive: v.boolean(),
})
  .index('by_active_date', ['isActive', 'date'])
  .index('by_event_type', ['eventTypeId'])
```

### Foreign Key Pattern

```typescript
attendance_records: defineTable({
  eventId: v.id('events'),
  attendeeId: v.id('attendees'),
  checkedInAt: v.number(),
  checkedInBy: v.id('users'),
})
  .index('by_event', ['eventId', 'checkedInAt'])
  .index('by_attendee', ['attendeeId', 'checkedInAt'])
  .index('by_event_attendee', ['eventId', 'attendeeId'])
```

---

## Real-time Patterns

### Live Updates (Automatic)

Convex queries are subscriptions. When data changes, UI updates automatically:

```typescript
// Frontend
const { data: attendees } = useQuery(
  convexQuery(api.attendees.list, { count: 10 }),
)

// When any attendee is added/modified/deleted,
// the component re-renders with new data automatically
```

### Optimistic Updates

```typescript
const queryClient = useQueryClient()

const checkIn = useMutation(api.attendance.checkIn, {
  onMutate: async (newAttendance) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(['attendance'])

    // Snapshot previous value
    const previousAttendance = queryClient.getQueryData(['attendance'])

    // Optimistically update
    queryClient.setQueryData(['attendance'], (old) => [...old, newAttendance])

    return { previousAttendance }
  },
  onError: (err, newAttendance, context) => {
    // Rollback on error
    queryClient.setQueryData(['attendance'], context.previousAttendance)
  },
  onSettled: () => {
    // Always refetch after error or success
    queryClient.invalidateQueries(['attendance'])
  },
})
```

---

## Error Handling

### Convex Errors

```typescript
export const createAttendee = mutation({
  args: { email: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // Check for duplicate email
    if (args.email) {
      const existing = await ctx.db
        .query('attendees')
        .withIndex('by_email', (q) => q.eq('email', args.email))
        .first()

      if (existing) {
        throw new Error('Email already exists')
      }
    }

    // ... create attendee
  },
})
```

### Frontend Error Handling

```typescript
try {
  await createAttendee(data)
  toast.success('Attendee created')
} catch (error) {
  if (error.message.includes('already exists')) {
    toast.error('Email already in use')
  } else {
    toast.error('Failed to create attendee')
  }
}
```

---

## Best Practices

1. **Always use indexes** for filtered queries (performance)
2. **Use `paginate`** for large lists (not `collect`)
3. **Set timestamps** on all mutations (createdAt, updatedAt)
4. **Soft delete** with status flags (don't hard delete)
5. **Validate inputs** with Convex validators
6. **Check auth** in mutations that modify data
7. **Handle errors** gracefully (user-friendly messages)
8. **Use transactions** when modifying multiple documents
9. **Avoid N+1 queries** - batch fetches with `Promise.all`
10. **Test in Convex dashboard** - use the query runner

---

_Last Updated: 2026-03-20_
