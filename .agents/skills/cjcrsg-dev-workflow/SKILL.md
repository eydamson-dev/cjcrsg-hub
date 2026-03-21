---
name: cjcrsg-dev-workflow
description: Development workflow methodology for CJCRSG-Hub including Implementation-First approach and feature/bug development patterns. Use when implementing new features or fixing bugs to follow the established development process.
---

# CJCRSG Development Workflow

Development methodology and feature/bug workflows.

## When to Use This Skill

- Starting new features
- Implementing bug fixes
- Following development methodology
- Planning implementation approach

---

## Implementation-First Workflow

For **ALL tasks** (backend AND frontend):

### Step 1: IMPLEMENT

Build the feature first:

- Write the code
- Make it functional
- Don't write tests yet
- Focus on requirements

### Step 2: MANUAL TEST

Verify it works:

- Run `pnpm dev`
- Test the feature manually
- Confirm requirements are met
- Report issues or adjustments

### Step 3: ADD TESTS

After user confirmation ("works", "LGTM", etc.):

- Backend: Add convex-test unit tests
- Frontend: Add component tests OR rely on E2E tests
- Update test counts in documentation
- Run all tests to verify

---

## Feature Development Workflow

```bash
# 1. Create branch
git checkout -b feature/event-types

# 2. Implement
# Write code in convex/, src/features/
pnpm dev

# 3. Manual testing
# Verify in browser

# 4. Add tests (after verification)
# Create tests/unit/convex/eventTypes/mutations.test.ts
# Create tests/unit/convex/eventTypes/queries.test.ts
pnpm test

# 5. Update docs
# CHANGELOG.md under [Unreleased]
# TASKS.md "Current Session"

# 6. Quality checks
pnpm lint && pnpm dev:ts && pnpm test

# 7. Commit
git add .
git commit -m "feat: implement event type CRUD operations

- Add create, update, delete mutations
- Add list and getById queries
- Add 15 comprehensive tests
- Update CHANGELOG.md"

# 8. Push
git push -u origin feature/event-types
```

---

## Bug Fix Workflow

```bash
# 1. Create branch
git checkout -b fix/attendee-search

# 2. Implement fix
# Fix the code

# 3. Manual testing
pnpm dev

# 4. Add regression test
# Add test to existing test file

# 5. Update docs
# CHANGELOG.md under ### Fixed

# 6. Quality checks
pnpm lint && pnpm dev:ts && pnpm test

# 7. Commit
git commit -m "fix: resolve attendee search with special characters

- Fix regex pattern in search query
- Add regression test for special chars
- Update CHANGELOG.md"

# 8. Push
git push -u origin fix/attendee-search
```

---

## Why Implementation-First?

**Benefits:**

- UI requirements often evolve during implementation
- Heavy mocking makes tests brittle for React components
- Manual testing catches UX issues unit tests miss
- Backend can still be unit tested effectively after implementation
- Faster iteration without test maintenance overhead during development

---

## Essential Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm dev:ts           # Type check
pnpm lint             # ESLint
pnpm test             # Run tests

# Git
git checkout -b feature/name    # Create branch
git add .                       # Stage changes
git commit -m "type: message"   # Commit
git push -u origin branch       # Push

# Convex
pnpm dlx convex dev             # Start Convex
pnpm dlx convex dashboard       # Open dashboard
```

---

\_Last Updated: 2026-03-21
