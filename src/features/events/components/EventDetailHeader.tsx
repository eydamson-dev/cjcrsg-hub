import { MapPin, Clock } from 'lucide-react'
import { Badge } from '~/components/ui/badge'
import { Card } from '~/components/ui/card'
import type { Event } from '../types'

interface EventDetailHeaderProps {
  event: Event
}

export function EventDetailHeader({ event }: EventDetailHeaderProps) {
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
    const statusStyles: Record<
      string,
      { variant: 'default' | 'secondary' | 'outline'; className?: string }
    > = {
      active: { variant: 'default', className: 'bg-green-500' },
      upcoming: { variant: 'secondary' },
      completed: { variant: 'outline' },
      cancelled: { variant: 'destructive' as 'default' },
    }
    const style = statusStyles[event.status] || { variant: 'secondary' }
    return (
      <Badge variant={style.variant} className={style.className}>
        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
      </Badge>
    )
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="aspect-[5/1] w-full overflow-hidden">
        {event.bannerImage ? (
          <img
            src={event.bannerImage}
            alt={event.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted">
            <span className="text-muted-foreground">No banner image</span>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <h1 className="text-2xl font-semibold">{event.name}</h1>
          {getStatusBadge()}
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="size-4" />
            <span>
              {formatDate(event.date)}
              {event.startTime && ` • ${formatTime(event.startTime)}`}
              {event.endTime && ` - ${formatTime(event.endTime)}`}
            </span>
          </div>

          {event.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="size-4" />
              <span>{event.location}</span>
            </div>
          )}
        </div>

        {event.eventType && (
          <div className="mt-3">
            <Badge
              variant="secondary"
              className="gap-1.5"
              style={{ borderColor: event.eventType.color }}
            >
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: event.eventType.color }}
              />
              {event.eventType.name}
            </Badge>
          </div>
        )}
      </div>
    </Card>
  )
}
