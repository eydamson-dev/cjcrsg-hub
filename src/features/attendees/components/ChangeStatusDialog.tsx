'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { useConvexMutation } from '@convex-dev/react-query'
import { api } from '../../../../convex/_generated/api'
import { toast } from 'sonner'
import type { Id } from '../../../../convex/_generated/dataModel'
import type { AttendeeStatus } from '../types'
import {
  AttendeeStatusSelect,
  getStatusBadgeClass,
} from './AttendeeStatusSelect'

interface ChangeStatusDialogProps {
  open: boolean
  attendeeId: string
  attendeeName: string
  currentStatus: AttendeeStatus
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ChangeStatusDialog({
  open,
  attendeeId,
  attendeeName,
  currentStatus,
  onOpenChange,
  onSuccess,
}: ChangeStatusDialogProps) {
  const [newStatus, setNewStatus] = useState<AttendeeStatus>(currentStatus)
  const [isSaving, setIsSaving] = useState(false)
  const updateAttendee = useConvexMutation(api.attendees.mutations.update)

  const handleSave = async () => {
    if (newStatus === currentStatus) {
      onOpenChange(false)
      return
    }

    setIsSaving(true)
    try {
      await updateAttendee({
        id: attendeeId as Id<'attendees'>,
        status: newStatus,
      })
      toast.success(`${attendeeName} status changed to ${newStatus}`)
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update status'
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const getStatusBadge = (status: AttendeeStatus) => {
    return <Badge className={getStatusBadgeClass(status)}>{status}</Badge>
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Attendee Status</DialogTitle>
          <DialogDescription>
            Update the status for <strong>{attendeeName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Current Status
            </span>
            {getStatusBadge(currentStatus)}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">New Status</label>
            <AttendeeStatusSelect
              mode="simple"
              value={newStatus}
              onChange={(value) => setNewStatus(value as AttendeeStatus)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
