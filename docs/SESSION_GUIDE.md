# SESSION.md Guide

Session continuity tracking for CJCRSG-Hub development.

---

## What is SESSION.md?

A lightweight, single-file snapshot that captures **immediate session context** for when an AI agent (or you) returns to the project.

**Think of it as:** "What was I _just_ working on?"

---

## How It Differs from TASKS.md

| File             | Purpose                  | Granularity           | Updated When                      |
| ---------------- | ------------------------ | --------------------- | --------------------------------- |
| **TASKS.md**     | Overall project progress | Phase/Task level      | Completing tasks, planning phases |
| **SESSION.md**   | Current session context  | Micro-task/File level | Every session start/end           |
| **TDD_TASKS.md** | Testing progress         | Test level            | Test work                         |
| **AGENTS.md**    | Project overview         | High-level status     | Phase completion                  |

**Example:**

- **TASKS.md**: "Task 15.4: Update Sunday Service Page"
- **SESSION.md**: "Currently modifying events.sunday-service.tsx, need to add isCreating state, next: read current implementation"

---

## When to Update SESSION.md

### At Session Start

- Set session timestamp
- Define current micro-task
- List files being worked on
- Note any blockers from last session

### During Work

- Mark files as ✅ Complete or 🔄 In Progress
- Note blockers discovered
- Update immediate next actions

### At Session End (Before Commit)

- Update "Last Updated" timestamp
- Mark completed items
- Update file statuses
- Note decisions made
- Update next actions for next session

---

## What to Include

### Required Sections

1. **Session timestamps** - Start and last updated
2. **Current micro-task** - More granular than TASKS.md
3. **Working files** - With status (✅ Ready, 🔄 In Progress, ⏳ Pending)
4. **Immediate next actions** - Numbered list of what to do next

### Optional Sections

- **Session state** - Just completed, in progress, next up
- **Quality status** - Test count, TypeScript errors, lint status
- **Blockers/Decisions** - Any issues or decisions needed
- **Session notes** - Reminders, gotchas, context

---

## Example Workflow

### Starting a Session

1. Read SESSION.md to understand:
   - What was just completed
   - What's in progress
   - Immediate next actions
   - Any blockers

2. Update SESSION.md:
   - Set new session timestamp
   - Update current micro-task if needed
   - Refresh working files list

### During Work

```markdown
## 🛠️ Working Files

| File                                                 | Status         | Notes                  |
| ---------------------------------------------------- | -------------- | ---------------------- |
| `src/routes/events.sunday-service.tsx`               | ✅ Complete    | Added isCreating state |
| `src/features/events/components/EventPageHeader.tsx` | 🔄 In Progress | Integrating into route |
```

### Ending a Session

1. Update SESSION.md with completed items
2. Update TASKS.md (via task manager skill)
3. Update CHANGELOG.md if needed
4. Run quality checks
5. Commit changes

---

## Quick Reference

### File Locations

- **SESSION.md** - docs/SESSION.md
- **TASKS.md** - docs/TASKS.md
- **TDD_TASKS.md** - docs/TDD_TASKS.md
- **AGENTS.md** - Root level

### Related Skills

- `cjcrsg-dev-workflow` - Development methodology
- `cjcrsg-task-manager` - Task tracking
- `cjcrsg-pre-commit` - Quality checklist
- `cjcrsg-docs-workflow` - Documentation workflow

---

_Last Updated: 2026-04-02_
