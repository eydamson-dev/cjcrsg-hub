import { useState } from 'react'
import { useEventTypesList } from '../hooks/useEventTypes'
import { useDeleteEventType } from '../hooks/useEventTypeMutations'
import { Button } from '~/components/ui/button'
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
import { Plus, Trash2, Loader2 } from 'lucide-react'

interface EventTypeListProps {
  onEdit: (id: string) => void
  onCreate: () => void
}

export function EventTypeList({ onEdit, onCreate }: EventTypeListProps) {
  const { data: eventTypes, isLoading, error } = useEventTypesList()
  const { mutate: deleteEventType, isPending: isDeleting } =
    useDeleteEventType()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleDelete = () => {
    if (deleteId) {
      deleteEventType(deleteId)
      setDeleteId(null)
    }
  }

  const eventTypeToDelete = eventTypes?.find((et) => et._id === deleteId)

  if (isLoading) {
    return (
      <div className="space-y-4" data-testid="event-type-list-skeleton">
        <div className="flex justify-end">
          <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </Button>
        </div>
        <div className="rounded-md border">
          <div className="h-32 animate-pulse bg-muted" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Error loading event types
        </p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  if (!eventTypes || eventTypes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground mb-4">No event types yet</p>
        <Button onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Event Type
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Event Type
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Color</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {eventTypes.map((eventType) => (
              <TableRow
                key={eventType._id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onEdit(eventType._id)}
                data-testid={`event-type-row-${eventType._id}`}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-6 w-6 rounded-full border"
                      style={{ backgroundColor: eventType.color || '#6b7280' }}
                      data-testid={`color-circle-${eventType._id}`}
                    />
                    <span className="text-xs text-muted-foreground font-mono">
                      {eventType.color || '#6b7280'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{eventType.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {eventType.description || '-'}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    data-testid={`delete-button-${eventType._id}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteId(eventType._id)
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong>{eventTypeToDelete?.name}</strong>? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Confirm'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
