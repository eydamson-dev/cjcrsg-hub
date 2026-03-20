# Git Workflow

Complete guide for version control using Git CLI (not gh CLI).

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

## Branch Strategy

```
main                    # Production-ready code
├── develop            # Integration branch (optional)
│   ├── feature/attendees
│   ├── feature/events
│   ├── feature/attendance
│   └── feature/auth
└── hotfix/...         # Production fixes
```

### Branch Naming Conventions

| Type          | Pattern                | Example                     |
| ------------- | ---------------------- | --------------------------- |
| Feature       | `feature/description`  | `feature/attendee-search`   |
| Bug Fix       | `fix/description`      | `fix/login-redirect`        |
| Documentation | `docs/description`     | `docs/update-readme`        |
| Refactor      | `refactor/description` | `refactor/simplify-queries` |

---

## Commit Message Convention

### Format

```
<type>: <subject>

<body> (optional)

<footer> (optional)
```

### Types

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only changes
- `style:` - Code style changes (formatting, semicolons, etc.)
- `refactor:` - Code changes that neither fix a bug nor add a feature
- `test:` - Adding or correcting tests
- `chore:` - Changes to build process, dependencies, etc.

### Examples

```
feat: add attendee search functionality

fix: resolve event date parsing issue
docs: update API documentation with new endpoints
style: format attendance list component with prettier
refactor: simplify attendance queries using Convex helpers
test: add attendee validation tests
chore: update dependencies to latest versions
```

### Guidelines

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Don't capitalize first letter
- No period at the end
- Keep subject line under 50 characters
- Use body to explain what and why, not how

---

## Development Workflow (Read-Only Mode)

**Important:** I will NOT automatically commit or push changes. Follow this workflow:

### 1. Task Assignment

I create a feature branch for each task:

```bash
git checkout -b feature/descriptive-name
```

### 2. Implementation

I make all code changes on the branch.

### 3. Review & Test

You test the changes locally:

- Run `pnpm dev` to test
- Review the code changes
- Verify everything works as expected

### 3a. Update Changelog

Before committing, update `CHANGELOG.md`:

- Add changes under `[Unreleased]` section
- Follow Keep a Changelog format
- Use categories: Added, Changed, Deprecated, Removed, Fixed, Security

Example:

```markdown
### Added

- Add responsive navigation with sidebar and mobile drawer
```

### 4. Approval

Only after your confirmation ("looks good", "approved", "LGTM", etc.):

- I will stage and commit the changes
- Create a commit with conventional message format:

```bash
git add .
git commit -m "feat: descriptive message"
```

### 5. Pull Request

I push the branch and create a PR:

```bash
git push -u origin feature/descriptive-name
```

Then go to GitHub to create the PR at:
`https://github.com/eydamson-dev/cjcrsg-hub/pull/new/feature/descriptive-name`

### 6. Merge

You manually review and approve the PR on GitHub:

- Go to GitHub repository
- Review the PR
- Click "Merge" when satisfied

### 7. Cleanup

After merge, switch back to main:

```bash
git checkout main
git pull origin main
```

**Note:** I will always ask for confirmation before committing. No changes will be committed without your explicit approval.

---

## Pre-Commit Checklist

Before committing, ensure:

- [ ] Run `pnpm lint` - no errors
- [ ] Run type check - no TypeScript errors
- [ ] Test the feature manually (`pnpm dev`)
- [ ] **Update `CHANGELOG.md`** - add entry under `[Unreleased]`
- [ ] **Update `TASKS.md`** - mark tasks complete or document bug fixes
- [ ] Clear console.log statements
- [ ] Review your own changes (diff)
- [ ] Update AGENTS.md if needed

---

## Changelog Workflow

Every significant change must be documented in `CHANGELOG.md` under the `[Unreleased]` section.

### When to Update Changelog

| Change Type     | Example              | Update Changelog? |
| --------------- | -------------------- | ----------------- |
| New feature     | Add attendee search  | ✅ Required       |
| Bug fix         | Fix login redirect   | ✅ Required       |
| Breaking change | Rename field         | ✅ Required       |
| Documentation   | Update README        | ❌ No             |
| Refactor        | Simplify queries     | ❌ No             |
| Dependencies    | Update packages      | ❌ No             |
| Code style      | Format with prettier | ❌ No             |

### Changelog Update Process

1. **Before committing**, add entry under `[Unreleased]`:

   ```markdown
   ### Added

   - Add attendee search functionality with name and email filters
   ```

2. **Use present tense and imperative mood:**
   - ✅ "Add search functionality"
   - ❌ "Added search functionality"

3. **Be specific and concise:**
   - ✅ "Add Google OAuth authentication"
   - ❌ "Added stuff"

4. **Group related changes** under the same category

### Version Release Process

When releasing a version (e.g., v0.2.0):

1. Replace `[Unreleased]` with version number and date:

   ```markdown
   ## [0.2.0] - 2026-03-25
   ```

2. Add new empty `[Unreleased]` section at top

3. Create git tag:

   ```bash
   git tag -a v0.2.0 -m "Release v0.2.0"
   ```

4. Push tag:

   ```bash
   git push origin v0.2.0
   ```

5. Create GitHub release with changelog content

### Changelog Categories (in order)

1. **Added** - New features
2. **Changed** - Changes to existing functionality
3. **Deprecated** - Features marked for removal
4. **Removed** - Deleted features
5. **Fixed** - Bug fixes
6. **Security** - Security fixes

### Breaking Changes

Mark breaking changes with `[BREAKING]` prefix:

```markdown
### Changed

- [BREAKING] Rename `attendee.status` field to `attendee.membershipStatus`
```

---

## Common Git Commands

### Branch Operations

```bash
# Create and switch to new branch
git checkout -b feature/name

# Switch to existing branch
git checkout branch-name

# List all branches (local and remote)
git branch -a

# Delete local branch (after merge)
git branch -d feature/name

# Force delete branch (if not merged)
git branch -D feature/name
```

### Committing Changes

```bash
# Stage all changes
git add .

# Stage specific file
git add filename.tsx

# Commit with message
git commit -m "feat: add new feature"

# Commit with detailed message
git commit -m "feat: add new feature" -m "Detailed description here"

# Amend last commit (if not pushed)
git commit --amend -m "new message"
```

### Pushing Changes

```bash
# First push on new branch
git push -u origin branch-name

# Push subsequent commits
git push

# Force push (use carefully!)
git push --force-with-lease origin branch-name
```

### Syncing with Remote

```bash
# Fetch latest changes
git fetch origin

# Pull changes into current branch
git pull origin main

# Pull with rebase (cleaner history)
git pull --rebase origin main
```

### Viewing History

```bash
# View commit log
git log

# Compact log
git log --oneline

# Graph view
git log --graph --oneline --all

# Show specific commit
git show commit-hash
```

### Undoing Changes

```bash
# Unstage files
git restore --staged filename

# Discard local changes
git restore filename

# Revert commit (creates new commit)
git revert commit-hash

# Reset to specific commit (destructive!)
git reset --hard commit-hash
```

### Stashing Changes

```bash
# Stash current changes
git stash push -m "work in progress"

# List stashes
git stash list

# Apply latest stash
git stash pop

# Apply specific stash
git stash apply stash@{0}

# Drop stash
git stash drop stash@{0}
```

---

## Resolving Merge Conflicts

When you see "CONFLICT" after pulling or merging:

1. Open conflicted files and look for:

   ```
   <<<<<<< HEAD
   Your changes
   =======
   Incoming changes
   >>>>>>> branch-name
   ```

2. Edit the file to keep desired changes

3. Remove conflict markers

4. Stage and commit:
   ```bash
   git add .
   git commit -m "fix: resolve merge conflict"
   ```

---

## Git Configuration Tips

### Useful Aliases

Add to `~/.gitconfig`:

```ini
[alias]
    st = status
    co = checkout
    br = branch
    ci = commit
    lg = log --graph --oneline --all
    amend = commit --amend --no-edit
    unstage = restore --staged
    last = log -1 HEAD
```

### Line Endings

For cross-platform consistency:

```bash
git config --global core.autocrlf input  # macOS/Linux
git config --global core.autocrlf true     # Windows
```

---

_Last Updated: 2026-03-20_
