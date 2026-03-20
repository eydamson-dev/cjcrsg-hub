# Quick Reference

Essential commands, file locations, and quick tips.

---

## Essential Commands

### Development

```bash
# Start dev server (runs both Vite + Convex)
pnpm dev

# Type check in watch mode
pnpm dev:ts

# Build for production
pnpm build

# Run ESLint
pnpm lint

# Format with Prettier
pnpm format
```

### Convex

```bash
# Start Convex local dev
pnpm dlx convex dev

# Run once and exit
pnpm dlx convex dev --once

# Open dashboard
pnpm dlx convex dashboard

# Deploy to production
pnpm dlx convex deploy

# Check status
pnpm dlx convex status

# View logs
pnpm dlx convex logs
```

### shadcn/ui

```bash
# Initialize (already done)
pnpm dlx shadcn@canary init

# Add component
pnpm dlx shadcn@canary add button

# Add multiple components
pnpm dlx shadcn@canary add card input form dialog

# Reinstall (overwrite)
pnpm dlx shadcn@canary add button --overwrite
```

### Git

```bash
# Create feature branch
git checkout -b feature/name

# Check status
git status

# Stage all
git add .

# Commit
git commit -m "feat: description"

# Push (first time)
git push -u origin feature/name

# Push updates
git push

# Pull updates
git checkout main
git pull origin main
```

---

## Important File Locations

### Configuration

| File                    | Purpose                         |
| ----------------------- | ------------------------------- |
| `convex/schema.ts`      | Database schema definition      |
| `convex/auth.config.ts` | Convex Auth configuration       |
| `src/router.tsx`        | TanStack Router setup           |
| `src/routes/__root.tsx` | Root layout and providers       |
| `src/styles/app.css`    | Global styles and CSS variables |
| `vite.config.ts`        | Vite configuration              |
| `tsconfig.json`         | TypeScript configuration        |
| `package.json`          | Dependencies and scripts        |

### Environment

| File           | Purpose                     |
| -------------- | --------------------------- |
| `.env.local`   | Local environment variables |
| `.env.example` | Template for env vars       |

### Documentation

| File                      | Purpose                          |
| ------------------------- | -------------------------------- |
| `AGENTS.md`               | Project overview and quick links |
| `README.md`               | Project description for GitHub   |
| `docs/TASKS.md`           | Implementation checklist         |
| `docs/COMMANDS.md`        | All CLI commands                 |
| `docs/CONVENTIONS.md`     | Code standards                   |
| `docs/GIT.md`             | Git workflow                     |
| `docs/TESTING.md`         | Testing strategy                 |
| `docs/TROUBLESHOOTING.md` | Common issues                    |

### Skills

| File                                            | Purpose                 |
| ----------------------------------------------- | ----------------------- |
| `.agents/skills/cjcrsg-hub/SKILL.md`            | Main skill entry point  |
| `.agents/skills/cjcrsg-hub/project-overview.md` | Tech stack details      |
| `.agents/skills/cjcrsg-hub/architecture.md`     | Folder structure        |
| `.agents/skills/cjcrsg-hub/database.md`         | Schema reference        |
| `.agents/skills/cjcrsg-hub/conventions.md`      | Code conventions        |
| `.agents/skills/cjcrsg-hub/ui-patterns.md`      | shadcn/ui patterns      |
| `.agents/skills/cjcrsg-hub/convex-patterns.md`  | Convex patterns         |
| `.agents/skills/cjcrsg-hub/common-tasks.md`     | How-to guides           |
| `.agents/skills/shadcn/`                        | shadcn skill (separate) |

---

## Tech Stack Versions

| Technology     | Version | Command          |
| -------------- | ------- | ---------------- |
| Node.js        | 18+     | `node -v`        |
| pnpm           | latest  | `pnpm -v`        |
| TanStack Start | latest  | See package.json |
| Convex         | 1.33.1+ | See package.json |
| React          | 19.2.4+ | See package.json |
| TypeScript     | 5.9.3+  | See package.json |
| Tailwind CSS   | v4      | See package.json |

---

## Environment Variables

### Local Development (.env.local)

```env
# Convex
VITE_CONVEX_URL=http://127.0.0.1:3210

# Note: OAuth credentials are configured in Convex dashboard
# (Google, Facebook client IDs/secrets are server-side)
```

### Production

```env
VITE_CONVEX_URL=https://your-project.convex.cloud
```

---

## Quick Tips

### Workflow Reminders

- ✅ Use `pnpm` (never npm)
- ✅ Test before asking to commit
- ✅ Create feature branches
- ✅ Wait for user approval before committing
- ✅ Run `pnpm lint` before commits
- ✅ Check TypeScript with `pnpm dev:ts`

### Performance

- Use indexes for filtered queries
- Paginate large lists (don't `collect()` everything)
- Use `useMemo` for expensive calculations
- Debounce search inputs (300ms)

### Debugging

- Check browser console first
- Use `DEBUG=convex:* pnpm dev` for verbose logs
- Open Convex dashboard to inspect data
- Use React DevTools for component debugging

### Mobile-First

- Test on mobile viewport (375px)
- Use responsive classes (md:, lg:)
- Ensure touch targets are large enough (44px min)
- Test with on-screen keyboard open

---

## Common File Templates

### New Convex Query

```typescript
import { query } from './_generated/server'
import { v } from 'convex/values'

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('table').collect()
  },
})
```

### New Route

```typescript
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/route-name')({
  component: Component,
});

function Component() {
  return <div>Content</div>;
}
```

### New Component

```typescript
interface Props {
  // props here
}

export function Component({}: Props) {
  return <div>Content</div>;
}
```

---

## Links & Resources

### Project Docs

- [AGENTS.md](../../AGENTS.md) - Main entry point
- [README.md](../../README.md) - GitHub description
- [TASKS.md](../../docs/TASKS.md) - Implementation checklist
- [COMMANDS.md](../../docs/COMMANDS.md) - All commands
- [CONVENTIONS.md](../../docs/CONVENTIONS.md) - Code standards
- [GIT.md](../../docs/GIT.md) - Git workflow

### External Docs

- [TanStack Start](https://tanstack.com/start/latest)
- [Convex Docs](https://docs.convex.dev)
- [shadcn/ui](https://ui.shadcn.com)
- [Convex Auth](https://labs.convex.dev/auth/setup)

### Community

- [Convex Discord](https://convex.dev/community)
- [TanStack Discord](https://discord.gg/tanstack)

---

## Session Context

**Current Phase:** Phase 1 - Foundation Setup  
**Next Task:** Initialize shadcn/ui with canary version  
**Status:** Ready to start

**Recent Updates:**

- ✅ Git repository configured
- ✅ All documentation reorganized
- ✅ Convex Auth selected (Password + Google + Facebook)
- ✅ shadcn skill and MCP configured
- ✅ CJCRSG-Hub custom skill created

---

_Last Updated: 2026-03-20_
