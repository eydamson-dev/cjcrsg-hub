import { createFileRoute } from '@tanstack/react-router'
import { Layout } from '~/components/layout/Layout'
import { ProtectedRoute } from '~/components/auth/ProtectedRoute'
import { requireAuth } from '~/lib/auth-guard'
import {
  useCurrentUserRole,
  useListUsersWithRoles,
  usePromoteUser,
  useDemoteUser,
  type UserRole,
} from '~/hooks/useCurrentUserRole'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Loader2, Shield, ShieldAlert, User, Crown } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/settings/admin')({
  component: AdminPage,
  beforeLoad: async ({ context }) => {
    requireAuth(context)
  },
})

function AdminPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <AdminContent />
      </Layout>
    </ProtectedRoute>
  )
}

function AdminContent() {
  const { data: currentUser, isLoading: loadingCurrentUser } =
    useCurrentUserRole()
  const { data: allUsers, isLoading: loadingUsers } = useListUsersWithRoles()
  const promoteUser = usePromoteUser()
  const demoteUser = useDemoteUser()
  const [searchQuery, setSearchQuery] = useState('')
  const [promotingEmail, setPromotingEmail] = useState<string | null>(null)

  if (loadingCurrentUser || loadingUsers) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!currentUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You must be signed in to view this page.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (currentUser.role !== 'super_admin') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            Only super administrators can access this page.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const filteredUsers = allUsers?.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const stats = {
    superAdmin:
      filteredUsers?.filter((u) => u.role === 'super_admin').length ?? 0,
    admin: filteredUsers?.filter((u) => u.role === 'admin').length ?? 0,
    moderator: filteredUsers?.filter((u) => u.role === 'moderator').length ?? 0,
    user: filteredUsers?.filter((u) => u.role === 'user').length ?? 0,
  }

  const handlePromote = async (email: string, newRole: UserRole) => {
    setPromotingEmail(email)
    try {
      await promoteUser({ email, role: newRole })
      toast.success(`User promoted to ${newRole}`)
    } catch (error) {
      toast.error(
        `Failed to promote user: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    } finally {
      setPromotingEmail(null)
    }
  }

  const handleDemote = async (email: string) => {
    setPromotingEmail(email)
    try {
      await demoteUser({ email })
      toast.success('User demoted to user')
    } catch (error) {
      toast.error(
        `Failed to demote user: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    } finally {
      setPromotingEmail(null)
    }
  }

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return <Crown className="h-4 w-4" />
      case 'admin':
        return <Shield className="h-4 w-4" />
      case 'moderator':
        return <ShieldAlert className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getRoleBadge = (role: UserRole) => {
    const variants: Record<UserRole, string> = {
      super_admin: 'bg-purple-500',
      admin: 'bg-red-500',
      moderator: 'bg-yellow-500',
      user: 'bg-gray-500',
    }
    const labels: Record<UserRole, string> = {
      super_admin: 'Super Admin',
      admin: 'Admin',
      moderator: 'Moderator',
      user: 'User',
    }
    return (
      <Badge className={variants[role]}>
        {getRoleIcon(role)}
        <span className="ml-1">{labels[role]}</span>
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Management</h1>
        <p className="text-muted-foreground">
          Manage user roles and permissions
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
            <Crown className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.superAdmin}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.admin}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Moderators</CardTitle>
            <ShieldAlert className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.moderator}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <User className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.user}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Search and manage user roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search by email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers?.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {user.name || 'No name'}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {user.role !== 'super_admin' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handlePromote(user.email, 'moderator')
                              }
                              disabled={promotingEmail === user.email}
                            >
                              {promotingEmail === user.email ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Mod'
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePromote(user.email, 'admin')}
                              disabled={
                                promotingEmail === user.email ||
                                user.role === 'admin'
                              }
                            >
                              Admin
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDemote(user.email)}
                              disabled={
                                promotingEmail === user.email ||
                                user.role === 'user'
                              }
                            >
                              Demote
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
