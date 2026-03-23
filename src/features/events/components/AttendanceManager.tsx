import { useState, useMemo, useEffect, useRef } from 'react'
import { Search, Plus, Trash2, X, Users, Check } from 'lucide-react'
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
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [selectedAttendees, setSelectedAttendees] = useState<Set<string>>(
    new Set(),
  )
  const [deleteRecordId, setDeleteRecordId] = useState<string | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Queries
  const { data: attendanceData, isLoading: isLoadingAttendance } =
    useAttendanceByEvent(eventId)
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Attendance</CardTitle>
          <div className="flex items-center gap-2">
            <Users className="size-4 text-muted-foreground" />
            <span className="text-2xl font-bold">{totalCount}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Section */}
        <div ref={searchRef} className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search attendee to add..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowSearchResults(true)
                  setSelectedAttendees(new Set())
                }}
                onFocus={() => setShowSearchResults(true)}
                className="pl-9"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setShowSearchResults(false)
                    setSelectedAttendees(new Set())
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* Bulk Check-in Button */}
            {selectedAttendees.size > 0 && (
              <Button
                onClick={handleBulkCheckIn}
                disabled={bulkCheckIn.isPending}
                className="whitespace-nowrap"
              >
                <Plus className="mr-2 size-4" />
                Add {selectedAttendees.size}
              </Button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && debouncedSearchQuery.length > 0 && (
            <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
              <Command>
                <CommandList>
                  {isSearching ? (
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

        {/* Selection hint */}
        {selectedAttendees.size > 0 && (
          <div className="flex items-center justify-between rounded-md bg-muted p-2 text-sm">
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

        {/* Attendance Table */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingAttendance ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <div className="flex items-center justify-center">
                      <div className="size-6 animate-spin rounded-full border-b-2 border-primary" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : attendance.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No attendees yet. Search above to check someone in.
                  </TableCell>
                </TableRow>
              ) : (
                attendance.map((record: AttendanceRecordItem) => (
                  <TableRow key={record._id}>
                    <TableCell className="font-medium">
                      {record.attendee ? (
                        <>
                          {record.attendee.firstName} {record.attendee.lastName}
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
                          variant={
                            record.attendee.status === 'member'
                              ? 'default'
                              : 'secondary'
                          }
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteRecordId(record._id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Load More */}
        {attendanceData?.continueCursor && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => {
                // Implement load more logic
              }}
            >
              Load More
            </Button>
          </div>
        )}
      </CardContent>

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
    </Card>
  )
}
