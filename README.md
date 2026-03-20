# CJCRSG-Hub

A modern church management system built with TanStack Start, Convex, and shadcn/ui. Manage church attendees, events, and attendance tracking with ease.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Tech](https://img.shields.io/badge/stack-TanStack%20Start%20%2B%20Convex-green)

## Features

### Core Modules

- **Attendee Management** 👥
  - Register and manage church members and visitors
  - Search by name, email, or phone
  - Track membership status and personal details
  - View attendance history per attendee

- **Event Management** 📅
  - Create and manage church events
  - Dynamic event types (Sunday Service, Retreat, Youth Events, etc.)
  - Schedule events with dates, times, and locations
  - Color-coded event types for easy visual identification

- **Attendance Tracking** ✓
  - Real-time attendance recording
  - Quick check-in interface
  - Search and select attendees rapidly
  - View attendance statistics and reports
  - Export attendance data

### Additional Features

- **Admin Authentication** 🔐
  - Secure login with Convex Auth (Password + Google + Facebook)
  - Protected routes for admin-only access
  - Session management

- **Responsive Design** 📱
  - Mobile-friendly interface
  - Works on tablets and desktops
  - Optimized for church check-in workflows

## Tech Stack

| Category             | Technology                           |
| -------------------- | ------------------------------------ |
| **Frontend**         | TanStack Start (React)               |
| **Backend**          | Convex (Database + Server Functions) |
| **Authentication**   | Convex Auth (Password + OAuth)       |
| **UI Components**    | shadcn/ui                            |
| **Styling**          | Tailwind CSS v4                      |
| **State Management** | TanStack Query + Convex React Query  |
| **Package Manager**  | pnpm                                 |

### Development Tools & AI

This project uses **OpenCode** with AI-assisted development tools:

- **shadcn MCP** - AI assistant for shadcn/ui component management
- **shadcn/ui Skill** - Comprehensive shadcn/ui knowledge base (`.agents/skills/shadcn/`)

See [AGENTS.md](AGENTS.md) for detailed configuration.

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm (npm install -g pnpm)
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone git@github.com:eydamson-dev/cjcrsg-hub.git
   cd cjcrsg-hub
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Setup environment variables**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

4. **Start the development server**

   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to http://localhost:3000

## Development

### Local Development with Convex

We use Convex's local development mode for rapid prototyping:

```bash
# Start Convex in local mode
pnpm dlx convex dev

# The dev server runs both Vite and Convex
pnpm dev
```

### Project Structure

```
cjcrsg-hub/
├── src/
│   ├── features/           # Feature-based modules
│   │   ├── attendees/     # Attendee management
│   │   ├── events/        # Event management
│   │   ├── attendance/    # Attendance tracking
│   │   └── auth/          # Authentication
│   ├── components/        # Shared UI components
│   ├── lib/              # Utilities
│   └── routes/           # TanStack Router routes
├── convex/               # Convex backend
│   ├── schema.ts        # Database schema
│   ├── attendees/       # Attendee queries/mutations
│   ├── events/          # Event queries/mutations
│   └── attendance/      # Attendance queries/mutations
└── public/              # Static assets
```

### Adding shadcn Components

```bash
pnpm dlx shadcn@canary add button
pnpm dlx shadcn@canary add table
# etc...
```

### Convex Commands

```bash
# Start local dev server
pnpm dlx convex dev

# Open dashboard
pnpm dlx convex dashboard

# Deploy to production
pnpm dlx convex deploy

# Run a specific query
pnpm dlx convex run attendees/list
```

## Database Schema

### Core Tables

#### attendees

```typescript
{
  _id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  dateOfBirth?: number
  address?: string
  status: 'member' | 'visitor' | 'inactive'
  joinDate?: number
  notes?: string
  createdAt: number
  updatedAt: number
}
```

#### events

```typescript
{
  _id: string
  name: string
  eventTypeId: string
  description?: string
  date: number
  startTime?: string
  endTime?: string
  location?: string
  isActive: boolean
  createdAt: number
}
```

#### attendance_records

```typescript
{
  _id: string
  eventId: string
  attendeeId: string
  checkedInAt: number
  checkedInBy: string
  notes?: string
}
```

## Scripts

| Command       | Description               |
| ------------- | ------------------------- |
| `pnpm dev`    | Start development server  |
| `pnpm build`  | Build for production      |
| `pnpm dev:ts` | Type check in watch mode  |
| `pnpm format` | Format code with Prettier |
| `pnpm lint`   | Run ESLint                |

## Roadmap

### Phase 1: Foundation ✓

- [x] Project setup
- [x] Documentation (AGENTS.md)
- [ ] shadcn/ui initialization
- [ ] Convex Auth setup (Password + Google + Facebook)
- [ ] Base layout and navigation

### Phase 2: Attendee Management

- [ ] Attendee CRUD operations
- [ ] Search and filter functionality
- [ ] Attendee profile pages

### Phase 3: Events

- [ ] Event types management
- [ ] Event creation and scheduling
- [ ] Event list and detail views

### Phase 4: Attendance Tracking

- [ ] Real-time check-in interface
- [ ] Attendance reporting
- [ ] Export functionality

### Phase 5: Dashboard & Polish

- [ ] Admin dashboard with statistics
- [ ] Toast notifications
- [ ] Mobile optimization

## Contributing

We use a branch-based workflow with pull requests:

1. Create a feature branch: `git checkout -b feature/name`
2. Make your changes
3. Test locally: `pnpm dev`
4. Create a PR on GitHub
5. Wait for review and approval

See [AGENTS.md](./AGENTS.md) for detailed workflow documentation.

## License

MIT License - feel free to use for your church!

## Support

- 📖 [TanStack Start Docs](https://tanstack.com/start/latest)
- 📖 [Convex Docs](https://docs.convex.dev)
- 📖 [shadcn/ui Docs](https://ui.shadcn.com)
- 💬 Create an issue for bugs or feature requests

---

Built with ❤️ for the church community
