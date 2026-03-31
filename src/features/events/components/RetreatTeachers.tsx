import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Plus, Edit, Trash2, UserCircle, AlertTriangle } from 'lucide-react'
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
import {
  useQualifiedTeachers,
  useRetreatMutations,
  useCheckTeacherLessons,
} from '~/features/events/hooks/useRetreat'
import type { RetreatTeacher, RetreatDetails } from '~/features/events/types'
import type { Id } from '../../../../convex/_generated/dataModel'

interface RetreatTeachersProps {
  eventId: string
  retreatData?: RetreatDetails
  isLoading?: boolean
}

interface TeacherFormData {
  attendeeId: string
  subject: string
  bio: string
}

function TeacherCard({
  teacher,
  onEdit,
  onRemove,
}: {
  teacher: RetreatTeacher
  onEdit: () => void
  onRemove: () => void
}) {
  const getStatusBadgeVariant = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'pastor':
        return 'default'
      case 'leader':
        return 'secondary'
      case 'elder':
        return 'outline'
      case 'deacon':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <UserCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">
                {teacher.attendee
                  ? `${teacher.attendee.firstName} ${teacher.attendee.lastName}`
                  : 'Unknown Teacher'}
              </CardTitle>
              {teacher.attendee?.email && (
                <p className="text-sm text-muted-foreground">
                  {teacher.attendee.email}
                </p>
              )}
            </div>
          </div>
          {teacher.attendee?.status && (
            <Badge variant={getStatusBadgeVariant(teacher.attendee.status)}>
              {teacher.attendee.status}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {teacher.subject && (
          <div className="mb-2">
            <span className="text-sm font-medium">Topic: </span>
            <span className="text-sm text-muted-foreground">
              {teacher.subject}
            </span>
          </div>
        )}
        {teacher.bio && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {teacher.bio}
          </p>
        )}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="mr-1 h-3 w-3" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="mr-1 h-3 w-3" />
            Remove
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function AddTeacherDialog({
  eventId,
  existingTeacherIds,
  onAdd,
  children,
}: {
  eventId: string
  existingTeacherIds: string[]
  onAdd: (data: TeacherFormData) => void
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAttendeeId, setSelectedAttendeeId] = useState<string | null>(
    null,
  )
  const [subject, setSubject] = useState('')
  const [bio, setBio] = useState('')

  const { data: qualifiedTeachers, isLoading } = useQualifiedTeachers()

  const availableTeachers = qualifiedTeachers?.filter(
    (t) => !existingTeacherIds.includes(t._id),
  )

  const filteredTeachers = availableTeachers?.filter(
    (teacher) =>
      teacher.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSubmit = () => {
    if (!selectedAttendeeId) return
    onAdd({
      attendeeId: selectedAttendeeId,
      subject,
      bio,
    })
    setOpen(false)
    setSearchQuery('')
    setSelectedAttendeeId('')
    setSubject('')
    setBio('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Teacher</DialogTitle>
          <DialogDescription>
            Select a qualified person to serve as a teacher for this retreat.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="teacher-search">Search</Label>
            <Input
              id="teacher-search"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : filteredTeachers && filteredTeachers.length > 0 ? (
            <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-2">
              {filteredTeachers.map((teacher) => (
                <div
                  key={teacher._id}
                  className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-muted ${
                    selectedAttendeeId === teacher._id ? 'bg-muted' : ''
                  }`}
                  onClick={() => setSelectedAttendeeId(teacher._id)}
                >
                  <div>
                    <p className="font-medium">
                      {teacher.firstName} {teacher.lastName}
                    </p>
                    {teacher.email && (
                      <p className="text-sm text-muted-foreground">
                        {teacher.email}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline">{teacher.status}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No qualified teachers found. Only Pastor, Leader, Elder, or Deacon
              status holders can be teachers.
            </p>
          )}

          {selectedAttendeeId && (
            <>
              <div>
                <Label htmlFor="subject">Subject (optional)</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Spiritual Renewal"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="bio">Bio (optional)</Label>
                <Textarea
                  id="bio"
                  placeholder="Brief description of the teacher..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                />
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedAttendeeId}>
            Add Teacher
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function EditTeacherDialog({
  eventId,
  teacher,
  onSave,
}: {
  eventId: string
  teacher: RetreatTeacher
  onSave: (subject: string, bio: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [subject, setSubject] = useState(teacher.subject || '')
  const [bio, setBio] = useState(teacher.bio || '')

  const handleSubmit = () => {
    onSave(subject, bio)
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
          <DialogTitle>Edit Teacher</DialogTitle>
          <DialogDescription>
            Update the subject and bio for{' '}
            {teacher.attendee
              ? `${teacher.attendee.firstName} ${teacher.attendee.lastName}`
              : 'this teacher'}
            .
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-subject">Subject</Label>
            <Input
              id="edit-subject"
              placeholder="e.g., Spiritual Renewal"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="edit-bio">Bio</Label>
            <Textarea
              id="edit-bio"
              placeholder="Brief description..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function RemoveTeacherDialog({
  eventId,
  teacher,
  onConfirm,
}: {
  eventId: string
  teacher: RetreatTeacher
  onConfirm: (forceRemove: boolean) => void
}) {
  const [open, setOpen] = useState(false)
  const [forceRemove, setForceRemove] = useState(false)

  const { data: teacherLessons } = useCheckTeacherLessons(
    eventId,
    teacher.attendeeId,
  )
  const hasLessons = teacherLessons?.hasLessons

  const handleConfirm = () => {
    onConfirm(forceRemove)
    setOpen(false)
    setForceRemove(false)
  }

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
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Remove Teacher?
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to remove{' '}
            {teacher.attendee
              ? `${teacher.attendee.firstName} ${teacher.attendee.lastName}`
              : 'this teacher'}{' '}
            from this retreat?
          </DialogDescription>
        </DialogHeader>

        {hasLessons && (
          <div className="bg-destructive/10 p-4 rounded-md">
            <p className="font-medium text-destructive mb-2">
              This teacher has {teacherLessons.lessons.length} assigned
              lesson(s):
            </p>
            <ul className="list-disc list-inside text-sm">
              {teacherLessons.lessons.slice(0, 3).map((lesson) => (
                <li key={lesson.id}>
                  {lesson.title}
                  {lesson.day && ` (Day ${lesson.day})`}: {lesson.startTime} -{' '}
                  {lesson.endTime}
                </li>
              ))}
              {teacherLessons.lessons.length > 3 && (
                <li className="text-muted-foreground">
                  ...and {teacherLessons.lessons.length - 3} more
                </li>
              )}
            </ul>
            <p className="text-sm mt-2">
              Removing this teacher will unassign them from these lessons.
            </p>
            <label className="flex items-center gap-2 mt-3">
              <input
                type="checkbox"
                checked={forceRemove}
                onChange={(e) => setForceRemove(e.target.checked)}
              />
              <span className="text-sm">Force remove anyway</span>
            </label>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Remove Teacher
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function RetreatTeachers({
  eventId,
  retreatData,
  isLoading,
}: RetreatTeachersProps) {
  const { addTeacher, updateTeacher, removeTeacher } = useRetreatMutations()

  const teachers = retreatData?.teachers || []
  const existingTeacherIds = teachers.map((t) => t.attendeeId)

  const handleAddTeacher = async (data: TeacherFormData) => {
    try {
      await addTeacher.mutateAsync({
        eventId,
        attendeeId: data.attendeeId,
        subject: data.subject || undefined,
        bio: data.bio || undefined,
      })
    } catch (error) {
      // Error handled by hook
    }
  }

  const handleUpdateTeacher = async (
    teacherId: string,
    subject: string,
    bio: string,
  ) => {
    try {
      await updateTeacher.mutateAsync({
        eventId,
        attendeeId: teacherId,
        subject: subject || undefined,
        bio: bio || undefined,
      })
    } catch (error) {
      // Error handled by hook
    }
  }

  const handleRemoveTeacher = async (
    teacherId: string,
    forceRemove: boolean,
  ) => {
    try {
      await removeTeacher.mutateAsync({
        eventId,
        attendeeId: teacherId,
        forceRemove,
      })
    } catch (error) {
      // Error handled by hook
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
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
          <h2 className="text-lg font-semibold">Teachers</h2>
          <p className="text-sm text-muted-foreground">
            {teachers.length} teacher{teachers.length !== 1 ? 's' : ''} assigned
          </p>
        </div>
        <AddTeacherDialog
          eventId={eventId}
          existingTeacherIds={existingTeacherIds}
          onAdd={handleAddTeacher}
        >
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Teacher
          </Button>
        </AddTeacherDialog>
      </div>

      {teachers.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UserCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No Teachers Yet</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Add teachers to lead sessions at this retreat.
              <br />
              Only Pastor, Leader, Elder, or Deacon status holders can be
              teachers.
            </p>
            <AddTeacherDialog
              eventId={eventId}
              existingTeacherIds={existingTeacherIds}
              onAdd={handleAddTeacher}
            >
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Teacher
              </Button>
            </AddTeacherDialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher) => (
            <Card
              key={teacher.attendeeId}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <UserCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {teacher.attendee
                          ? `${teacher.attendee.firstName} ${teacher.attendee.lastName}`
                          : 'Unknown'}
                      </CardTitle>
                      {teacher.attendee?.email && (
                        <p className="text-sm text-muted-foreground">
                          {teacher.attendee.email}
                        </p>
                      )}
                    </div>
                  </div>
                  {teacher.attendee?.status && (
                    <Badge variant="outline">{teacher.attendee.status}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {teacher.subject && (
                  <div className="mb-2">
                    <span className="text-sm font-medium">Topic: </span>
                    <span className="text-sm text-muted-foreground">
                      {teacher.subject}
                    </span>
                  </div>
                )}
                {teacher.bio && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {teacher.bio}
                  </p>
                )}
                <div className="flex gap-2">
                  <EditTeacherDialog
                    eventId={eventId}
                    teacher={teacher}
                    onSave={(subject, bio) =>
                      handleUpdateTeacher(teacher.attendeeId, subject, bio)
                    }
                  />
                  <RemoveTeacherDialog
                    eventId={eventId}
                    teacher={teacher}
                    onConfirm={(force) =>
                      handleRemoveTeacher(teacher.attendeeId, force)
                    }
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
