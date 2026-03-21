import { Calendar, Users, Clock, CalendarCheck } from 'lucide-react'
import { cn } from '~/lib/utils'

interface QuickStatsProps {
  eventsThisMonth: number
  totalEvents: number
  lastEvent: string
  nextScheduled: string
  className?: string
}

export function QuickStats({
  eventsThisMonth,
  totalEvents,
  lastEvent,
  nextScheduled,
  className,
}: QuickStatsProps) {
  return (
    <div
      className={cn('grid grid-cols-2 gap-4 @[600px]:grid-cols-4', className)}
    >
      <StatItem
        icon={Calendar}
        label="This Month"
        value={eventsThisMonth.toString()}
      />
      <StatItem
        icon={Users}
        label="Total Events"
        value={totalEvents.toString()}
      />
      <StatItem icon={Clock} label="Last Event" value={lastEvent} />
      <StatItem
        icon={CalendarCheck}
        label="Next Scheduled"
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
    <div className="flex flex-col items-center gap-1.5 text-center">
      <Icon className="size-5 text-muted-foreground" />
      <span className="text-2xl font-semibold tabular-nums">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}
