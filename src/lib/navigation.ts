import {
  LayoutDashboard,
  Users,
  CalendarDays,
  CheckSquare,
  Settings,
  Palette,
  Church,
  List,
  Mountain,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
  description?: string
  children?: NavItem[]
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
    children: [
      {
        title: 'All Events',
        href: '/events',
        icon: List,
        description: 'View all events',
      },
      {
        title: 'Sunday Service',
        href: '/events/sunday-service',
        icon: Church,
        description: 'Manage Sunday worship services',
      },
      {
        title: 'Spiritual Retreat',
        href: '/events/spiritual-retreat',
        icon: Mountain,
        description: 'Manage spiritual retreat events',
      },
    ],
  },
  {
    title: 'Attendance',
    href: '/attendance',
    icon: CheckSquare,
    description: 'Track attendance for events',
  },
  {
    title: 'Event Types',
    href: '/event-types',
    icon: Palette,
    description: 'Manage event types and categories',
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Configure app settings',
  },
]

export const churchName = 'CJCRSG'
export const churchFullName = 'Church of Jesus Christ the Risen Son of God'
