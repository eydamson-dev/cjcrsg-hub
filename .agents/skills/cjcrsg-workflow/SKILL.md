---
name: cjcrsg-git-workflow
description: [DEPRECATED] This skill has been split into smaller, focused skills. Use cjcrsg-git-conventions, cjcrsg-pre-commit, cjcrsg-docs-workflow, cjcrsg-testing-workflow, or cjcrsg-dev-workflow instead.
---

# ⚠️ DEPRECATED

This skill has been split into 5 separate, focused skills:

## Use These Skills Instead:

| Old Section                      | New Skill                   | Purpose             |
| -------------------------------- | --------------------------- | ------------------- |
| Branch naming, commit messages   | **cjcrsg-git-conventions**  | Git standards       |
| Pre-commit checklist             | **cjcrsg-pre-commit**       | Quality gates       |
| TASKS.md, CHANGELOG.md updates   | **cjcrsg-docs-workflow**    | Documentation       |
| Test requirements                | **cjcrsg-testing-workflow** | Testing workflow    |
| Implementation-First methodology | **cjcrsg-dev-workflow**     | Development process |

---

## Migration Guide

### Before (using this skill):

```
Use cjcrsg-git-workflow for:
- Creating branches
- Writing commits
- Pre-commit checks
- Updating docs
- Testing workflow
```

### After (using specific skills):

```
Use cjcrsg-git-conventions for:
- Branch naming patterns
- Commit message format
- Git commands

Use cjcrsg-pre-commit for:
- Quality checklist
- Lint/typecheck enforcement
- Test requirements before commit

Use cjcrsg-docs-workflow for:
- Updating TASKS.md
- Updating TDD_TASKS.md
- Adding CHANGELOG entries

Use cjcrsg-testing-workflow for:
- Deciding what to test
- Test file locations
- Running test suites

Use cjcrsg-dev-workflow for:
- Implementation-First approach
- Feature development workflow
- Bug fix workflow
```

---

\_Last Updated: 2026-03-21
**Status:** DEPRECATED - Use specific skills above
