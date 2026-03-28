# CJCRSG-Hub: Church Management System

A modern church management system built with TanStack Start, Convex, and shadcn/ui.

**Status:** Phase 10 - Complete (Sunday Service Page)  
**Last Updated:** 2026-03-28

---

## About

### Purpose & Mission

CJCRSG-Hub is a comprehensive church management platform designed to streamline administrative tasks and enhance community engagement. The system helps churches track members, organize events, and monitor attendance—all in one centralized, user-friendly interface.

**Core Mission:**

- Simplify church administration through digital tools
- Provide real-time insights into church activities and attendance
- Enable efficient event planning and management
- Foster better community connection through organized data

### Key Features

**Attendee Management**

- Complete member and visitor tracking with detailed profiles
- Real-time search across names, emails, and phone numbers
- Status categorization (Member, Visitor, Inactive)
- Inviter tracking to understand community growth

**Event Management**

- Dynamic event types with custom color coding
- Full event lifecycle: Upcoming → Active → Completed/Cancelled
- Real-time attendance tracking during events
- Media galleries for event photos and banners

**Attendance Tracking**

- Quick check-in interface optimized for mobile devices
- Bulk check-in capabilities for efficient processing
- Detailed attendance statistics and reporting
- Per-event and historical attendance views

**Administrative Tools**

- Server-side pagination for large datasets
- Advanced filtering and search capabilities
- Responsive design for desktop and mobile use
- Export-ready data structure

### Current Capabilities

The system is fully functional for core church operations:

✅ **Authentication & Security**

- Multi-provider authentication (Email, Google, Facebook)
- Protected routes with role-based access
- Secure session management

✅ **Data Management**

- Complete CRUD operations for all entities
- Real-time data synchronization via Convex
- Soft-delete functionality with archive recovery
- Form validation with user-friendly error handling

✅ **Event Operations**

- Create and manage unlimited events
- Track attendance with check-in/check-out
- **Dedicated "Add Attendance" button with modal interface**
- **Unified attendee selection with inviter assignment**
- **Quick attendee creation from attendance modal**
- View event history and analytics
- Manage event media and documentation

✅ **User Experience**

- Responsive layout optimized for all devices
- Mobile-first check-in interface
- Intuitive navigation with breadcrumb trails
- Loading states and empty state handling

---

## Current Status

**Recently Completed:**

- ✅ Phase 6: Event History page with server-side pagination
- ✅ Reusable EventList component with table/cards views
- ✅ New Convex queries: listActive, countActive, countArchived
- ✅ Server-side filtering and pagination for archive page
- ✅ Phase 8: AttendanceManager refactor with "Add Attendance" button
- ✅ Unified AttendeeSearchModal with search + selected attendees
- ✅ Inviter selection with full Attendee object return
- ✅ CreateAttendeeModal with optional name pre-population
- ✅ Phase 9: All test failures fixed (553 unit + 42 E2E = 595 total)
- ✅ Phase 10.1: Backend queries getCurrentEventByType, getStatsByEventType
- ✅ Phase 10.2: Frontend hooks with eventTypeId support
- ✅ Phase 10.3-10.4: Extract EventsContent, update EmptyEventState
- ✅ Phase 10.5: Update QuickStats with optional label props
- ✅ Phase 10.6: Update events.index.tsx to use EventsContent
- ✅ Phase 10.7: Create /events/sunday-service route
- ✅ Phase 10.8-10.9: Update navigation & sidebar with accordion

**Next Up:**

- ⏳ Phase 11: Add more dedicated event type pages

**See [docs/TASKS.md](docs/TASKS.md) for complete feature catalog.**

---

## Quick Overview

**Tech Stack:**

- **Frontend:** TanStack Start (React), shadcn/ui, Tailwind CSS v4
- **Backend:** Convex (database + server functions)
- **Auth:** Convex Auth (Password + Google + Facebook OAuth)
- **State Management:** TanStack Query + Convex React Query
- **Package Manager:** pnpm

**Development Strategy:**  
Start with **Convex local development mode** for rapid prototyping, then deploy to production.

```bash
# Start development
pnpm dlx convex dev
pnpm dev
```

---

## Quick Links

### 📋 Documentation

- **[Tasks](docs/TASKS.md)** - Feature catalog and implementation status
- **[TDD Tasks](docs/TDD_TASKS.md)** - Testing workflow and coverage details
- **[Commands](docs/COMMANDS.md)** - All CLI commands
- **[Conventions](docs/CONVENTIONS.md)** - Code standards & UI guidelines
- **[Git Workflow](docs/GIT.md)** - Version control guide
- **[Testing](docs/TESTING.md)** - Testing strategy & checklist
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues & fixes

### 🚀 Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Start Convex (local mode)
pnpm dlx convex dev

# 3. Start dev server (new terminal)
pnpm dev

# 4. Open http://localhost:3000
```

---

## Architecture Overview

### Frontend Structure (Feature-Based)

```
src/
├── features/
│   ├── attendees/      # Attendee management
│   ├── events/         # Event management
│   ├── attendance/     # Attendance tracking
│   └── auth/           # Authentication
├── components/         # Shared UI components
├── lib/               # Utilities
└── routes/            # TanStack Router routes
```

### Backend Structure (Convex)

```
convex/
├── schema.ts          # Database schema
├── auth.config.ts     # Auth configuration
├── attendees/         # Attendee queries/mutations
├── events/            # Event queries/mutations
├── attendance/        # Attendance queries/mutations
└── eventTypes/        # Event type queries/mutations
```

**See [docs/DATABASE.md](docs/DATABASE.md) for complete schema reference.**

---

## Essential Commands

```bash
# Development
pnpm dev              # Start dev server (Vite + Convex)
pnpm dev:ts           # Type check in watch mode

# Build & Quality
pnpm build            # Production build
pnpm lint             # Run ESLint
pnpm format           # Format with Prettier

# Testing
pnpm test             # Run unit tests
pnpm test:e2e         # Run E2E tests

# Convex
pnpm dlx convex dev           # Start Convex local dev
pnpm dlx convex dashboard   # Open dashboard
pnpm dlx convex deploy      # Deploy to production
```

**See [docs/COMMANDS.md](docs/COMMANDS.md) for complete command reference.**

---

## Development Workflow

**Note:** All git operations use native `git` CLI commands. See [docs/GIT.md](docs/GIT.md) for complete workflow.

### Before You Start

- Read [docs/TASKS.md](docs/TASKS.md) for current status
- Check [docs/CONVENTIONS.md](docs/CONVENTIONS.md) for code standards
- Review [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) if issues arise

### Making Changes

```bash
# Create feature branch
git checkout -b feature/descriptive-name

# Make your changes
# ... edit files ...

# Test locally
pnpm dev
```

### Commit & Push (After Your Approval)

```bash
# Stage and commit
git add .
git commit -m "feat: descriptive message"

# Push to remote
git push -u origin feature-name

# Create PR on GitHub (you manually approve)
```

---

## Resources

### Documentation

- [TanStack Start Docs](https://tanstack.com/start/latest)
- [Convex Docs](https://docs.convex.dev)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [Convex Auth Setup Guide](https://labs.convex.dev/auth/setup)

### Community

- [Convex Discord](https://convex.dev/community)
- [TanStack Discord](https://discord.gg/tanstack)

---

**Questions?** Check the detailed docs in the `/docs` folder or refer to troubleshooting guide.

_CJCRSG-Hub - Built with ❤️ for the church community_

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.

<!-- convex-ai-end -->
