import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Layout } from '~/components/layout/Layout'
import { ProtectedRoute } from '~/components/auth/ProtectedRoute'
import { requireAuth } from '~/lib/auth-guard'
import { useEventTypesList } from '~/features/events/hooks/useEventTypes'
import { useCurrentEvent } from '~/features/events/hooks/useEvents'
import { useCreateEvent } from '~/features/events/hooks/useEventMutations'
import { RetreatDetails } from '~/features/events/components/RetreatDetails'
import { SpiritualRetreatForm } from '~/features/events/forms/SpiritualRetreatForm'
import { PageLoader } from '~/components/ui/loading-spinner'
import { Button } from '~/components/ui/button'
import { Plus, Mountain } from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/events/spiritual-retreat')({
  component: SpiritualRetreatPage,
  beforeLoad: async ({ context }) => {
    requireAuth(context)
  },
})

const RETREAT_NAME = 'Spiritual Retreat'

interface UnsavedRetreatData {
  name: string
  eventTypeId: string
  date: number
  startTime: string
  endTime: string
  location: string
  description: string
}

function SpiritualRetreatPage() {
  const { data: eventTypes, isPending: typesLoading } = useEventTypesList()
  const retreatType = eventTypes?.find((et) => et.name === RETREAT_NAME)

  const { data: currentEvent, isPending: eventLoading } = useCurrentEvent(
    retreatType?._id ? { eventTypeId: retreatType._id } : undefined,
  )

  const createEvent = useCreateEvent()

  const [unsavedRetreat, setUnsavedRetreat] =
    useState<UnsavedRetreatData | null>(null)

  const isLoading = typesLoading || eventLoading

  const handleStartUnsavedEvent = () => {
    if (!retreatType) return

    const today = new Date()
    const name = `Spiritual Retreat - ${today.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })}`

    setUnsavedRetreat({
      name,
      eventTypeId: retreatType._id,
      date: today.getTime(),
      startTime: '08:00',
      endTime: '17:00',
      location: '',
      description: '',
    })
  }

  const handleSaveUnsaved = async (data: unknown) => {
    const eventData = data as {
      name: string
      date: number
      startTime?: string
      endTime?: string
      location?: string
      description?: string
      bannerImage?: string
    }

    try {
      await createEvent.mutateAsync({
        ...eventData,
        eventTypeId: unsavedRetreat!.eventTypeId,
      })

      toast.success('Spiritual Retreat created successfully')
      setUnsavedRetreat(null)
    } catch (error) {
      // Error handled by hook
    }
  }

  const handleCancelUnsaved = () => {
    setUnsavedRetreat(null)
  }

  if (!retreatType && !typesLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex h-64 items-center justify-center">
            <p className="text-muted-foreground">
              Retreat event type not found. Please create it first.
            </p>
          </div>
        </Layout>
      </ProtectedRoute>
    )
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <PageLoader message="Loading Spiritual Retreat..." />
        </Layout>
      </ProtectedRoute>
    )
  }

  if (unsavedRetreat) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="space-y-6 p-4">
            <SpiritualRetreatForm
              mode="create"
              isUnsaved
              eventTypeId={unsavedRetreat.eventTypeId}
              initialData={unsavedRetreat}
              onSave={handleSaveUnsaved}
              onCancel={handleCancelUnsaved}
            />
          </div>
        </Layout>
      </ProtectedRoute>
    )
  }

  if (!currentEvent) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex flex-col items-center justify-center py-16">
            <Mountain className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              No Spiritual Retreat Scheduled
            </h2>
            <p className="text-muted-foreground mb-6 text-center">
              Start a Spiritual Retreat to begin managing teachers, schedule,
              and staff.
            </p>
            <Button onClick={handleStartUnsavedEvent}>
              <Plus className="mr-2 h-4 w-4" />
              Start Spiritual Retreat
            </Button>
          </div>
        </Layout>
      </ProtectedRoute>
    )
  }

  // Cast to any to bypass type mismatch between query result and Event type
  return (
    <ProtectedRoute>
      <Layout>
        <RetreatDetails event={currentEvent as any} layout="tabs" />
      </Layout>
    </ProtectedRoute>
  )
}
