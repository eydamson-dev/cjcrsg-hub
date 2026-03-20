# CJCRSG-Hub: Church Management System

A modern church management system built with TanStack Start, Convex, and shadcn/ui.

**Status:** Phase 1 - Foundation Setup  
**Last Updated:** 2026-03-20

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

- **[Tasks](docs/TASKS.md)** - Complete implementation checklist
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
  dateOfBirth?: number
  address?: string
  status: 'member' | 'visitor' | 'inactive'
  joinDate?: number
  notes?: string
  createdAt: number
  updatedAt: number
}
```

#### event_types

```typescript
{
  _id: string
  name: string
  description?: string
  color?: string
  isActive: boolean
  createdAt: number
}
```

#### events

```typescript
{
  _id: string
  name: string
  eventTypeId: string
  description?: string
  date: number
  startTime?: string
  endTime?: string
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
  checkedInAt: number
  checkedInBy: string
  notes?: string
}
```

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

# Convex
pnpm dlx convex dev           # Start Convex local dev
pnpm dlx convex dashboard   # Open dashboard
pnpm dlx convex deploy      # Deploy to production
```

**See [docs/COMMANDS.md](docs/COMMANDS.md) for complete command reference.**

---

## Development Workflow

### 1. Before You Start

- Read [docs/TASKS.md](docs/TASKS.md) for current phase tasks
- Check [docs/CONVENTIONS.md](docs/CONVENTIONS.md) for code standards
- Review [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) if issues arise

### 2. Making Changes

```bash
# Create feature branch
git checkout -b feature/descriptive-name

# Make your changes
# ... edit files ...

# Test locally
pnpm dev
```

### 3. Commit & Push (After Your Approval)

```bash
# Stage and commit
git add .
git commit -m "feat: descriptive message"

# Push to remote
git push -u origin feature-name

# Create PR on GitHub (you manually approve)
```

**See [docs/GIT.md](docs/GIT.md) for detailed workflow.**

---

## Development Tools & AI Assistants

### OpenCode Configuration

This project uses **OpenCode** for AI-assisted development with the following configuration:

**MCP (Model Context Protocol) Tools:**

- **shadcn MCP** - AI assistant for shadcn/ui component management
  - Automatically adds, updates, and manages shadcn components
  - Provides component recommendations based on context
  - Configuration: `opencode.json`

**Skills:**

- **shadcn/ui Skill** - Comprehensive knowledge base for shadcn/ui
  - Located in: `.agents/skills/shadcn/`
  - Includes: CLI commands, customization guides, component rules
  - Helps with: Component selection, styling, forms, icons

### VS Code Extensions

Recommended extensions for development:

- **Convex** - Official Convex extension
- **Tailwind CSS IntelliSense** - Autocomplete for Tailwind
- **TypeScript Importer** - Auto-imports
- **ESLint** - Linting
- **Prettier** - Code formatting

---

## Implementation Status

### ✅ Completed

- [x] Git repository setup
- [x] GitHub remote configuration
- [x] .gitignore configuration
- [x] AGENTS.md documentation
- [x] README.md creation

### 🚧 In Progress (Phase 1)

- [ ] Initialize shadcn/ui with canary version
- [ ] Setup Convex Auth (Password + Google + Facebook OAuth)
- [ ] Configure environment variables
- [ ] Create base layout with navigation
- [ ] Setup protected routes

### 📅 Upcoming

- Phase 2: Database Schema & Auth
- Phase 3: Attendee Management
- Phase 4: Event Types (Admin)
- Phase 5: Event Management
- Phase 6: Attendance Tracking
- Phase 7: Dashboard & Polish

**See [docs/TASKS.md](docs/TASKS.md) for full task list with details.**

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
