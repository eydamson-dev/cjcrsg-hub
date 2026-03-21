---
name: cjcrsg-git-conventions
description: Git branch naming conventions, commit message format, and basic git commands for CJCRSG-Hub. Use when creating branches, writing commit messages, or performing git operations to ensure consistency with project standards.
---

# CJCRSG Git Conventions

Standards for branch naming and commit messages.

## When to Use This Skill

- Creating new branches
- Writing commit messages
- Performing git operations
- Setting up feature/bug fix branches

---

## Branch Naming Convention

| Type          | Pattern                | Example                     |
| ------------- | ---------------------- | --------------------------- |
| Feature       | `feature/description`  | `feature/attendee-search`   |
| Bug Fix       | `fix/description`      | `fix/login-redirect`        |
| Documentation | `docs/description`     | `docs/update-readme`        |
| Refactor      | `refactor/description` | `refactor/simplify-queries` |

**Rules:**

- Branch names must be lowercase with hyphens
- Use descriptive names (not just "fix-bug")
- Include feature/fix/docs/refactor prefix

---

## Commit Message Convention

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

---

## Common Git Commands

```bash
# Create new feature branch
git checkout -b feature/descriptive-name

# Check status
git status

# Stage changes
git add .

# Commit with conventional message
git commit -m "type: descriptive message"

# Push to remote (first time)
git push -u origin feature-name

# Push updates
git push

# Switch to main and pull updates
git checkout main
git pull origin main

# View commit history
git log --oneline -10
```

---

## Remote Repository

**GitHub URL:** `git@github.com:eydamson-dev/cjcrsg-hub.git`

**Initial Setup:**

```bash
# Add remote (if not already configured)
git remote add origin git@github.com:eydamson-dev/cjcrsg-hub.git

# Verify remote
git remote -v

# First push (set upstream)
git push -u origin main
```

**Note:** We use native git CLI commands, not gh CLI.

---

\_Last Updated: 2026-03-21
