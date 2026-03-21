import { useState, useMemo } from 'react'
import {
  Users,
  Plus,
  Trash2,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'
import type { AttendanceRecord } from '../types'

const PAGE_SIZES = [10, 25, 50]

interface EventAttendanceSummaryProps {
  attendance: AttendanceRecord[]
  totalCount: number
  onAddAttendee?: () => void
  onDeleteAttendee?: (recordId: string) => void
}

export function EventAttendanceSummary({
  attendance,
  totalCount,
  onAddAttendee,
  onDeleteAttendee,
}: EventAttendanceSummaryProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [deleteRecordId, setDeleteRecordId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const members = attendance.filter(
    (r) => r.attendee?.status === 'member',
  ).length
  const visitors = attendance.filter(
    (r) => r.attendee?.status === 'visitor',
  ).length

  const filteredAttendance = useMemo(() => {
    if (!searchQuery) return attendance
    return attendance.filter((record) => {
      const fullName =
        `${record.attendee?.firstName} ${record.attendee?.lastName}`.toLowerCase()
      return fullName.includes(searchQuery.toLowerCase())
    })
  }, [attendance, searchQuery])

  const sortedAttendance = [...filteredAttendance].sort(
    (a, b) => a.checkedInAt - b.checkedInAt,
  )

  // Pagination
  const totalPages = Math.ceil(sortedAttendance.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, sortedAttendance.length)
  const paginatedAttendance = sortedAttendance.slice(startIndex, endIndex)

  const hasNext = currentPage < totalPages
  const hasPrevious = currentPage > 1

  const handlePageSizeChange = (value: string | null) => {
    if (value) {
      setPageSize(parseInt(value, 10))
      setCurrentPage(1)
    }
  }

  const handleNextPage = () => {
    if (hasNext) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  const handlePreviousPage = () => {
    if (hasPrevious) {
      setCurrentPage((prev) => prev - 1)
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const handleDelete = () => {
    if (deleteRecordId && onDeleteAttendee) {
      onDeleteAttendee(deleteRecordId)
    }
    setDeleteRecordId(null)
  }

  const handleAddAttendee = () => {
    if (onAddAttendee) {
      onAddAttendee()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center rounded-lg bg-muted/50 p-4 text-center">
            <div className="flex items-center gap-2 text-2xl font-semibold">
              <Users className="size-5 text-muted-foreground" />
              {totalCount}
            </div>
            <span className="text-sm text-muted-foreground">Total</span>
          </div>

          <div className="flex flex-col items-center rounded-lg bg-muted/50 p-4 text-center">
            <div className="text-2xl font-semibold">{members}</div>
            <span className="text-sm text-muted-foreground">Members</span>
          </div>

          <div className="flex flex-col items-center rounded-lg bg-muted/50 p-4 text-center">
            <div className="text-2xl font-semibold">{visitors}</div>
            <span className="text-sm text-muted-foreground">Visitors</span>
          </div>
        </div>

        {/* Search and Add Button inline */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 w-full sm:min-w-[200px] sm:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search attendees..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-9"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setCurrentPage(1)
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleAddAttendee}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Attendee
          </Button>
        </div>

        {/* Results count with pagination info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">
            Showing {sortedAttendance.length > 0 ? startIndex + 1 : 0} to{' '}
            {endIndex} of {sortedAttendance.length} attendees
            {searchQuery && ' found'}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Items per page:
            </span>
            <Select
              value={pageSize.toString()}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="w-[80px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="w-[80px] min-w-0">
                {PAGE_SIZES.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
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
              {paginatedAttendance.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {searchQuery
                      ? 'No attendees match your search'
                      : 'No attendees yet. Click "Add Attendee" to check someone in.'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedAttendance.map((record) => (
                  <TableRow key={record._id}>
                    <TableCell className="font-medium">
                      {record.attendee?.firstName} {record.attendee?.lastName}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          record.attendee?.status === 'member'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {record.attendee?.status === 'member'
                          ? 'Member'
                          : 'Visitor'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatTime(record.checkedInAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {record.notes && (
                          <span
                            className="text-xs text-muted-foreground"
                            title={record.notes}
                          >
                            *
                          </span>
                        )}
                        {onDeleteAttendee && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteRecordId(record._id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination controls */}
        {sortedAttendance.length > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={!hasPrevious}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={!hasNext}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>

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
