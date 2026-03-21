import { useState } from 'react'
import { RotateCcw, Trash2, Pencil } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Separator } from '~/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog'
import { toast } from 'sonner'
import { EventsBreadcrumb, BackLink } from './EventsBreadcrumb'
import { EventDetailHeader } from './EventDetailHeader'
import { EventAttendanceSummary } from './EventAttendanceSummary'
import { BasicInfoEditModal } from './BasicInfoEditModal'
import { DescriptionEditModal } from './DescriptionEditModal'
import { BannerUploader } from './BannerUploader'
import { MediaGallery, type MediaItem } from './MediaGallery'
import { mockEventTypes } from '../mocks'
import type { Event, AttendanceRecord, UpdateEventInput } from '../types'

interface EventDetailProps {
  event: Event
  attendance?: AttendanceRecord[]
  showBackLink?: boolean
  onUpdate?: (updates: UpdateEventInput) => void
  onRestore?: () => void
  onDelete?: () => void
  onAddAttendee?: () => void
  onDeleteAttendee?: (recordId: string) => void
}

export function EventDetail({
  event,
  attendance = [],
  showBackLink = false,
  onUpdate,
  onRestore,
  onDelete,
  onAddAttendee,
  onDeleteAttendee,
}: EventDetailProps) {
  const [currentEvent, setCurrentEvent] = useState<Event>(event)
  const [showBannerUploader, setShowBannerUploader] = useState(false)
  const [showBasicInfoModal, setShowBasicInfoModal] = useState(false)
  const [showDescriptionModal, setShowDescriptionModal] = useState(false)
  const [showMediaGallery, setShowMediaGallery] = useState(false)

  const handleUpdateBasicInfo = (updates: {
    name: string
    eventTypeId: string
    date: number
    startTime?: string
    endTime?: string
    location?: string
  }) => {
    const updatedEvent: Event = {
      ...currentEvent,
      ...updates,
      eventType:
        mockEventTypes.find((t) => t._id === updates.eventTypeId) ||
        currentEvent.eventType,
    }
    setCurrentEvent(updatedEvent)

    if (onUpdate) {
      onUpdate({ id: event._id, ...updates })
    }

    toast.success('Event basic info updated')
    setShowBasicInfoModal(false)
  }

  const handleUpdateDescription = (description: string) => {
    const updatedEvent: Event = {
      ...currentEvent,
      description,
    }
    setCurrentEvent(updatedEvent)

    if (onUpdate) {
      onUpdate({ id: event._id, description })
    }

    toast.success('Event description updated')
    setShowDescriptionModal(false)
  }

  const handleUpdateBanner = (bannerImage: string) => {
    const updatedEvent: Event = {
      ...currentEvent,
      bannerImage,
    }
    setCurrentEvent(updatedEvent)

    if (onUpdate) {
      onUpdate({ id: event._id, bannerImage })
    }

    toast.success('Event banner updated')
    setShowBannerUploader(false)
  }

  const handleAddMedia = (item: MediaItem) => {
    const updatedMedia = [...(currentEvent.media || []), item]
    const updatedEvent: Event = {
      ...currentEvent,
      media: updatedMedia,
    }
    setCurrentEvent(updatedEvent)

    if (onUpdate) {
      onUpdate({ id: event._id, media: updatedMedia })
    }

    toast.success('Media added')
  }

  const handleDeleteMedia = (index: number) => {
    const updatedMedia = (currentEvent.media || []).filter(
      (_, i) => i !== index,
    )
    const updatedEvent: Event = {
      ...currentEvent,
      media: updatedMedia,
    }
    setCurrentEvent(updatedEvent)

    if (onUpdate) {
      onUpdate({ id: event._id, media: updatedMedia })
    }

    toast.success('Media removed')
  }

  const handleRestore = () => {
    if (onRestore) {
      onRestore()
    } else {
      console.log('Restore event:', currentEvent._id)
      toast.success('Event restored')
    }
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete()
    } else {
      console.log('Delete event:', currentEvent._id)
      toast.success('Event deleted')
    }
  }

  return (
    <div className="space-y-6 p-4">
      <EventsBreadcrumb
        items={[
          { label: 'Archive', href: '/events/archive' },
          { label: currentEvent.name },
        ]}
      />

      {showBackLink && (
        <BackLink href="/events/archive" label="Back to Archive" />
      )}

      {/* Basic Info - Header with Banner */}
      <EventDetailHeader
        event={currentEvent}
        onEdit={() => setShowBasicInfoModal(true)}
        onBannerClick={() => setShowBannerUploader(true)}
      />

      {/* Description Section - Simple box with edit button beside title */}
      <div className="rounded-lg border p-4">
        <div className="mb-2 flex items-center justify-start gap-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Description
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDescriptionModal(true)}
            className="size-8 rounded-full bg-muted/50 text-muted-foreground opacity-60 transition-opacity hover:bg-muted hover:opacity-100"
          >
            <Pencil className="mr-1 size-3" />
          </Button>
        </div>
        <p className="text-sm leading-relaxed">
          {currentEvent.description || 'No description provided.'}
        </p>
      </div>

      {/* Media Gallery Section - Simple box with edit button beside title */}
      <div className="rounded-lg border p-4">
        <div className="mb-2 flex items-center justify-start gap-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Media Gallery ({currentEvent.media?.length || 0})
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMediaGallery(true)}
            className="size-8 rounded-full bg-muted/50 text-muted-foreground opacity-60 transition-opacity hover:bg-muted hover:opacity-100"
          >
            <Pencil className="mr-1 size-3" />
          </Button>
        </div>
        {currentEvent.media && currentEvent.media.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {currentEvent.media.slice(0, 6).map((item, index) => (
              <div
                key={index}
                className="relative aspect-square w-20 flex-shrink-0 overflow-hidden rounded-md border"
              >
                {item.type === 'video' ? (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <span className="text-xs text-muted-foreground">Video</span>
                  </div>
                ) : (
                  <img
                    src={item.url}
                    alt={item.caption || `Media ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
            ))}
            {(currentEvent.media?.length || 0) > 6 && (
              <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-md border bg-muted">
                <span className="text-sm text-muted-foreground">
                  +{currentEvent.media.length - 6}
                </span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No media uploaded.</p>
        )}
      </div>

      <EventAttendanceSummary
        attendance={attendance}
        totalCount={currentEvent.attendanceCount || attendance.length}
        onAddAttendee={onAddAttendee}
        onDeleteAttendee={onDeleteAttendee}
      />

      <Separator />

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {currentEvent.status === 'completed' && (
          <Button variant="outline" onClick={handleRestore}>
            <RotateCcw className="mr-2 size-4" />
            Restore Event
          </Button>
        )}

        <AlertDialog>
          <AlertDialogTrigger>
            <Button variant="destructive">
              <Trash2 className="mr-2 size-4" />
              Delete Event
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                event &quot;{currentEvent.name}&quot; and all associated
                attendance records.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Modals */}
      <BasicInfoEditModal
        open={showBasicInfoModal}
        event={currentEvent}
        eventTypes={mockEventTypes}
        onSave={handleUpdateBasicInfo}
        onClose={() => setShowBasicInfoModal(false)}
      />

      <DescriptionEditModal
        open={showDescriptionModal}
        description={currentEvent.description || ''}
        onSave={handleUpdateDescription}
        onClose={() => setShowDescriptionModal(false)}
      />

      <BannerUploader
        open={showBannerUploader}
        bannerImage={currentEvent.bannerImage}
        onUpload={handleUpdateBanner}
        onClose={() => setShowBannerUploader(false)}
      />

      <MediaGallery
        open={showMediaGallery}
        media={currentEvent.media || []}
        onAdd={handleAddMedia}
        onDelete={handleDeleteMedia}
        editable={true}
        onClose={() => setShowMediaGallery(false)}
      />
    </div>
  )
}
