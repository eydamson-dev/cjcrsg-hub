import { createFileRoute } from '@tanstack/react-router'
import { Layout } from '~/components/layout/Layout'
import { ProtectedRoute } from '~/components/auth/ProtectedRoute'
import { EventDetail } from '~/features/events/components/EventDetail'
import { requireAuth } from '~/lib/auth-guard'
import { mockEvents, mockAttendees } from '~/features/events/mocks'

export const Route = createFileRoute('/events/$id')({
  component: EventDetailPage,
  beforeLoad: async ({ context }) => {
    requireAuth(context)
  },
})

function EventDetailPage() {
  const { id } = Route.useParams()
  const event = mockEvents.find((e) => e._id === id)
  // For demo purposes, show attendance for all active events
  // In production, this would be fetched from the API
  const attendance = event?.status === 'active' ? mockAttendees : []

  if (!event) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex h-full items-center justify-center p-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold">Event Not Found</h2>
              <p className="mt-2 text-muted-foreground">
                The event you&apos;re looking for doesn&apos;t exist or has been
                deleted.
              </p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    )
  }

  const handleAddAttendee = () => {
    // TODO: Implement add attendee modal/navigation
    console.log('Add attendee clicked')
  }

  const handleDeleteAttendee = (recordId: string) => {
    // TODO: Implement delete attendee API call
    console.log('Delete attendee:', recordId)
  }

  return (
    <ProtectedRoute>
      <Layout>
        <EventDetail
          event={event}
          attendance={attendance}
          showBackLink
          onAddAttendee={handleAddAttendee}
          onDeleteAttendee={handleDeleteAttendee}
        />
      </Layout>
    </ProtectedRoute>
  )
}
