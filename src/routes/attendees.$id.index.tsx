import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
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
  const router = useRouter()
  const { id } = Route.useParams()
  const { data: attendee, isPending, error } = useAttendee(id)

  const handleEdit = () => {
    navigate({ to: `/attendees/${id}/edit` })
  }

  const handleBack = () => {
    if (router.history.canGoBack()) router.history.back()
    else navigate({ to: '/attendees' })
  }

  const handleRetry = () => {
    window.location.reload()
  }

  if (isPending) {
    return <AttendeeDetailsSkeleton onBack={handleBack} />
  }

  if (error || !attendee) {
    return (
      <AttendeeNotFound
        error={error || undefined}
        onBack={handleBack}
        onRetry={handleRetry}
      />
    )
  }

  return (
    <AttendeeDetails
      attendee={attendee}
      onEdit={handleEdit}
      onBack={handleBack}
    />
  )
}
