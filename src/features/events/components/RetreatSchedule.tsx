import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import {
  Plus,
  Edit,
  Trash2,
  Clock,
  AlertTriangle,
  BookOpen,
  Utensils,
  Coffee,
  Music,
  ClipboardList,
  PartyPopper,
  HelpCircle,
} from 'lucide-react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import {
  useRetreatMutations,
  useLessonConflicts,
} from '~/features/events/hooks/useRetreat'
import { LESSON_TYPE_COLORS, LESSON_TYPE_LABELS } from '~/features/events/types'
import type {
  RetreatLesson,
  RetreatDetails,
  LessonType,
} from '~/features/events/types'
import type { Id } from '../../../../convex/_generated/dataModel'

interface RetreatScheduleProps {
  eventId: string
  retreatData?: RetreatDetails
  isLoading?: boolean
}

const LESSON_TYPES: LessonType[] = [
  'teaching',
  'meal',
  'break',
  'worship',
  'registration',
  'closing',
  'other',
]

const LESSON_TYPE_ICONS: Record<LessonType, React.ReactNode> = {
  teaching: <BookOpen className="h-4 w-4" />,
  meal: <Utensils className="h-4 w-4" />,
  break: <Coffee className="h-4 w-4" />,
  worship: <Music className="h-4 w-4" />,
  registration: <ClipboardList className="h-4 w-4" />,
  closing: <PartyPopper className="h-4 w-4" />,
  other: <HelpCircle className="h-4 w-4" />,
}

function LessonCard({
  lesson,
  onEdit,
  onRemove,
}: {
  lesson: RetreatLesson
  onEdit: () => void
  onRemove: () => void
}) {
  const colorClass = LESSON_TYPE_COLORS[lesson.type]
  const icon = LESSON_TYPE_ICONS[lesson.type]

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border ${colorClass}`}
    >
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-medium truncate">{lesson.title}</h4>
          <div className="flex items-center gap-1 text-sm">
            <Clock className="h-3 w-3" />
            <span>
              {lesson.startTime} - {lesson.endTime}
            </span>
          </div>
        </div>
        {lesson.description && (
          <p className="text-sm mt-1 line-clamp-2 opacity-80">
            {lesson.description}
          </p>
        )}
        {lesson.teacher && (
          <p className="text-sm mt-1 opacity-80">
            Teacher: {lesson.teacher.firstName} {lesson.teacher.lastName}
          </p>
        )}
        {lesson.location && (
          <p className="text-sm mt-1 opacity-80">Location: {lesson.location}</p>
        )}
        <div className="flex gap-2 mt-2">
          <Button variant="ghost" size="sm" onClick={onEdit}>
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
      </div>
    </div>
  )
}

function AddLessonDialog({
  eventId,
  existingDays,
  existingLessons,
  onAdd,
  children,
}: {
  eventId: string
  existingDays: number[]
  existingLessons: RetreatLesson[]
  onAdd: (lesson: Omit<RetreatLesson, 'id'>) => void
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [day, setDay] = useState<number>(
    existingDays.length > 0 ? existingDays[0] : 1,
  )
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [teacherId, setTeacherId] = useState('')
  const [location, setLocation] = useState('')
  const [type, setType] = useState<LessonType>('teaching')

  const { data: conflicts } = useLessonConflicts({
    eventId,
    day,
    startTime,
    endTime,
  })

  const hasConflict = conflicts && conflicts.length > 0

  const handleSubmit = () => {
    if (!title || hasConflict) return

    const id = `lesson-${Date.now()}`
    onAdd({
      id,
      title,
      description: description || undefined,
      teacherId: teacherId || undefined,
      day,
      startTime,
      endTime,
      location: location || undefined,
      type,
    })

    setOpen(false)
    setTitle('')
    setDescription('')
    setTeacherId('')
    setLocation('')
    setType('teaching')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Schedule Item</DialogTitle>
          <DialogDescription>
            Add a lesson, activity, or break to the retreat schedule.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="day">Day</Label>
              <Select
                value={day.toString()}
                onValueChange={(v) => setDay(parseInt(v))}
              >
                <SelectTrigger id="day">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {existingDays.map((d) => (
                    <SelectItem key={d} value={d.toString()}>
                      Day {d}
                    </SelectItem>
                  ))}
                  {existingDays.length < 3 && (
                    <SelectItem value={(existingDays.length + 1).toString()}>
                      + Add Day {existingDays.length + 1}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as LessonType)}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LESSON_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {LESSON_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Session 1: Spiritual Renewal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Additional details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="location">Location (optional)</Label>
            <Input
              id="location"
              placeholder="e.g., Main Chapel"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {hasConflict && (
            <div className="bg-destructive/10 p-3 rounded-md flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-destructive">Time Conflict</p>
                <p className="text-destructive/80">
                  Conflicts with {conflicts.length} lesson(s) on this day
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title || hasConflict}>
            Add Item
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function EditLessonDialog({
  eventId,
  lesson,
  onSave,
}: {
  eventId: string
  lesson: RetreatLesson
  onSave: (updates: Partial<RetreatLesson>) => void
}) {
  const [open, setOpen] = useState(false)
  const [day, setDay] = useState(lesson.day || 1)
  const [startTime, setStartTime] = useState(lesson.startTime)
  const [endTime, setEndTime] = useState(lesson.endTime)
  const [title, setTitle] = useState(lesson.title)
  const [description, setDescription] = useState(lesson.description || '')
  const [location, setLocation] = useState(lesson.location || '')
  const [type, setType] = useState<LessonType>(lesson.type)

  const { data: conflicts } = useLessonConflicts({
    eventId,
    day,
    startTime,
    endTime,
    excludeLessonId: lesson.id,
  })

  const hasConflict = conflicts && conflicts.length > 0

  const handleSubmit = () => {
    if (!title || hasConflict) return

    onSave({
      title,
      description: description || undefined,
      day,
      startTime,
      endTime,
      location: location || undefined,
      type,
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="mr-1 h-3 w-3" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Schedule Item</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-day">Day</Label>
              <Select
                value={day.toString()}
                onValueChange={(v) => setDay(parseInt(v))}
              >
                <SelectTrigger id="edit-day">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3].map((d) => (
                    <SelectItem key={d} value={d.toString()}>
                      Day {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-type">Type</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as LessonType)}
              >
                <SelectTrigger id="edit-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LESSON_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {LESSON_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-startTime">Start Time</Label>
              <Input
                id="edit-startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-endTime">End Time</Label>
              <Input
                id="edit-endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="edit-title">Title *</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="edit-location">Location</Label>
            <Input
              id="edit-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {hasConflict && (
            <div className="bg-destructive/10 p-3 rounded-md flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
              <p className="text-sm text-destructive">
                Time conflict with existing lesson
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title || hasConflict}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function RemoveLessonDialog({
  lesson,
  onConfirm,
}: {
  lesson: RetreatLesson
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
          <DialogTitle>Remove Schedule Item?</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove "{lesson.title}" from the schedule?
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

export function RetreatSchedule({
  eventId,
  retreatData,
  isLoading,
}: RetreatScheduleProps) {
  const { addLesson, updateLesson, removeLesson } = useRetreatMutations()

  const lessons = retreatData?.lessons || []
  const existingDays = [...new Set(lessons.map((l) => l.day || 1))].sort()

  const handleAddLesson = async (lessonData: Omit<RetreatLesson, 'id'>) => {
    try {
      const id = `lesson-${Date.now()}`
      await addLesson.mutateAsync({
        eventId,
        lesson: { ...lessonData, id },
      })
    } catch (error) {
      // Error handled by hook
    }
  }

  const handleUpdateLesson = async (
    lessonId: string,
    updates: Partial<RetreatLesson>,
  ) => {
    try {
      await updateLesson.mutateAsync({
        eventId,
        lessonId,
        updates,
      })
    } catch (error) {
      // Error handled by hook
    }
  }

  const handleRemoveLesson = async (lessonId: string) => {
    try {
      await removeLesson.mutateAsync({
        eventId,
        lessonId,
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
            <div key={i} className="h-24 bg-muted rounded-md" />
          ))}
        </div>
      </div>
    )
  }

  const days = existingDays.length > 0 ? existingDays : [1]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Schedule</h2>
          <p className="text-sm text-muted-foreground">
            {lessons.length} item{lessons.length !== 1 ? 's' : ''} scheduled
          </p>
        </div>
        <AddLessonDialog
          eventId={eventId}
          existingDays={days}
          existingLessons={lessons}
          onAdd={handleAddLesson}
        >
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </AddLessonDialog>
      </div>

      <Tabs defaultValue={days[0].toString()} className="w-full">
        <TabsList>
          {days.map((day) => (
            <TabsTrigger key={day} value={day.toString()}>
              Day {day}
            </TabsTrigger>
          ))}
          {days.length < 3 && <TabsTrigger value="add">+ Add Day</TabsTrigger>}
        </TabsList>

        {days.map((day) => {
          const dayLessons = lessons.filter((l) => (l.day || 1) === day)
          const sortedLessons = [...dayLessons].sort((a, b) =>
            a.startTime.localeCompare(b.startTime),
          )

          return (
            <TabsContent key={day} value={day.toString()} className="mt-4">
              {sortedLessons.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">
                      No Items for Day {day}
                    </h3>
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      Add lessons, breaks, and activities for this day.
                    </p>
                    <AddLessonDialog
                      eventId={eventId}
                      existingDays={days}
                      existingLessons={lessons}
                      onAdd={handleAddLesson}
                    >
                      <Button variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Add First Item
                      </Button>
                    </AddLessonDialog>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {sortedLessons.map((lesson) => (
                    <LessonCard
                      key={lesson.id}
                      lesson={lesson}
                      onEdit={() => {}}
                      onRemove={() => handleRemoveLesson(lesson.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
