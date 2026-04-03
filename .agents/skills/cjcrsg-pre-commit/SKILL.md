---
name: cjcrsg-pre-commit
description: Pre-commit quality checklist and enforcement rules for CJCRSG-Hub. Use before committing changes to ensure code quality, test coverage, and documentation updates are complete. HARD BLOCK on documentation and manual testing.
---

# CJCRSG Pre-Commit Checklist

Quality gates and **HARD ENFORCEMENT** rules before every commit. **Commits will be BLOCKED** until all requirements are met.

## When to Use This Skill

- Before committing changes
- Running quality checks
- Verifying code standards
- Preparing for code review
- **This skill enforces mandatory requirements**

---

## 🚨 MANDATORY REQUIREMENTS (HARD BLOCK)

**The following MUST be completed before ANY commit. No exceptions.**

### 1. Manual Testing Approval (HARD BLOCK)

**⚠️ YOU MUST WAIT FOR USER APPROVAL BEFORE COMMITTING ⚠️**

After implementing and testing a task:

1. **Notify user:** "Task complete. Ready for manual testing."
2. **Wait for explicit approval** using one of these commands:
   - `tested, good to commit`
   - `LGTM`
   - `approved`
   - `commit it`
   - `looks good`
   - `works, commit`
3. **Only then proceed** with commit workflow

**DO NOT COMMIT without user approval.** This is a **HARD BLOCK**.

---

### 2. Documentation Updates (HARD BLOCK)

**ALL documentation files MUST be updated before commit.** The following files must be checked and updated if applicable:

| File             | When to Update         | Required?        |
| ---------------- | ---------------------- | ---------------- |
| **AGENTS.md**    | EVERY task/feature/bug | ✅ **MANDATORY** |
| **CHANGELOG.md** | User-facing changes    | ✅ **MANDATORY** |
| **SESSION.md**   | Every session          | ✅ **MANDATORY** |
| **TASKS.md**     | Feature/bug work       | ✅ **MANDATORY** |
| **TDD_TASKS.md** | Testing work           | ✅ **MANDATORY** |

#### Documentation Update Rules:

1. **AGENTS.md** - Update for **EVERY** task:
   - Add new capability to "Current Capabilities" section
   - Update "Next Up" section if priorities change
   - Update status line if phase completes
   - **NO EXCEPTIONS** - Even small features must be documented

2. **CHANGELOG.md** - Add entry under `[Unreleased]`:
   - ### Added: New features
   - ### Changed: Modifications
   - ### Fixed: Bug fixes
   - Be specific and detailed

3. **SESSION.md** - Update session state:
   - What was completed
   - Current status
   - Next actions

4. **TASKS.md** - Update task status:
   - Mark task as complete
   - Update "Current Session" section

---

## Pre-Commit Verification Script

**BEFORE committing, verify ALL of these:**

```markdown
## 🚨 PRE-COMMIT CHECKLIST (All must be ✅)

### Quality Gates

- [ ] `pnpm lint` - no errors
- [ ] `pnpm dev:ts` - no TypeScript errors
- [ ] `pnpm test` - all tests passing
- [ ] No console.log statements (unless debugging)

### Documentation (HARD BLOCK - ALL REQUIRED)

- [ ] **AGENTS.md updated** - New capability documented
- [ ] **CHANGELOG.md updated** - Entry under [Unreleased]
- [ ] **SESSION.md updated** - Session state current
- [ ] **TASKS.md updated** - Task marked complete

### Testing (HARD BLOCK - MUST HAVE APPROVAL)

- [ ] **Code manually tested** (`pnpm dev`)
- [ ] **User approval received** (see approval commands below)

### Code Quality

- [ ] New mutations have tests (if applicable)
- [ ] New queries have tests (if applicable)
- [ ] New shared components have tests (if applicable)
- [ ] Bug fixes include regression test (if applicable)
```

**IF ANY CHECKBOX IS NOT ✅, DO NOT COMMIT.**

---

## User Approval Commands

**I recognize these approval commands from you:**

| Command                  | Meaning                      |
| ------------------------ | ---------------------------- |
| `tested, good to commit` | ✅ Approved for commit       |
| `LGTM`                   | ✅ Looks good to me - commit |
| `approved`               | ✅ Approved - commit         |
| `commit it`              | ✅ Commit the changes        |
| `looks good`             | ✅ Approved - commit         |
| `works, commit`          | ✅ Tested and approved       |
| `ok` / `okay`            | ✅ Approved                  |
| `yes` / `y`              | ✅ Approved                  |
| `go ahead`               | ✅ Approved                  |

**Non-approval responses (require clarification):**

- "not yet" / "not ready" / "wait" → Wait for approval
- "fix X first" / "change Y" → Make changes, then request approval again
- "testing" / "checking" → Wait for user to finish testing

---

## Documentation Quick Guide

### AGENTS.md Updates (MANDATORY for all work)

**Location:** Root level `AGENTS.md`

**What to add to "Current Capabilities":**

```markdown
- **Feature description** - What it does (brief)
```

**Example:**

```markdown
- **Attendee list link status:** User Account column, link filter, quick stats (admin only)
```

### CHANGELOG.md Updates (MANDATORY for user-facing changes)

**Location:** Root level `CHANGELOG.md`

**Format:**

```markdown
### Added

- **Phase 16 Task X.X: Task Name** - Brief description
  - File/Component - What it does
  - Another component - What it does
```

---

## Exception Handling

**Only these exceptions allow skipping requirements:**

```bash
# Work-in-progress / prototype (no commit yet)
# No commit - just exploring code

# Documentation-only commits (docs already updated)
git commit -m "docs: update README formatting"

# Emergency hotfix (user explicitly says [HOTFIX])
git commit -m "fix: critical bug [HOTFIX]"
```

**NOT valid exceptions:**

- ❌ "Small change" - All changes need docs
- ❌ "Just a fix" - Bug fixes need CHANGELOG.md
- ❌ "Will update later" - Update BEFORE commit
- ❌ "Forgot to test" - Test first, then commit

---

## Important: Git CLI vs GitHub CLI

**This project uses native `git` CLI only** - NOT `gh` CLI.

- ✅ Use: `git add`, `git commit`, `git push`, `git checkout -b`
- ❌ Don't use: `gh pr create`, `gh issue create`, `gh repo clone`

**Exception:** You may use `gh` for viewing PRs/issues, but create them via GitHub web UI instead.

---

## Creating Pull Requests

After pushing your branch, create the PR via GitHub web UI:

1. **Push your branch:**

   ```bash
   git push -u origin feature/your-feature-name
   ```

2. **Open GitHub in browser:**
   Navigate to: `https://github.com/eydamson-dev/cjcrsg-hub/pull/new/feature/your-feature-name`

3. **Fill in PR template:**
   - Title: Use conventional commit format (e.g., "feat: add event types management")
   - Description: Summarize changes, link to related issues

4. **Submit PR** via the GitHub web interface.

---

## Quality Checks

```bash
# Run all quality checks
pnpm lint              # ESLint - must pass
pnpm dev:ts            # TypeScript check - must pass
pnpm test              # Tests - must pass
```

---

## Quick Reference

```bash
# Essential quality commands
pnpm lint              # ESLint
pnpm dev:ts            # TypeScript check
pnpm test              # Run all tests

# Git commands
git add .                       # Stage changes
git commit -m "type: message"   # Commit
git push -u origin branch       # Push
```

---

## Enforcement Summary

**I will enforce these rules:**

1. ✅ **Wait for manual testing approval** before committing
2. ✅ **Update AGENTS.md** for every task without exception
3. ✅ **Update CHANGELOG.md** for user-facing changes
4. ✅ **Update SESSION.md** and **TASKS.md** appropriately
5. ✅ **Run all quality checks** before committing
6. ✅ **Ask for user approval** using the specific commands

**No commit without:**

- User approval (manual testing complete)
- All docs updated (AGENTS.md, CHANGELOG.md, SESSION.md, TASKS.md)
- Quality checks passing

---

\_Last Updated: 2026-04-03
