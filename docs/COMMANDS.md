# Common Commands Reference

Quick reference for all CLI commands used in the project.

---

## Project Setup

```bash
# Initialize shadcn/ui (requires canary for TanStack Start)
pnpm dlx shadcn@canary init

# Install Convex Auth packages
pnpm add @convex-dev/auth @auth/core@0.37.0

# Initialize Convex Auth (sets up tables and config)
npx @convex-dev/auth

# Add shadcn components
pnpm dlx shadcn@canary add button card input form dialog table badge
pnpm dlx shadcn@canary add select date-picker tabs toast command tabs
```

---

## Development

```bash
# Start development server (runs both Vite + Convex)
pnpm dev

# Build for production
pnpm build

# Type check in watch mode
pnpm dev:ts

# Format code with Prettier
pnpm format

# Run ESLint
pnpm lint
```

---

## Convex CLI

```bash
# Start convex dev server (local development mode)
pnpm dlx convex dev

# Run once and exit (useful for CI/CD)
pnpm dlx convex dev --once

# Deploy to production (cloud)
pnpm dlx convex deploy

# Open convex dashboard (local or cloud)
pnpm dlx convex dashboard

# Run specific query for testing
pnpm dlx convex run attendees/list

# View logs
pnpm dlx convex logs

# Check deployment status
pnpm dlx convex status

# Generate schema types
pnpm dlx convex dev --once
```

**Debug Mode:**

```bash
# Enable Convex debug logging
DEBUG=convex:* pnpm dev
```

---

## Git Operations

```bash
# Create new feature branch
git checkout -b feature/descriptive-name

# Check status
git status

# Stage changes
git add .

# Commit with conventional message
git commit -m "feat: descriptive message"

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

## Testing & Debugging

```bash
# Type check project
pnpm dev:ts

# Lint check
pnpm lint

# Format check
pnpm format

# Run dev server with debug
DEBUG=convex:* pnpm dev
```

---

## Environment Setup

```bash
# Create environment file
cp .env.example .env.local

# Generate secret for auth (Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Useful Aliases (Optional)

Add to your shell profile (`.bashrc`, `.zshrc`, etc.):

```bash
# Convex aliases
alias cdv='pnpm dlx convex dev'
alias cdash='pnpm dlx convex dashboard'
alias cdep='pnpm dlx convex deploy'

# Development aliases
alias pdev='pnpm dev'
alias pbuild='pnpm build'
alias plint='pnpm lint'
alias pformat='pnpm format'
```

---

_Last Updated: 2026-03-20_
