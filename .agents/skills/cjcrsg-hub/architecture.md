# Architecture Guide

## Feature-Based Folder Structure

We organize code by **feature** not by file type. This makes it easier to:

- Add/remove features
- Understand what files are related
- Navigate the codebase
- Scale the project

## Frontend Structure (src/)

```
src/
├── features/                    # All features organized here
│   ├── attendees/              # Attendee management feature
│   │   ├── components/         # React components
│   │   │   ├── AttendeeList.tsx
│   │   │   ├── AttendeeForm.tsx
│   │   │   └── AttendeeCard.tsx
│   │   ├── hooks/             # Feature-specific hooks
│   │   │   ├── useAttendees.ts
│   │   │   └── useAttendeeMutations.ts
│   │   ├── types.ts           # TypeScript types
│   │   └── routes/            # Route files (TanStack Router)
│   │       ├── attendees.index.tsx
│   │       ├── attendees.new.tsx
│   │       └── attendees.$id.tsx
│   ├── events/                 # Event management
│   ├── attendance/             # Attendance tracking
│   └── auth/                   # Authentication
├── components/                 # Shared UI components
│   ├── layout/                # Layout components
│   │   ├── Layout.tsx
│   │   ├── Sidebar.tsx
│   │   └── MobileNav.tsx
│   ├── ui/                    # shadcn/ui components
│   └── auth/                  # Auth components
├── lib/                       # Utilities
│   ├── utils.ts               # General utilities
│   └── auth.ts                # Auth helpers
├── hooks/                     # Shared hooks
├── types/                     # Shared types
└── routes/                    # Route definitions
    ├── __root.tsx            # Root route with layout
    └── index.tsx             # Home/dashboard
```

## Backend Structure (convex/)

```
convex/
├── schema.ts                  # Database schema
├── auth.config.ts            # Convex Auth configuration
├── attendees/                # Attendee feature
│   ├── queries.ts           # Read operations
│   ├── mutations.ts         # Write operations
│   └── validators.ts        # Shared validators
├── events/                   # Event feature
│   ├── queries.ts
│   ├── mutations.ts
│   └── validators.ts
├── attendance/               # Attendance feature
│   ├── queries.ts
│   ├── mutations.ts
│   └── validators.ts
└── eventTypes/               # Event types (admin)
    ├── queries.ts
    └── mutations.ts
```

## Key Principles

### 1. Co-location

Keep related files together:

```
attendees/
├── components/     # UI for this feature
├── hooks/         # Logic for this feature
├── types.ts       # Types for this feature
└── routes/        # Routes for this feature
```

### 2. Shared Components

Only put components in `/components` if used by **multiple** features.

Good:

- `components/layout/Layout.tsx` - Used by all pages
- `components/ui/button.tsx` - shadcn component used everywhere

Bad:

- `components/AttendeeCard.tsx` - Only used by attendees feature
  → Should be in `features/attendees/components/`

### 3. Route Organization

TanStack Router uses file-based routing:

| File                            | Route                 |
| ------------------------------- | --------------------- |
| `routes/index.tsx`              | `/`                   |
| `routes/attendees.index.tsx`    | `/attendees`          |
| `routes/attendees.new.tsx`      | `/attendees/new`      |
| `routes/attendees.$id.tsx`      | `/attendees/:id`      |
| `routes/attendees.$id.edit.tsx` | `/attendees/:id/edit` |

### 4. Convex Organization

Separate queries, mutations, and validators:

```typescript
// queries.ts - Read operations
export const list = query({...});
export const getById = query({...});

// mutations.ts - Write operations
export const create = mutation({...});
export const update = mutation({...});

// validators.ts - Shared validation
export const attendeeFields = {...};
```

### 5. Naming Conventions

**Frontend:**

- Components: `PascalCase.tsx` (e.g., `AttendeeList.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useAttendees.ts`)
- Routes: `kebab-case.tsx` (e.g., `attendees.index.tsx`)
- Utils: `camelCase.ts` (e.g., `formatDate.ts`)

**Backend:**

- Queries: Descriptive names (e.g., `list`, `getById`, `search`)
- Mutations: Action names (e.g., `create`, `update`, `archive`)
- Validators: Reusable field definitions

### 6. Import Order

Always import in this order:

1. React imports
2. External libraries
3. Internal components
4. Internal hooks/utils
5. Types

Example:

```typescript
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { useAttendees } from '@/features/attendees/hooks/useAttendees'
import type { Attendee } from '@/features/attendees/types'
```

## Component Architecture

### Smart vs Presentational

**Smart Components (Containers):**

- Connect to data (Convex queries)
- Handle business logic
- Pass data down to presentational

**Presentational Components:**

- Receive data via props
- Handle UI logic only
- Reusable and testable

Example:

```typescript
// Smart: AttendeeList.tsx (in features/attendees/components/)
export function AttendeeList() {
  const { data: attendees } = useQuery(...);
  return <AttendeeTable attendees={attendees} />;
}

// Presentational: AttendeeTable.tsx (could be in components/)
export function AttendeeTable({ attendees }: Props) {
  return <table>...</table>;
}
```

## State Management

### Server State (Convex)

- Use TanStack Query for all Convex operations
- Convex queries are subscriptions (real-time updates)
- Cache managed automatically by TanStack Query

### Client State (React)

- Use `useState` for local component state
- Use `useContext` for feature-level shared state (rarely needed)
- Avoid global state management (Redux, Zustand, etc.)

### Form State

- Use `react-hook-form` with `zod` validation
- Keep form state local to form component
- Submit via Convex mutations

## Routing Strategy

### Protected Routes

All admin routes are protected:

- Check auth in route loader or component
- Redirect to `/login` if not authenticated
- Use `ConvexAuthProvider` for auth context

### Layout Routes

- `__root.tsx` - Root layout with navigation
- `_layout.tsx` - Feature layout (if needed)
- Layouts wrap child routes automatically

## Best Practices

1. **Keep components clean** - Move complex logic to hooks
2. **Use TypeScript strictly** - No `any` types
3. **Validate at boundaries** - Zod for forms, Convex validators for DB
4. **Handle errors gracefully** - Toast notifications for user feedback
5. **Loading states matter** - Skeletons for better UX
6. **Test on mobile** - Church check-in is mobile-first
7. **Follow existing patterns** - Look at completed features for examples

---

_Last Updated: 2026-03-20_
