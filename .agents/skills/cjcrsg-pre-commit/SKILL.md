---
name: cjcrsg-pre-commit
description: Pre-commit quality checklist and enforcement rules for CJCRSG-Hub. Use before committing changes to ensure code quality, test coverage, and documentation updates are complete.
---

# CJCRSG Pre-Commit Checklist

Quality gates and enforcement rules before every commit.

## When to Use This Skill

- Before committing changes
- Running quality checks
- Verifying code standards
- Preparing for code review

---

## Pre-Commit Checklist

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

---

## Quality Checks

```bash
# Run all quality checks
pnpm lint              # ESLint - must pass
pnpm dev:ts            # TypeScript check - must pass
pnpm test              # Tests - must pass (138 tests)
```

---

## Enforcement Rules

### Before Committing, Verify:

1. **Branch name** follows convention (`feature/`, `fix/`, `docs/`, `refactor/`)
2. **Quality checks** pass (lint, typecheck, tests)
3. **Test coverage** for new features (if required)
4. **Documentation updates**:
   - CHANGELOG.md updated for user-facing changes
   - TASKS.md or TDD_TASKS.md updated
   - Current Session section reflects current status
5. **Commit message** follows convention
6. **No console.logs** (unless debugging)
7. **Manual testing** completed

---

## Exception Handling

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

\_Last Updated: 2026-03-21
