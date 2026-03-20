# Project Overview

## What is CJCRSG-Hub?

A modern church management system built for churches to track:

- **Attendees:** Church members, visitors, and their details
- **Events:** Sunday services, retreats, youth events, etc.
- **Attendance:** Who attended which event and when

## Why This Tech Stack?

### TanStack Start

- Modern React framework with file-based routing
- Built on Vite for fast development
- Type-safe routing and data loading
- Server-side rendering support

### Convex

- Real-time database (subscriptions update UI automatically)
- TypeScript-first (end-to-end type safety)
- Local development mode (no account needed initially)
- Serverless functions (no backend server to manage)

### shadcn/ui

- Built on Radix UI primitives (accessible)
- Tailwind CSS v4 styling
- Copy-paste components (fully customizable)
- Large ecosystem of components

### Convex Auth

- Native Convex authentication
- No external auth service needed
- Multiple methods: Password + OAuth (Google, Facebook)
- Simple setup and configuration

## Project Goals

### Phase 1: Foundation

Setup the project structure, auth, and basic layout

### Phase 2-3: Core Data

Build attendee management and event management

### Phase 4-5: Event Types & Scheduling

Create event types and schedule events

### Phase 6: Attendance Tracking

Implement the core attendance recording feature

### Phase 7: Dashboard & Polish

Add statistics, reports, and final touches

## Key Features

### Attendee Management

- Register new attendees (members, visitors)
- Search by name, email, phone
- Track membership status
- View attendance history per person

### Event Management

- Create and manage events
- Dynamic event types (Sunday Service, Retreat, etc.)
- Schedule with dates, times, locations
- Color-coded event types

### Attendance Tracking

- Real-time check-in interface
- Quick search and select attendees
- View attendance by event
- Export attendance data

## Target Users

- Church administrators
- Youth group leaders
- Event coordinators
- Anyone tracking church attendance

## Development Approach

1. **Start with Convex local dev** (no deployment needed initially)
2. **Build features incrementally** (one phase at a time)
3. **Test on mobile early** (church check-in is mobile-first)
4. **Keep it simple** (MVP first, features later)

## Philosophy

- **Simple over complex** - Easy to use for non-technical staff
- **Mobile-first** - Check-in happens on phones/tablets
- **Real-time** - See attendance updates instantly
- **Self-hosted data** - Church owns their data

---

_Last Updated: 2026-03-20_
