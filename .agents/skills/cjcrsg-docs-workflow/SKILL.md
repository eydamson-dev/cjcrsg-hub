---
name: cjcrsg-docs-workflow
description: Documentation workflow for CJCRSG-Hub task tracking and changelog management. Use when updating TASKS.md, TDD_TASKS.md, or CHANGELOG.md to maintain accurate project status and change history.
---

# CJCRSG Documentation Workflow

Guidelines for updating project documentation files.

## When to Use This Skill

- Updating task tracking files
- Adding changelog entries
- Marking tasks complete
- Tracking project progress

---

## Documentation Separation

| File                | Purpose                | Update When...                               |
| ------------------- | ---------------------- | -------------------------------------------- |
| `docs/TASKS.md`     | Feature implementation | Working on UI, backend features, bug fixes   |
| `docs/TDD_TASKS.md` | Testing & TDD          | Working on test setup, unit tests, E2E tests |

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
| `docs/GIT.md`       | Git workflow details         |

---

\_Last Updated: 2026-03-21
