import { Users } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import type { Event } from '../types'

interface EventArchiveTableProps {
  events: Event[]
  onEventClick: (eventId: string) => void
}

export function EventArchiveTable({
  events,
  onEventClick,
}: EventArchiveTableProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Banner</TableHead>
            <TableHead>Event Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-center">Attendance</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow
              key={event._id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onEventClick(event._id)}
            >
              <TableCell>
                {event.bannerImage ? (
                  <img
                    src={event.bannerImage}
                    alt={event.name}
                    className="size-12 rounded-md object-cover"
                  />
                ) : (
                  <div className="size-12 rounded-md bg-muted" />
                )}
              </TableCell>
              <TableCell className="font-medium">{event.name}</TableCell>
              <TableCell>{formatDate(event.date)}</TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className="gap-1.5"
                  style={
                    event.eventType?.color
                      ? { borderColor: event.eventType.color }
                      : undefined
                  }
                >
                  <span
                    className="size-2 rounded-full"
                    style={{
                      backgroundColor: event.eventType?.color || 'currentColor',
                    }}
                  />
                  {event.eventType?.name || 'Unknown'}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Users className="size-4 text-muted-foreground" />
                  <span>{event.attendanceCount || 0}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEventClick(event._id)
                  }}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
