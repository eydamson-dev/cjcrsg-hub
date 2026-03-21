---
name: cjcrsg-hub
description: Comprehensive guidance for CJCRSG-Hub church management system built with TanStack Start, Convex, and shadcn/ui. Covers project architecture and feature-based folder structure, database schema with indexes and validators, Convex query/mutation patterns with real-time subscriptions, authentication flows with Convex Auth (Password + Google + Facebook OAuth), shadcn/ui component patterns and form handling with react-hook-form + zod, code conventions and TypeScript standards, common development tasks and implementation workflows, TDD testing strategy with convex-test and Playwright, troubleshooting guides, and quick reference for commands and file locations. Use when implementing features, creating database operations, building UI components, setting up auth, or working with TanStack Router.
---

# CJCRSG-Hub Skill

This skill provides comprehensive guidance for working on the CJCRSG-Hub church management system.

## When to Use This Skill

Use this skill when:

- Starting a new feature implementation
- Creating database queries/mutations in Convex
- Building UI components with shadcn/ui
- Setting up authentication flows
- Working with TanStack Start routing
- Need quick reference for project patterns

## Quick Navigation

| Topic                       | File                                         |
| --------------------------- | -------------------------------------------- |
| Tech stack & overview       | [project-overview.md](./project-overview.md) |
| Folder structure & patterns | [architecture.md](./architecture.md)         |
| Database schema             | [database.md](./database.md)                 |
| Code conventions            | [conventions.md](./conventions.md)           |
| UI patterns & shadcn        | [ui-patterns.md](./ui-patterns.md)           |
| Convex patterns             | [convex-patterns.md](./convex-patterns.md)   |
| Common "how to" guides      | [common-tasks.md](./common-tasks.md)         |
| Commands & quick ref        | [quick-reference.md](./quick-reference.md)   |

## Project Status

**Current Phase:** Phase 1 - Foundation Setup  
**Status:** ⏳ Ready to start implementation  
**Next Task:** Initialize shadcn/ui with canary version

## Core Technologies

- **Frontend:** TanStack Start (React), shadcn/ui, Tailwind CSS v4
- **Backend:** Convex (database + server functions)
- **Auth:** Convex Auth (Password + Google + Facebook OAuth)
- **State:** TanStack Query + Convex React Query
- **Package Manager:** pnpm

## Quick Tips

- Always use `pnpm` (never npm)
- Create feature branches for each task
- Test before asking to commit
- Wait for user approval before committing
- Use feature-based folder structure
- Follow established patterns in existing code

---

_Last Updated: 2026-03-20_
