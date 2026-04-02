import { Button } from '~/components/ui/button'
import { Plus, History, Archive } from 'lucide-react'

export interface EventPageHeaderProps {
  title: string
  subtitle?: string
  eventColor?: string
  eventTypeId?: string
}

export function EventPageHeader({
  title,
  subtitle,
  eventColor,
  eventTypeId,
}: EventPageHeaderProps) {
  const historyUrl = eventTypeId
    ? `/events/history?type=${eventTypeId}`
    : '/events/history'
  const archiveUrl = eventTypeId
    ? `/events/archive?type=${eventTypeId}`
    : '/events/archive'
  const createEventUrl = eventTypeId
    ? `/events/new?type=${eventTypeId}`
    : '/events/new'

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {eventColor && (
          <div
            className="size-3 rounded-full"
            style={{ backgroundColor: eventColor }}
          />
        )}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => (window.location.href = historyUrl)}
        >
          <History className="mr-2 h-4 w-4" />
          Event History
        </Button>
        <Button
          variant="outline"
          onClick={() => (window.location.href = archiveUrl)}
        >
          <Archive className="mr-2 h-4 w-4" />
          Archive
        </Button>
        <Button onClick={() => (window.location.href = createEventUrl)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </div>
    </div>
  )
}
