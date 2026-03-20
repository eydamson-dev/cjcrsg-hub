import { createFileRoute } from '@tanstack/react-router'
import { Layout } from '~/components/layout/Layout'
import { ProtectedRoute } from '~/components/auth/ProtectedRoute'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Plus } from 'lucide-react'

export const Route = createFileRoute('/events/')({
  component: EventsPage,
})

function EventsPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <EventsContent />
      </Layout>
    </ProtectedRoute>
  )
}

function EventsContent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">
            Manage church events and services
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>
            Full event management coming in Phase 4
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border p-8 text-center">
            <p className="text-muted-foreground">
              Event management features coming soon...
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              This includes: Event creation, scheduling, event types, and
              attendance tracking
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
