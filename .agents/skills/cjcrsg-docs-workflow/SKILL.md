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

| File                | Purpose                   | Update When...                                | Granularity          | Required?        |
| ------------------- | ------------------------- | --------------------------------------------- | -------------------- | ---------------- |
| `docs/TASKS.md`     | Feature implementation    | Working on UI, backend features, bug fixes    | Phase/Task level     | ✅ YES           |
| `docs/TDD_TASKS.md` | Testing & TDD             | Working on test setup, unit tests             | Testing tasks        | ✅ YES           |
| `CHANGELOG.md`      | User-facing changes       | Any feature, fix, or change users should know | Release notes        | ✅ YES           |
| `AGENTS.md`         | Project overview & status | **EVERY TASK** - All features, fixes, changes | High-level status    | ✅ **MANDATORY** |
| **`SESSION.md`**    | **Session continuity**    | **Every session start/end**                   | **Micro-task level** | ✅ **MANDATORY** |

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

## AGENTS.md Updates (MANDATORY - EVERY TASK)

**⚠️ HARD REQUIREMENT: Update AGENTS.md for EVERY task, feature, fix, or change. No exceptions.**

**When to update:**

- ✅ **EVERY task** - Even small features
- ✅ **EVERY bug fix** - Even minor fixes
- ✅ **EVERY change** - Even refactoring
- ✅ **EVERY time** - No "I'll update later"

**Why mandatory?**

- AGENTS.md is the project overview for all AI agents
- Keeps project state current and accurate
- Prevents lost context between sessions
- Required for workflow compliance

**What to update:**

- **Current Capabilities section:** Add bullet point for new capability
- **Status line:** If phase completes
- **Next Up section:** If priorities change

**Format:**

```markdown
- **Capability name:** Brief description of what it does
```

**Example:**

```markdown
- **Attendee list link status:** User Account column with linked/unlinked badge, filter dropdown, quick stats (admin only)
```

**What NOT to include:**

- ❌ "Recently Completed" list (belongs in TASKS.md)
- ❌ Detailed task breakdown (belongs in TASKS.md)
- ❌ Testing details (belongs in TDD_TASKS.md)
- ❌ File-level details (too granular)

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

## SESSION.md Guidelines

**Purpose:** Session continuity - track what you're working on RIGHT NOW

**Update when:**

- Starting a new session
- Completing a micro-task
- Discovering blockers
- Before committing (end session)

**Contains:**

- Current micro-task (more granular than TASKS.md)
- Working files and their status
- Immediate next actions
- Blockers or decisions needed
- Quality check status

**Does NOT replace TASKS.md** - use both:

- TASKS.md = Overall project progress
- SESSION.md = Current session context

**See [SESSION_GUIDE.md](../../docs/SESSION_GUIDE.md) for full details.**

---

## File Locations

| File                | Purpose                      |
| ------------------- | ---------------------------- |
| `docs/TASKS.md`     | Feature implementation tasks |
| `docs/TDD_TASKS.md` | Testing tasks                |
| `CHANGELOG.md`      | Change log                   |
| `AGENTS.md`         | Project overview & status    |
| `SESSION.md`        | Session continuity           |
| `docs/GIT.md`       | Git workflow details         |

---

## Workflow Summary (HARD ENFORCEMENT)

**For task management (starting, completing, planning tasks), use `cjcrsg-task-manager` skill.**

**For documentation formatting and updates (ALL MANDATORY):**

1. **AGENTS.md updates** (REQUIRED for **EVERY** task - NO EXCEPTIONS)
   - Add capability to "Current Capabilities" section
   - Even small changes need documentation
   - Never skip this file

2. **CHANGELOG.md** (REQUIRED for user-facing changes)
   - Add to [Unreleased] section
   - Follow category rules
   - Be specific and detailed

3. **SESSION.md** (REQUIRED every session)
   - Update at start and end
   - Track current micro-task
   - Note blockers and decisions

4. **TASKS.md** (REQUIRED for feature/bug work)
   - Use `cjcrsg-task-manager` to update "Current Session"
   - Mark tasks complete with ✅
   - Follow naming convention: `Task X.Y: Name`

5. **TDD_TASKS.md** (REQUIRED for testing work)
   - Update "Current Progress" section
   - Track test counts and status

**ALL documentation must be updated BEFORE committing.**

**NO EXCEPTIONS. NO "SMALL CHANGES". NO "I'LL UPDATE LATER".**

---

\_Last Updated: 2026-04-03
