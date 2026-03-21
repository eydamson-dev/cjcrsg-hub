import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Plus, CalendarDays } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui/card'
import { QuickStats } from './QuickStats'
import { mockEventStats } from '../mocks'

interface EmptyEventStateProps {
  onStartEvent?: () => void
  stats?: {
    eventsThisMonth: number
    totalEvents: number
    lastEvent: string
    nextScheduled: string
  }
}

export function EmptyEventState({
  onStartEvent,
  stats = mockEventStats,
}: EmptyEventStateProps) {
  const navigate = useNavigate()
  const [isHovered, setIsHovered] = useState(false)

  const handleStartEvent = () => {
    if (onStartEvent) {
      onStartEvent()
    } else {
      // TODO: Update route when events/new is created
      console.log('Navigate to create event')
    }
  }

  return (
    <div className="flex h-full items-center justify-center p-4">
      <Card className="w-full max-w-lg border-dashed">
        <div className="flex flex-col items-center gap-6 p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <button
                onClick={handleStartEvent}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`
                  flex size-20 items-center justify-center rounded-full
                  bg-primary text-primary-foreground
                  transition-all duration-200 ease-out
                  hover:scale-105 hover:shadow-lg
                  ${isHovered ? 'scale-105 shadow-lg' : ''}
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                `}
                aria-label="Start New Event"
              >
                <Plus className="size-10" />
              </button>
              {isHovered && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 animate-in fade-in-0 zoom-in-95 duration-200">
                  <span className="inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    Click to start
                  </span>
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold">Start New Event</h2>
              <p className="text-sm text-muted-foreground">
                Create an event to begin tracking attendance
              </p>
            </div>
          </div>

          <div className="w-full border-t pt-6">
            <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="size-4" />
              <span>Quick Stats</span>
            </div>
            <QuickStats
              eventsThisMonth={stats.eventsThisMonth}
              totalEvents={stats.totalEvents}
              lastEvent={stats.lastEvent}
              nextScheduled={stats.nextScheduled}
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: '/events/archive' })}
            className="mt-2"
          >
            View Event Archive
          </Button>
        </div>
      </Card>
    </div>
  )
}
