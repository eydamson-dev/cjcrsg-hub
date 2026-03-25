import { useState, useEffect } from 'react'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import type { Event, EventStatus, EventType } from '../types'

interface StatusAndTypeEditModalProps {
  open?: boolean
  event: Event
  eventTypes: EventType[]
  onSave: (updates: { status: EventStatus; eventTypeId: string }) => void
  onClose?: () => void
}

export function StatusAndTypeEditModal({
  open,
  event,
  eventTypes,
  onSave,
  onClose,
}: StatusAndTypeEditModalProps) {
  const [isOpen, setIsOpen] = useState(open ?? false)
  const [status, setStatus] = useState<EventStatus>(event.status)
  const [eventTypeId, setEventTypeId] = useState(event.eventTypeId)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open)
    }
  }, [open])

  useEffect(() => {
    if (isOpen) {
      setStatus(event.status)
      setEventTypeId(event.eventTypeId)
      setErrors({})
    }
  }, [isOpen, event])

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen)
    if (!newOpen && onClose) {
      onClose()
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!eventTypeId) {
      newErrors.eventTypeId = 'Event type is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validate()) return

    onSave({
      status,
      eventTypeId,
    })
    handleOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Event Status</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as EventStatus)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventType">Event Type *</Label>
            <Select
              value={eventTypeId}
              onValueChange={(value) => setEventTypeId(value || '')}
            >
              <SelectTrigger id="eventType">
                <SelectValue placeholder="Select type">
                  {eventTypes.find((t) => t._id === eventTypeId)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((type) => (
                  <SelectItem key={type._id} value={type._id}>
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: type.color || '#3b82f6' }}
                      />
                      {type.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.eventTypeId && (
              <p className="text-sm text-destructive">{errors.eventTypeId}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
