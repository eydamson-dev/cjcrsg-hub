export type AttendeeStatus = 'member' | 'visitor' | 'inactive'

export interface Attendee {
  _id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  dateOfBirth?: number
  address: string
  status: AttendeeStatus
  joinDate?: number
  notes?: string
  createdAt: number
  updatedAt: number
}

export interface CreateAttendeeInput {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  dateOfBirth?: number
  address: string
  status: AttendeeStatus
  joinDate?: number
  notes?: string
}

export interface UpdateAttendeeInput {
  id: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  dateOfBirth?: number
  address?: string
  status?: AttendeeStatus
  joinDate?: number
  notes?: string
}
