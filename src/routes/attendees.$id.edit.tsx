import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AttendeeForm } from '~/features/attendees/components/AttendeeForm'
import {
  useAttendee,
  useUpdateAttendee,
} from '~/features/attendees/hooks/useAttendees'
import { Button } from '~/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/attendees/$id/edit')({
  component: EditAttendeePage,
})

function EditAttendeePage() {
  const navigate = useNavigate()
  const { id } = Route.useParams()
  const { data: attendee, isPending } = useAttendee(id)
  const updateAttendee = useUpdateAttendee()

  const handleSubmit = async (data: any) => {
    try {
      await updateAttendee.mutate({ id, ...data })
      toast.success('Attendee updated successfully!')
      navigate({ to: `/attendees/${id}` })
    } catch (error: any) {
      console.error('Failed to update attendee:', error)
      toast.error(error.message || 'Failed to update attendee')
    }
  }

  const handleCancel = () => {
    navigate({ to: `/attendees/${id}` })
  }

  if (isPending) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Attendee</h1>
            <p className="text-muted-foreground">Update attendee information</p>
          </div>
        </div>
        <div className="max-w-3xl">
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-24 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!attendee) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Attendee Not Found
            </h1>
            <p className="text-muted-foreground">
              The attendee you're looking for doesn't exist
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Attendee</h1>
          <p className="text-muted-foreground">Update attendee information</p>
        </div>
      </div>

      <div className="max-w-3xl">
        <AttendeeForm
          initialData={attendee}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={updateAttendee.isPending || false}
        />
      </div>
    </div>
  )
}
