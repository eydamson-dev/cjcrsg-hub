import { Calendar, Users, Clock, CalendarCheck } from 'lucide-react'
import { cn } from '~/lib/utils'

interface QuickStatsProps {
  eventsThisMonth: number
  totalEvents: number
  lastEvent: string
  nextScheduled: string
  className?: string
  eventsThisMonthLabel?: string
  totalEventsLabel?: string
  lastEventLabel?: string
  nextScheduledLabel?: string
}

export function QuickStats({
  eventsThisMonth,
  totalEvents,
  lastEvent,
  nextScheduled,
  className,
  eventsThisMonthLabel = 'Events This Month',
  totalEventsLabel = 'Total Events',
  lastEventLabel = 'Last Event',
  nextScheduledLabel = 'Next Scheduled',
}: QuickStatsProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4',
        className,
      )}
    >
      <StatItem
        icon={Calendar}
        label={eventsThisMonthLabel}
        value={eventsThisMonth.toString()}
      />
      <StatItem
        icon={Users}
        label={totalEventsLabel}
        value={totalEvents.toString()}
      />
      <StatItem icon={Clock} label={lastEventLabel} value={lastEvent} />
      <StatItem
        icon={CalendarCheck}
        label={nextScheduledLabel}
        value={nextScheduled}
      />
    </div>
  )
}

interface StatItemProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}

function StatItem({ icon: Icon, label, value }: StatItemProps) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <Icon className="size-4 sm:size-5 text-muted-foreground" />
      <span className="text-lg sm:text-2xl font-semibold tabular-nums">
        {value}
      </span>
      <span className="text-[10px] sm:text-xs text-muted-foreground leading-tight">
        {label}
      </span>
    </div>
  )
}
