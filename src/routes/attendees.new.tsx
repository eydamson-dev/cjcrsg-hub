import { createFileRoute } from '@tanstack/react-router'
import { Layout } from '~/components/layout/Layout'
import { ProtectedRoute } from '~/components/auth/ProtectedRoute'
import { AttendeeForm } from '~/features/attendees/components/AttendeeForm'
import { useCreateAttendee } from '~/features/attendees/hooks/useAttendees'
import { Button } from '~/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

export const Route = createFileRoute('/attendees/new')({
  component: NewAttendeePage,
})

function NewAttendeePage() {
  const navigate = useNavigate()
  const createAttendee = useCreateAttendee()

  const handleSubmit = async (data: any) => {
    try {
      await createAttendee.mutate(data)
      toast.success('Attendee created successfully!')
      navigate({ to: '/attendees' })
    } catch (error: any) {
      console.error('Failed to create attendee:', error)
      toast.error(error.message || 'Failed to create attendee')
    }
  }

  const handleCancel = () => {
    navigate({ to: '/attendees' })
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleCancel}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Add New Attendee
              </h1>
              <p className="text-muted-foreground">
                Create a new church member or visitor
              </p>
            </div>
          </div>

          <div className="max-w-3xl">
            <AttendeeForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={createAttendee.isPending || false}
            />
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
