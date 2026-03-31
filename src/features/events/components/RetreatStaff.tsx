import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Plus, Edit, Trash2, Users } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { useAttendees } from '~/features/attendees/hooks/useAttendees'
import { useRetreatMutations } from '~/features/events/hooks/useRetreat'
import type {
  RetreatStaff as RetreatStaffType,
  RetreatDetails,
} from '~/features/events/types'
import type { Id } from '../../../../convex/_generated/dataModel'

interface RetreatStaffProps {
  eventId: string
  retreatData?: RetreatDetails
  isLoading?: boolean
}

interface StaffFormData {
  attendeeId: string
  role: string
  responsibilities: string
  isLead: boolean
}

function AddStaffDialog({
  existingStaffIds,
  onAdd,
  children,
}: {
  existingStaffIds: string[]
  onAdd: (data: StaffFormData) => void
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAttendeeId, setSelectedAttendeeId] = useState<string | null>(
    null,
  )
  const [role, setRole] = useState('')
  const [responsibilities, setResponsibilities] = useState('')
  const [isLead, setIsLead] = useState(false)

  const { data: attendeesData, isLoading } = useAttendees(undefined, null, 100)
  const allAttendees = attendeesData?.page

  const availableAttendees = allAttendees?.filter(
    (a: { _id: string }) => !existingStaffIds.includes(a._id),
  )

  const filteredAttendees = availableAttendees?.filter(
    (attendee: { firstName: string; lastName: string; email?: string }) =>
      attendee.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attendee.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attendee.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSubmit = () => {
    if (!selectedAttendeeId || !role) return
    onAdd({
      attendeeId: selectedAttendeeId,
      role,
      responsibilities,
      isLead,
    })
    setOpen(false)
    setSearchQuery('')
    setSelectedAttendeeId('')
    setRole('')
    setResponsibilities('')
    setIsLead(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Staff Member</DialogTitle>
          <DialogDescription>
            Select a person to serve as staff for this retreat.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="staff-search">Search</Label>
            <Input
              id="staff-search"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : filteredAttendees && filteredAttendees.length > 0 ? (
            <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-2">
              {filteredAttendees.map((attendee) => (
                <div
                  key={attendee._id}
                  className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-muted ${
                    selectedAttendeeId === attendee._id ? 'bg-muted' : ''
                  }`}
                  onClick={() => setSelectedAttendeeId(attendee._id)}
                >
                  <div>
                    <p className="font-medium">
                      {attendee.firstName} {attendee.lastName}
                    </p>
                    {attendee.email && (
                      <p className="text-sm text-muted-foreground">
                        {attendee.email}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline">{attendee.status}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No attendees available to add as staff.
            </p>
          )}

          {selectedAttendeeId && (
            <>
              <div>
                <Label htmlFor="role">Role *</Label>
                <Input
                  id="role"
                  placeholder="e.g., Sound Tech, Registration, Greeter"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="responsibilities">
                  Responsibilities (optional)
                </Label>
                <Textarea
                  id="responsibilities"
                  placeholder="Describe the staff member's duties..."
                  value={responsibilities}
                  onChange={(e) => setResponsibilities(e.target.value)}
                  rows={3}
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isLead}
                  onChange={(e) => setIsLead(e.target.checked)}
                  className="h-4 w-4 rounded border-input"
                />
                <span className="text-sm">Lead Contact for this role</span>
              </label>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedAttendeeId || !role}
          >
            Add Staff
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function EditStaffDialog({
  staff,
  onSave,
}: {
  staff: RetreatStaffType
  onSave: (role: string, responsibilities: string, isLead: boolean) => void
}) {
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState(staff.role || '')
  const [responsibilities, setResponsibilities] = useState(
    staff.responsibilities || '',
  )
  const [isLead, setIsLead] = useState(staff.isLead || false)

  const handleSubmit = () => {
    onSave(role, responsibilities, isLead)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="mr-1 h-3 w-3" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Staff Member</DialogTitle>
          <DialogDescription>
            Update the role and responsibilities for{' '}
            {staff.attendee
              ? `${staff.attendee.firstName} ${staff.attendee.lastName}`
              : 'this staff member'}
            .
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-role">Role</Label>
            <Input
              id="edit-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="edit-responsibilities">Responsibilities</Label>
            <Textarea
              id="edit-responsibilities"
              value={responsibilities}
              onChange={(e) => setResponsibilities(e.target.value)}
              rows={3}
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isLead}
              onChange={(e) => setIsLead(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            <span className="text-sm">Lead Contact for this role</span>
          </label>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!role}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function RemoveStaffDialog({
  staff,
  onConfirm,
}: {
  staff: RetreatStaffType
  onConfirm: () => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive">
          <Trash2 className="mr-1 h-3 w-3" />
          Remove
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Remove Staff Member?</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove{' '}
            {staff.attendee
              ? `${staff.attendee.firstName} ${staff.attendee.lastName}`
              : 'this staff member'}{' '}
            from this retreat?
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm()
              setOpen(false)
            }}
          >
            Remove
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function RetreatStaff({
  eventId,
  retreatData,
  isLoading,
}: RetreatStaffProps) {
  const { addStaff, updateStaff, removeStaff } = useRetreatMutations()

  const staff = retreatData?.staff || []
  const existingStaffIds = staff.map((s) => s.attendeeId)

  const handleAddStaff = async (data: StaffFormData) => {
    try {
      await addStaff.mutateAsync({
        eventId: eventId as Id<'events'>,
        attendeeId: data.attendeeId as Id<'attendees'>,
        role: data.role,
        responsibilities: data.responsibilities || undefined,
        isLead: data.isLead,
      })
    } catch (error) {
      // Error handled by hook
    }
  }

  const handleUpdateStaff = async (
    attendeeId: string,
    role: string,
    responsibilities: string,
    isLead: boolean,
  ) => {
    try {
      await updateStaff.mutateAsync({
        eventId: eventId as Id<'events'>,
        attendeeId: attendeeId as Id<'attendees'>,
        role,
        responsibilities: responsibilities || undefined,
        isLead,
      })
    } catch (error) {
      // Error handled by hook
    }
  }

  const handleRemoveStaff = async (attendeeId: string) => {
    try {
      await removeStaff.mutateAsync({
        eventId: eventId as Id<'events'>,
        attendeeId: attendeeId as Id<'attendees'>,
      })
    } catch (error) {
      // Error handled by hook
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded-md" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-md" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Staff</h2>
          <p className="text-sm text-muted-foreground">
            {staff.length} staff member{staff.length !== 1 ? 's' : ''} assigned
          </p>
        </div>
        <AddStaffDialog
          existingStaffIds={existingStaffIds}
          onAdd={handleAddStaff}
        >
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Staff
          </Button>
        </AddStaffDialog>
      </div>

      {staff.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No Staff Yet</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Add staff members to help with the retreat operations.
              <br />
              Any attendee can be assigned as staff.
            </p>
            <AddStaffDialog
              existingStaffIds={existingStaffIds}
              onAdd={handleAddStaff}
            >
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Staff
              </Button>
            </AddStaffDialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {staff.map((staffMember) => (
            <Card
              key={staffMember.attendeeId}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {staffMember.attendee
                          ? `${staffMember.attendee.firstName} ${staffMember.attendee.lastName}`
                          : 'Unknown'}
                      </CardTitle>
                      {staffMember.attendee?.email && (
                        <p className="text-sm text-muted-foreground">
                          {staffMember.attendee.email}
                        </p>
                      )}
                    </div>
                  </div>
                  {staffMember.isLead && <Badge variant="default">Lead</Badge>}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {staffMember.role && (
                  <div className="mb-2">
                    <span className="text-sm font-medium">Role: </span>
                    <span className="text-sm text-muted-foreground">
                      {staffMember.role}
                    </span>
                  </div>
                )}
                {staffMember.responsibilities && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {staffMember.responsibilities}
                  </p>
                )}
                <div className="flex gap-2">
                  <EditStaffDialog
                    staff={staffMember}
                    onSave={(role, responsibilities, isLead) =>
                      handleUpdateStaff(
                        staffMember.attendeeId,
                        role,
                        responsibilities,
                        isLead,
                      )
                    }
                  />
                  <RemoveStaffDialog
                    staff={staffMember}
                    onConfirm={() => handleRemoveStaff(staffMember.attendeeId)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
