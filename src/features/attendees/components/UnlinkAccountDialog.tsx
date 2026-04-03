'use client'

import { useState } from 'react'
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
import { Alert, AlertDescription } from '~/components/ui/alert'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { useUnlinkFromUser } from '~/features/attendees/hooks/useAttendeeAdmin'
import { toast } from 'sonner'
import type { Id } from '../../../../convex/_generated/dataModel'

interface UnlinkAccountDialogProps {
  open: boolean
  attendeeId: string
  attendeeName: string
  userEmail: string
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function UnlinkAccountDialog({
  open,
  attendeeId,
  attendeeName,
  userEmail,
  onOpenChange,
  onSuccess,
}: UnlinkAccountDialogProps) {
  const [isUnlinking, setIsUnlinking] = useState(false)
  const unlinkFromUser = useUnlinkFromUser()

  const handleUnlink = async () => {
    setIsUnlinking(true)
    try {
      await unlinkFromUser({
        attendeeId: attendeeId as Id<'attendees'>,
      })
      toast.success(`Unlinked ${attendeeName} from ${userEmail}`)
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to unlink account'
      toast.error(message)
    } finally {
      setIsUnlinking(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unlink User Account</AlertDialogTitle>
          <AlertDialogDescription>
            This will unlink <strong>{attendeeName}</strong> from the user
            account <strong>{userEmail}</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            If this is the user&apos;s only sign-in method, they will lose
            access to their account. Make sure they have another authentication
            method (password, Google, or Facebook) before unlinking.
          </AlertDescription>
        </Alert>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isUnlinking}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleUnlink()
            }}
            disabled={isUnlinking}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isUnlinking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Unlinking...
              </>
            ) : (
              'Unlink Account'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
