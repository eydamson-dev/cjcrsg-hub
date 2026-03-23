import { createFileRoute } from '@tanstack/react-router'
import { Layout } from '~/components/layout/Layout'
import { ProtectedRoute } from '~/components/auth/ProtectedRoute'
import { requireAuth } from '~/lib/auth-guard'
import { useEvent } from '~/features/events/hooks/useEvents'
import {
  useAttendanceByEvent,
  useAttendanceStats,
} from '~/features/events/hooks/useAttendance'
import type { Event, EventType } from '~/features/events/types'

export const Route = createFileRoute('/events/$id')({
  component: EventDetailPage,
  beforeLoad: async ({ context }) => {
    requireAuth(context)
  },
})

function EventDetailPage() {
  const { id } = Route.useParams()
  const { data: event, isLoading } = useEvent(id)
  const { data: attendanceData } = useAttendanceByEvent(id)
  const { data: stats } = useAttendanceStats(id)

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex h-64 items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </Layout>
      </ProtectedRoute>
    )
  }

  if (!event) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex h-full items-center justify-center p-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold">Event Not Found</h2>
              <p className="mt-2 text-muted-foreground">
                The event you're looking for doesn't exist or has been deleted.
              </p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    )
  }

  const eventType: EventType | undefined = event.eventType
    ? {
        _id: event.eventType.name,
        name: event.eventType.name,
        color: event.eventType.color || '#3b82f6',
        isActive: true,
        createdAt: event._creationTime,
      }
    : undefined

  const eventData: Event = {
    ...event,
    eventType,
  }

  const getStatusBadge = () => {
    switch (event.status) {
      case 'active':
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            LIVE
          </span>
        )
      case 'completed':
        return (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
            Completed
          </span>
        )
      case 'cancelled':
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
            Cancelled
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
            Upcoming
          </span>
        )
    }
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {getStatusBadge()}
              </div>
              <h1 className="text-3xl font-bold">{eventData.name}</h1>
              <p className="text-muted-foreground">
                {eventData.eventType?.name}
              </p>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-4">Event Details</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">
                  {new Date(eventData.date).toLocaleDateString()}
                </p>
              </div>
              {eventData.startTime && (
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium">
                    {eventData.startTime}
                    {eventData.endTime && ` - ${eventData.endTime}`}
                  </p>
                </div>
              )}
              {eventData.location && (
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{eventData.location}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Attendance</p>
                <p className="font-medium">{stats?.total || 0} attendees</p>
              </div>
            </div>
          </div>

          {eventData.description && (
            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-semibold mb-4">Description</h3>
              <p className="text-muted-foreground">{eventData.description}</p>
            </div>
          )}

          {eventData.bannerImage && (
            <div className="rounded-lg border overflow-hidden">
              <img
                src={eventData.bannerImage}
                alt={eventData.name}
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-4">Recent Attendance</h3>
            {attendanceData && attendanceData.page.length > 0 ? (
              <div className="space-y-2">
                {attendanceData.page.slice(0, 5).map((record) => (
                  <div
                    key={record._id}
                    className="flex items-center justify-between p-2 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium">
                        {record.attendee?.firstName} {record.attendee?.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {record.attendee?.status}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(record.checkedInAt).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
                {attendanceData.page.length > 5 && (
                  <p className="text-sm text-muted-foreground text-center pt-2">
                    + {attendanceData.page.length - 5} more attendees
                  </p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No attendance records yet</p>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
