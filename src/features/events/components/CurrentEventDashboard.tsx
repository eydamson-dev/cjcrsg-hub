import { Pencil, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { EventBanner } from './EventBanner'
import { EventInfo } from './EventInfo'
import { AttendanceManager } from './AttendanceManager'
import type { Event } from '../types'

interface CurrentEventDashboardProps {
  event: Event
  onCompleteEvent?: () => void
  onCancelEvent?: () => void
  onEditEvent?: () => void
}

export function CurrentEventDashboard({
  event,
  onCompleteEvent,
  onCancelEvent,
  onEditEvent,
}: CurrentEventDashboardProps) {
  console.log('=== DEBUG: CurrentEventDashboard ===')
  console.log('Event:', event)
  console.log('Event ID:', event._id)
  console.log('Event Name:', event.name)
  console.log('Event Status:', event.status)
  console.log('=====================================')

  return (
    <div className="space-y-6">
      {/* LIVE Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm font-semibold text-green-600">LIVE</span>
        </div>
      </div>

      {/* Event Banner */}
      <EventBanner event={event} />

      {/* Event Info */}
      <EventInfo event={event} attendanceCount={event.attendanceCount || 0} />

      {/* Attendance Manager */}
      <AttendanceManager eventId={event._id} />

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 pt-4 border-t">
        {onEditEvent && (
          <Button variant="outline" onClick={onEditEvent}>
            <Pencil className="mr-2 size-4" />
            Edit Event
          </Button>
        )}

        {onCompleteEvent && (
          <Button onClick={onCompleteEvent}>
            <CheckCircle className="mr-2 size-4" />
            Complete Event
          </Button>
        )}

        {onCancelEvent && (
          <Button variant="destructive" onClick={onCancelEvent}>
            <XCircle className="mr-2 size-4" />
            Cancel Event
          </Button>
        )}
      </div>
    </div>
  )
}
