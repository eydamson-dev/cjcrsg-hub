---
name: cjcrsg-docs-workflow
description: Documentation workflow for CJCRSG-Hub task tracking, changelog management, and AGENTS.md status updates. Use when updating TASKS.md, TDD_TASKS.md, CHANGELOG.md, or AGENTS.md.
---

# CJCRSG Documentation Workflow

Guidelines for updating project documentation files.

## When to Use This Skill

- Updating task tracking files
- Adding changelog entries
- Marking tasks complete
- Tracking project progress
- Updating project status overview

---

## Documentation Separation

| File                | Purpose                   | Update When...                                |
| ------------------- | ------------------------- | --------------------------------------------- |
| `docs/TASKS.md`     | Feature implementation    | Working on UI, backend features, bug fixes    |
| `docs/TDD_TASKS.md` | Testing & TDD             | Working on test setup, unit tests, E2E tests  |
| `CHANGELOG.md`      | User-facing changes       | Any feature, fix, or change users should know |
| `AGENTS.md`         | Project overview & status | Completing phases, adding new capabilities    |

---

## Current Session Section

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

---

## AGENTS.md Updates

**When to update:**

- Completing a phase or major feature
- Adding new capabilities that should be highlighted
- Changing project status

**What to update:**

- Status line (top of file): `Phase X - Complete (Feature Name)`
- Current Capabilities section: Add bullet points for new features
- Next Up section: Update if priorities change

**What NOT to include:**

- ❌ "Recently Completed" list (belongs in TASKS.md)
- ❌ Detailed task breakdown (belongs in TASKS.md)
- ❌ Testing details (belongs in TDD_TASKS.md)

**Keep AGENTS.md focused on:**

- Current state of the app
- What capabilities exist NOW
- Brief 2-3 item roadmap

---

## Changelog Updates

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

1. **Added** - New features
2. **Changed** - Modifications
3. **Deprecated** - Features being removed
4. **Removed** - Deleted features
5. **Fixed** - Bug fixes
6. **Security** - Security fixes

### Changelog Guidelines

- Use present tense: "Add feature" not "Added feature"
- Be specific: "Add attendee search with real-time filtering"
- Keep concise: One clear sentence per entry
- Group related changes under the same category

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

## File Locations

| File                | Purpose                      |
| ------------------- | ---------------------------- |
| `docs/TASKS.md`     | Feature implementation tasks |
| `docs/TDD_TASKS.md` | Testing tasks                |
| `CHANGELOG.md`      | Change log                   |
| `AGENTS.md`         | Project overview & status    |
| `docs/GIT.md`       | Git workflow details         |

---

## Workflow Summary

**On every commit, check and update files as needed:**

1. **TASKS.md** (required for feature work)
   - Add to "Completed Tasks" section
   - Update phase status

2. **CHANGELOG.md** (required for user-facing changes)
   - Add to [Unreleased] section
   - Follow category rules

3. **AGENTS.md** (update if needed)
   - Status line (always update on phase completion)
   - Current Capabilities (only if new capability added)
   - Next Up (only if roadmap changes)

**Only update files that NEED updating** - not every file every time.

---

\_Last Updated: 2026-03-30
