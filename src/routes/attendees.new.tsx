import { createFileRoute } from '@tanstack/react-router'
import { Layout } from '~/components/layout/Layout'
import { ProtectedRoute } from '~/components/auth/ProtectedRoute'
import { Button } from '~/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/attendees/new')({
  component: NewAttendeePage,
})

function NewAttendeePage() {
  const navigate = useNavigate()

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
                Add New Attendee
              </h1>
              <p className="text-muted-foreground">
                Create a new church member or visitor
              </p>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
            Attendee form coming soon...
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
