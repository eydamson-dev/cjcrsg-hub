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
import { Plus, Search, Edit, Eye, Archive, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import type { AttendeeStatus } from '../types'

interface AttendeeListProps {
  attendees?: any[]
  isPending?: boolean
  onNavigate?: (path: string) => void
  onArchive?: (id: string) => void
}

export function AttendeeList({
  attendees = [],
  isPending = false,
  onNavigate,
  onArchive,
}: AttendeeListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined,
  )

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search attendees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={statusFilter || ''}
            onChange={(e) => setStatusFilter(e.target.value || undefined)}
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

      <Card>
        <CardHeader>
          <CardTitle>Church Members</CardTitle>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading attendees...
            </div>
          ) : attendees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No attendees found. Add your first attendee to get started.
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
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              onNavigate?.(`/attendees/${attendee._id}`)
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
                              onClick={() => onArchive?.(attendee._id)}
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
    </div>
  )
}
