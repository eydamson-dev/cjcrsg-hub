export type EventStatus = 'upcoming' | 'active' | 'completed' | 'cancelled'

export interface EventType {
  _id: string
  name: string
  description?: string
  color: string
  isActive: boolean
  createdAt: number
}

export interface Event {
  _id: string
  name: string
  eventTypeId: string
  eventType?: EventType
  description?: string
  date: number
  startTime?: string
  endTime?: string
  location?: string
  status: EventStatus
  bannerImage?: string
  media?: Array<{
    url: string
    type: 'image' | 'video'
    caption?: string
  }>
  isActive: boolean
  createdAt: number
  updatedAt: number
  completedAt?: number
  attendanceCount?: number
}

export interface AttendanceRecord {
  _id: string
  eventId: string
  attendeeId: string
  attendee?: {
    _id: string
    firstName: string
    lastName: string
    status: 'member' | 'visitor' | 'inactive'
  }
  checkedInAt: number
  checkedInBy: string
  notes?: string
}

export interface CreateEventInput {
  name: string
  eventTypeId: string
  description?: string
  date: number
  startTime?: string
  endTime?: string
  location?: string
  bannerImage?: string
  media?: Array<{
    url: string
    type: 'image' | 'video'
    caption?: string
  }>
}

export interface UpdateEventInput {
  id: string
  name?: string
  eventTypeId?: string
  description?: string
  date?: number
  startTime?: string
  endTime?: string
  location?: string
  status?: EventStatus
  bannerImage?: string
  media?: Array<{
    url: string
    type: 'image' | 'video'
    caption?: string
  }>
  completedAt?: number
}

export interface EventFilters {
  eventTypeId?: string
  search?: string
  dateRange?: {
    start?: number
    end?: number
  }
}

export interface EventStats {
  eventsThisMonth: number
  totalEvents: number
  lastEvent?: string
  nextScheduled?: string
}
