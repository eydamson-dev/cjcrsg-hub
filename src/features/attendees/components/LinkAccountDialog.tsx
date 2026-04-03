'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Skeleton } from '~/components/ui/skeleton'
import { Search, UserPlus, Loader2 } from 'lucide-react'
import { useListAllUsers } from '~/hooks/useCurrentUserRole'
import { useLinkToUser } from '~/features/attendees/hooks/useAttendeeAdmin'
import { toast } from 'sonner'
import type { Id } from '../../../../convex/_generated/dataModel'

interface LinkAccountDialogProps {
  open: boolean
  attendeeId: string
  attendeeName: string
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function LinkAccountDialog({
  open,
  attendeeId,
  attendeeName,
  onOpenChange,
  onSuccess,
}: LinkAccountDialogProps) {
  const [search, setSearch] = useState('')
  const [linkingUserId, setLinkingUserId] = useState<string | null>(null)
  const { data: users, isPending } = useListAllUsers(search)
  const linkToUser = useLinkToUser()

  const handleLink = async (userId: string, userEmail: string) => {
    setLinkingUserId(userId)
    try {
      await linkToUser({
        attendeeId: attendeeId as Id<'attendees'>,
        userId: userId as Id<'users'>,
      })
      toast.success(`${attendeeName} linked to ${userEmail}`)
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to link account'
      toast.error(message)
    } finally {
      setLinkingUserId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Link User Account</DialogTitle>
          <DialogDescription>
            Search and select a user to link to {attendeeName}
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="max-h-[300px] overflow-y-auto space-y-2">
          {isPending && (
            <>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-8 w-16" />
                </div>
              ))}
            </>
          )}

          {!isPending && users?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <UserPlus className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p>No users found</p>
            </div>
          )}

          {!isPending &&
            users?.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="space-y-1">
                  <p className="font-medium text-sm">
                    {user.name || 'Unnamed User'}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <Badge variant="outline" className="text-xs">
                    {user.role}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleLink(user._id, user.email || '')}
                  disabled={linkingUserId !== null}
                >
                  {linkingUserId === user._id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Link'
                  )}
                </Button>
              </div>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
