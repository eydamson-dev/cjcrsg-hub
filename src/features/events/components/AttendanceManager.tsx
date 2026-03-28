'use client'

import { useState, useMemo, useEffect } from 'react'
import { cn } from '~/lib/utils'
import {
  Trash2,
  Users,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ChevronDown,
  ChevronUp,
  Plus,
  List,
  LayoutGrid,
} from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

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

import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible'
import {
  useAttendanceByEvent,
  useAttendanceStats,
  useUnCheckIn,
  useBulkCheckIn,
  useUpdateInviter,
} from '../hooks/useAttendance'
import { useNavigate } from '@tanstack/react-router'
import { InviterSelectionModal } from './InviterSelectionModal'
import { AttendeeSearchModal } from './AttendeeSearchModal'

interface AttendanceManagerProps {
  eventId: string
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
  const [deleteRecordId, setDeleteRecordId] = useState<string | null>(null)
  const [cursor, setCursor] = useState<string | null>(null)
  const [pageSize, setPageSize] = useState(10)

  // View mode state
  const [viewMode, setViewMode] = useState<'list' | 'byInviter'>('list')

  // Modal states
  const [showInviterModal, setShowInviterModal] = useState(false)
  const [showAddAttendanceModal, setShowAddAttendanceModal] = useState(false)

  // Track expanded groups in "by inviter" view
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  // Table row selection state (for bulk actions)
  const [selectedTableRows, setSelectedTableRows] = useState<Set<string>>(
    new Set(),
  )

  const pageSizeOptions = [10, 25, 50]

  // Queries
  const { data: attendanceData, isLoading: isLoadingAttendance } =
    useAttendanceByEvent(eventId, { numItems: pageSize, cursor })
  const { data: stats } = useAttendanceStats(eventId)

  // Mutations
  const unCheckIn = useUnCheckIn()
  const bulkCheckIn = useBulkCheckIn()
  const updateInviter = useUpdateInviter()

  // State for inviter assignment modal
  const [recordToAssignInviter, setRecordToAssignInviter] = useState<
    string | null
  >(null)
  const [attendeeNameForModal, setAttendeeNameForModal] = useState<string>('')

  // State for group quick-add modal
  const [showAttendeeSearchModal, setShowAttendeeSearchModal] = useState(false)
  const [selectedInviterForGroupAdd, setSelectedInviterForGroupAdd] = useState<{
    id: string | null
    name: string
  } | null>(null)

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

  // Handle opening attendee search for group quick-add
  const handleOpenGroupAdd = (
    inviter: { _id: string; firstName: string; lastName: string } | null,
  ) => {
    setSelectedInviterForGroupAdd({
      id: inviter?._id || null,
      name: inviter ? `${inviter.firstName} ${inviter.lastName}` : 'Walk-in',
    })
    setShowAttendeeSearchModal(true)
  }

  // Handle attendees selected from AttendeeSearchModal (groupAdd mode)
  const handleAttendeesSelectedForGroup = async (
    attendeeIds: string[],
    inviterId: string | null,
  ) => {
    if (!selectedInviterForGroupAdd || attendeeIds.length === 0) return

    try {
      // Check in all selected attendees with the pre-selected inviter
      const attendeesToCheckIn = attendeeIds.map((id) => ({
        attendeeId: id,
        invitedBy: inviterId || undefined,
      }))

      await bulkCheckIn.mutateAsync({
        eventId,
        attendees: attendeesToCheckIn,
      })

      setShowAttendeeSearchModal(false)
      setSelectedInviterForGroupAdd(null)
    } catch (error) {
      // Error is handled by the hook
    }
  }

  // Handle inviter selection from modal (for single record assignment)
  const handleInviterSelectedForRecord = async (
    inviter: { _id: string } | null,
  ) => {
    if (!recordToAssignInviter) return

    try {
      await updateInviter.mutateAsync({
        attendanceRecordId: recordToAssignInviter,
        invitedBy: inviter?._id ?? undefined,
      })
      setRecordToAssignInviter(null)
      setAttendeeNameForModal('')
      setShowInviterModal(false)
    } catch (error) {
      // Error is handled by the hook
    }
  }

  // Handle attendees selected from Add Attendance modal (generalAdd mode)
  const handleAttendeesSelectedForGeneralAdd = async (
    attendeeIds: string[],
    inviterId: string | null,
  ) => {
    if (attendeeIds.length === 0) return

    try {
      const attendeesToCheckIn = attendeeIds.map((id) => ({
        attendeeId: id,
        invitedBy: inviterId || undefined,
      }))

      await bulkCheckIn.mutateAsync({
        eventId,
        attendees: attendeesToCheckIn,
      })

      setShowAddAttendanceModal(false)
    } catch (error) {
      // Error is handled by the hook
    }
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
      <div className="flex w-full justify-end tems-center">
        <Button
          onClick={() => setShowAddAttendanceModal(true)}
          variant="default"
          size="lg"
          className="w-max"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Attendance
        </Button>
      </div>
      {attendance.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">
            {paginationInfo.totalCount > 0
              ? `Showing ${paginationInfo.startItem} to ${paginationInfo.endItem} of ${paginationInfo.totalCount} attendees`
              : `${attendance.length} attendees`}
          </span>
          <div className="flex items-center gap-2 ml-auto">
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Checked-in Attendees</CardTitle>
            <div className="flex items-center gap-3 mr-auto">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-muted-foreground" />
                <span className="text-lg font-bold">{totalCount}</span>
              </div>
            </div>
            <div className="flex rounded-lg justify-end">
              <Button
                variant={viewMode === 'list' ? 'outline' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={cn(
                  viewMode === 'list'
                    ? ''
                    : 'text-muted-foreground hover:text-foreground',
                  'rounded-r-none',
                )}
              >
                <List className="h-4 w-4 mr-2" />
              </Button>
              <Button
                variant={viewMode === 'byInviter' ? 'outline' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('byInviter')}
                className={cn(
                  viewMode === 'byInviter'
                    ? ''
                    : 'text-muted-foreground hover:text-foreground',
                  'rounded-l-none',
                )}
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
              </Button>
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
                Click "Add Attendance" to check someone in
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
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {group.records.length}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenGroupAdd(group.inviter)
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
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

      {/* Inviter Selection Modal */}
      <InviterSelectionModal
        open={showInviterModal}
        onSelect={handleInviterSelectedForRecord}
        onClose={() => {
          setShowInviterModal(false)
          setRecordToAssignInviter(null)
          setAttendeeNameForModal('')
        }}
        excludeAttendeeIds={[]}
        title={
          recordToAssignInviter
            ? `Assign Inviter to ${attendeeNameForModal}`
            : 'Select Inviter'
        }
      />

      {/* Attendee Search Modal for Group Quick-Add */}
      {selectedInviterForGroupAdd && (
        <AttendeeSearchModal
          open={showAttendeeSearchModal}
          mode="groupAdd"
          inviterName={selectedInviterForGroupAdd.name}
          onSelect={handleAttendeesSelectedForGroup}
          onClose={() => {
            setShowAttendeeSearchModal(false)
            setSelectedInviterForGroupAdd(null)
          }}
          excludeAttendeeIds={attendance.map((r) => r.attendeeId)}
        />
      )}

      {/* Attendee Search Modal for General Add Attendance */}
      <AttendeeSearchModal
        open={showAddAttendanceModal}
        mode="generalAdd"
        onSelect={handleAttendeesSelectedForGeneralAdd}
        onClose={() => setShowAddAttendanceModal(false)}
        excludeAttendeeIds={attendance.map((r) => r.attendeeId)}
      />
    </div>
  )
}
