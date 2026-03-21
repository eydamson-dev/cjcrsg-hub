---
name: cjcrsg-git-workflow
description: Enforces CJCRSG-Hub git workflow, pre-commit checklist, conventional commits, branch naming conventions, and development workflow including Implementation-First approach, testing requirements, and task documentation updates. Use when committing changes, creating branches, or working on features to ensure compliance with project standards.
---

# CJCRSG Git & Development Workflow Enforcement

This skill enforces the established git workflow and development practices for CJCRSG-Hub.

## When to Use This Skill

Use this skill when:

- Creating new branches
- Preparing to commit changes
- Writing commit messages
- Completing tasks and updating documentation
- Starting new features or bug fixes
- Running quality checks before commits

---

## Git Workflow

### 1. Branch Naming Convention

| Type          | Pattern                | Example                     |
| ------------- | ---------------------- | --------------------------- |
| Feature       | `feature/description`  | `feature/attendee-search`   |
| Bug Fix       | `fix/description`      | `fix/login-redirect`        |
| Documentation | `docs/description`     | `docs/update-readme`        |
| Refactor      | `refactor/description` | `refactor/simplify-queries` |

**Enforcement:**

- Branch names must be lowercase with hyphens
- Use descriptive names (not just "fix-bug")
- Include feature/bug prefix

### 2. Commit Message Convention

**Format:**

```
<type>: <subject>

<body> (optional)

<footer> (optional)
```

**Types:**

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only changes
- `style:` - Code style changes (formatting, semicolons, etc.)
- `refactor:` - Code changes that neither fix a bug nor add a feature
- `test:` - Adding or correcting tests
- `chore:` - Changes to build process, dependencies, etc.

**Examples:**

```bash
feat: add attendee search functionality
fix: resolve event date parsing issue
docs: update API documentation with new endpoints
test: add attendee validation tests
```

**Guidelines:**

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Don't capitalize first letter
- No period at the end
- Keep subject line under 50 characters

### 3. Pre-Commit Checklist

**MANDATORY - Must complete before every commit:**

```markdown
- [ ] Code has been tested manually (pnpm dev)
- [ ] No console.log statements (unless debugging)
- [ ] Run `pnpm lint` - no errors
- [ ] Run type check - no TypeScript errors
- [ ] New mutations have tests (if applicable)
- [ ] New queries have tests (if applicable)
- [ ] New shared components have tests (if applicable)
- [ ] Bug fixes include regression test (if applicable)
- [ ] Update CHANGELOG.md (if user-facing change)
- [ ] Update TASKS.md "Current Session" (if feature work)
- [ ] Update TDD_TASKS.md "Current Progress" (if test work)
```

**Quality Checks:**

```bash
# Run all quality checks
pnpm lint              # ESLint - must pass
pnpm dev:ts            # TypeScript check - must pass
pnpm test              # Tests - must pass (138 tests)
```

---

## Development Workflow (Implementation-First)

### Phase 1: IMPLEMENT

Build the feature first:

- Write the code
- Make it functional
- Don't write tests yet
- Focus on requirements

### Phase 2: MANUAL TEST

Verify it works:

- Run `pnpm dev`
- Test the feature manually
- Confirm requirements are met
- Report issues or adjustments

### Phase 3: ADD TESTS

After your confirmation ("works", "LGTM", etc.):

- Backend: Add convex-test unit tests
- Frontend: Add component tests OR rely on E2E tests
- Update test counts in documentation
- Run all tests to verify

### Workflow Commands

```bash
# 1. Create feature branch
git checkout -b feature/descriptive-name

# 2. Implement
# Write code
pnpm dev  # Test manually

# 3. Quality checks
pnpm lint
pnpm dev:ts
pnpm test

# 4. Update documentation
# Update CHANGELOG.md
# Update TASKS.md or TDD_TASKS.md

# 5. Stage and commit
git add .
git commit -m "type: descriptive message"

# 6. Push
git push -u origin feature-name
```

---

## Task Documentation Workflow

### Documentation Separation

| File                | Purpose                | Update When...                               |
| ------------------- | ---------------------- | -------------------------------------------- |
| `docs/TASKS.md`     | Feature implementation | Working on UI, backend features, bug fixes   |
| `docs/TDD_TASKS.md` | Testing & TDD          | Working on test setup, unit tests, E2E tests |

### Current Session Section

**Must update BEFORE committing:**

```markdown
**Updated:** 2026-03-21

**Phase:** Phase 4 - Event Types (Admin) - In Progress  
**Current Task:** Task 4.10 - Create Event Types Route Page  
**Status:** 🚧 In Progress

**Recently Completed:**

- ✅ Task X.X: Description
- ✅ Task X.X: Description
```

### Changelog Updates

**Add to [Unreleased] section:**

```markdown
### Added

- Add feature description

### Changed

- Change description

### Fixed

- Fix description
```

**Categories (in order):**

1. Added - New features
2. Changed - Modifications
3. Deprecated - Features being removed
4. Removed - Deleted features
5. Fixed - Bug fixes
6. Security - Security fixes

---

## Testing Requirements

### When Tests Are Required

**✅ REQUIRED (After implementation):**

| Feature                               | Test Type        | File Pattern                                    |
| ------------------------------------- | ---------------- | ----------------------------------------------- |
| New Convex mutation                   | Unit test        | `tests/unit/convex/{feature}/mutations.test.ts` |
| New Convex query                      | Unit test        | `tests/unit/convex/{feature}/queries.test.ts`   |
| Shared component (2+ features use it) | Component test   | `tests/unit/components/{name}.test.tsx`         |
| Bug fix                               | Regression test  | Add to existing test file                       |
| Form validation logic                 | Unit + Component | Both test types                                 |

**❌ Optional (Can skip):**

- Simple UI-only components
- One-off components
- Styling/visual changes
- Documentation updates

### Test Statistics

**Current:** 138 tests passing

| Category        | Count | Status         |
| --------------- | ----- | -------------- |
| Convex Unit     | 37    | ✅ All passing |
| Component Tests | 92    | ✅ All passing |
| E2E Tests       | 9     | ✅ All passing |

### Running Tests

```bash
# Run all tests
pnpm test              # Must pass before commit

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e

# Run E2E with UI
pnpm test:e2e:ui
```

---

## Enforcement Rules

### Before Committing, I Will:

1. **Verify branch name** follows convention
2. **Run quality checks** (lint, typecheck, tests)
3. **Check test coverage** for new features
4. **Verify documentation updates**:
   - CHANGELOG.md updated for user-facing changes
   - TASKS.md or TDD_TASKS.md updated
   - Current Session section reflects current status
5. **Verify commit message** follows convention
6. **Confirm no console.logs** (unless debugging)
7. **Confirm manual testing** completed

### Exception Handling

**Mark commit with keyword if skipping requirements:**

```bash
# Prototype/Spike
git commit -m "feat: add event type form [WIP: prototype]"

# Hotfix (emergency)
git commit -m "fix: critical login bug [HOTFIX]"

# Documentation only
git commit -m "docs: update README"
```

---

## Common Workflows

### New Feature Implementation

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

### Bug Fix

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

## Quick Reference

### Essential Commands

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

### File Locations

| File                | Purpose                      |
| ------------------- | ---------------------------- |
| `docs/TASKS.md`     | Feature implementation tasks |
| `docs/TDD_TASKS.md` | Testing tasks                |
| `CHANGELOG.md`      | Change log                   |
| `docs/GIT.md`       | Git workflow details         |

---

_Last Updated: 2026-03-21_
