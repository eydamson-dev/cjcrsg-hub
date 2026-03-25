# CJCRSG-Hub: Church Management System

A modern church management system built with TanStack Start, Convex, and shadcn/ui.

**Status:** Phase 5 - Event Management (Complete)  
**Last Updated:** 2026-03-25  
**Tests:** 164 passing (37 Convex + 100 Component + 27 E2E)

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
- **[TDD Tasks](docs/TDD_TASKS.md)** - Testing workflow and test coverage
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

## Implementation Status

### ✅ Completed Features

**Core Infrastructure**

- Authentication (Email + Google + Facebook OAuth)
- Protected routes with route guards
- Responsive layout with sidebar and mobile navigation

**Attendee Management**

- Full CRUD operations (Create, Read, Update, Archive)
- Real-time search with filters and pagination
- Detailed attendee profiles
- Form validation with react-hook-form + Zod

**Event Types (Admin)**

- Dynamic event categories with custom colors
- Color picker with react-colorful
- Inline editing via modal
- 48 unit tests passing

**Event Management**

- Event lifecycle (upcoming → active → completed/cancelled)
- Event dashboard with real-time attendance
- Bulk check-in functionality
- Archive page with filters
- Inline editing and media gallery
- Image upload and management

### 📅 Upcoming Features

- Attendance reporting & analytics
- Dashboard with statistics widgets
- Data export to CSV
- Toast notifications

**See [docs/TASKS.md](docs/TASKS.md) for complete feature catalog.**

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

## Development Tools

### AI Assistants

- **shadcn/ui MCP** - Component management and recommendations
- **Skills** - Located in `.agents/skills/` for detailed guidance
  - `cjcrsg-hub/` - Project-specific patterns and workflows
  - `shadcn/` - shadcn/ui component usage

### VS Code Extensions

- **Convex** - Official Convex extension
- **Tailwind CSS IntelliSense** - Autocomplete for Tailwind
- **TypeScript Importer** - Auto-imports
- **ESLint** - Linting
- **Prettier** - Code formatting

---

## Testing Summary

| Category    | Count   | Status             |
| ----------- | ------- | ------------------ |
| Convex Unit | 37      | ✅ Passing         |
| Component   | 100     | ✅ Passing         |
| E2E         | 27      | ✅ Passing         |
| **Total**   | **164** | **✅ All Passing** |

**See [docs/TDD_TASKS.md](docs/TDD_TASKS.md) for detailed testing workflow.**

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
