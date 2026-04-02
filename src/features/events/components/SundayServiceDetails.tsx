import { GenericEventDetails } from '~/features/events/components/GenericEventDetails'
import type { Event } from '~/features/events/types'

/**
 * SundayServiceDetails - Dedicated component for Sunday Service pages.
 *
 * Currently wraps GenericEventDetails with a simple interface.
 * Designed for future extension with Sunday Service-specific features:
 * - Sermon series management
 * - Worship leader assignments
 * - Offering tracking
 * - Sermon notes and recordings
 * - Service order planning
 * - Scripture reading schedules
 */

export interface SundayServiceDetailsProps {
  event: Event
  isCreating?: boolean
  onSave?: (data: unknown) => void
  onCancel?: () => void
}

export function SundayServiceDetails({
  event,
  isCreating = false,
  onSave,
  onCancel,
}: SundayServiceDetailsProps) {
  return (
    <GenericEventDetails
      event={event}
      mode="dashboard"
      isUnsaved={isCreating}
      onSave={onSave ? () => onSave({}) : undefined}
      onCancel={onCancel}
    />
  )
}
