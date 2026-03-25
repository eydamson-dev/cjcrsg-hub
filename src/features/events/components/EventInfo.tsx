import { useState } from 'react'
import { MapPin, Users, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import type { Event } from '../types'

interface EventInfoProps {
  event: Event
  attendanceCount: number
  defaultExpanded?: boolean
}

export function EventInfo({
  event,
  attendanceCount,
  defaultExpanded = true,
}: EventInfoProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <Card>
      <CardContent className="p-0">
        {/* Toggle Header */}
        <Button
          variant="ghost"
          className="w-full justify-between rounded-none px-4 py-3 h-auto hover:bg-muted/50"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <span className="font-medium">Event Details</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="size-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-4 text-muted-foreground" />
          )}
        </Button>

        {/* Collapsible Content */}
        {isExpanded && (
          <div className="border-t px-4 py-4 space-y-4">
            {/* Description */}
            {event.description && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Description
                </h4>
                <p className="text-sm leading-relaxed">{event.description}</p>
              </div>
            )}

            {/* Location & Count */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {event.location && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="size-4" />
                  <span>{event.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="size-4" />
                <span>{attendanceCount} attendees checked in</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
