'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { cn } from '~/lib/utils'
import {
  Search,
  Trash2,
  X,
  Users,
  Check,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ChevronDown,
  ChevronUp,
  UserPlus,
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
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible'
import { useDebounce } from '~/hooks/useDebounce'
import { useSearchAttendees } from '~/features/attendees/hooks/useAttendees'
import {
  useAttendanceByEvent,
  useAttendanceStats,
  useCheckIn,
  useUnCheckIn,
  useBulkCheckIn,
  useUpdateInviter,
} from '../hooks/useAttendance'
import { useNavigate } from '@tanstack/react-router'
import { CreateAttendeeModal } from './CreateAttendeeModal'
import { InviterSelectionModal } from './InviterSelectionModal'
import type { Attendee } from '~/features/attendees/types'

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
  invitedBy?: string
  attendee: {
    _id: string
    firstName: string
    lastName: string
    status: 'member' | 'visitor' | 'inactive'
    email?: string
    phone?: string
  } | null
  inviter?: {
    _id: string
    firstName: string
    lastName: string
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

  // View mode state
  const [viewMode, setViewMode] = useState<'list' | 'byInviter'>('list')

  // Modal states
  const [showInviterModal, setShowInviterModal] = useState(false)
  const [showCreateAttendeeModal, setShowCreateAttendeeModal] = useState(false)

  // Pending attendees for check-in (waiting for inviter selection)
  const [pendingAttendees, setPendingAttendees] = useState<AttendeeToCheckIn[]>(
    [],
  )

  // Track expanded groups in "by inviter" view
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  // Table row selection state (for bulk actions)
  const [selectedTableRows, setSelectedTableRows] = useState<Set<string>>(
    new Set(),
  )

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
  const updateInviter = useUpdateInviter()

  // State for inviter assignment modal
  const [recordToAssignInviter, setRecordToAssignInviter] = useState<
    string | null
  >(null)
  const [attendeeNameForModal, setAttendeeNameForModal] = useState<string>('')

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

  // Handle check-in (defaults to Walk-in)
  const handleBulkCheckIn = async () => {
    if (selectedAttendees.size === 0) return

    const attendeesToCheckIn = availableAttendees
      .filter((attendee) => selectedAttendees.has(attendee._id))
      .map((attendee) => ({
        attendeeId: attendee._id,
        // invitedBy is undefined = Walk-in
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

  // Handle inviter selection from modal
  const handleInviterSelect = async (inviterId: string | null) => {
    if (pendingAttendees.length === 0) return

    try {
      if (pendingAttendees.length === 1) {
        // Single check-in
        await checkIn.mutateAsync({
          eventId,
          attendeeId: pendingAttendees[0].attendeeId,
          invitedBy: inviterId || undefined,
        })
      } else {
        // Bulk check-in
        await bulkCheckIn.mutateAsync({
          eventId,
          attendees: pendingAttendees.map((attendee) => ({
            attendeeId: attendee.attendeeId,
            invitedBy: inviterId || undefined,
          })),
        })
      }

      // Reset state
      setSearchQuery('')
      setShowSearchResults(false)
      setSelectedAttendees(new Set())
      setPendingAttendees([])
      setShowInviterModal(false)
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

  // Handle assign inviter to a record
  const handleAssignInviter = (record: AttendanceRecordItem) => {
    setRecordToAssignInviter(record._id)
    setAttendeeNameForModal(
      record.attendee
        ? `${record.attendee.firstName} ${record.attendee.lastName}`
        : 'Unknown Attendee',
    )
    setShowInviterModal(true)
  }

  // Handle remove inviter (set to walk-in)
  const handleRemoveInviter = async (recordId: string) => {
    try {
      await updateInviter.mutateAsync({
        attendanceRecordId: recordId,
        invitedBy: undefined, // Set to undefined = walk-in
      })
    } catch (error) {
      // Error is handled by the hook
    }
  }

  // Handle inviter selection from modal (for single record assignment)
  const handleInviterSelectedForRecord = async (inviterId: string | null) => {
    if (!recordToAssignInviter) return

    try {
      await updateInviter.mutateAsync({
        attendanceRecordId: recordToAssignInviter,
        invitedBy: inviterId || undefined,
      })
      setRecordToAssignInviter(null)
      setAttendeeNameForModal('')
      setShowInviterModal(false)
    } catch (error) {
      // Error is handled by the hook
    }
  }

  // Handle create new attendee from search
  const handleCreateAttendee = () => {
    setShowCreateAttendeeModal(true)
  }

  // Handle after attendee is created
  const handleAttendeeCreated = (attendee: Attendee) => {
    // Add the new attendee to selected attendees
    setSelectedAttendees(new Set([attendee._id]))
    // Set them as pending for check-in
    setPendingAttendees([
      {
        attendeeId: attendee._id,
        firstName: attendee.firstName,
        lastName: attendee.lastName,
        status: attendee.status,
      },
    ])
    // Clear search
    setSearchQuery('')
    setShowSearchResults(false)
    // Open inviter modal
    setShowInviterModal(true)
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

  // Toggle group expansion
  const toggleGroupExpansion = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey)
    } else {
      newExpanded.add(groupKey)
    }
    setExpandedGroups(newExpanded)
  }

  // Toggle table row selection
  const toggleTableRowSelection = (recordId: string) => {
    const newSelected = new Set(selectedTableRows)
    if (newSelected.has(recordId)) {
      newSelected.delete(recordId)
    } else {
      newSelected.add(recordId)
    }
    setSelectedTableRows(newSelected)
  }

  // Select/deselect all visible table rows
  const selectAllTableRows = (selectAll: boolean) => {
    if (selectAll) {
      const allIds = new Set(attendance.map((record) => record._id))
      setSelectedTableRows(allIds)
    } else {
      setSelectedTableRows(new Set())
    }
  }

  // Clear table selection when view or page changes
  useEffect(() => {
    setSelectedTableRows(new Set())
  }, [viewMode, cursor, pageSize])

  // Get attendance records
  const attendance = attendanceData?.page || []
  const totalCount = stats?.total || attendance.length

  // Group attendance records by inviter
  const attendanceByInviter = useMemo(() => {
    const groups = new Map<
      string,
      {
        inviter: { _id: string; firstName: string; lastName: string } | null
        records: AttendanceRecordItem[]
      }
    >()

    // Walk-in group (no inviter)
    groups.set('walk-in', {
      inviter: null,
      records: [],
    })

    attendance.forEach((record) => {
      if (record.inviter) {
        const key = record.inviter._id
        if (!groups.has(key)) {
          groups.set(key, {
            inviter: record.inviter,
            records: [],
          })
        }
        groups.get(key)!.records.push(record)
      } else {
        groups.get('walk-in')!.records.push(record)
      }
    })

    // Convert to array and sort: inviters alphabetically, walk-in at end
    const sortedGroups = Array.from(groups.entries())
      .filter(([_, group]) => group.records.length > 0)
      .sort((a, b) => {
        if (a[0] === 'walk-in') return 1
        if (b[0] === 'walk-in') return -1
        const nameA = `${a[1].inviter?.firstName || ''} ${a[1].inviter?.lastName || ''}`
        const nameB = `${b[1].inviter?.firstName || ''} ${b[1].inviter?.lastName || ''}`
        return nameA.localeCompare(nameB)
      })

    return sortedGroups
  }, [attendance])

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
                        {searchResults?.length === 0 ? (
                          <div className="p-4 text-center space-y-2">
                            <p className="text-muted-foreground">
                              No attendees found
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCreateAttendee}
                              className="w-full"
                            >
                              <UserPlus className="mr-2 h-4 w-4" />
                              Create new attendee: &quot;{debouncedSearchQuery}
                              &quot;
                            </Button>
                          </div>
                        ) : (
                          'All matching attendees are already checked in'
                        )}
                      </CommandEmpty>
                    ) : (
                      <>
                        <CommandGroup
                          heading={`${availableAttendees.length} available`}
                        >
                          {availableAttendees.map((attendee) => (
                            <CommandItem
                              key={attendee._id}
                              className="flex items-center justify-between py-2 cursor-pointer"
                              onSelect={() => {
                                toggleAttendeeSelection(attendee._id)
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
                        {selectedAttendees.size > 0 && (
                          <div className="border-t p-2 flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              {selectedAttendees.size} selected
                            </span>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedAttendees(new Set())}
                              >
                                Clear
                              </Button>
                              <Button
                                size="sm"
                                onClick={handleBulkCheckIn}
                                disabled={bulkCheckIn.isPending}
                              >
                                Add {selectedAttendees.size}
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
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

      {/* View Toggle Tabs */}
      {attendance.length > 0 && (
        <Tabs
          value={viewMode}
          onValueChange={(value) => setViewMode(value as 'list' | 'byInviter')}
        >
          <TabsList className="grid w-full sm:w-auto grid-cols-2">
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="byInviter">By Inviter</TabsTrigger>
          </TabsList>
        </Tabs>
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
          ) : viewMode === 'list' ? (
            /* List View */
            <div className="overflow-x-auto -mx-6 px-6">
              {/* Selection Bar */}
              {selectedTableRows.size > 0 && (
                <div className="flex items-center justify-between py-2 mb-2 px-2 bg-muted/50 rounded-md">
                  <span className="text-sm font-medium">
                    {selectedTableRows.size} selected
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTableRows(new Set())}
                    >
                      Clear
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button size="sm">Bulk Actions</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            // TODO: Open inviter selection modal for bulk assign
                            setPendingAttendees(
                              attendance
                                .filter((r) => selectedTableRows.has(r._id))
                                .map((r) => ({
                                  attendeeId: r.attendeeId,
                                  firstName: r.attendee?.firstName || '',
                                  lastName: r.attendee?.lastName || '',
                                  status: r.attendee?.status || 'visitor',
                                })),
                            )
                            setShowInviterModal(true)
                          }}
                        >
                          Assign Inviter
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={async () => {
                            // Delete selected records
                            for (const recordId of selectedTableRows) {
                              await unCheckIn.mutateAsync(recordId)
                            }
                            setSelectedTableRows(new Set())
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove Selected
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={
                          attendance.length > 0 &&
                          attendance.every((r) => selectedTableRows.has(r._id))
                        }
                        onCheckedChange={(checked) =>
                          selectAllTableRows(checked as boolean)
                        }
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Invited By</TableHead>
                    <TableHead>Check-in Time</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.map((record: AttendanceRecordItem) => (
                    <TableRow
                      key={record._id}
                      className={cn(
                        'cursor-pointer hover:bg-muted/50',
                        selectedTableRows.has(record._id) && 'bg-muted',
                      )}
                      onClick={() =>
                        record.attendee?._id &&
                        navigate({
                          to: '/attendees/$id',
                          params: { id: record.attendee._id },
                        })
                      }
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedTableRows.has(record._id)}
                          onCheckedChange={() =>
                            toggleTableRowSelection(record._id)
                          }
                        />
                      </TableCell>
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
                      <TableCell>
                        {record.inviter ? (
                          <span className="text-sm">
                            {record.inviter.firstName} {record.inviter.lastName}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Walk-in
                          </span>
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
                            {record.attendee && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  const attendeeId = record.attendee!._id
                                  navigate({
                                    to: '/attendees/$id',
                                    params: { id: attendeeId },
                                  })
                                }}
                              >
                                View Profile
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAssignInviter(record)
                              }}
                            >
                              Assign Inviter
                            </DropdownMenuItem>
                            {record.inviter && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRemoveInviter(record._id)
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove Inviter
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
          ) : (
            /* By Inviter View */
            <div className="space-y-4">
              {attendanceByInviter.map(([groupKey, group]) => (
                <Collapsible
                  key={groupKey}
                  open={expandedGroups.has(groupKey)}
                  onOpenChange={() => toggleGroupExpansion(groupKey)}
                >
                  <div className="border rounded-lg">
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer">
                        <div className="flex items-center gap-3">
                          {expandedGroups.has(groupKey) ? (
                            <ChevronUp className="size-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="size-4 text-muted-foreground" />
                          )}
                          <div className="flex items-center gap-2">
                            <Users className="size-4 text-muted-foreground" />
                            <span className="font-medium">
                              {group.inviter
                                ? `${group.inviter.firstName} ${group.inviter.lastName}`
                                : 'Walk-in'}
                            </span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {group.records.length}
                        </Badge>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="border-t overflow-x-auto">
                        <Table>
                          <TableBody>
                            {group.records.map((record) => (
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
                                <TableCell className="text-right">
                                  {formatTime(record.checkedInAt)}
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger
                                      onClick={(e) => e.stopPropagation()}
                                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted"
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      {record.attendee && (
                                        <DropdownMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            const attendeeId =
                                              record.attendee!._id
                                            navigate({
                                              to: '/attendees/$id',
                                              params: { id: attendeeId },
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
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ))}
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

      {/* Create Attendee Modal */}
      <CreateAttendeeModal
        open={showCreateAttendeeModal}
        onSave={handleAttendeeCreated}
        onClose={() => setShowCreateAttendeeModal(false)}
      />

      {/* Inviter Selection Modal */}
      <InviterSelectionModal
        open={showInviterModal}
        onSelect={
          recordToAssignInviter
            ? handleInviterSelectedForRecord
            : handleInviterSelect
        }
        onClose={() => {
          setShowInviterModal(false)
          setPendingAttendees([])
          setRecordToAssignInviter(null)
          setAttendeeNameForModal('')
        }}
        excludeAttendeeIds={pendingAttendees.map((a) => a.attendeeId)}
        title={
          recordToAssignInviter
            ? `Assign Inviter to ${attendeeNameForModal}`
            : 'Select Inviter'
        }
      />
    </div>
  )
}
