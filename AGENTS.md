# CJCRSG-Hub: Church Management System

## Project Overview

A full-stack church management system built with TanStack Start + Convex + shadcn/ui for managing church attendees, events, and attendance tracking.

**Tech Stack:**

- **Frontend:** TanStack Start (React), shadcn/ui, Tailwind CSS v4
- **Backend:** Convex (database + server functions)
- **Auth:** Convex Better Auth
- **State Management:** TanStack Query + Convex React Query

**Development Strategy:**

We will start development using **Convex local development mode** (no account required initially). This allows rapid prototyping without cloud deployment. Once features are stable, we will migrate to a Convex cloud deployment for production use.

```bash
# Start with local development
pnpm dlx convex dev

# Later, deploy to production
pnpm dlx convex deploy
```

---

## Architecture Decisions

### Frontend Structure (Feature-Based)

```
src/
├── features/                    # Feature-based organization
│   ├── attendees/              # Attendee management module
│   │   ├── components/         # UI components
│   │   ├── hooks/             # Feature-specific hooks
│   │   ├── types.ts           # TypeScript types
│   │   └── routes/            # Route files
│   ├── events/                 # Event management module
│   ├── attendance/             # Attendance tracking module
│   └── auth/                   # Authentication module
├── components/                 # Shared UI components
├── lib/                       # Utilities & helpers
├── hooks/                     # Shared hooks
└── utils/                     # Utility functions
```

### Backend Structure (Convex)

```
convex/
├── schema.ts                  # Main database schema
├── auth.config.ts            # Convex Auth configuration
├── attendees/
│   ├── queries.ts           # Read operations
│   ├── mutations.ts         # Write operations
│   └── validators.ts        # Shared validators
├── events/
│   ├── queries.ts
│   ├── mutations.ts
│   └── validators.ts
├── attendance/
│   ├── queries.ts
│   ├── mutations.ts
│   └── validators.ts
└── eventTypes/
    ├── queries.ts
    └── mutations.ts
```

---

## Database Schema

### Core Tables

#### attendees

```typescript
{
  _id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  dateOfBirth?: number        // timestamp
  address?: string
  status: 'member' | 'visitor' | 'inactive'
  joinDate?: number          // When they joined the church
  notes?: string
  createdAt: number
  updatedAt: number
}
```

#### event_types (Dynamic)

```typescript
{
  _id: string
  name: string               // "Sunday Service", "Retreat", etc.
  description?: string
  color?: string             // UI theming (hex color)
  isActive: boolean
  createdAt: number
}
```

#### events

```typescript
{
  _id: string
  name: string
  eventTypeId: string        // Reference to event_types
  description?: string
  date: number              // Event date (timestamp)
  startTime?: string        // "09:00" format
  endTime?: string          // "11:00" format
  location?: string
  isActive: boolean
  createdAt: number
}
```

#### attendance_records

```typescript
{
  _id: string
  eventId: string
  attendeeId: string
  checkedInAt: number        // When they were marked present
  checkedInBy: string       // Admin user ID
  notes?: string
}
```

---

## Implementation Roadmap

### ✅ Completed Setup

- [x] Initialize git repository
- [x] Setup GitHub remote (git@github.com:eydamson-dev/cjcrsg-hub.git)
- [x] Configure .gitignore
- [x] Create comprehensive AGENTS.md documentation
- [x] Create README.md with project overview

### Phase 1: Foundation Setup

- [ ] Initialize shadcn/ui with canary version
- [ ] Setup Convex Better Auth
- [ ] Configure environment variables
- [ ] Create base layout with navigation
- [ ] Setup protected routes

**Commands:**

```bash
# Initialize shadcn/ui (requires canary for TanStack Start)
pnpm dlx shadcn@canary init

# Install auth dependencies
pnpm add @convex-dev/better-auth better-auth

# Add base components
pnpm dlx shadcn@canary add button card input form dialog table badge
pnpm dlx shadcn@canary add select date-picker tabs toast command
```

### Phase 2: Database Schema & Auth

- [ ] Create schema.ts with all tables
- [ ] Configure convex/auth.config.ts
- [ ] Setup auth routes at src/routes/api/auth/$.ts
- [ ] Create login/signup pages
- [ ] Test authentication flow

### Phase 3: Attendee Management

- [ ] Create attendee queries (list, get, search)
- [ ] Create attendee mutations (create, update)
- [ ] Build AttendeeList component with data table
- [ ] Build AttendeeForm component
- [ ] Create routes: /attendees, /attendees/new, /attendees/$id
- [ ] Add search functionality

### Phase 4: Event Types (Admin)

- [ ] Create event type queries
- [ ] Create event type mutations
- [ ] Build EventTypeList component
- [ ] Build EventTypeForm component
- [ ] Create settings page for admin

### Phase 5: Event Management

- [ ] Create event queries
- [ ] Create event mutations
- [ ] Build EventList component
- [ ] Build EventForm component
- [ ] Create routes: /events, /events/new, /events/$id
- [ ] Add event filtering by type

### Phase 6: Attendance Tracking

- [ ] Create attendance queries
- [ ] Create attendance mutations
- [ ] Build AttendanceRecorder component
- [ ] Build AttendeeSelector (search & select)
- [ ] Build EventAttendanceList (real-time view)
- [ ] Create routes: /attendance, /attendance/$eventId
- [ ] Implement quick check-in flow

### Phase 7: Dashboard & Polish

- [ ] Create dashboard with stats
- [ ] Add recent attendance widget
- [ ] Add upcoming events widget
- [ ] Implement toast notifications
- [ ] Add loading states
- [ ] Responsive design pass

---

## Development Workflow

### Environment Setup

```bash
# Required environment variables
CONVEX_DEPLOYMENT=          # From convex dashboard
VITE_CONVEX_URL=            # Convex deployment URL
BETTER_AUTH_SECRET=         # Random secret string
BETTER_AUTH_URL=            # http://localhost:3000 (dev)
```

### Development Commands

```bash
# Start development server (runs both Vite + Convex)
pnpm dev

# Build for production
pnpm build

# Type check
pnpm dev:ts

# Format code
pnpm format

# Lint
pnpm lint
```

**Note:** We use `pnpm` instead of `npm` for faster, more efficient package management.

### Convex Commands

```bash
# Start convex dev server (local development mode)
pnpm dlx convex dev

# Deploy to production (cloud)
pnpm dlx convex deploy

# Open convex dashboard (local or cloud)
pnpm dlx convex dashboard

# Run specific query for testing
pnpm dlx convex run attendees/list

# View logs
pnpm dlx convex logs
```

**Deployment Strategy:**

1. **Phase 1-3 (Development):** Use `pnpm dlx convex dev` for local development
   - No account required initially
   - Data stored locally
   - Perfect for rapid iteration

2. **Phase 4+ (Production):** Deploy to Convex cloud
   - Run `pnpm dlx convex deploy`
   - Update VITE_CONVEX_URL in production
   - BETTER_AUTH_SECRET must be set for production

3. **Migration Path:**
   - Local data can be exported and imported to cloud later
   - Schema changes automatically sync when deploying
   - Auth configuration will need production domain updates

---

## Testing Strategy

### Manual Testing Checklist

- [ ] Authentication flow (login, logout, signup)
- [ ] Create, read, update attendees
- [ ] Search attendees by name/email/phone
- [ ] Create, read, update event types
- [ ] Create, read, update events
- [ ] Record attendance for event
- [ ] View attendance list in real-time
- [ ] Test responsive design on mobile
- [ ] Test dark mode (if implemented)

### Test Tools

- **Browser DevTools**: Network tab for Convex queries
- **Convex Dashboard**: Inspect data, test queries
- **React DevTools**: Component debugging
- **TanStack Query DevTools**: Cache inspection

---

## Git Workflow

### Remote Repository

**GitHub URL:** `git@github.com:eydamson-dev/cjcrsg-hub.git`

**Initial Setup:**

```bash
# Add remote (if not already configured)
git remote add origin git@github.com:eydamson-dev/cjcrsg-hub.git

# Verify remote
git remote -v

# First push (set upstream)
git push -u origin main
```

**Note:** We use native git CLI commands, not gh CLI.

### Branch Strategy

```
main                    # Production-ready code
├── develop            # Integration branch
│   ├── feature/attendees
│   ├── feature/events
│   ├── feature/attendance
│   └── feature/auth
└── hotfix/...         # Production fixes
```

### Commit Message Convention

```
feat: add attendee search functionality
fix: resolve event date parsing issue
docs: update API documentation
style: format attendance list component
refactor: simplify attendance queries
test: add attendee validation tests
chore: update dependencies
```

### Pre-Commit Checklist

- [ ] Run `pnpm lint` - no errors
- [ ] Run type check - no TypeScript errors
- [ ] Test the feature manually
- [ ] Update AGENTS.md if needed
- [ ] Clear console.log statements

### Development Workflow (Read-Only Mode)

**Important:** I will NOT automatically commit or push changes. Follow this workflow:

1. **Task Assignment**: I create a feature branch for each task

   ```bash
   git checkout -b feature/descriptive-name
   ```

2. **Implementation**: I make all code changes on the branch

3. **Review & Test**: You test the changes locally
   - Run `pnpm dev` to test
   - Review the code changes
   - Verify everything works as expected

4. **Approval**: Only after your confirmation ("looks good", "approved", etc.)
   - I will stage and commit the changes
   - Create a commit with conventional message format

   ```bash
   git add .
   git commit -m "feat: descriptive message"
   ```

5. **Pull Request**: I push the branch and create a PR

   ```bash
   git push -u origin feature/descriptive-name
   ```

6. **Merge**: You manually review and approve the PR on GitHub
   - Go to GitHub repository
   - Review the PR
   - Click "Merge" when satisfied

7. **Cleanup**: After merge, switch back to main
   ```bash
   git checkout main
   git pull origin main
   ```

**Note:** I will always ask for confirmation before committing. No changes will be committed without your explicit approval.

---

## MCPs & Tools

### Required MCPs

- **Git MCP**: For version control operations
- **File System MCP**: For file operations
- **Web Search MCP**: For documentation lookups
- **Browser MCP**: For testing and verification

### Recommended VS Code Extensions

- **Convex**: Official Convex extension
- **Tailwind CSS IntelliSense**: Autocomplete for Tailwind
- **TypeScript Importer**: Auto-imports
- **ESLint**: Linting
- **Prettier**: Code formatting

### Development Tools

- **Convex Dashboard**: `pnpm dlx convex dashboard`
- **TanStack Router DevTools**: Route debugging
- **React Query DevTools**: Cache inspection

---

## Code Conventions

### File Naming

- Components: `PascalCase.tsx` (e.g., `AttendeeList.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useAttendees.ts`)
- Routes: `kebab-case.tsx` (e.g., `attendees.index.tsx`)
- Utils: `camelCase.ts` (e.g., `formatDate.ts`)

### TypeScript Conventions

- Use strict mode enabled
- Explicit return types for functions
- Interface naming: `IAttendee`, `IEvent`
- Type naming: `AttendeeStatus`, `EventType`

### Component Structure

```typescript
// 1. Imports
import { useState } from 'react'
import { Button } from '@/components/ui/button'

// 2. Types
interface Props {
  attendeeId: string
}

// 3. Component
export function AttendeeCard({ attendeeId }: Props) {
  // State
  const [isLoading, setIsLoading] = useState(false)

  // Hooks
  const { data: attendee } = useAttendee(attendeeId)

  // Handlers
  const handleSave = async () => {
    // implementation
  }

  // Render
  return (
    <Card>
      {/* Content */}
    </Card>
  )
}
```

---

## UI/UX Guidelines

### shadcn Components to Use

- **Layout**: Card, Separator, Tabs
- **Forms**: Input, Label, Select, DatePicker, Textarea
- **Actions**: Button, Dialog, Sheet, DropdownMenu
- **Data**: Table, Badge, Avatar
- **Feedback**: Toast, Skeleton, Progress
- **Navigation**: Command (search), Breadcrumb

### Color Coding

- Sunday Service: Blue
- Retreat: Green
- Youth Events: Purple
- Prayer Meeting: Orange
- Custom types: User-defined

### Responsive Breakpoints

- Mobile: < 768px (single column, bottom nav)
- Tablet: 768px - 1024px (two columns)
- Desktop: > 1024px (full layout)

---

## Common Commands Reference

### Adding shadcn Components

```bash
pnpm dlx shadcn@canary add <component-name>
```

### Convex Operations

```bash
# Generate new schema types after schema change
pnpm dlx convex dev --once

# Run a specific query for testing
pnpm dlx convex run attendees/list

# View logs
pnpm dlx convex logs
```

### Git Operations

```bash
# Create new feature branch
git checkout -b feature/attendee-management

# Stage and commit
git add .
git commit -m "feat: add attendee CRUD operations"

# Push to remote
git push -u origin feature/attendee-management
```

---

## Troubleshooting

### Common Issues

1. **Convex connection errors**: Check VITE_CONVEX_URL in .env.local
2. **Auth not working**: Verify BETTER_AUTH_SECRET is set
3. **Schema changes not reflecting**: Run `pnpm dlx convex dev --once`
4. **Route not found**: Check file name matches TanStack Router convention
5. **shadcn components not styling**: Verify Tailwind CSS v4 is configured

### Debug Mode

```bash
# Enable Convex debug logging
DEBUG=convex:* pnpm dev

# Check Convex deployment status
pnpm dlx convex status
```

---

## Resources

### Documentation

- [TanStack Start Docs](https://tanstack.com/start/latest)
- [Convex Docs](https://docs.convex.dev)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Better Auth + Convex](https://labs.convex.dev/better-auth)

### Templates & Examples

- [TanStack Start + Convex Template](https://github.com/workos/template-convex-tanstack-react-start-authkit)
- [TanStack Start + shadcn](https://github.com/marmelab/shadcn-admin-kit)

---

## Next Steps

### Immediate Actions

1. Review and approve this plan
2. Initialize shadcn/ui
3. Setup Convex Auth
4. Create database schema
5. Build first feature (Attendees)

### Future Enhancements (Phase 2)

- [ ] Reports & analytics dashboard
- [ ] Bulk import/export (CSV)
- [ ] QR code check-in
- [ ] SMS/email notifications
- [ ] Ministry/team assignments
- [ ] Recurring events support
- [ ] Multi-church support
- [ ] Mobile app (React Native)

---

_Last Updated: 2026-03-20_
_Project: CJCRSG-Hub_
_Status: Planning Phase_
