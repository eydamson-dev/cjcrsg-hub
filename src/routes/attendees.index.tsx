import { createFileRoute } from '@tanstack/react-router'
import { Layout } from '~/components/layout/Layout'
import { ProtectedRoute } from '~/components/auth/ProtectedRoute'
import { AttendeeList } from '~/features/attendees/components/AttendeeList'
import {
  useAttendees,
  useArchiveAttendee,
} from '~/features/attendees/hooks/useAttendees'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

export const Route = createFileRoute('/attendees/')({
  component: AttendeesPage,
})

function AttendeesPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <AttendeesContent />
      </Layout>
    </ProtectedRoute>
  )
}

function AttendeesContent() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data, isPending } = useAttendees()
  const archiveAttendee = useArchiveAttendee()

  const handleArchive = async (id: string) => {
    try {
      await archiveAttendee.mutate({ id })
      toast.success('Attendee archived successfully!')
      // Refetch the attendees list to show updated status
      queryClient.invalidateQueries({ queryKey: ['attendees'] })
    } catch (error: any) {
      console.error('Failed to archive attendee:', error)
      toast.error(error.message || 'Failed to archive attendee')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendees</h1>
        <p className="text-muted-foreground">
          Manage church members and visitors
        </p>
      </div>

      <AttendeeList
        attendees={(data as any)?.page || []}
        isPending={isPending}
        onNavigate={(path) => navigate({ to: path as any })}
        onArchive={handleArchive}
      />
    </div>
  )
}
