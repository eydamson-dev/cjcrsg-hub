import { createFileRoute } from '@tanstack/react-router'
import { Layout } from '~/components/layout/Layout'
import { ProtectedRoute } from '~/components/auth/ProtectedRoute'
import { EventArchive } from '~/features/events/components/EventArchive'
import { requireAuth } from '~/lib/auth-guard'
import { useArchiveEvents } from '~/features/events/hooks/useEvents'
import { useEventTypesList } from '~/features/events/hooks/useEventTypes'
import type { Event } from '~/features/events/types'

export const Route = createFileRoute('/events/archive')({
  component: EventsArchivePage,
  beforeLoad: async ({ context }) => {
    requireAuth(context)
  },
})

function EventsArchivePage() {
  const { data: archiveData, isLoading } = useArchiveEvents()
  const { data: eventTypes } = useEventTypesList()

  const events: Event[] = (archiveData?.page || []).map((item) => ({
    _id: item._id,
    name: item.name,
    eventTypeId: item.eventTypeId,
    eventType: item.eventType
      ? {
          _id: item.eventType.name,
          name: item.eventType.name,
          color: item.eventType.color || '#3b82f6',
          isActive: true,
          createdAt: item._creationTime,
        }
      : undefined,
    description: item.description,
    date: item.date,
    startTime: item.startTime,
    endTime: item.endTime,
    location: item.location,
    status: item.status,
    bannerImage: item.bannerImage,
    media: item.media,
    isActive: item.isActive,
    createdAt: item._creationTime,
    updatedAt: item.updatedAt,
    completedAt: item.completedAt,
    attendanceCount: item.attendanceCount,
  }))

  const transformedEventTypes = eventTypes
    ? eventTypes.map((et) => ({
        _id: et._id,
        name: et.name,
        description: et.description,
        color: et.color || '#3b82f6',
        isActive: et.isActive,
        createdAt: et.createdAt,
      }))
    : undefined

  return (
    <ProtectedRoute>
      <Layout>
        <EventArchive
          events={events}
          eventTypes={transformedEventTypes}
          isLoading={isLoading}
        />
      </Layout>
    </ProtectedRoute>
  )
}
