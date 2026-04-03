# CJCRSG-Hub: Church Management System

A modern church management system built with TanStack Start, Convex, and shadcn/ui.

**Status:** Phase 15 - Unified Event Creation Architecture - In Progress  
**Last Updated:** 2026-04-02

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
- **Role system with 4 levels:** super_admin, admin, moderator, user
- **Attendee-User account linking:** Auto-link on registration by email
- **CLI admin promotion:** `npx convex run admin:promoteUser`
- Admin-only attendee linking/unlinking with safety checks
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
- **Manage event media and documentation with persistent storage**
- **Image upload with Ctrl+V paste support**
- **Dedicated Sunday Service event page** (`/events/sunday-service`)
- **Dedicated Spiritual Retreat event page** (`/events/spiritual-retreat`)
  - **Tabbed interface** (Overview, Teachers, Schedule, Staff, Attendance)
  - **Teacher management** with qualified status validation (Pastor/Leader/Elder/Deacon)
  - **Schedule builder** with day tabs and time conflict detection
  - **Staff assignments** with role and responsibilities fields
- Filtered history and archive by event type

✅ **User Experience**

- Responsive layout optimized for all devices
- Mobile-first check-in interface
- Intuitive navigation with breadcrumb trails
- Loading states and empty state handling

---

## Current Status

**Status:** Phase 16 - Complete Auth Module with Admin Roles & Account Linking - In Progress  
**Last Updated:** 2026-04-03

**Phase 15 Progress:** (Complete)

- ✅ Phase 15.1: Create EventPageHeader Component
- ✅ Phase 15.2: Rename EventDetails to GenericEventDetails
- ✅ Phase 15.3: Create SundayServiceDetails Component
- ✅ Phase 15.4: Update Sunday Service Page
- ✅ Phase 15.5: Update RetreatDetails with isCreating Mode
- ✅ Phase 15.6: Update Spiritual Retreat Page
- ✅ Phase 15.7: Update /events/new Route
- ✅ Phase 15.8: Delete Deprecated Components
- ✅ Phase 15.9: Testing & Validation
- ✅ Phase 15.10: Documentation Update

**Phase 16 Progress:** (In Progress)

- ✅ Task 16.1: Admin Roles Schema & CLI Promotion
- ✅ Task 16.2: Attendee-User Auto-Linking Backend
- ⏳ Task 16.3: Admin Dashboard UI
- ⏳ Task 16.4: Attendee Detail Admin Actions
- ⏳ Task 16.5: Attendee List Link Status
- ⏳ Task 16.6: Settings > Account Page
- ⏳ Task 16.7: OAuth Setup & E2E Testing

**Next Up:**

- Task 16.3: Admin Dashboard UI

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

## AI Tools & Capabilities

This project uses specialized AI skills and MCPs (Model Context Protocols):

### Project Skills (Custom Knowledge)

- **cjcrsg-hub** - Main project guidance (architecture, patterns, conventions)
- **cjcrsg-task-manager** - Task planning and tracking (show tasks, plan phase)
- **cjcrsg-dev-workflow** - Development methodology and implementation approach
- **cjcrsg-pre-commit** - Quality checks before committing
- **cjcrsg-docs-workflow** - Documentation updates (TASKS.md, CHANGELOG.md)
- **cjcrsg-testing-workflow** - Testing decisions and requirements
- **cjcrsg-git-conventions** - Git branch naming and commit format

### Platform Skills

- **convex-quickstart** - Initialize Convex projects
- **convex-setup-auth** - Set up Convex authentication
- **convex-migration-helper** - Schema migrations
- **convex-performance-audit** - Performance optimization
- **convex-create-component** - Build reusable Convex components
- **shadcn** - UI component management

### Available MCPs (Declared in opencode.json)

- **convex** - Direct database operations, queries, mutations
- **playwright** - E2E testing, browser automation
- **vitest** - Unit testing, coverage analysis
- **chrome-devtools** - Browser debugging, performance profiling
- **shadcn** - Component registry operations

**Skills:** Located in `.agents/skills/`
**MCPs:** Configured in `opencode.json`

---

## Quick Links

### 📋 Documentation

- **[Tasks](docs/TASKS.md)** - Feature catalog and implementation status
- **[TDD Tasks](docs/TDD_TASKS.md)** - Testing workflow and coverage details
- **[Session](docs/SESSION.md)** - Current session context and immediate next actions
- **[Commands](docs/COMMANDS.md)** - All CLI commands
- **[Conventions](docs/CONVENTIONS.md)** - Code standards & UI guidelines
- **[Git Workflow](docs/GIT.md)** - Version control guide
- **[Testing](docs/TESTING.md)** - Testing strategy & checklist
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues & fixes

### 🎯 Task Management

Use the **`cjcrsg-task-manager`** skill for:

- Starting and completing tasks
- Planning new phases/features
- Checking project status
- Standardized task naming and tracking

**Quick commands:** `show tasks`, `start task`, `task complete`, `plan phase`

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
