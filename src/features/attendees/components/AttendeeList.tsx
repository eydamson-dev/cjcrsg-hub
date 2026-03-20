'use client'

import { useState } from 'react'
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
} from 'lucide-react'
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
import type { AttendeeStatus } from '../types'

interface AttendeeListProps {
  attendees?: any[]
  isPending?: boolean
  isSearching?: boolean
  searchQuery?: string
  statusFilter?: string
  onNavigate?: (path: string) => void
  onArchive?: (id: string) => void
  onSearchChange?: (query: string) => void
  onStatusFilterChange?: (status: string | undefined) => void
  onClearSearch?: () => void
}

export function AttendeeList({
  attendees = [],
  isPending = false,
  isSearching = false,
  searchQuery = '',
  statusFilter,
  onNavigate,
  onArchive,
  onSearchChange,
  onStatusFilterChange,
  onClearSearch,
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px] max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or address..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-9 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => onClearSearch?.()}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>
          {searchQuery.length > 0 && searchQuery.length < 3 && (
            <p className="text-xs text-muted-foreground mt-1">
              Type at least 3 characters to search
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <select
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={statusFilter || ''}
            onChange={(e) =>
              onStatusFilterChange?.(e.target.value || undefined)
            }
          >
            <option value="">All Status</option>
            <option value="member">Member</option>
            <option value="visitor">Visitor</option>
            <option value="inactive">Inactive</option>
          </select>
          <Button onClick={() => onNavigate?.('/attendees/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Attendee
          </Button>
        </div>
      </div>

      {/* Results count */}
      {hasActiveFilters && (
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
      )}

      <Card>
        <CardHeader>
          <CardTitle>Church Members</CardTitle>
        </CardHeader>
        <CardContent>
          {isPending || isSearching ? (
            <div className="text-center py-8 text-muted-foreground">
              {isSearching ? 'Searching...' : 'Loading attendees...'}
            </div>
          ) : attendees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {hasActiveFilters ? (
                <div className="space-y-2">
                  <p className="font-medium">No results found</p>
                  <p className="text-sm">
                    {searchQuery
                      ? `No attendees match your search "${searchQuery}"`
                      : 'No attendees match your filters'}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearSearch}
                    className="mt-2"
                  >
                    Clear filters
                  </Button>
                </div>
              ) : (
                <>
                  <p>
                    No attendees found. Add your first attendee to get started.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate?.('/attendees/new')}
                    className="mt-2"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Attendee
                  </Button>
                </>
              )}
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>

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
