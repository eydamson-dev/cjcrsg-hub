import { Users } from 'lucide-react'
import { Card } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import type { Event } from '../types'

interface EventArchiveCardsProps {
  events: Event[]
  onEventClick: (eventId: string) => void
}

export function EventArchiveCards({
  events,
  onEventClick,
}: EventArchiveCardsProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <Card
          key={event._id}
          className="cursor-pointer overflow-hidden transition-shadow hover:shadow-md"
          onClick={() => onEventClick(event._id)}
        >
          {event.bannerImage ? (
            <div className="aspect-[16/9] w-full overflow-hidden">
              <img
                src={event.bannerImage}
                alt={event.name}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-[16/9] w-full bg-muted" />
          )}

          <div className="p-3">
            <h3 className="mb-0.5 text-sm font-semibold line-clamp-1">
              {event.name}
            </h3>
            <p className="mb-2 text-xs text-muted-foreground">
              {formatDate(event.date)}
            </p>

            <div className="flex items-center justify-between">
              <Badge
                variant="secondary"
                className="gap-1 text-xs"
                style={
                  event.eventType?.color
                    ? { borderColor: event.eventType.color }
                    : undefined
                }
              >
                <span
                  className="size-1.5 rounded-full"
                  style={{
                    backgroundColor: event.eventType?.color || 'currentColor',
                  }}
                />
                {event.eventType?.name || 'Unknown'}
              </Badge>

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="size-3" />
                <span>{event.attendanceCount || 0}</span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
