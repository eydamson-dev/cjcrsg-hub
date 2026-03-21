import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Layout } from '~/components/layout/Layout'
import { ProtectedRoute } from '~/components/auth/ProtectedRoute'
import { requireAuth } from '~/lib/auth-guard'
import { EventTypeList } from '~/features/events/components/EventTypeList'
import { EventTypeForm } from '~/features/events/components/EventTypeForm'
import { useEventType } from '~/features/events/hooks/useEventTypes'
import {
  useCreateEventType,
  useUpdateEventType,
} from '~/features/events/hooks/useEventTypeMutations'
import { Dialog, DialogContent } from '~/components/ui/dialog'
import { Loader2 } from 'lucide-react'

export const Route = createFileRoute('/event-types')({
  component: EventTypesPage,
  beforeLoad: async ({ context }) => {
    requireAuth(context)
  },
})

function EventTypesPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <EventTypesContent />
      </Layout>
    </ProtectedRoute>
  )
}

export function EventTypesContent() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [initialData, setInitialData] = useState<{
    name?: string
    description?: string
    color?: string
  } | null>(null)

  const { data: editingEventType, isLoading: isLoadingEventType } =
    useEventType(editingId ?? undefined)

  const createEventType = useCreateEventType()
  const updateEventType = useUpdateEventType()

  const handleCreate = () => {
    setEditingId(null)
    setInitialData(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (id: string) => {
    setEditingId(id)
    setIsDialogOpen(true)
  }

  const handleClose = () => {
    setIsDialogOpen(false)
    setEditingId(null)
    setInitialData(null)
  }

  const handleSubmit = async (data: {
    name: string
    description?: string
    color?: string | null
  }) => {
    try {
      const submitData = {
        ...data,
        color: data.color ?? undefined,
      }
      if (editingId) {
        await updateEventType.mutateAsync({
          id: editingId,
          ...submitData,
        })
      } else {
        await createEventType.mutateAsync(submitData)
      }
      handleClose()
    } catch (error) {
      console.error('Failed to save event type:', error)
    }
  }

  const isEditMode = !!editingId
  const isSubmitting = createEventType.isPending || updateEventType.isPending

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Event Types</h1>
        <p className="text-muted-foreground mt-1">
          Manage event types and categories for your church events
        </p>
      </div>

      <EventTypeList onEdit={handleEdit} onCreate={handleCreate} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {isEditMode && isLoadingEventType ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <EventTypeForm
              initialData={
                isEditMode && editingEventType
                  ? {
                      name: editingEventType.name,
                      description: editingEventType.description,
                      color: editingEventType.color,
                    }
                  : (initialData ?? undefined)
              }
              onSubmit={handleSubmit}
              onCancel={handleClose}
              isSubmitting={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
