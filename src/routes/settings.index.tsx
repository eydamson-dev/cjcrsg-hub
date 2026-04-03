import { createFileRoute } from '@tanstack/react-router'
import { Layout } from '~/components/layout/Layout'
import { ProtectedRoute } from '~/components/auth/ProtectedRoute'
import { requireAuth } from '~/lib/auth-guard'
import { Link } from '@tanstack/react-router'
import { Shield } from 'lucide-react'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'

export const Route = createFileRoute('/settings/')({
  component: SettingsPage,
  beforeLoad: async ({ context }) => {
    requireAuth(context)
  },
})

function SettingsPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <SettingsContent />
      </Layout>
    </ProtectedRoute>
  )
}

function SettingsContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure app settings and manage access
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link to="/settings/admin">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Admin Management</CardTitle>
                <CardDescription>
                  Manage user roles and permissions
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  )
}
