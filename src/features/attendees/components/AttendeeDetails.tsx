'use client'

import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'
import { AlertCircle, Edit, Archive, ArrowLeft } from 'lucide-react'
import type { AttendeeStatus } from '../types'

interface AttendeeDetailsProps {
  attendee: any
  onEdit?: () => void
  onArchive?: () => void
  onBack?: () => void
}

export function AttendeeDetails({
  attendee,
  onEdit,
  onArchive,
  onBack,
}: AttendeeDetailsProps) {
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
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {attendee.firstName} {attendee.lastName}
          </h1>
          <p className="text-muted-foreground">View attendee information</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onEdit} variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          {attendee.status !== 'inactive' && (
            <Button onClick={onArchive} variant="destructive">
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-medium">
                {attendee.firstName} {attendee.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{attendee.email || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{attendee.phone || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date of Birth</p>
              <p className="font-medium">{formatDate(attendee.dateOfBirth)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Church Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Church Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge
                variant={getStatusBadgeVariant(attendee.status)}
                className="mt-1"
              >
                {attendee.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Join Date</p>
              <p className="font-medium">{formatDate(attendee.joinDate)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium whitespace-pre-wrap">
                {attendee.address}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes Card */}
      {attendee.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-muted-foreground">
              {attendee.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <div className="text-sm text-muted-foreground pt-4 border-t">
        <p>Created: {formatDate(attendee.createdAt)}</p>
        <p>Last Updated: {formatDate(attendee.updatedAt)}</p>
      </div>
    </div>
  )
}

interface AttendeeDetailsSkeletonProps {
  onBack?: () => void
}

export function AttendeeDetailsSkeleton({
  onBack,
}: AttendeeDetailsSkeletonProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-48 mt-2" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-48 mt-1" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-48 mt-1" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface AttendeeNotFoundProps {
  error?: Error
  onBack?: () => void
}

export function AttendeeNotFound({ error, onBack }: AttendeeNotFoundProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Attendee Not Found
          </h1>
          <p className="text-muted-foreground">
            The attendee you're looking for doesn't exist
          </p>
        </div>
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>Error: {error?.message || 'Attendee not found'}</p>
          </div>
          <Button className="mt-4" onClick={onBack}>
            Back to Attendees
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
