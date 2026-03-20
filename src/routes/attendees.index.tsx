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
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendees</h1>
          <p className="text-muted-foreground">
            Manage church members and visitors
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Attendee
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Church Members</CardTitle>
          <CardDescription>
            Full attendee management coming in Phase 3
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border p-8 text-center">
            <p className="text-muted-foreground">
              Attendee management features coming soon...
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              This includes: Member list, visitor tracking, search, and
              attendance history
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
