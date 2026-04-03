---
name: cjcrsg-dev-workflow
description: Development workflow methodology for CJCRSG-Hub including Implementation-First approach and feature/bug development patterns. Use when implementing new features or fixing bugs to follow the established development process. HARD BLOCK on manual testing approval.
---

# CJCRSG Development Workflow

Development methodology and **MANDATORY WORKFLOWS** with hard enforcement on documentation and manual testing.

## When to Use This Skill

- Starting new features
- Implementing bug fixes
- Following development methodology
- Planning implementation approach
- **Ensuring workflow compliance**

---

## 🚨 MANDATORY: User Approval Required

**⚠️ CRITICAL: I MUST WAIT FOR YOUR APPROVAL BEFORE COMMITTING ⚠️**

### The Workflow

```
IMPLEMENT → MANUAL TEST → USER APPROVAL → UPDATE DOCS → COMMIT
     ↑___________________________|
```

**I will NOT commit until you explicitly approve using one of these commands:**

| Your Command             | My Action            |
| ------------------------ | -------------------- |
| `tested, good to commit` | ✅ Proceed to commit |
| `LGTM`                   | ✅ Proceed to commit |
| `approved`               | ✅ Proceed to commit |
| `commit it`              | ✅ Proceed to commit |
| `looks good`             | ✅ Proceed to commit |
| `works, commit`          | ✅ Proceed to commit |
| `ok` / `okay`            | ✅ Proceed to commit |
| `yes` / `y`              | ✅ Proceed to commit |
| `go ahead`               | ✅ Proceed to commit |

**If you say anything else, I will ask for clarification.**

---

## 🚨 MANDATORY: Documentation Updates

**EVERY task requires updating AGENTS.md and other docs.**

### Documentation Requirements (HARD BLOCK)

| File             | Required For        | Update What                              |
| ---------------- | ------------------- | ---------------------------------------- |
| **AGENTS.md**    | **EVERY TASK**      | Add capability to "Current Capabilities" |
| **CHANGELOG.md** | User-facing changes | Add entry under [Unreleased]             |
| **SESSION.md**   | Every session       | Current state, completed items           |
| **TASKS.md**     | Feature/bug work    | Mark task complete                       |
| **TDD_TASKS.md** | Testing work        | Test progress                            |

**NO EXCEPTIONS. NO "SMALL CHANGES". ALL TASKS REQUIRE DOCS.**

---

## Session Continuity

**Always read SESSION.md before starting work** to understand:

- What was just completed
- What's in progress
- Immediate next actions
- Any blockers

**Update SESSION.md at session start and end** for continuity between AI conversations.

**See [SESSION.md](../../docs/SESSION.md) for details.**

---

## Implementation-First Workflow (With HARD STOPS)

### Step 0: START SESSION (Before Any Work)

1. **Read SESSION.md** (if exists) to understand:
   - What was just completed
   - What's in progress
   - Immediate next actions
   - Any blockers

2. **Update SESSION.md:**
   - Set session start timestamp
   - Define current micro-task
   - List working files with status
   - Note any blockers
   - Link to relevant TASKS.md section

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
- **Wait for user to test**

### Step 3: REQUEST APPROVAL (HARD STOP)

**I MUST say:**

```
"Task complete. I've tested it and it works. Ready for your manual testing.
Please test and confirm with: 'tested, good to commit' or 'LGTM'"
```

**Then I WAIT. No commit until you approve.**

### Step 4: UPDATE DOCUMENTATION (HARD STOP)

After your approval:

1. **Update AGENTS.md** (MANDATORY):

   ```markdown
   - **Feature name:** Brief description
   ```

2. **Update CHANGELOG.md** (if user-facing):

   ```markdown
   ### Added

   - **Phase X Task X.X: Task Name** - Description
   ```

3. **Update SESSION.md**:
   - Mark completed
   - Update status

4. **Update TASKS.md**:
   - Mark task ✅ Complete

### Step 5: QUALITY CHECKS

Run all checks:

```bash
pnpm lint        # ESLint - must pass
pnpm dev:ts      # TypeScript - must pass
pnpm test        # Tests - must pass
```

### Step 6: END SESSION & COMMIT (After Approval)

Only after all of the above:

1. **Final SESSION.md update**
2. **Commit with message:**

   ```bash
   git commit -m "feat: task description

   - Change 1
   - Change 2
   - Update AGENTS.md
   - Update CHANGELOG.md"
   ```

3. **Push to remote**

---

## Feature Development Workflow (With Enforcement)

```bash
# 1. Create branch
git checkout -b feature/event-types

# 2. Implement
# Write code in convex/, src/features/
pnpm dev

# 3. Manual testing
# Verify in browser
# → WAIT FOR USER APPROVAL ←

# 4. Update docs (ALL REQUIRED)
# AGENTS.md - Add capability
# CHANGELOG.md - Add entry
# SESSION.md - Update state
# TASKS.md - Mark complete

# 5. Quality checks
pnpm lint && pnpm dev:ts && pnpm test

# 6. Commit (ONLY after approval)
git add .
git commit -m "feat: implement event type CRUD operations

- Add create, update, delete mutations
- Add list and getById queries
- Update AGENTS.md
- Update CHANGELOG.md"

# 7. Push
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
# → WAIT FOR USER APPROVAL ←

# 4. Update docs
# CHANGELOG.md under ### Fixed
# AGENTS.md (if needed)

# 5. Quality checks
pnpm lint && pnpm dev:ts && pnpm test

# 6. Commit (ONLY after approval)
git commit -m "fix: resolve attendee search with special characters

- Fix regex pattern in search query
- Update CHANGELOG.md"

# 7. Push
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

**PLUS: Hard enforcement ensures:**

- ✅ Nothing commits without your approval
- ✅ All documentation stays current
- ✅ Quality checks always pass
- ✅ You control the pace

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

## Workflow Enforcement Summary

**I will:**

1. ✅ **Implement** the feature
2. ✅ **Test** manually (`pnpm dev`)
3. ✅ **Notify you** and wait for approval
4. ✅ **Update ALL docs** (AGENTS.md mandatory)
5. ✅ **Run quality checks**
6. ✅ **Only commit after your explicit approval**

**I will NOT:**

- ❌ Commit without your approval
- ❌ Skip documentation updates
- ❌ Commit "small changes" without docs
- ❌ Assume "looks good" means approval
- ❌ Rush to commit before testing

---

\_Last Updated: 2026-04-03
