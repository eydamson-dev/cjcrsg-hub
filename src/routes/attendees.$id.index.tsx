import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  AttendeeDetails,
  AttendeeDetailsSkeleton,
  AttendeeNotFound,
} from '~/features/attendees/components/AttendeeDetails'
import { useAttendee } from '~/features/attendees/hooks/useAttendees'
import { requireAuth } from '~/lib/auth-guard'

export const Route = createFileRoute('/attendees/$id/')({
  component: AttendeeDetailPage,
  beforeLoad: async ({ context }) => {
    requireAuth(context)
  },
})

function AttendeeDetailPage() {
  const navigate = useNavigate()
  const { id } = Route.useParams()
  const { data: attendee, isPending, error } = useAttendee(id)

  const handleEdit = () => {
    navigate({ to: `/attendees/${id}/edit` })
  }

  const handleBack = () => {
    navigate({ to: '/attendees' })
  }

  if (isPending) {
    return <AttendeeDetailsSkeleton onBack={handleBack} />
  }

  if (error || !attendee) {
    return <AttendeeNotFound error={error || undefined} onBack={handleBack} />
  }

  return (
    <AttendeeDetails
      attendee={attendee}
      onEdit={handleEdit}
      onBack={handleBack}
    />
  )
}
