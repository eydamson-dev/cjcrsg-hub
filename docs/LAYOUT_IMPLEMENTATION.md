# Layout & Navigation Implementation Summary

## Created Files

### 1. Navigation Configuration (`src/lib/navigation.ts`)

Centralized navigation configuration with:

- 5 main navigation items: Dashboard, Attendees, Events, Attendance, Settings
- Lucide React icons for each item
- Church name and full name constants
- Type definitions for nav items

### 2. Layout Components

#### Header (`src/components/layout/Header.tsx`)

- Top header bar with church branding
- Hamburger menu button for mobile
- Responsive design (hidden on desktop, visible on mobile)

#### MobileNav (`src/components/layout/MobileNav.tsx`)

- Sheet-based drawer navigation for mobile
- Lists all navigation items
- Church branding and full name
- Touch-friendly with large tap targets

#### Sidebar (`src/components/layout/Sidebar.tsx`)

- Fixed left sidebar for desktop (1024px+)
- Church branding with full name
- Navigation items with active state highlighting
- User menu with profile and sign out options
- Responsive: hidden on mobile, visible on desktop

#### Layout (`src/components/layout/Layout.tsx`)

- Main layout wrapper component
- Combines Header, Sidebar, and MobileNav
- Responsive grid layout
- Manages mobile nav state
- Renders children content

### 3. Auth Components

#### ProtectedRoute (`src/components/auth/ProtectedRoute.tsx`)

- Authentication check using Convex Auth
- Redirects to `/login` if not authenticated
- Shows loading spinner during auth check
- Renders children only when authenticated

## How to Use

### Creating Protected Routes

For any route that should require authentication and show the layout:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { Layout } from '~/components/layout/Layout'
import { ProtectedRoute } from '~/components/auth/ProtectedRoute'
import { DashboardContent } from './DashboardContent' // Your content component

export const Route = createFileRoute('/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  return (
    <ProtectedRoute>
      <Layout>
        <DashboardContent />
      </Layout>
    </ProtectedRoute>
  )
}
```

### Creating Public Routes (No Layout)

For routes like login that should not show the layout:

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      {/* Login form */}
    </div>
  )
}
```

### Adding New Navigation Items

Edit `src/lib/navigation.ts`:

```tsx
export const navItems: NavItem[] = [
  // ... existing items
  {
    title: 'New Page',
    href: '/new-page',
    icon: NewIcon,
    description: 'Description for new page',
  },
]
```

### Future Route Structure

When creating future routes for attendees, events, etc., wrap them with:

```tsx
<ProtectedRoute>
  <Layout>
    <YourPageContent />
  </Layout>
</ProtectedRoute>
```

## Current Navigation Items

1. **Dashboard** (`/`) - Overview and stats
2. **Attendees** (`/attendees`) - Manage church members (coming soon)
3. **Events** (`/events`) - Schedule events (coming soon)
4. **Attendance** (`/attendance`) - Track attendance (coming soon)
5. **Settings** (`/settings`) - App configuration (coming soon)

## Responsive Behavior

- **Desktop (1024px+)**: Fixed left sidebar, full navigation visible
- **Tablet (768px-1023px)**: Collapsible sidebar or icon-only mode
- **Mobile (<768px)**: Hidden sidebar, hamburger menu in header, sheet drawer navigation

## Dependencies

The following shadcn components are used:

- `sidebar` - Desktop sidebar navigation
- `sheet` - Mobile navigation drawer
- `tooltip` - Tooltip for navigation items
- `collapsible` - Collapsible sidebar sections
- `avatar` - User avatar in sidebar
- `dropdown-menu` - User menu dropdown
- `button` - Navigation and actions
- `card` - Dashboard stats and content cards
- `separator` - Visual separators
- `skeleton` - Loading states

## Notes

- The login page (`/login`) is public and doesn't require authentication
- The dashboard (`/`) is protected and shows the layout
- Future routes should follow the same pattern: ProtectedRoute > Layout > content
- The layout automatically handles responsive behavior
- CJCRSG branding is shown in both sidebar and mobile nav
