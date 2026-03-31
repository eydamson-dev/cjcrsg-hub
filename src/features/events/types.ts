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

// ============================================================================
// Retreat (Spiritual Retreat) Types
// ============================================================================

export type LessonType =
  | 'teaching'
  | 'meal'
  | 'break'
  | 'worship'
  | 'registration'
  | 'closing'
  | 'other'

export const LESSON_TYPE_COLORS: Record<LessonType, string> = {
  teaching: 'bg-green-100 text-green-700 border-green-200',
  meal: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  break: 'bg-gray-100 text-gray-700 border-gray-200',
  worship: 'bg-green-100 text-green-700 border-green-200',
  registration: 'bg-blue-100 text-blue-700 border-blue-200',
  closing: 'bg-purple-100 text-purple-700 border-purple-200',
  other: 'bg-gray-100 text-gray-700 border-gray-200',
}

export const LESSON_TYPE_LABELS: Record<LessonType, string> = {
  teaching: 'Teaching',
  meal: 'Meal',
  break: 'Break',
  worship: 'Worship',
  registration: 'Registration',
  closing: 'Closing',
  other: 'Other',
}

export interface RetreatTeacher {
  attendeeId: string
  subject?: string
  bio?: string
  attendee?: {
    _id: string
    firstName: string
    lastName: string
    email?: string | null
    status: 'member' | 'visitor' | 'inactive'
  } | null
}

export interface RetreatLesson {
  id: string
  title: string
  description?: string
  teacherId?: string
  day?: number
  startTime: string
  endTime: string
  location?: string
  type: LessonType
  teacher?: {
    _id: string
    firstName: string
    lastName: string
  } | null
}

export interface RetreatStaff {
  attendeeId: string
  role: string
  responsibilities?: string
  isLead?: boolean
  attendee?: {
    _id: string
    firstName: string
    lastName: string
    email?: string | null
  } | null
}

export interface RetreatDetails {
  teachers: RetreatTeacher[]
  lessons: RetreatLesson[]
  staff: RetreatStaff[]
}

export interface AddTeacherInput {
  eventId: string
  attendeeId: string
  subject?: string
  bio?: string
}

export interface UpdateTeacherInput {
  eventId: string
  attendeeId: string
  subject?: string
  bio?: string
}

export interface AddLessonInput {
  eventId: string
  lesson: {
    id: string
    title: string
    description?: string
    teacherId?: string
    day?: number
    startTime: string
    endTime: string
    location?: string
    type: LessonType
  }
}

export interface UpdateLessonInput {
  eventId: string
  lessonId: string
  updates: {
    title?: string
    description?: string
    teacherId?: string
    day?: number
    startTime?: string
    endTime?: string
    location?: string
    type?: LessonType
  }
}

export interface AddStaffInput {
  eventId: string
  attendeeId: string
  role: string
  responsibilities?: string
  isLead?: boolean
}

export interface UpdateStaffInput {
  eventId: string
  attendeeId: string
  role?: string
  responsibilities?: string
  isLead?: boolean
}

export interface TeacherLessonInfo {
  hasLessons: boolean
  lessons: Array<{
    id: string
    title: string
    day?: number
    startTime: string
    endTime: string
  }>
}

export interface LessonConflict {
  id: string
  day?: number
  startTime: string
  endTime: string
}
