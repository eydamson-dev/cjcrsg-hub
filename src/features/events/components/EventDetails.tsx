import { useState } from 'react'
import {
  ArrowLeft,
  Pencil,
  Play,
  CheckCircle,
  XCircle,
  List,
  Image as ImageIcon,
} from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { AttendanceManager } from './AttendanceManager'
import { BasicInfoEditModal } from './BasicInfoEditModal'
import { DescriptionEditModal } from './DescriptionEditModal'
import { BannerUploader } from './BannerUploader'
import { MediaGallery, type MediaItem } from './MediaGallery'
import { useEventTypesList } from '../hooks/useEventTypes'
import {
  useUpdateEvent,
  useStartEvent,
  useCompleteEvent,
  useCancelEvent,
} from '../hooks/useEventMutations'
import type { Event } from '../types'

interface EventDetailsProps {
  event: Event
  mode: 'dashboard' | 'detail'
  onEventUpdated?: () => void
}

export function EventDetails({
  event,
  mode,
  onEventUpdated,
}: EventDetailsProps) {
  const [showBasicInfoModal, setShowBasicInfoModal] = useState(false)
  const [showDescriptionModal, setShowDescriptionModal] = useState(false)
  const [showBannerUploader, setShowBannerUploader] = useState(false)
  const [showMediaGallery, setShowMediaGallery] = useState(false)

  const { data: eventTypes } = useEventTypesList()
  const updateEvent = useUpdateEvent()
  const startEvent = useStartEvent()
  const completeEvent = useCompleteEvent()
  const cancelEvent = useCancelEvent()

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

  const getStatusBadge = () => {
    switch (event.status) {
      case 'active':
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            <span className="mr-1.5 relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            LIVE
          </span>
        )
      case 'completed':
        return <Badge variant="outline">Completed</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="secondary">Upcoming</Badge>
    }
  }

  const handleUpdateBasicInfo = async (updates: {
    name: string
    eventTypeId: string
    date: number
    startTime?: string
    endTime?: string
    location?: string
  }) => {
    try {
      await updateEvent.mutateAsync({
        id: event._id,
        ...updates,
      })
      setShowBasicInfoModal(false)
      onEventUpdated?.()
    } catch (error) {
      // Error handled by hook
    }
  }

  const handleUpdateDescription = async (description: string) => {
    try {
      await updateEvent.mutateAsync({
        id: event._id,
        description,
      })
      setShowDescriptionModal(false)
      onEventUpdated?.()
    } catch (error) {
      // Error handled by hook
    }
  }

  const handleUpdateBanner = async (bannerImage: string) => {
    try {
      await updateEvent.mutateAsync({
        id: event._id,
        bannerImage,
      })
      setShowBannerUploader(false)
      onEventUpdated?.()
    } catch (error) {
      // Error handled by hook
    }
  }

  const handleAddMedia = async (item: MediaItem) => {
    const currentMedia = event.media || []
    try {
      await updateEvent.mutateAsync({
        id: event._id,
        media: [...currentMedia, item],
      })
      onEventUpdated?.()
    } catch (error) {
      // Error handled by hook
    }
  }

  const handleDeleteMedia = async (index: number) => {
    const currentMedia = event.media || []
    const newMedia = currentMedia.filter((_, i) => i !== index)
    try {
      await updateEvent.mutateAsync({
        id: event._id,
        media: newMedia,
      })
      onEventUpdated?.()
    } catch (error) {
      // Error handled by hook
    }
  }

  const handleStartEvent = async () => {
    try {
      await startEvent.mutateAsync(event._id)
      onEventUpdated?.()
    } catch (error) {
      // Error handled by hook
    }
  }

  const handleCompleteEvent = async () => {
    try {
      await completeEvent.mutateAsync(event._id)
      onEventUpdated?.()
    } catch (error) {
      // Error handled by hook
    }
  }

  const handleCancelEvent = async () => {
    try {
      await cancelEvent.mutateAsync(event._id)
      onEventUpdated?.()
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
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          {event.eventType && (
            <Badge variant="outline" className="gap-1.5">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: event.eventType.color }}
              />
              {event.eventType.name}
            </Badge>
          )}
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
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <p className="font-medium">
                {event.eventType?.name || 'Unknown'}
              </p>
            </div>
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

      {/* Attendance Manager */}
      <AttendanceManager eventId={event._id} />

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 pt-4 border-t">
        {event.status === 'upcoming' && (
          <Button onClick={handleStartEvent} disabled={startEvent.isPending}>
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
      </div>

      {/* Modals */}
      {eventTypes && (
        <BasicInfoEditModal
          open={showBasicInfoModal}
          event={event}
          eventTypes={eventTypes.map((et) => ({
            ...et,
            color: et.color || '#3b82f6',
          }))}
          onSave={handleUpdateBasicInfo}
          onClose={() => setShowBasicInfoModal(false)}
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
        bannerImage={event.bannerImage}
        onUpload={handleUpdateBanner}
        onClose={() => setShowBannerUploader(false)}
      />

      <MediaGallery
        open={showMediaGallery}
        media={event.media || []}
        onAdd={handleAddMedia}
        onDelete={handleDeleteMedia}
        onClose={() => setShowMediaGallery(false)}
      />
    </div>
  )
}
