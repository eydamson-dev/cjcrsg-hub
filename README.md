# CJCRSG-Hub

A modern church management system built with TanStack Start, Convex, and shadcn/ui. Manage church attendees, events, and attendance tracking with ease.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Tech](https://img.shields.io/badge/stack-TanStack%20Start%20%2B%20Convex-green)

## Features

### Core Modules

- **Attendee Management** 👥
  - Register and manage church members and visitors
  - Search by name, email, or phone
  - Track membership status and personal details
  - View attendance history per attendee
  - Admin actions: Link/unlink user accounts, change attendee status

- **Event Management** 📅
  - Create and manage church events
  - Dynamic event types (Sunday Service, Retreat, Youth Events, etc.)
  - Schedule events with dates, times, and locations
  - Color-coded event types for easy visual identification
  - Event lifecycle: Upcoming → Active → Completed/Cancelled
  - Media galleries with image upload support

- **Attendance Tracking** ✓
  - Real-time attendance recording
  - Quick check-in interface with attendee search
  - Bulk check-in functionality
  - Attendance statistics and reporting
  - Inviter tracking per event

### Authentication & Admin

- **Multi-Provider Auth** 🔐
  - Email & Password (built-in)
  - Google OAuth
  - Facebook OAuth
  - Account linking and management

- **Role-Based Access Control** 👑
  - super_admin: Full access, can create other admins
  - admin: Can link/unlink accounts, change attendee status
  - moderator: Can view admin features (read-only)
  - user: Regular user access

- **Attendee-User Account Linking** 🔗
  - Auto-linking on registration by email
  - Admin manual linking for edge cases
  - Safety checks prevent unlinking only auth method

## Tech Stack

| Category             | Technology                           |
| -------------------- | ------------------------------------ |
| **Frontend**         | TanStack Start (React)               |
| **Backend**          | Convex (Database + Server Functions) |
| **Authentication**   | Convex Auth (Password + OAuth)       |
| **UI Components**    | shadcn/ui                            |
| **Styling**          | Tailwind CSS v4                      |
| **State Management** | TanStack Query + Convex React Query  |
| **Testing**          | Vitest + convex-test + Playwright    |
| **Package Manager**  | pnpm                                 |

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Complete Setup Guide](#complete-setup-guide)
- [Convex Commands Reference](#convex-commands-reference)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)
- [Project Status](#project-status)
- [License](#license)

## Prerequisites

- **Node.js** 18+ (check with `node -v`)
- **pnpm** (install with `npm install -g pnpm`)
- **Git**
- **Convex CLI** (auto-installed with project dependencies)

## Quick Start

For experienced developers who want to get started quickly:

```bash
# 1. Clone and install
git clone git@github.com:eydamson-dev/cjcrsg-hub.git
cd cjcrsg-hub
pnpm install

# 2. Setup environment
cp .env.example .env.local
# Edit .env.local with your values

# 3. Start development
pnpm dev

# 4. Open browser
# Navigate to http://localhost:3000
```

## Complete Setup Guide

### 1. Installation

```bash
# Clone the repository
git clone git@github.com:eydamson-dev/cjcrsg-hub.git
cd cjcrsg-hub

# Install dependencies
pnpm install
```

### 2. Environment Setup

```bash
# Copy the environment template
cp .env.example .env.local
```

**Required Environment Variables:**

```env
# Convex WebSocket connection (for real-time sync)
VITE_CONVEX_URL=http://127.0.0.1:3210

# Your frontend URL (used for OAuth callbacks)
# Change this in production to your actual domain
CONVEX_SITE_URL=http://localhost:3000
```

**Optional (for OAuth authentication):**

```env
# Google OAuth credentials
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret

# Facebook OAuth credentials
AUTH_FACEBOOK_ID=your-facebook-app-id
AUTH_FACEBOOK_SECRET=your-facebook-app-secret
```

> **Note:** OAuth credentials are server-side only and configured via Convex environment variables. See [OAuth Setup Guide](#oauth-setup-optional) below.

### 3. Database Setup (Convex)

**Note:** Convex Auth tables are pre-configured in `convex/schema.ts` via `authTables`. For new projects, you would run `npx @convex-dev/auth`, but this project already includes the setup.

**Start Development Servers:**

```bash
# Terminal 1: Start Convex backend
pnpm dlx convex dev

# Terminal 2: Start the application
pnpm dev
```

**Access the Dashboard:**

```bash
# Open Convex dashboard in browser
pnpm dlx convex dashboard
# Or visit: http://localhost:3210
```

### 4. Authentication Setup

**Convex Auth is Pre-Configured**

The project includes Convex Auth with Password, Google, and Facebook providers. The authentication tables are automatically created via `authTables` in `convex/schema.ts`.

**For New Projects Only:**

If you're setting up Convex Auth from scratch on a new project, run:

```bash
npx @convex-dev/auth
```

**Create First Admin User:**

1. **Sign up** with email/password at `http://localhost:3000/login`
2. **Promote to super_admin** via CLI:

```bash
pnpm dlx convex run admin:promoteUser --arg '{"email":"admin@church.com","role":"super_admin"}'
```

**Promote Additional Admins:**

```bash
# Promote to admin role
pnpm dlx convex run admin:promoteUser --arg '{"email":"user@church.com","role":"admin"}'

# Promote to moderator role
pnpm dlx convex run admin:promoteUser --arg '{"email":"helper@church.com","role":"moderator"}'

# Reset to regular user
pnpm dlx convex run admin:demoteUser --arg '{"email":"user@church.com"}'
```

**Check Current User Role:**

```bash
pnpm dlx convex run lib/authHelpers:getCurrentUserRole
```

### 5. OAuth Setup (Optional)

For detailed Google and Facebook OAuth setup instructions, see [docs/OAUTH_SETUP.md](./docs/OAUTH_SETUP.md).

**Quick Setup Summary:**

1. **Create OAuth apps** in Google Cloud Console and/or Facebook Developers
2. **Add redirect URIs:**
   - `http://localhost:3000/api/auth/callback/google` (for Google)
   - `http://localhost:3000/api/auth/callback/facebook` (for Facebook)
3. **Set environment variables in Convex:**

```bash
# Google OAuth
pnpm dlx convex env set AUTH_GOOGLE_ID your-google-client-id
pnpm dlx convex env set AUTH_GOOGLE_SECRET your-google-client-secret

# Facebook OAuth
pnpm dlx convex env set AUTH_FACEBOOK_ID your-facebook-app-id
pnpm dlx convex env set AUTH_FACEBOOK_SECRET your-facebook-app-secret
```

4. **Restart the dev server** for changes to take effect

## Convex Commands Reference

| Command                        | Description                    | Example                                                   |
| ------------------------------ | ------------------------------ | --------------------------------------------------------- |
| `convex dev`                   | Start local development server | `pnpm dlx convex dev`                                     |
| `convex dev --once`            | Generate types and exit        | `pnpm dlx convex dev --once`                              |
| `convex deploy`                | Deploy to production           | `pnpm dlx convex deploy`                                  |
| `convex dashboard`             | Open dashboard in browser      | `pnpm dlx convex dashboard`                               |
| `convex env set`               | Set environment variable       | `pnpm dlx convex env set SITE_URL http://localhost:3000`  |
| `convex env list`              | List all environment variables | `pnpm dlx convex env list`                                |
| `convex env get`               | Get specific variable          | `pnpm dlx convex env get SITE_URL`                        |
| `convex env remove`            | Remove environment variable    | `pnpm dlx convex env remove OLD_VAR`                      |
| `convex run`                   | Run a query or mutation        | `pnpm dlx convex run attendees/list --arg '{"count":10}'` |
| `convex logs`                  | View function logs             | `pnpm dlx convex logs`                                    |
| `convex logs --status failure` | View error logs only           | `pnpm dlx convex logs --status failure`                   |

## Development Workflow

### Available Scripts

| Command              | Description                              |
| -------------------- | ---------------------------------------- |
| `pnpm dev`           | Start development server (Vite + Convex) |
| `pnpm build`         | Build for production                     |
| `pnpm dev:ts`        | Type check in watch mode                 |
| `pnpm lint`          | Run ESLint                               |
| `pnpm format`        | Format code with Prettier                |
| `pnpm test`          | Run unit and component tests             |
| `pnpm test:watch`    | Run tests in watch mode                  |
| `pnpm test:coverage` | Run tests with coverage report           |

### Project Structure

```
cjcrsg-hub/
├── src/                          # Frontend source code
│   ├── components/              # Shared UI components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layout/             # Layout components (Header, Sidebar)
│   │   └── auth/               # Auth-related components
│   ├── features/                # Feature-based modules
│   │   ├── attendees/          # Attendee management
│   │   ├── events/             # Event management
│   │   └── attendance/         # Attendance tracking
│   ├── hooks/                   # Shared React hooks
│   ├── lib/                     # Utilities and helpers
│   ├── routes/                  # TanStack Router routes
│   └── styles/                  # Global styles
├── convex/                      # Convex backend
│   ├── schema.ts               # Database schema
│   ├── auth.ts                 # Auth configuration
│   ├── account.ts              # Account management
│   ├── admin.ts                # Admin functions
│   ├── users.ts                # User queries
│   ├── attendees/              # Attendee queries/mutations
│   ├── events/                 # Event queries/mutations
│   ├── attendance/             # Attendance queries/mutations
│   └── retreat/                # Spiritual retreat extension
├── docs/                        # Documentation
├── tests/                       # Test files
│   └── unit/                   # Unit and component tests
├── .agents/                     # AI assistant skills and configuration
└── public/                      # Static assets
```

## Testing

### Running Tests

```bash
# Run all unit and component tests
pnpm test

# Run tests in watch mode (for development)
pnpm test:watch

# Run tests with coverage report
pnpm test:coverage
```

### Test Structure

- **Unit Tests:** Located in `tests/unit/convex/` for backend
- **Component Tests:** Located in `tests/unit/components/` for frontend
- **Test Utilities:** `tests/setup/` contains test configuration

### Writing Tests

For testing guidelines and patterns, see [docs/TDD_TASKS.md](./docs/TDD_TASKS.md) and [docs/TESTING.md](./docs/TESTING.md).

## Production Deployment

### 1. Build the Application

```bash
pnpm build
```

### 2. Deploy Convex to Production

```bash
pnpm dlx convex deploy
```

### 3. Set Production Environment Variables

```bash
# Site URL (your production domain)
pnpm dlx convex env set SITE_URL https://your-domain.com

# OAuth credentials (production values)
pnpm dlx convex env set AUTH_GOOGLE_ID your-production-google-id
pnpm dlx convex env set AUTH_GOOGLE_SECRET your-production-google-secret
pnpm dlx convex env set AUTH_FACEBOOK_ID your-production-facebook-id
pnpm dlx convex env set AUTH_FACEBOOK_SECRET your-production-facebook-secret
```

**Note:** Update redirect URIs in Google Cloud Console and Facebook Developers to use your production domain:

- `https://your-domain.com/api/auth/callback/google`
- `https://your-domain.com/api/auth/callback/facebook`

### 4. Create First Production Admin

```bash
pnpm dlx convex run admin:promoteUser --arg '{"email":"admin@your-church.com","role":"super_admin"}'
```

### Post-Deployment Checklist

- [ ] Application loads at production URL
- [ ] Login works with email/password
- [ ] OAuth sign-in works (if configured)
- [ ] Database is accessible
- [ ] Admin dashboard is functional
- [ ] Attendee and event management works

## Troubleshooting

For common issues and solutions, see [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md).

### Quick Fixes

**Convex connection errors:**

- Ensure `VITE_CONVEX_URL` is set correctly in `.env.local`
- Verify Convex dev server is running (`pnpm dlx convex dev`)

**OAuth redirect errors:**

- Check `CONVEX_SITE_URL` matches your actual frontend URL
- Verify redirect URIs in Google/Facebook consoles match exactly
- Remember: `http://` vs `https://`, trailing slashes matter

**TypeScript errors after schema changes:**

```bash
pnpm dlx convex dev --once
```

## Project Status

For current development status, completed features, and roadmap, see [docs/TASKS.md](./docs/TASKS.md).

**Current Phase:** Phase 16 - Complete Auth Module with Admin Roles & Account Linking

### Completed Features:

- ✅ Multi-provider authentication (Email, Google, Facebook)
- ✅ Role-based access control (super_admin, admin, moderator, user)
- ✅ Attendee-user account linking (auto and manual)
- ✅ Admin dashboard for user management
- ✅ Account settings page for auth method management
- ✅ Event management with media uploads
- ✅ Attendance tracking with real-time updates
- ✅ Spiritual retreat event type with teachers, schedule, and staff

## License

MIT License - feel free to use for your church!

---

Built with ❤️ for the church community
