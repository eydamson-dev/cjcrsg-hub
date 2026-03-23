'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { cn } from '~/lib/utils'
import {
  Search,
  Plus,
  Trash2,
  X,
  Users,
  Check,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Badge } from '~/components/ui/badge'
import { Checkbox } from '~/components/ui/checkbox'
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '~/components/ui/command'
import { useDebounce } from '~/hooks/useDebounce'
import { useSearchAttendees } from '~/features/attendees/hooks/useAttendees'
import {
  useAttendanceByEvent,
  useAttendanceStats,
  useCheckIn,
  useUnCheckIn,
  useBulkCheckIn,
} from '../hooks/useAttendance'
import { useNavigate } from '@tanstack/react-router'

interface AttendanceManagerProps {
  eventId: string
}

interface AttendeeToCheckIn {
  attendeeId: string
  firstName: string
  lastName: string
  status: 'member' | 'visitor' | 'inactive'
}

// Type for attendance record from Convex query
interface AttendanceRecordItem {
  _id: string
  eventId: string
  attendeeId: string
  checkedInAt: number
  checkedInBy: string
  notes?: string
  attendee: {
    _id: string
    firstName: string
    lastName: string
    status: 'member' | 'visitor' | 'inactive'
    email?: string
    phone?: string
  } | null
}

export function AttendanceManager({ eventId }: AttendanceManagerProps) {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [selectedAttendees, setSelectedAttendees] = useState<Set<string>>(
    new Set(),
  )
  const [deleteRecordId, setDeleteRecordId] = useState<string | null>(null)
  const [cursor, setCursor] = useState<string | null>(null)
  const [pageSize, setPageSize] = useState(10)
  const searchRef = useRef<HTMLDivElement>(null)

  const pageSizeOptions = [10, 25, 50]
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Queries
  const { data: attendanceData, isLoading: isLoadingAttendance } =
    useAttendanceByEvent(eventId, { numItems: pageSize, cursor })
  const { data: stats } = useAttendanceStats(eventId)
  const { data: searchResults, isLoading: isSearching } =
    useSearchAttendees(debouncedSearchQuery)

  // Mutations
  const checkIn = useCheckIn()
  const unCheckIn = useUnCheckIn()
  const bulkCheckIn = useBulkCheckIn()

  // Get already checked-in attendee IDs
  const checkedInAttendeeIds = useMemo(() => {
    const attendance = attendanceData?.page || []
    return new Set(
      attendance.map((record: AttendanceRecordItem) => record.attendeeId),
    )
  }, [attendanceData])

  // Filter search results to exclude already checked-in attendees
  const availableAttendees = useMemo(() => {
    if (!searchResults) return []
    return searchResults.filter(
      (attendee) => !checkedInAttendeeIds.has(attendee._id),
    )
  }, [searchResults, checkedInAttendeeIds])

  // Handle click outside to close search results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Format time
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  // Calculate pagination info
  const paginationInfo = {
    currentPage: cursor ? 2 : 1, // Simplified - assumes max 2 pages for cursor-based
    totalCount: stats?.total || 0,
    pageSize,
    totalPages: Math.ceil((stats?.total || 0) / pageSize),
    startItem: (cursor ? pageSize : 0) + 1,
    endItem: Math.min(
      (cursor ? pageSize : 0) + (attendanceData?.page?.length || 0),
      stats?.total || 0,
    ),
    hasNext: !!attendanceData?.continueCursor,
    hasPrevious: !!cursor,
  }

  // Handle single check-in
  const handleCheckIn = async (attendee: AttendeeToCheckIn) => {
    try {
      await checkIn.mutateAsync({
        eventId,
        attendeeId: attendee.attendeeId,
      })
      setSearchQuery('')
      setShowSearchResults(false)
    } catch (error) {
      // Error is handled by the hook
    }
  }

  // Handle bulk check-in
  const handleBulkCheckIn = async () => {
    if (selectedAttendees.size === 0) return

    const attendeesToCheckIn = availableAttendees
      .filter((attendee) => selectedAttendees.has(attendee._id))
      .map((attendee) => ({
        attendeeId: attendee._id,
      }))

    try {
      await bulkCheckIn.mutateAsync({
        eventId,
        attendees: attendeesToCheckIn,
      })
      setSearchQuery('')
      setShowSearchResults(false)
      setSelectedAttendees(new Set())
    } catch (error) {
      // Error is handled by the hook
    }
  }

  // Handle uncheck-in (remove)
  const handleDelete = async () => {
    if (deleteRecordId) {
      try {
        await unCheckIn.mutateAsync(deleteRecordId)
        setDeleteRecordId(null)
      } catch (error) {
        // Error is handled by the hook
      }
    }
  }

  // Toggle attendee selection for bulk check-in
  const toggleAttendeeSelection = (attendeeId: string) => {
    const newSelected = new Set(selectedAttendees)
    if (newSelected.has(attendeeId)) {
      newSelected.delete(attendeeId)
    } else {
      newSelected.add(attendeeId)
    }
    setSelectedAttendees(newSelected)
  }

  // Get attendance records
  const attendance = attendanceData?.page || []
  const totalCount = stats?.total || attendance.length

  const getStatusBadgeVariant = (status: string) => {
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

  return (
    <div className="space-y-6">
      {/* Search Bar with Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 w-full sm:min-w-[200px] sm:max-w-md">
          <div ref={searchRef} className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search attendee to add..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowSearchResults(true)
                if (e.target.value === '') {
                  setSelectedAttendees(new Set())
                }
              }}
              onFocus={() => setShowSearchResults(true)}
              className="pl-9"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {isSearching && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              {searchQuery && !isSearching && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setShowSearchResults(false)
                    setSelectedAttendees(new Set())
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && (
              <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
                <Command>
                  <CommandList>
                    {debouncedSearchQuery.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Start typing to search for attendees
                      </div>
                    ) : isSearching ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Searching...
                      </div>
                    ) : availableAttendees.length === 0 ? (
                      <CommandEmpty>
                        {searchResults?.length === 0
                          ? 'No attendees found'
                          : 'All matching attendees are already checked in'}
                      </CommandEmpty>
                    ) : (
                      <CommandGroup
                        heading={`${availableAttendees.length} available`}
                      >
                        {availableAttendees.map((attendee) => (
                          <CommandItem
                            key={attendee._id}
                            className="flex items-center justify-between py-2 cursor-pointer"
                            onSelect={() => {
                              if (selectedAttendees.size > 0) {
                                toggleAttendeeSelection(attendee._id)
                              } else {
                                handleCheckIn({
                                  attendeeId: attendee._id,
                                  firstName: attendee.firstName,
                                  lastName: attendee.lastName,
                                  status: attendee.status,
                                })
                              }
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={selectedAttendees.has(attendee._id)}
                                onCheckedChange={() =>
                                  toggleAttendeeSelection(attendee._id)
                                }
                                onClick={(e) => e.stopPropagation()}
                              />
                              <span className="font-medium">
                                {attendee.firstName} {attendee.lastName}
                              </span>
                              <Badge
                                variant={
                                  attendee.status === 'member'
                                    ? 'default'
                                    : 'secondary'
                                }
                                className="text-xs"
                              >
                                {attendee.status === 'member'
                                  ? 'Member'
                                  : 'Visitor'}
                              </Badge>
                            </div>
                            {selectedAttendees.has(attendee._id) && (
                              <Check className="size-4 text-primary" />
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </div>
            )}
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
          {/* Selection count display */}
          {selectedAttendees.size > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mr-2">
              <span>{selectedAttendees.size} selected</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedAttendees(new Set())}
              >
                Clear
              </Button>
            </div>
          )}
          {/* Add Button */}
          {selectedAttendees.size === 0 ? (
            <Button
              onClick={() => {
                setShowSearchResults(true)
                const searchInput = document.querySelector(
                  'input[placeholder="Search attendee to add..."]',
                ) as HTMLInputElement
                searchInput?.focus()
              }}
              disabled={checkIn.isPending}
              className="flex-1 sm:flex-none"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Attendee
            </Button>
          ) : (
            <Button
              onClick={handleBulkCheckIn}
              disabled={bulkCheckIn.isPending}
              className="flex-1 sm:flex-none"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add {selectedAttendees.size}
            </Button>
          )}
        </div>
      </div>

      {/* Results Info */}
      {attendance.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">
            {paginationInfo.totalCount > 0
              ? `Showing ${paginationInfo.startItem} to ${paginationInfo.endItem} of ${paginationInfo.totalCount} attendees`
              : `${attendance.length} attendees`}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Items per page:
            </span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(Number(value))
                setCursor(null)
              }}
            >
              <SelectTrigger className="w-[80px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="w-[80px] min-w-0">
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Attendance Table Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Checked-in Attendees</CardTitle>
            <div className="flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{totalCount}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingAttendance ? (
            <div className="flex h-24 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : attendance.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No attendees yet</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Search above to check someone in
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Check-in Time</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.map((record: AttendanceRecordItem) => (
                    <TableRow
                      key={record._id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() =>
                        record.attendee?._id &&
                        navigate({
                          to: '/attendees/$id',
                          params: { id: record.attendee._id },
                        })
                      }
                    >
                      <TableCell className="font-medium">
                        {record.attendee ? (
                          <>
                            {record.attendee.firstName}{' '}
                            {record.attendee.lastName}
                          </>
                        ) : (
                          <span className="text-muted-foreground">
                            Unknown Attendee
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.attendee ? (
                          <Badge
                            variant={getStatusBadgeVariant(
                              record.attendee.status,
                            )}
                          >
                            {record.attendee.status === 'member'
                              ? 'Member'
                              : 'Visitor'}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Unknown</Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatTime(record.checkedInAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {record.attendee?._id && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  navigate({
                                    to: '/attendees/$id',
                                    params: { id: record.attendee._id },
                                  })
                                }}
                              >
                                View Profile
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={(e) => {
                                e.stopPropagation()
                                setDeleteRecordId(record._id)
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove
                            </DropdownMenuItem>
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
      {attendance.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t">
          <span className="text-sm text-muted-foreground">
            Page {paginationInfo.currentPage} of {paginationInfo.totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCursor(null)}
              disabled={!paginationInfo.hasPrevious || isLoadingAttendance}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCursor(attendanceData?.continueCursor || null)}
              disabled={!paginationInfo.hasNext || isLoadingAttendance}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteRecordId}
        onOpenChange={() => setDeleteRecordId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Attendee?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove this attendee from the event attendance. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteRecordId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
