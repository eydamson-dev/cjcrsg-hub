import { useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Layout } from '~/components/layout/Layout'
import { ProtectedRoute } from '~/components/auth/ProtectedRoute'
import { requireAuth } from '~/lib/auth-guard'
import {
  useAccountInfo,
  useUnlinkAccount,
  useLinkOAuth,
} from '~/hooks/useAccountInfo'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Separator } from '~/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'
import {
  Loader2,
  Mail,
  User,
  Calendar,
  ExternalLink,
  Trash2,
  AlertTriangle,
  Shield,
  KeyRound,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/settings/account')({
  component: AccountPage,
  beforeLoad: async ({ context }) => {
    requireAuth(context)
  },
})

function AccountPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <AccountContent />
      </Layout>
    </ProtectedRoute>
  )
}

function AccountContent() {
  const { data: accountInfo, isLoading } = useAccountInfo()
  const unlinkAccount = useUnlinkAccount()
  const { linkOAuth, linkingProvider } = useLinkOAuth()
  const [unlinkingAccountId, setUnlinkingAccountId] = useState<string | null>(
    null,
  )
  const [showUnlinkDialog, setShowUnlinkDialog] = useState(false)
  const [pendingUnlink, setPendingUnlink] = useState<{
    id: string
    provider: string
  } | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('linked') === 'true') {
      toast.success('Account linked successfully')
      window.history.replaceState({}, '', '/settings/account')
    } else if (params.get('error')) {
      toast.error(`Failed to link account: ${params.get('error')}`)
      window.history.replaceState({}, '', '/settings/account')
    }
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!accountInfo) {
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      member: 'bg-green-500',
      visitor: 'bg-blue-500',
      inactive: 'bg-gray-500',
      Pastor: 'bg-purple-500',
      Leader: 'bg-yellow-500',
      Elder: 'bg-orange-500',
      Deacon: 'bg-teal-500',
    }
    return (
      <Badge className={variants[status] ?? 'bg-gray-500'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'password':
        return <KeyRound className="h-4 w-4" />
      case 'google':
        return <Mail className="h-4 w-4" />
      case 'facebook':
        return <Shield className="h-4 w-4" />
      default:
        return <Shield className="h-4 w-4" />
    }
  }

  const getProviderLabel = (provider: string) => {
    switch (provider) {
      case 'password':
        return 'Email & Password'
      case 'google':
        return 'Google'
      case 'facebook':
        return 'Facebook'
      default:
        return provider.charAt(0).toUpperCase() + provider.slice(1)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const handleUnlink = async () => {
    if (!pendingUnlink) return

    setUnlinkingAccountId(pendingUnlink.id)
    try {
      await unlinkAccount({ accountId: pendingUnlink.id })
      toast.success('Authentication method removed')
    } catch (error) {
      toast.error(
        `Failed to unlink: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    } finally {
      setUnlinkingAccountId(null)
      setShowUnlinkDialog(false)
      setPendingUnlink(null)
    }
  }

  const requestUnlink = (accountId: string, provider: string) => {
    const isOnlyMethod = accountInfo.authMethods.length <= 1
    if (isOnlyMethod) {
      toast.error(
        'Cannot unlink your only sign-in method. Add another authentication method first.',
      )
      return
    }

    setPendingUnlink({ id: accountId, provider })
    setShowUnlinkDialog(true)
  }

  const isOnlyMethod = (_accountId: string) => {
    return accountInfo.authMethods.length <= 1
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account</h1>
        <p className="text-muted-foreground">
          Manage your profile and authentication methods
        </p>
      </div>

      {/* Attendee Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Your Attendee Profile</CardTitle>
          <CardDescription>
            {accountInfo.attendeeProfile
              ? 'Your linked church attendee profile'
              : 'No attendee profile linked yet'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {accountInfo.attendeeProfile ? (
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={accountInfo.image ?? undefined} />
                <AvatarFallback>
                  {accountInfo.attendeeProfile.firstName[0]}
                  {accountInfo.attendeeProfile.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">
                    {accountInfo.attendeeProfile.firstName}{' '}
                    {accountInfo.attendeeProfile.lastName}
                  </h3>
                  {getStatusBadge(accountInfo.attendeeProfile.status)}
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  {accountInfo.attendeeProfile.joinDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Member since{' '}
                      {formatDate(accountInfo.attendeeProfile.joinDate)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (accountInfo.attendeeProfile) {
                      window.location.assign(
                        `/attendees/${accountInfo.attendeeProfile.attendeeId}`,
                      )
                    }
                  }}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View Profile
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 py-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={accountInfo.image ?? undefined} />
                <AvatarFallback>
                  {accountInfo.name?.[0] ?? <User className="h-6 w-6" />}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-muted-foreground">
                  No attendee profile is linked to your account. Contact an
                  administrator to link your attendee record.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Authentication Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication Methods</CardTitle>
          <CardDescription>
            Manage how you sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {accountInfo.authMethods.map((method) => (
              <div key={method.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getProviderIcon(method.provider)}
                    <div>
                      <p className="font-medium">
                        {getProviderLabel(method.provider)}
                      </p>
                      {method.isPassword && accountInfo.email && (
                        <p className="text-sm text-muted-foreground">
                          {accountInfo.email}
                        </p>
                      )}
                      {!method.isPassword && (
                        <p className="text-sm text-muted-foreground">
                          Linked {formatDate(method.linkedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {method.isPassword && (
                      <Button variant="outline" size="sm">
                        Change Password
                      </Button>
                    )}
                    {!method.isPassword && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          requestUnlink(method.id, method.provider)
                        }
                        disabled={
                          isOnlyMethod(method.id) ||
                          unlinkingAccountId === method.id
                        }
                      >
                        {unlinkingAccountId === method.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="h-3 w-3 mr-1" />
                            Unlink
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                {isOnlyMethod(method.id) && !method.isPassword && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Cannot unlink your only sign-in method
                  </p>
                )}
                <Separator className="mt-4" />
              </div>
            ))}
          </div>

          {/* Link New Account Section */}
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-3">Link New Account</h3>
            <div className="flex flex-wrap gap-2">
              {!accountInfo.authMethods.some(
                (m) => m.provider === 'google',
              ) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => linkOAuth('google')}
                  disabled={linkingProvider === 'google'}
                >
                  {linkingProvider === 'google' ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : null}
                  Link Google
                </Button>
              )}
              {!accountInfo.authMethods.some(
                (m) => m.provider === 'facebook',
              ) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => linkOAuth('facebook')}
                  disabled={linkingProvider === 'facebook'}
                >
                  {linkingProvider === 'facebook' ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : null}
                  Link Facebook
                </Button>
              )}
              {!accountInfo.authMethods.some((m) => m.isPassword) && (
                <Button variant="outline" size="sm">
                  Set Password
                </Button>
              )}
              {accountInfo.authMethods.some((m) => m.isPassword) &&
                !accountInfo.authMethods.some((m) => m.provider === 'google') &&
                !accountInfo.authMethods.some(
                  (m) => m.provider === 'facebook',
                ) && (
                  <p className="text-sm text-muted-foreground">
                    All available authentication methods are linked
                  </p>
                )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Safety Warning */}
      <Card className="border-yellow-200 bg-yellow-50/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Important Safety Note
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                You cannot unlink your only authentication method. Always ensure
                you have at least one way to sign in to your account before
                removing any authentication method.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unlink Confirmation Dialog */}
      <AlertDialog open={showUnlinkDialog} onOpenChange={setShowUnlinkDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Unlink {pendingUnlink?.provider}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unlink this authentication method? You
              will no longer be able to sign in using this provider.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnlink}>
              {unlinkingAccountId ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Unlink
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
