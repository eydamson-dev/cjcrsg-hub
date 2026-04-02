import { useState } from 'react'
import {
  ArrowLeft,
  Pencil,
  Play,
  CheckCircle,
  XCircle,
  List,
  Image as ImageIcon,
  Save,
  Trash2,
  Archive,
} from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { cn } from '~/lib/utils'
import { AttendanceManager } from './AttendanceManager'
import { BasicInfoEditModal } from './BasicInfoEditModal'
import { DescriptionEditModal } from './DescriptionEditModal'
import { BannerUploader } from './BannerUploader'
import { MediaGallery } from './MediaGallery'
import { StatusAndTypeEditModal } from './StatusAndTypeEditModal'
import { useEventTypesList } from '../hooks/useEventTypes'
import {
  useUpdateEvent,
  useStartEvent,
  useCompleteEvent,
  useCancelEvent,
  useArchiveEvent,
} from '../hooks/useEventMutations'
import type { Event } from '../types'

interface GenericEventDetailsProps {
  event: Event
  mode: 'dashboard' | 'detail'
  isUnsaved?: boolean
  onSave?: () => void
  onCancel?: () => void
  onUpdate?: (updates: Partial<Event>) => void
}

export function GenericEventDetails({
  event,
  mode,
  isUnsaved = false,
  onSave,
  onCancel,
  onUpdate,
}: GenericEventDetailsProps) {
  const [showBasicInfoModal, setShowBasicInfoModal] = useState(false)
  const [showDescriptionModal, setShowDescriptionModal] = useState(false)
  const [showBannerUploader, setShowBannerUploader] = useState(false)
  const [showMediaGallery, setShowMediaGallery] = useState(false)
  const [showStatusAndTypeModal, setShowStatusAndTypeModal] = useState(false)

  const { data: eventTypes } = useEventTypesList()
  const updateEvent = useUpdateEvent()
  const startEvent = useStartEvent()
  const completeEvent = useCompleteEvent()
  const cancelEvent = useCancelEvent()
  const archiveEvent = useArchiveEvent()

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (time: string | undefined) => {
    if (!time) return ''
    const [hours, minutes] = time.split(':')
    const h = parseInt(hours, 10)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const hour12 = h % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const handleUpdateBasicInfo = async (updates: {
    name: string
    date: number
    startTime?: string
    endTime?: string
    location?: string
  }) => {
    if (isUnsaved) {
      onUpdate?.({
        name: updates.name,
        date: updates.date,
        startTime: updates.startTime,
        endTime: updates.endTime,
        location: updates.location,
      })
      setShowBasicInfoModal(false)
      return
    }

    try {
      await updateEvent.mutateAsync({
        id: event._id,
        ...updates,
      })
      setShowBasicInfoModal(false)
    } catch (error) {
      // Error handled by hook
    }
  }

  const handleUpdateDescription = async (description: string) => {
    if (isUnsaved) {
      onUpdate?.({ description })
      setShowDescriptionModal(false)
      return
    }

    try {
      await updateEvent.mutateAsync({
        id: event._id,
        description,
      })
      setShowDescriptionModal(false)
    } catch (error) {
      // Error handled by hook
    }
  }

  const handleStartEvent = async () => {
    try {
      await startEvent.mutateAsync(event._id)
    } catch (error) {
      // Error handled by hook
    }
  }

  const handleCompleteEvent = async () => {
    try {
      await completeEvent.mutateAsync(event._id)
    } catch (error) {
      // Error handled by hook
    }
  }

  const handleCancelEvent = async () => {
    try {
      await cancelEvent.mutateAsync(event._id)
    } catch (error) {
      // Error handled by hook
    }
  }

  const handleArchiveEvent = async () => {
    try {
      await archiveEvent.mutateAsync(event._id)
    } catch (error) {
      // Error handled by hook
    }
  }

  const handleSaveUnsaved = () => {
    onSave?.()
  }

  const handleCancelUnsaved = () => {
    onCancel?.()
  }

  const handleUpdateStatusAndType = async (updates: {
    status: 'upcoming' | 'active' | 'completed' | 'cancelled'
    eventTypeId: string
  }) => {
    const selectedEventType = eventTypes?.find(
      (et) => et._id === updates.eventTypeId,
    )

    if (isUnsaved) {
      onUpdate?.({
        status: updates.status,
        eventTypeId: updates.eventTypeId,
        eventType: selectedEventType
          ? {
              _id: selectedEventType._id,
              name: selectedEventType.name,
              color: selectedEventType.color || '#3b82f6',
              isActive: selectedEventType.isActive,
              createdAt: selectedEventType.createdAt,
            }
          : undefined,
      })
      setShowStatusAndTypeModal(false)
      return
    }

    try {
      await updateEvent.mutateAsync({
        id: event._id,
        status: updates.status,
        eventTypeId: updates.eventTypeId,
      })
      setShowStatusAndTypeModal(false)
    } catch (error) {
      // Error handled by hook
    }
  }

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        {mode === 'dashboard' ? (
          <Button
            variant="ghost"
            className="-ml-4"
            onClick={() => (window.location.href = '/events/archive')}
          >
            <List className="mr-2 h-4 w-4" />
            View All Events
          </Button>
        ) : (
          <Button
            variant="ghost"
            className="-ml-4"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        )}
      </div>

      {/* Event Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className={cn(
              'gap-1.5 border-2 cursor-pointer hover:bg-accent',
              event.status === 'upcoming' && 'border-gray-300',
              event.status === 'active' && 'border-green-500',
              event.status === 'completed' && 'border-blue-500',
              event.status === 'cancelled' && 'border-red-500',
            )}
            onClick={() => setShowStatusAndTypeModal(true)}
          >
            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </Badge>
          {event.eventType && (
            <Badge
              variant="outline"
              className="gap-1.5 cursor-pointer hover:bg-accent"
              onClick={() => setShowStatusAndTypeModal(true)}
            >
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: event.eventType.color }}
              />
              {event.eventType.name}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={() => setShowStatusAndTypeModal(true)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
        <h1 className="text-3xl font-bold">{event.name}</h1>
      </div>

      {/* Editable Banner */}
      <div
        className="relative group cursor-pointer"
        onClick={() => setShowBannerUploader(true)}
      >
        <div className="relative aspect-[4/1] w-full overflow-hidden max-h-[200px] rounded-lg">
          {event.bannerImage ? (
            <img
              src={event.bannerImage}
              alt={event.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <div className="text-center">
                <ImageIcon className="mx-auto h-8 w-8 text-primary/40 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to add banner
                </p>
              </div>
            </div>
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <Pencil className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>

      {/* Basic Info Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Event Details</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowBasicInfoModal(true)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">{formatDate(event.date)}</p>
            </div>
            {(event.startTime || event.endTime) && (
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="font-medium">
                  {event.startTime && formatTime(event.startTime)}
                  {event.startTime && event.endTime && ' - '}
                  {event.endTime && formatTime(event.endTime)}
                </p>
              </div>
            )}
            {event.location && (
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{event.location}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Description Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Description</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDescriptionModal(true)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </CardHeader>
        <CardContent>
          {event.description ? (
            <p className="text-muted-foreground">{event.description}</p>
          ) : (
            <p className="text-muted-foreground italic">No description added</p>
          )}
        </CardContent>
      </Card>

      {/* Media Gallery Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Media Gallery ({event.media?.length || 0})</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMediaGallery(true)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Manage
          </Button>
        </CardHeader>
        <CardContent>
          {event.media && event.media.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {event.media.slice(0, 4).map((item, index) => (
                <div
                  key={index}
                  className="relative aspect-video rounded-lg overflow-hidden border bg-muted"
                >
                  {item.type === 'image' ? (
                    <img
                      src={item.url}
                      alt={item.caption || `Media ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-black/5">
                      <div className="text-center">
                        <div className="mx-auto w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                          <div className="w-0 h-0 border-t-4 border-t-transparent border-l-6 border-l-primary border-b-4 border-b-transparent ml-0.5" />
                        </div>
                        <p className="text-xs text-muted-foreground">Video</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {event.media.length > 4 && (
                <div className="flex items-center justify-center aspect-video rounded-lg border bg-muted">
                  <p className="text-sm text-muted-foreground">
                    +{event.media.length - 4} more
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setShowMediaGallery(true)}
            >
              <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No media added</p>
              <p className="text-xs text-muted-foreground mt-1">
                Click to add photos or videos
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendance Manager - Hidden for unsaved events */}
      {!isUnsaved && <AttendanceManager eventId={event._id} />}

      {/* Unsaved Event Info Card */}
      {isUnsaved && (
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-yellow-100 p-2">
                <Save className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-yellow-900">
                  Unsaved Event Draft
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  This event is not saved yet. Attendance tracking will be
                  available after you save the event.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 pt-4 border-t">
        {isUnsaved ? (
          <>
            <Button onClick={handleSaveUnsaved}>
              <Save className="mr-2 h-4 w-4" />
              Save Event
            </Button>
            <Button variant="outline" onClick={handleCancelUnsaved}>
              <Trash2 className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </>
        ) : (
          <>
            {event.status === 'upcoming' && (
              <Button
                onClick={handleStartEvent}
                disabled={startEvent.isPending}
              >
                <Play className="mr-2 h-4 w-4" />
                Start Event
              </Button>
            )}

            {event.status === 'active' && (
              <>
                <Button
                  onClick={handleCompleteEvent}
                  disabled={completeEvent.isPending}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Complete Event
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCancelEvent}
                  disabled={cancelEvent.isPending}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel Event
                </Button>
              </>
            )}

            {/* Archive button - available for all saved events */}
            <Button
              variant="outline"
              onClick={handleArchiveEvent}
              disabled={archiveEvent.isPending}
              data-testid="archive-event-button"
            >
              <Archive className="mr-2 h-4 w-4" />
              Archive Event
            </Button>
          </>
        )}
      </div>

      {/* Modals */}
      <BasicInfoEditModal
        open={showBasicInfoModal}
        event={event}
        onSave={handleUpdateBasicInfo}
        onClose={() => setShowBasicInfoModal(false)}
      />

      {eventTypes && (
        <StatusAndTypeEditModal
          open={showStatusAndTypeModal}
          event={event}
          eventTypes={eventTypes.map((et) => ({
            ...et,
            color: et.color || '#3b82f6',
          }))}
          onSave={handleUpdateStatusAndType}
          onClose={() => setShowStatusAndTypeModal(false)}
        />
      )}

      <DescriptionEditModal
        open={showDescriptionModal}
        description={event.description || ''}
        onSave={handleUpdateDescription}
        onClose={() => setShowDescriptionModal(false)}
      />

      <BannerUploader
        open={showBannerUploader}
        eventId={event._id}
        bannerImage={event.bannerImage}
        onClose={() => setShowBannerUploader(false)}
      />

      <MediaGallery
        open={showMediaGallery}
        eventId={event._id}
        media={event.media || []}
        onClose={() => setShowMediaGallery(false)}
      />
    </div>
  )
}
