import { Search, X } from 'lucide-react'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import type { EventType } from '../types'

interface EventFiltersProps {
  eventTypes: EventType[]
  selectedEventType: string | undefined
  onEventTypeChange: (eventTypeId: string | undefined) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  onClearFilters: () => void
}

export function EventFilters({
  eventTypes,
  selectedEventType,
  onEventTypeChange,
  searchQuery,
  onSearchChange,
  onClearFilters,
}: EventFiltersProps) {
  const hasFilters = selectedEventType || searchQuery

  return (
    <div className="flex flex-col gap-3 @md:flex-row mb-3">
      <div className="flex flex-1 gap-3">
        <Select
          value={selectedEventType || 'all'}
          onValueChange={(value) =>
            onEventTypeChange(value === 'all' ? undefined : value || undefined)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Event Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {eventTypes.map((type) => (
              <SelectItem key={type._id} value={type._id}>
                <span
                  className="inline-block size-2 rounded-full mr-2"
                  style={{ backgroundColor: type.color }}
                />
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative flex-1 w-full sm:min-w-50 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              type="button"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="text-muted-foreground"
        >
          Clear Filters
        </Button>
      )}
    </div>
  )
}
