# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Responsive layout system with sidebar and mobile navigation
  - Layout, Sidebar, MobileNav, Header components in `src/components/layout/`
  - ProtectedRoute component for authentication in `src/components/auth/`
  - Navigation configuration with 5 main sections (Dashboard, Attendees, Events, Attendance, Settings)
  - Mobile-first responsive design with sheet-based drawer navigation
- CJCRSG blue theme (#304080) as primary color
  - Applied to both light and dark modes in `src/styles/app.css`
  - Updated sidebar, buttons, focus rings, and accent colors
- Dashboard page with stats cards showing member counts, events, and attendance
- New shadcn components: sidebar, tooltip, collapsible, use-mobile hook

### Changed

- Nothing yet

## [0.1.0] - 2026-03-20

### Added

- shadcn/ui component library initialized with canary version
  - Base-nova style with neutral color palette
  - Tailwind CSS v4 with theme variables
  - Lucide icons configured
- Convex Auth authentication system
  - Auth configuration files (auth.config.ts, auth.ts, http.ts)
  - React provider updated to ConvexAuthProvider
- Unified login page (`src/routes/login.tsx`)
  - Password authentication form with sign-in/sign-up tabs
  - Google OAuth button
  - Facebook OAuth button
- Environment configuration
  - `.env.local` with Convex URL
  - `.env.example` template
  - Both files in .gitignore
- shadcn/ui components installed:
  - button, card, input, form, label, tabs, sonner
  - badge, separator, avatar, dropdown-menu
  - skeleton, scroll-area, sheet

### Changed

- Updated `src/router.tsx` to use ConvexAuthProvider
- Updated `src/styles/app.css` with shadcn theme variables
- Updated `convex/schema.ts` with custom tables (attendees, events, eventTypes, attendanceRecords)

### Fixed

- Removed unused React import in scroll-area.tsx component

### Security

- Environment variables configured to keep OAuth secrets server-side

---

## [Unreleased]: https://github.com/eydamson-dev/cjcrsg-hub/compare/v0.1.0...HEAD

[0.1.0]: https://github.com/eydamson-dev/cjcrsg-hub/releases/tag/v0.1.0
