import { useState, useEffect } from 'react'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { DatePicker } from '~/components/ui/date-picker'
import type { Event, EventType } from '../types'

interface BasicInfoEditModalProps {
  open?: boolean
  event: Event
  eventTypes: EventType[]
  onSave: (updates: {
    name: string
    eventTypeId: string
    date: number
    startTime?: string
    endTime?: string
    location?: string
  }) => void
  onClose?: () => void
}

export function BasicInfoEditModal({
  open,
  event,
  eventTypes,
  onSave,
  onClose,
}: BasicInfoEditModalProps) {
  const [isOpen, setIsOpen] = useState(open ?? false)
  const [name, setName] = useState(event.name)
  const [eventTypeId, setEventTypeId] = useState(event.eventTypeId)
  const [date, setDate] = useState<number | undefined>(event.date)
  const [startTime, setStartTime] = useState(event.startTime || '')
  const [endTime, setEndTime] = useState(event.endTime || '')
  const [location, setLocation] = useState(event.location || '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open)
    }
  }, [open])

  useEffect(() => {
    if (isOpen) {
      setName(event.name)
      setEventTypeId(event.eventTypeId)
      setDate(event.date)
      setStartTime(event.startTime || '')
      setEndTime(event.endTime || '')
      setLocation(event.location || '')
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

    if (!name.trim()) {
      newErrors.name = 'Event name is required'
    } else if (name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!eventTypeId) {
      newErrors.eventTypeId = 'Event type is required'
    }

    if (!date) {
      newErrors.date = 'Date is required'
    }

    if (startTime && endTime && startTime >= endTime) {
      newErrors.endTime = 'End time must be after start time'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validate()) return

    onSave({
      name,
      eventTypeId,
      date: date!,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      location: location || undefined,
    })
    handleOpenChange(false)
  }

  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2)
    const minute = i % 2 === 0 ? '00' : '30'
    const period = hour < 12 ? 'AM' : 'PM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return {
      value: `${hour.toString().padStart(2, '0')}:${minute}`,
      label: `${displayHour}:${minute} ${period}`,
    }
  })

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Basic Info</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Event Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter event name"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventType">Event Type *</Label>
              <Select
                value={eventTypeId}
                onValueChange={(value) => setEventTypeId(value || '')}
              >
                <SelectTrigger id="eventType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((type) => (
                    <SelectItem key={type._id} value={type._id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.eventTypeId && (
                <p className="text-sm text-destructive">{errors.eventTypeId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Date *</Label>
              <DatePicker value={date} onChange={setDate} />
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Select
                value={startTime}
                onValueChange={(value) => setStartTime(value || '')}
              >
                <SelectTrigger id="startTime">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {timeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Select
                value={endTime}
                onValueChange={(value) => setEndTime(value || '')}
              >
                <SelectTrigger id="endTime">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {timeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.endTime && (
                <p className="text-sm text-destructive">{errors.endTime}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location"
            />
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
