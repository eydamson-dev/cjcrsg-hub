import { createFileRoute } from '@tanstack/react-router'
import { Layout } from '~/components/layout/Layout'
import { ProtectedRoute } from '~/components/auth/ProtectedRoute'
import { Button } from '~/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/attendees/$id/edit')({
  component: EditAttendeePage,
})

function EditAttendeePage() {
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
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Edit Attendee
              </h1>
              <p className="text-muted-foreground">
                Update attendee information
              </p>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
            Edit form coming soon...
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
