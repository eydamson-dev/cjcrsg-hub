'use client'

import { useState } from 'react'
import { cn } from '~/lib/utils'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Badge } from '~/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '~/components/ui/card'
import {
  Search,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  X,
  Loader2,
  SearchX,
  FilterX,
  Archive,
} from 'lucide-react'
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from '~/components/ui/empty'
import { EventListSkeleton } from './EventListSkeleton'
import type { Event, EventType, EventStatus } from '../types'

interface PaginationInfo {
  currentPage: number
  totalCount: number
  pageSize: number
  totalPages: number
  startItem: number
  endItem: number
  hasNext: boolean
  hasPrevious: boolean
  isDone: boolean
}

interface EventListProps {
  events: Event[]
  eventTypes?: EventType[]
  isPending: boolean
  isArchived?: boolean
  viewMode: 'table' | 'cards'
  onViewModeChange: (mode: 'table' | 'cards') => void
  searchQuery: string
  eventTypeFilter?: string
  statusFilter?: string
  onSearchChange: (query: string) => void
  onEventTypeFilterChange: (typeId: string | undefined) => void
  onStatusFilterChange: (status: string | undefined) => void
  onClearFilters: () => void
  onEventClick: (eventId: string) => void
  paginationInfo?: PaginationInfo
  availablePageSizes?: number[]
  onNextPage: () => void
  onPreviousPage: () => void
  onPageSizeChange: (size: number) => void
  title?: string
  description?: string
}

const STATUS_OPTIONS: { value: EventStatus; label: string }[] = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export function EventList({
  events,
  eventTypes = [],
  isPending,
  isArchived = false,
  viewMode,
  onViewModeChange,
  searchQuery,
  eventTypeFilter,
  statusFilter,
  onSearchChange,
  onEventTypeFilterChange,
  onStatusFilterChange,
  onClearFilters,
  onEventClick,
  paginationInfo,
  availablePageSizes = [10, 25, 50],
  onNextPage,
  onPreviousPage,
  onPageSizeChange,
  title = 'Event History',
  description = 'Manage and view your events',
}: EventListProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)
  const isSearching = isPending && searchQuery.length >= 3

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getStatusBadgeVariant = (status: EventStatus) => {
    switch (status) {
      case 'upcoming':
        return 'outline' as const
      case 'active':
        return 'default' as const
      case 'completed':
        return 'secondary' as const
      case 'cancelled':
        return 'destructive' as const
      default:
        return 'outline' as const
    }
  }

  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value)
    onSearchChange(value)
  }

  const handleClearFilters = () => {
    setLocalSearchQuery('')
    onClearFilters()
  }

  const hasActiveFilters = searchQuery || eventTypeFilter || statusFilter

  const renderResultsInfo = () => {
    if (isSearching) {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Searching...
        </div>
      )
    }

    if (paginationInfo && paginationInfo.totalCount > 0) {
      return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">
            Showing {paginationInfo.startItem} to {paginationInfo.endItem} of{' '}
            {paginationInfo.totalCount} events
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Items per page:
            </span>
            <Select
              value={paginationInfo.pageSize.toString()}
              onValueChange={(value) => {
                if (value) {
                  onPageSizeChange(parseInt(value, 10))
                }
              }}
            >
              <SelectTrigger className="w-[80px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="w-[80px] min-w-0">
                {availablePageSizes.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    }

    return null
  }

  const renderPaginationControls = () => {
    if (!paginationInfo) return null

    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t">
        <span className="text-sm text-muted-foreground">
          Page {paginationInfo.currentPage} of {paginationInfo.totalPages}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPreviousPage}
            disabled={!paginationInfo.hasPrevious || isPending}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onNextPage}
            disabled={!paginationInfo.hasNext || isPending}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    )
  }

  const renderTableView = () => (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">Banner</TableHead>
            <TableHead>Event Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
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
                    className="h-12 w-16 rounded-md object-cover"
                  />
                ) : (
                  <div className="h-12 w-16 rounded-md bg-muted flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium">{event.name}</TableCell>
              <TableCell>{formatDate(event.date)}</TableCell>
              <TableCell>
                <Badge
                  variant={getStatusBadgeVariant(event.status)}
                  className="capitalize"
                >
                  {event.status}
                </Badge>
              </TableCell>
              <TableCell>
                {event.eventType ? (
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: event.eventType.color }}
                    />
                    <span className="text-sm">{event.eventType.name}</span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Unknown</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
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

  const renderCardsView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {events.map((event) => (
        <Card
          key={event._id}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onEventClick(event._id)}
        >
          <div className="aspect-video relative overflow-hidden rounded-t-lg">
            {event.bannerImage ? (
              <img
                src={event.bannerImage}
                alt={event.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <Badge
              variant={getStatusBadgeVariant(event.status)}
              className="absolute top-2 right-2 capitalize"
            >
              {event.status}
            </Badge>
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{event.name}</CardTitle>
            <CardDescription>{formatDate(event.date)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {event.eventType ? (
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: event.eventType.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {event.eventType.name}
                  </span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Unknown</span>
              )}
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{event.attendanceCount || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderEmptyState = () => {
    if (hasActiveFilters) {
      if (searchQuery) {
        return (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchX />
              </EmptyMedia>
              <EmptyTitle>No results found</EmptyTitle>
              <EmptyDescription>
                No events match &quot;{searchQuery}&quot;
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" onClick={handleClearFilters}>
                Clear filters
              </Button>
            </EmptyContent>
          </Empty>
        )
      }

      return (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FilterX />
            </EmptyMedia>
            <EmptyTitle>No matches</EmptyTitle>
            <EmptyDescription>
              No events match the selected filters
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" onClick={handleClearFilters}>
              Clear filters
            </Button>
          </EmptyContent>
        </Empty>
      )
    }

    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Archive />
          </EmptyMedia>
          <EmptyTitle>No events yet</EmptyTitle>
          <EmptyDescription>
            {isArchived
              ? 'No archived events found'
              : 'Get started by creating your first event'}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>

        <div className="flex gap-1 rounded-lg bg-muted p-1">
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('table')}
            className={
              viewMode === 'table'
                ? 'shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }
          >
            <List className="h-4 w-4 mr-2" />
            Table
          </Button>
          <Button
            variant={viewMode === 'cards' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('cards')}
            className={
              viewMode === 'cards'
                ? 'shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Cards
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex-1 w-full lg:min-w-[300px] lg:max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={localSearchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 pr-10"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {isSearching && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              {localSearchQuery && !isSearching && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <p
            className={cn(
              'text-xs text-muted-foreground mt-1 h-4 transition-opacity duration-200',
              localSearchQuery.length > 0 && localSearchQuery.length < 3
                ? 'opacity-100'
                : 'opacity-0',
            )}
          >
            Type at least 3 characters to search
          </p>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          <Select
            value={eventTypeFilter || ''}
            onValueChange={(value) =>
              onEventTypeFilterChange(value || undefined)
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              {eventTypes.map((type) => (
                <SelectItem key={type._id} value={type._id}>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: type.color }}
                    />
                    {type.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={statusFilter || ''}
            onValueChange={(value) => onStatusFilterChange(value || undefined)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Results count */}
      {renderResultsInfo()}

      {/* Content */}
      <div>
        {isPending && events.length === 0 ? (
          <EventListSkeleton viewMode={viewMode} rowCount={5} />
        ) : events.length === 0 ? (
          renderEmptyState()
        ) : viewMode === 'table' ? (
          renderTableView()
        ) : (
          renderCardsView()
        )}
      </div>

      {/* Pagination */}
      {events.length > 0 && renderPaginationControls()}
    </div>
  )
}
