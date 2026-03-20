import { createFileRoute } from '@tanstack/react-router'
import { Layout } from '~/components/layout/Layout'
import { ProtectedRoute } from '~/components/auth/ProtectedRoute'
import { AttendeeList } from '~/features/attendees/components/AttendeeList'
import { useAttendees } from '~/features/attendees/hooks/useAttendees'
import { useNavigate } from '@tanstack/react-router'

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
  const { data, isPending } = useAttendees()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendees</h1>
        <p className="text-muted-foreground">
          Manage church members and visitors
        </p>
      </div>

      <AttendeeList
        attendees={data?.page || []}
        isPending={isPending}
        onNavigate={(path) => navigate({ to: path as any })}
      />
    </div>
  )
}
