'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { AttendeeForm } from '~/features/attendees/components/AttendeeForm'
import { useCreateAttendee } from '~/features/attendees/hooks/useAttendees'
import type { CreateAttendeeInput, Attendee } from '~/features/attendees/types'

interface CreateAttendeeModalProps {
  open?: boolean
  onSave: (attendee: Attendee) => void
  onClose?: () => void
}

export function CreateAttendeeModal({
  open,
  onSave,
  onClose,
}: CreateAttendeeModalProps) {
  const [isOpen, setIsOpen] = useState(open ?? false)

  const createAttendee = useCreateAttendee()

  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open)
    }
  }, [open])

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen)
    if (!newOpen && onClose) {
      onClose()
    }
  }

  const handleSubmit = async (data: CreateAttendeeInput) => {
    try {
      const result = await createAttendee.mutateAsync(data)
      // Create a temporary attendee object with the returned ID
      // The actual attendee data will be fetched when the parent queries for it
      const newAttendee: Attendee = {
        _id: result.toString(),
        ...data,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      onSave(newAttendee)
      handleOpenChange(false)
    } catch (error) {
      console.error('Failed to create attendee:', error)
      throw error
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Attendee</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <AttendeeForm
            onSubmit={handleSubmit}
            onCancel={() => handleOpenChange(false)}
            isSubmitting={createAttendee.isPending}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
