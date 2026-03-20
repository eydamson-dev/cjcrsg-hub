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
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import {
  Plus,
  Search,
  Edit,
  Eye,
  Archive,
  MoreHorizontal,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Users,
  SearchX,
  FilterX,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from '~/components/ui/empty'
import { AttendeeTableSkeleton } from './AttendeeTableSkeleton'
import type { AttendeeStatus } from '../types'

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

interface AttendeeListProps {
  attendees?: any[]
  isPending?: boolean
  isSearching?: boolean
  searchQuery?: string
  statusFilter?: string
  isPaginated?: boolean
  paginationInfo?: PaginationInfo
  availablePageSizes?: number[]
  onNavigate?: (path: string) => void
  onArchive?: (id: string) => void
  onSearchChange?: (query: string) => void
  onStatusFilterChange?: (status: string | undefined) => void
  onClearSearch?: () => void
  onNextPage?: () => void
  onPreviousPage?: () => void
  onPageSizeChange?: (size: number) => void
}

export function AttendeeList({
  attendees = [],
  isPending = false,
  isSearching = false,
  searchQuery = '',
  statusFilter,
  isPaginated = true,
  paginationInfo,
  availablePageSizes = [10, 25, 50],
  onNavigate,
  onArchive,
  onSearchChange,
  onStatusFilterChange,
  onClearSearch,
  onNextPage,
  onPreviousPage,
  onPageSizeChange,
}: AttendeeListProps) {
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false)
  const [attendeeToArchive, setAttendeeToArchive] = useState<any>(null)
  const [isArchiving, setIsArchiving] = useState(false)

  const getStatusBadgeVariant = (status: AttendeeStatus) => {
    switch (status) {
      case 'member':
        return 'default' as const
      case 'visitor':
        return 'secondary' as const
      case 'inactive':
        return 'outline' as const
      default:
        return 'outline' as const
    }
  }

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '-'
    return new Date(timestamp).toLocaleDateString()
  }

  const handleArchiveClick = (attendee: any) => {
    setAttendeeToArchive(attendee)
    setArchiveDialogOpen(true)
  }

  const handleConfirmArchive = async () => {
    if (!attendeeToArchive || !onArchive) return

    setIsArchiving(true)
    try {
      await onArchive(attendeeToArchive._id)
    } finally {
      setIsArchiving(false)
      setArchiveDialogOpen(false)
      setAttendeeToArchive(null)
    }
  }

  const hasActiveFilters = searchQuery || statusFilter

  const renderResultsInfo = () => {
    if (isSearching) {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Searching...
        </div>
      )
    }

    if (isPaginated && paginationInfo && paginationInfo.totalCount > 0) {
      return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">
            Showing {paginationInfo.startItem} to {paginationInfo.endItem} of{' '}
            {paginationInfo.totalCount} attendees
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Items per page:
            </span>
            <Select
              value={paginationInfo.pageSize.toString()}
              onValueChange={(value) => {
                if (value) {
                  onPageSizeChange?.(parseInt(value, 10))
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

    if (!isPaginated && hasActiveFilters && attendees.length > 0) {
      return (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {attendees.length} {attendees.length === 1 ? 'result' : 'results'}{' '}
            found
            {searchQuery && (
              <>
                {' '}
                for &quot;<span className="font-medium">{searchQuery}</span>
                &quot;
              </>
            )}
            {statusFilter && (
              <>
                {' '}
                with status &quot;
                <span className="font-medium">{statusFilter}</span>&quot;
              </>
            )}
          </span>
          <Button variant="ghost" size="sm" onClick={onClearSearch}>
            Clear filters
          </Button>
        </div>
      )
    }

    return null
  }

  const renderPaginationControls = () => {
    if (!isPaginated || !paginationInfo) return null

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 w-full sm:min-w-[200px] sm:max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or address..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-9 pr-20"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {isSearching && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              {searchQuery && !isSearching && (
                <button
                  onClick={() => onClearSearch?.()}
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
              searchQuery.length > 0 && searchQuery.length < 3
                ? 'opacity-100'
                : 'opacity-0',
            )}
          >
            Type at least 3 characters to search
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select
            value={statusFilter || ''}
            onValueChange={(value) =>
              onStatusFilterChange?.(value || undefined)
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="w-[140px] min-w-0">
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="visitor">Visitor</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => onNavigate?.('/attendees/new')}
            className="flex-1 sm:flex-none"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Attendee
          </Button>
        </div>
      </div>

      {/* Results count */}
      {renderResultsInfo()}

      <Card>
        <CardHeader>
          <CardTitle>Church Members</CardTitle>
        </CardHeader>
        <CardContent>
          {isPending || isSearching ? (
            <AttendeeTableSkeleton rowCount={5} />
          ) : attendees.length === 0 ? (
            hasActiveFilters ? (
              searchQuery ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <SearchX />
                    </EmptyMedia>
                    <EmptyTitle>No results found</EmptyTitle>
                    <EmptyDescription>
                      No attendees match "{searchQuery}"
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button variant="outline" onClick={onClearSearch}>
                      Clear search
                    </Button>
                  </EmptyContent>
                </Empty>
              ) : (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <FilterX />
                    </EmptyMedia>
                    <EmptyTitle>No matches</EmptyTitle>
                    <EmptyDescription>
                      No {statusFilter} attendees found
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button variant="outline" onClick={onClearSearch}>
                      Clear filter
                    </Button>
                  </EmptyContent>
                </Empty>
              )
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Users />
                  </EmptyMedia>
                  <EmptyTitle>No attendees yet</EmptyTitle>
                  <EmptyDescription>
                    Get started by adding your first church member
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button onClick={() => onNavigate?.('/attendees/new')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Attendee
                  </Button>
                </EmptyContent>
              </Empty>
            )
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendees.map((attendee) => (
                    <TableRow key={attendee._id}>
                      <TableCell className="font-medium">
                        {attendee.firstName} {attendee.lastName}
                      </TableCell>
                      <TableCell>{attendee.email || '-'}</TableCell>
                      <TableCell>{attendee.phone || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(attendee.status)}>
                          {attendee.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(attendee.joinDate)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                onNavigate?.(`/attendees/${attendee._id}/`)
                              }
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                onNavigate?.(`/attendees/${attendee._id}/edit`)
                              }
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            {attendee.status !== 'inactive' && (
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleArchiveClick(attendee)}
                              >
                                <Archive className="mr-2 h-4 w-4" />
                                Archive
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {renderPaginationControls()}

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Attendee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive {attendeeToArchive?.firstName}{' '}
              {attendeeToArchive?.lastName}? This will mark them as inactive and
              they won't appear in active lists. This action can be undone
              later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setArchiveDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmArchive}
              disabled={isArchiving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isArchiving ? 'Archiving...' : 'Archive'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
