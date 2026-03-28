import { useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'
import { Layout } from '~/components/layout/Layout'
import { ProtectedRoute } from '~/components/auth/ProtectedRoute'
import { requireAuth } from '~/lib/auth-guard'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { DatePicker } from '~/components/ui/date-picker'
import { Alert } from '~/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { BannerUploader } from '~/features/events/components/BannerUploader'
import {
  MediaGallery,
  type MediaItem,
} from '~/features/events/components/MediaGallery'
import { EventsBreadcrumb } from '~/features/events/components/EventsBreadcrumb'
import type { CreateEventInput } from '~/features/events/types'
import { useCreateEvent } from '~/features/events/hooks/useEventMutations'
import { useEventTypesList } from '~/features/events/hooks/useEventTypes'
import { z } from 'zod'

const searchSchema = z.object({
  type: z.string().optional(),
})

type SearchParams = z.infer<typeof searchSchema>

export const Route = createFileRoute('/events/new')({
  component: CreateEventPage,
  validateSearch: searchSchema,
  beforeLoad: async ({ context }) => {
    requireAuth(context)
  },
})

function CreateEventPage() {
  const navigate = useNavigate()
  const createEvent = useCreateEvent()
  const { data: eventTypes } = useEventTypesList()
  const searchParams = useSearch({ from: '/events/new' }) as SearchParams

  // Pre-select event type from query param if provided
  const [name, setName] = useState('')
  const [eventTypeId, setEventTypeId] = useState(searchParams.type || '')
  const [date, setDate] = useState<number | undefined>(Date.now())
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [bannerImage, setBannerImage] = useState('')
  const [media, setMedia] = useState<MediaItem[]>([])

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({})

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    try {
      const eventData: CreateEventInput = {
        name,
        eventTypeId,
        date: date!,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        location: location || undefined,
        description: description || undefined,
        bannerImage: bannerImage || undefined,
        media: media.length > 0 ? media : undefined,
      }

      await createEvent.mutateAsync(eventData)
      navigate({ to: '/events' })
    } catch (error) {
      // Error is handled by the mutation hook with toast
    }
  }

  const handleCancel = () => {
    navigate({ to: '/events' })
  }

  const handleAddMedia = (item: MediaItem) => {
    setMedia([...media, item])
  }

  const handleDeleteMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index))
  }

  // Check if date is in the past
  const isPastDate = date ? date < Date.now() : false

  // Generate time options
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
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6 p-4">
          <EventsBreadcrumb items={[{ label: 'Create New Event' }]} />

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info Section */}
            <div className="rounded-lg border">
              <div className="border-b p-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
              </div>
              <div className="space-y-4 p-4">
                {/* Event Name */}
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

                {/* Event Type and Date */}
                <div className="grid gap-4 sm:grid-cols-2">
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
                        {eventTypes?.map((type) => (
                          <SelectItem key={type._id} value={type._id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.eventTypeId && (
                      <p className="text-sm text-destructive">
                        {errors.eventTypeId}
                      </p>
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

                {/* Start Time and End Time */}
                <div className="grid gap-4 sm:grid-cols-2">
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
                      <p className="text-sm text-destructive">
                        {errors.endTime}
                      </p>
                    )}
                  </div>
                </div>

                {/* Location */}
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
            </div>

            {/* Description Section */}
            <div className="rounded-lg border">
              <div className="border-b p-4">
                <h3 className="text-lg font-semibold">Description</h3>
              </div>
              <div className="p-4">
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter event description..."
                  className="min-h-[120px]"
                />
              </div>
            </div>

            {/* Banner Section */}
            <div className="rounded-lg border">
              <div className="border-b p-4">
                <h3 className="text-lg font-semibold">Banner Image</h3>
              </div>
              <div className="p-4">
                <BannerUploader
                  bannerImage={bannerImage}
                  onUpload={setBannerImage}
                />
              </div>
            </div>

            {/* Media Gallery Section */}
            <div className="rounded-lg border">
              <div className="border-b p-4">
                <h3 className="text-lg font-semibold">
                  Media Gallery ({media.length})
                </h3>
              </div>
              <div className="p-4">
                <MediaGallery
                  media={media}
                  onAdd={handleAddMedia}
                  onDelete={handleDeleteMedia}
                  editable={true}
                />
              </div>
            </div>

            {/* Past Date Warning */}
            {isPastDate && (
              <Alert className="border-orange-500/50 bg-orange-50 text-orange-900 dark:bg-orange-950 dark:text-orange-100">
                <AlertCircle className="size-4 text-orange-600 dark:text-orange-400" />
                <div className="ml-2">
                  <p className="text-sm font-medium">
                    Creating event in the past
                  </p>
                  <p className="text-sm text-orange-700/80 dark:text-orange-300/80">
                    This event date has already passed.
                  </p>
                </div>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={createEvent.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createEvent.isPending}>
                {createEvent.isPending ? 'Creating...' : 'Create Event'}
              </Button>
            </div>
          </form>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
