'use client'

import type { Event, EventType } from '~/features/events/types'
import { GenericEventForm } from './GenericEventForm'
import { SpiritualRetreatForm } from './SpiritualRetreatForm'

export const SPIRITUAL_RETREAT_TYPE = 'Spiritual Retreat'

export interface EventFormFactoryProps {
  mode: 'create' | 'edit'
  eventTypeId?: string
  eventTypeName: string
  eventId?: string
  event?: Event & { eventType?: EventType }
  onSave?: (data: unknown) => Promise<unknown>
  onCancel?: () => void
}

export function EventFormFactory({
  mode,
  eventTypeId,
  eventTypeName,
  eventId,
  event,
  onSave,
  onCancel,
}: EventFormFactoryProps) {
  if (eventTypeName === SPIRITUAL_RETREAT_TYPE) {
    return (
      <SpiritualRetreatForm
        mode={mode}
        eventTypeId={eventTypeId!}
        eventId={eventId}
        initialData={event}
        onSave={onSave}
        onCancel={onCancel}
      />
    )
  }

  return (
    <GenericEventForm
      mode={mode}
      eventTypeId={eventTypeId!}
      eventTypeName={eventTypeName}
      eventId={eventId}
      initialData={event}
      onSave={onSave}
      onCancel={onCancel}
    />
  )
}
