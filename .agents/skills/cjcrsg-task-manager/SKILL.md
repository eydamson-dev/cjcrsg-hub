---
name: cjcrsg-task-manager
description: Task management for CJCRSG-Hub. Manages TASKS.md and TDD_TASKS.md with standardized naming, planning mode, and Current Session tracking. Use when starting tasks, completing tasks, planning phases, or checking project status.
---

# CJCRSG Task Manager

Manages project tasks with standardized naming conventions and collaborative planning.

## When to Use This Skill

- Starting a new task
- Completing a task
- Planning a new phase/feature
- Checking current status
- Creating tasks
- Asking "what's next?"

---

## Standard Naming Convention

**Strictly enforced format:**

```
Phase X: Name              (main sections)
Task X.Y: Name             (individual tasks)
```

**Examples:**

- ✅ `Phase 14: Attendance Reporting`
- ✅ `Task 14.1: Create database schema`
- ❌ `Phase 14.1` (use Task for sub-items)
- ❌ `Task 14` (must have decimal: Task 14.1)

**Status emojis:**

- ⏳ Pending
- 🚧 In Progress
- ✅ Complete

---

## Commands

### 1. Show Status

**Usage:** `show tasks`, `what's next?`, `status`

**Behavior:**

- Shows latest completed task
- Shows next task (from Current Session or Next Up)
- Indicates which file to update (TASKS.md vs TDD_TASKS.md)

**Example output:**

```
Latest Completed: ✅ Phase 13: Spiritual Retreat Enhancement

Next Up:
⏳ Phase 14: Attendance Reporting & Analytics
   - Task 14.1: Create database schema

Work Type: Feature work → Update TASKS.md
```

---

### 2. Start Task

**Usage:** `start task`, `start working`

**Behavior:**

1. Reads latest task from appropriate file
2. Suggests next task
3. Shows preview
4. On confirm: Creates Current Session header

**Current Session Header Format:**

```markdown
**Updated:** 2026-03-31

**Phase:** Phase 14 - Attendance Reporting - In Progress  
**Current Task:** Task 14.1 - Create database schema  
**Status:** 🚧 In Progress

**Recently Completed:**

- Phase 13: Spiritual Retreat Enhancement
```

---

### 3. Create Task

**Usage:** `create task`

**Behavior:**

1. Asks for task name
2. Auto-detects work type (asks to confirm)
3. Suggests next task number
4. Generates standardized format
5. Shows preview
6. On confirm: Adds to appropriate section

**Example:**

```
Task name: Create attendance export

Work type:
1. Feature work (TASKS.md)
2. Testing/TDD work (TDD_TASKS.md)
[Select 1]

Next available: Task 14.2

Create:
### Task 14.2: Create attendance export
**Time:** 2 hours
**Files:** `convex/attendance/mutations.ts`

[Confirm / Edit / Cancel]
```

---

### 4. Task Complete

**Usage:** `task complete`, `done`, `finished`

**Behavior:**

1. Reads Current Session
2. Moves task to "Recently Completed" (compressed to phase name only)
3. Clears Current Session
4. Shows next task suggestion

**Compression Rule:**
Keep only phase name, not individual tasks:

```markdown
**Recently Completed:**

- Phase 13: Spiritual Retreat Enhancement
- Phase 12: Spiritual Retreat Page
```

---

### 5. Plan Phase

**Usage:** `plan phase X: Name`, `create plan`

**Behavior:**

1. When all tasks complete, can suggest features
2. Collaborative breakdown (asks what to include)
3. Auto-suggests based on patterns
4. Always orders: UI first, but maintains dependencies
5. Generates tasks in both locations

**Full Flow:**

**Step 1: Feature Suggestion (when no active tasks)**

```
All phases complete! Here are potential next features:

📊 ANALYTICS & REPORTING
1. Attendance Reporting & Analytics
   - Monthly/weekly trends, export to CSV
   Estimated: 10-12 hours

2. Dashboard Statistics Widgets
   - Quick stats cards on homepage
   Estimated: 6-8 hours

🏛️ EVENT TYPES
3. Youth Group Management
   - Age-based grouping, parent tracking
   Estimated: 8-10 hours

Which feature? (Enter number or describe custom)
```

**Step 2: Collaborative Planning**

```
You: Let's do #1

AI: Planning Phase 14: Attendance Reporting & Analytics

What should this include? I'll suggest:

💡 SUGGESTED BREAKDOWN:
1. Task 14.1: Dashboard UI components (UI First)
2. Task 14.2: Backend queries (depends on UI needs)
3. Task 14.3: Database schema (foundation)
4. Task 14.4: Export to CSV functionality
5. Task 14.5: Date range filtering

Note: Ordering UI first, but schema/query dependencies are noted.

Add, remove, or modify?
```

**Step 3: Handle Custom Requests**

```
You: Add monthly summaries and email reports

AI: Updated plan:
1. Task 14.1: Dashboard UI components
2. Task 14.2: Backend queries
3. Task 14.3: Database schema
4. Task 14.4: Export to CSV
5. Task 14.5: Monthly summary reports (NEW)
6. Task 14.6: Email report functionality (NEW)
7. Task 14.7: Date range filtering

Create this plan?
[Confirm / Edit / Cancel]
```

**Step 4: Generate (Option C - Hybrid)**

**A. Update "## Next Up" (top of file):**

```markdown
**Next Up:**

- ⏳ Phase 14: Attendance Reporting & Analytics (Planned)
  - Task 14.1: Dashboard UI components
  - Task 14.2: Backend queries
  - Task 14.3: Database schema
  - Task 14.4: Export to CSV
  - Task 14.5: Monthly summary reports
  - Task 14.6: Email report functionality
  - Task 14.7: Date range filtering
```

**B. Create "## Phase 14" section:**

```markdown
## Phase 14: Attendance Reporting & Analytics

### Task 14.1: Dashboard UI Components

**Time:** 3 hours  
**Files:** `src/features/attendance/components/ReportDashboard.tsx`  
**Description:** Create dashboard layout and chart components

### Task 14.2: Backend Queries

**Time:** 2 hours  
**Files:** `convex/attendance/queries.ts`  
**Description:** Implement getAttendanceStats, getMonthlySummaries

### Task 14.3: Database Schema

**Time:** 1 hour  
**Files:** `convex/schema.ts`  
**Description:** Add report tables and indexes

**Status:** ⏳ Planned  
**Total Time:** ~12 hours
```

---

## File Path Suggestions

Auto-suggest based on task keywords:

| Task Contains                            | Suggested Path                                 |
| ---------------------------------------- | ---------------------------------------------- |
| "schema", "table", "index"               | `convex/schema.ts`                             |
| "query", "get", "list", "search"         | `convex/[feature]/queries.ts`                  |
| "mutation", "create", "update", "delete" | `convex/[feature]/mutations.ts`                |
| "component", "UI", "page", "modal"       | `src/features/[feature]/components/[Name].tsx` |
| "test", "spec"                           | `tests/unit/[type]/[name].test.ts`             |
| "hook", "use"                            | `src/features/[feature]/hooks/use[Name].ts`    |
| "e2e", "integration"                     | `tests/e2e/specs/[name].spec.ts`               |

---

## Work Type Detection

Auto-detects which file to update:

- **Default:** Feature work → `TASKS.md`
- **Keywords:** test, spec, e2e, unit test, TDD → `TDD_TASKS.md`

User can override: "Create in TDD_TASKS.md"

---

## Dependency Ordering with UI-First

**Rule:** Order tasks UI-first, but flag dependencies.

**Example ordering:**

```
1. Task 14.1: Dashboard UI components (UI First)
2. Task 14.2: Backend queries (⚠️ Needed by UI)
3. Task 14.3: Database schema (⚠️ Foundation)
4. Task 14.4: Export functionality
```

**Note:** UI-first doesn't mean UI is implemented first. It means:

- UI task comes first in the list
- But you can work on dependencies in parallel
- Or implement backend first if preferred

---

## AGENTS.md Integration

AGENTS.md stays separate. Only reference:

```markdown
See [docs/TASKS.md](docs/TASKS.md) for feature tasks.
See [docs/TDD_TASKS.md](docs/TDD_TASKS.md) for testing tasks.
```

Do NOT update AGENTS.md Current Session. Keep it as high-level status only.

---

## Quick Reference

```
show tasks          → What's done and what's next
start task          → Begin working on next task
create task         → Add single task
task complete       → Finish current task
plan phase          → Collaborative planning mode
plan phase X: Name  → Plan specific phase
```

---

\_Last Updated: 2026-03-31
