import {
  LayoutDashboard,
  Users,
  CalendarDays,
  CheckSquare,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
  description?: string
}

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    description: 'Overview of your church data',
  },
  {
    title: 'Attendees',
    href: '/attendees',
    icon: Users,
    description: 'Manage church members and visitors',
  },
  {
    title: 'Events',
    href: '/events',
    icon: CalendarDays,
    description: 'Schedule and manage events',
  },
  {
    title: 'Attendance',
    href: '/attendance',
    icon: CheckSquare,
    description: 'Track attendance for events',
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Configure event types and app settings',
  },
]

export const churchName = 'CJCRSG'
export const churchFullName = 'Church of Jesus Christ the Risen Son of God'
