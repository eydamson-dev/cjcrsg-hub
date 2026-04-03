'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Separator } from '~/components/ui/separator'
import { Link2, Link2Off, UserCircle, Shield, ExternalLink } from 'lucide-react'
import { LinkAccountDialog } from './LinkAccountDialog'
import { UnlinkAccountDialog } from './UnlinkAccountDialog'
import { ChangeStatusDialog } from './ChangeStatusDialog'
import { getStatusBadgeClass } from './AttendeeStatusSelect'
import { useCurrentUserRole } from '~/hooks/useCurrentUserRole'
import { toast } from 'sonner'
import type { AttendeeStatus } from '../types'

interface AdminSectionProps {
  attendeeId: string
  attendeeName: string
  currentStatus: AttendeeStatus
  userLink:
    | {
        linked: boolean
        userId?: string
        userEmail?: string
        userName?: string
      }
    | null
    | undefined
  onRefresh: () => void
}

export function AdminSection({
  attendeeId,
  attendeeName,
  currentStatus,
  userLink,
  onRefresh,
}: AdminSectionProps) {
  const { data: currentUser } = useCurrentUserRole()
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [unlinkDialogOpen, setUnlinkDialogOpen] = useState(false)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)

  if (!currentUser) return null

  const isAdmin =
    currentUser.role === 'super_admin' ||
    currentUser.role === 'admin' ||
    currentUser.role === 'moderator'

  if (!isAdmin) return null

  const getStatusBadge = (status: AttendeeStatus) => {
    return <Badge className={getStatusBadgeClass(status)}>{status}</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Admin Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Attendee Status</p>
              <p className="text-xs text-muted-foreground">
                Change membership status
              </p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(currentStatus)}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStatusDialogOpen(true)}
              >
                Change Status
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        {/* User Account Linking Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">User Account</p>
              <p className="text-xs text-muted-foreground">
                Link attendee to a user account
              </p>
            </div>
          </div>

          {userLink?.linked ? (
            <div className="p-4 border rounded-lg bg-accent/50 space-y-3">
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  Linked
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-sm">
                  <span className="text-muted-foreground">User:</span>{' '}
                  {userLink.userName || 'Unnamed User'}
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Email:</span>{' '}
                  {userLink.userEmail}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Navigate to user profile - placeholder for now
                    toast.info('User profile page coming soon')
                  }}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View User Profile
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUnlinkDialogOpen(true)}
                >
                  <Link2Off className="h-3 w-3 mr-1" />
                  Unlink
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <Link2Off className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700">
                  Not Linked
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                This attendee is not linked to any user account.
              </p>
              <Button
                variant="default"
                size="sm"
                onClick={() => setLinkDialogOpen(true)}
              >
                <UserCircle className="h-3 w-3 mr-1" />
                Search & Link User
              </Button>
            </div>
          )}
        </div>

        {/* Dialogs */}
        <LinkAccountDialog
          open={linkDialogOpen}
          attendeeId={attendeeId}
          attendeeName={attendeeName}
          onOpenChange={setLinkDialogOpen}
          onSuccess={onRefresh}
        />

        <UnlinkAccountDialog
          open={unlinkDialogOpen}
          attendeeId={attendeeId}
          attendeeName={attendeeName}
          userEmail={userLink?.userEmail || ''}
          onOpenChange={setUnlinkDialogOpen}
          onSuccess={onRefresh}
        />

        <ChangeStatusDialog
          open={statusDialogOpen}
          attendeeId={attendeeId}
          attendeeName={attendeeName}
          currentStatus={currentStatus}
          onOpenChange={setStatusDialogOpen}
          onSuccess={onRefresh}
        />
      </CardContent>
    </Card>
  )
}
