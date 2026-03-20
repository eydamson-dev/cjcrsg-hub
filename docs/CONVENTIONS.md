# Code Conventions

Coding standards, naming conventions, and UI/UX guidelines for CJCRSG-Hub.

---

## File Naming

| Type       | Convention                  | Example               |
| ---------- | --------------------------- | --------------------- |
| Components | PascalCase                  | `AttendeeList.tsx`    |
| Hooks      | camelCase with `use` prefix | `useAttendees.ts`     |
| Routes     | kebab-case                  | `attendees.index.tsx` |
| Utils      | camelCase                   | `formatDate.ts`       |
| Types      | PascalCase                  | `AttendeeStatus.ts`   |
| Constants  | UPPER_SNAKE_CASE            | `API_BASE_URL.ts`     |

---

## TypeScript Conventions

### General Rules

- Use strict mode enabled (`strict: true` in tsconfig.json)
- Explicit return types for all functions
- Prefer `interface` over `type` for object shapes
- Use `type` for unions, intersections, and primitives

### Naming

```typescript
// Interfaces
interface IAttendee {
  id: string
  name: string
}

// Type aliases
type AttendeeStatus = 'member' | 'visitor' | 'inactive'
type EventType = 'sunday_service' | 'retreat' | 'custom'

// Enums (use const assertions instead)
const AttendeeStatus = {
  MEMBER: 'member',
  VISITOR: 'visitor',
  INACTIVE: 'inactive',
} as const
```

### Function Signatures

```typescript
// Named functions with explicit return types
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0)
}

// Arrow functions with explicit return types
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US')
}

// Async functions
async function fetchAttendee(id: string): Promise<Attendee | null> {
  // implementation
}
```

---

## Component Structure

### Template Pattern

```typescript
// 1. Imports
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useAttendee } from '@/features/attendees/hooks/useAttendee';

// 2. Types
interface AttendeeCardProps {
  attendeeId: string;
  onEdit?: (id: string) => void;
}

// 3. Component
export function AttendeeCard({ attendeeId, onEdit }: AttendeeCardProps) {
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Hooks
  const { data: attendee, isPending } = useAttendee(attendeeId);

  // Handlers
  const handleEdit = () => {
    onEdit?.(attendeeId);
  };

  const handleToggleDetails = () => {
    setShowDetails(prev => !prev);
  };

  // Render helpers
  if (isPending) {
    return <AttendeeCardSkeleton />;
  }

  if (!attendee) {
    return <NotFound message="Attendee not found" />;
  }

  // Return
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{attendee.name}</h3>
          <p className="text-sm text-muted-foreground">{attendee.email}</p>
        </div>
        <Button onClick={handleEdit} variant="outline">
          Edit
        </Button>
      </div>
    </Card>
  );
}
```

### Order of Declarations

1. Imports (React, external, internal, types)
2. Type definitions (interfaces, types)
3. Component function
4. State declarations
5. Hook calls
6. Derived state / memoized values
7. Event handlers
8. Render helpers (optional)
9. Return statement

---

## Import Order

```typescript
// 1. React imports
import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'

// 2. External libraries
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'

// 3. Internal components
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// 4. Internal hooks/utils
import { useAttendees } from '@/features/attendees/hooks/useAttendees'
import { formatDate } from '@/lib/utils'

// 5. Types
import type { Attendee } from '@/features/attendees/types'
```

---

## UI/UX Guidelines

### shadcn Components to Use

#### Layout

- `Card` - Container for content sections
- `Separator` - Visual dividers
- `Tabs` - Content organization
- `Sheet` - Mobile navigation, side panels

#### Forms

- `Form` - Form wrapper with validation
- `Input` - Text inputs
- `Label` - Form labels
- `Select` - Dropdowns
- `DatePicker` - Date selection
- `Textarea` - Multi-line text
- `Checkbox` - Boolean options
- `RadioGroup` - Single selection from multiple

#### Actions

- `Button` - Primary actions
- `Dialog` - Modal dialogs
- `DropdownMenu` - Context menus
- `AlertDialog` - Confirmation dialogs

#### Data Display

- `Table` - Data tables
- `Badge` - Status indicators
- `Avatar` - User images
- `Skeleton` - Loading states

#### Feedback

- `Toast` - Notifications
- `Progress` - Progress bars
- `Alert` - Warning/info messages

### Color Coding for Events

| Event Type     | Color        | Hex Code  |
| -------------- | ------------ | --------- |
| Sunday Service | Blue         | `#3b82f6` |
| Retreat        | Green        | `#22c55e` |
| Youth Events   | Purple       | `#8b5cf6` |
| Prayer Meeting | Orange       | `#f97316` |
| Custom types   | User-defined | -         |

### Responsive Breakpoints

```css
/* Mobile first approach */
/* Base styles (mobile) */
.class {
  padding: 1rem;
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .class {
    padding: 1.5rem;
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .class {
    padding: 2rem;
  }
}
```

**Usage with Tailwind:**

```html
<div class="p-4 md:p-6 lg:p-8">
  <!-- Responsive padding -->
</div>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  <!-- Responsive grid -->
</div>
```

### Form Validation

Use `react-hook-form` with `zod` resolver:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const attendeeSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  status: z.enum(['member', 'visitor', 'inactive']),
});

type AttendeeFormData = z.infer<typeof attendeeSchema>;

function AttendeeForm() {
  const form = useForm<AttendeeFormData>({
    resolver: zodResolver(attendeeSchema),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </Form>
  );
}
```

### Error Handling

```typescript
// API errors
function handleApiError(error: Error) {
  if (error.message.includes('not found')) {
    toast.error('Resource not found')
  } else if (error.message.includes('unauthorized')) {
    toast.error('Please sign in again')
    navigate('/login')
  } else {
    toast.error('Something went wrong. Please try again.')
    console.error(error)
  }
}

// Form errors
try {
  await createAttendee(data)
  toast.success('Attendee created successfully')
  navigate('/attendees')
} catch (error) {
  handleApiError(error)
}
```

### Loading States

```typescript
// Skeleton loading
function AttendeeListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Button loading
<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Saving...
    </>
  ) : (
    'Save'
  )}
</Button>
```

---

## Comments

### When to Comment

- Complex business logic
- Workarounds or hacks (explain why)
- Public API documentation
- TODO items (mark with `TODO:`)

### When NOT to Comment

- Self-explanatory code
- Obvious variable names
- What the code does (describe why, not what)

### Comment Format

```typescript
// Good: Explain why
// We batch updates to avoid triggering re-renders on every checkbox change
const handleBulkCheckIn = debounce((ids: string[]) => {
  checkInAttendees(ids)
}, 300)

// Bad: Explain what (obvious from code)
// This function adds two numbers
const add = (a: number, b: number) => a + b

// TODO: Add pagination when list exceeds 100 items
// FIXME: Handle edge case when user has no permissions
```

---

## Changelog Conventions

The project uses [Keep a Changelog](https://keepachangelog.com/) format.
See `CHANGELOG.md` in the project root for examples.

### Good vs Bad Examples

**Good:**

```markdown
### Added

- Add attendee search with real-time filtering and pagination
- Implement password reset via email verification
- Support Google and Facebook OAuth authentication
```

**Bad:**

```markdown
### Added

- Attendee search
- Password stuff
- OAuth
```

### Entry Categories (in order)

**Added:**

- New features, endpoints, components
- New dependencies with purpose
- New configuration options

**Changed:**

- Modifications to existing behavior
- UI/UX improvements
- Performance optimizations
- API changes (breaking or not)

**Fixed:**

- Bug fixes
- Error handling improvements
- Correct typos or mistakes

**Deprecated:**

- Features to be removed in next version
- Old APIs being phased out

**Removed:**

- Deleted features
- Removed dependencies
- Deprecated code cleanup

**Security:**

- Security vulnerability fixes
- Authentication/authorization improvements
- Data protection enhancements

### Writing Guidelines

- **Use imperative mood:** "Add feature" not "Added feature"
- **Be specific:** Include what and why when not obvious
- **Keep concise:** One clear sentence per entry
- **Group related changes:** Under the same category
- **Include context:** Reference issues/PRs when helpful: `(#123)`

### Breaking Changes

Mark with `[BREAKING]` prefix:

```markdown
### Changed

- [BREAKING] Rename `attendee.status` field to `attendee.membershipStatus`
```

### Work In Progress

Use `[WIP]` prefix for incomplete features:

```markdown
### Added

- [WIP] Event calendar integration (basic view only)
```

---

_Last Updated: 2026-03-20_
