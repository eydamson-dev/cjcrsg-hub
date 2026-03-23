import { MapPin, Clock } from 'lucide-react'
import { Badge } from '~/components/ui/badge'
import type { Event } from '../types'

interface EventBannerProps {
  event: Event
}

export function EventBanner({ event }: EventBannerProps) {
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
      {
        variant: 'default' | 'secondary' | 'outline' | 'destructive'
        className?: string
      }
    > = {
      active: {
        variant: 'default',
        className: 'bg-green-500 hover:bg-green-600',
      },
      upcoming: { variant: 'secondary' },
      completed: { variant: 'outline' },
      cancelled: { variant: 'destructive' },
    }
    const style = statusStyles[event.status] || { variant: 'secondary' }
    return (
      <Badge variant={style.variant} className={style.className}>
        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Banner Image - 4:1 aspect ratio for compact display */}
      <div className="relative aspect-[4/1] w-full overflow-hidden max-h-[300px]">
        {event.bannerImage ? (
          <img
            src={event.bannerImage}
            alt={event.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary/40">
                {event.name.charAt(0)}
              </div>
            </div>
          </div>
        )}

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white drop-shadow-lg">
                {event.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-sm text-white/90">
                <div className="flex items-center gap-1">
                  <Clock className="size-4" />
                  <span>
                    {formatDate(event.date)}
                    {event.startTime && ` • ${formatTime(event.startTime)}`}
                    {event.endTime && ` - ${formatTime(event.endTime)}`}
                  </span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="size-4" />
                    <span>{event.location}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {event.eventType && (
                <Badge
                  variant="secondary"
                  className="gap-1.5 bg-white/20 text-white border-white/30"
                >
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: event.eventType.color }}
                  />
                  {event.eventType.name}
                </Badge>
              )}
              {getStatusBadge()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
