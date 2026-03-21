import { Pencil, RotateCcw, Trash2 } from 'lucide-react'
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
import { EventsBreadcrumb, BackLink } from './EventsBreadcrumb'
import { EventDetailHeader } from './EventDetailHeader'
import { EventMediaGallery } from './EventMediaGallery'
import { EventAttendanceSummary } from './EventAttendanceSummary'
import type { Event, AttendanceRecord } from '../types'

interface EventDetailProps {
  event: Event
  attendance?: AttendanceRecord[]
  showBackLink?: boolean
  onEdit?: () => void
  onRestore?: () => void
  onDelete?: () => void
  onAddAttendee?: () => void
  onDeleteAttendee?: (recordId: string) => void
}

export function EventDetail({
  event,
  attendance = [],
  showBackLink = false,
  onEdit,
  onRestore,
  onDelete,
  onAddAttendee,
  onDeleteAttendee,
}: EventDetailProps) {
  const formatDescription = (text: string | undefined) => {
    if (!text) return null
    return (
      <div className="rounded-lg border p-4">
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">
          Description
        </h3>
        <p className="text-sm leading-relaxed">{text}</p>
      </div>
    )
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit()
    } else {
      // TODO: Navigate to edit route when created
      console.log('Edit event:', event._id)
    }
  }

  const handleRestore = () => {
    if (onRestore) {
      onRestore()
    } else {
      // TODO: Call restore mutation
      console.log('Restore event:', event._id)
    }
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete()
    } else {
      // TODO: Call delete mutation
      console.log('Delete event:', event._id)
    }
  }

  return (
    <div className="space-y-6 p-4">
      <EventsBreadcrumb
        items={[
          { label: 'Archive', href: '/events/archive' },
          { label: event.name },
        ]}
      />

      {showBackLink && (
        <BackLink href="/events/archive" label="Back to Archive" />
      )}

      <EventDetailHeader event={event} />

      {formatDescription(event.description)}

      <EventMediaGallery event={event} />

      <EventAttendanceSummary
        attendance={attendance}
        totalCount={event.attendanceCount || attendance.length}
        onAddAttendee={onAddAttendee}
        onDeleteAttendee={onDeleteAttendee}
      />

      <Separator />

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={handleEdit}>
          <Pencil className="mr-2 size-4" />
          Edit Event
        </Button>

        {event.status === 'completed' && (
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
                event &quot;{event.name}&quot; and all associated attendance
                records.
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
    </div>
  )
}
