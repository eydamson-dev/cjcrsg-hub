import { MapPin, Clock, Pencil, ImagePlus } from 'lucide-react'
import { Badge } from '~/components/ui/badge'
import { Card } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import type { Event } from '../types'

interface EventDetailHeaderProps {
  event: Event
  onEdit?: () => void
  onBannerClick?: () => void
}

export function EventDetailHeader({
  event,
  onEdit,
  onBannerClick,
}: EventDetailHeaderProps) {
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
      {/* Banner - Clickable for upload */}
      <div
        className="group relative aspect-[5/1] w-full cursor-pointer overflow-hidden"
        onClick={onBannerClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onBannerClick?.()
          }
        }}
      >
        {event.bannerImage ? (
          <>
            <img
              src={event.bannerImage}
              alt={event.name}
              className="h-full w-full object-cover transition-opacity group-hover:opacity-75"
            />
            {/* Upload overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
              <ImagePlus className="size-8 text-white drop-shadow-lg" />
              <span className="mt-2 text-sm font-medium text-white drop-shadow-lg">
                Click to {event.bannerImage ? 'change' : 'upload'} banner
              </span>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-muted transition-colors hover:bg-muted/80">
            <ImagePlus className="size-8 text-muted-foreground" />
            <span className="mt-2 text-sm text-muted-foreground">
              Click to upload banner
            </span>
          </div>
        )}
      </div>

      <div className="p-6">
        {/* Title row with edit button */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">{event.name}</h1>
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onEdit}
                className="size-8 rounded-full bg-muted/50 text-muted-foreground opacity-60 transition-opacity hover:bg-muted hover:opacity-100"
                aria-label="Edit event"
              >
                <Pencil className="size-4" />
              </Button>
            )}
          </div>
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
