import { createFileRoute } from '@tanstack/react-router'
import { Layout } from '~/components/layout/Layout'
import { ProtectedRoute } from '~/components/auth/ProtectedRoute'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { ArrowLeft, Edit } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/attendees/$id')({
  component: AttendeeDetailPage,
})

function AttendeeDetailPage() {
  const navigate = useNavigate()
  const { id } = Route.useParams()

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate({ to: '/attendees' })}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">
                Attendee Details
              </h1>
              <p className="text-muted-foreground">View attendee information</p>
            </div>
            <Button onClick={() => navigate({ to: `/attendees/${id}/edit` })}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Attendee #{id}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border p-8 text-center text-muted-foreground">
                Attendee details coming soon...
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
