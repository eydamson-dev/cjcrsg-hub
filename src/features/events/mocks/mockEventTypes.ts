import type { EventType } from '../types'

export const mockEventTypes: EventType[] = [
  {
    _id: 'evt-type-1',
    name: 'Sunday Service',
    description: 'Weekly Sunday worship service',
    color: '#3b82f6',
    isActive: true,
    createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
  },
  {
    _id: 'evt-type-2',
    name: 'Youth Night',
    description: 'Youth group gathering and activities',
    color: '#8b5cf6',
    isActive: true,
    createdAt: Date.now() - 300 * 24 * 60 * 60 * 1000,
  },
  {
    _id: 'evt-type-3',
    name: 'Prayer Meeting',
    description: 'Weekly prayer gathering',
    color: '#f97316',
    isActive: true,
    createdAt: Date.now() - 200 * 24 * 60 * 60 * 1000,
  },
  {
    _id: 'evt-type-4',
    name: 'Retreat',
    description: 'Church retreat and spiritual renewal',
    color: '#22c55e',
    isActive: true,
    createdAt: Date.now() - 150 * 24 * 60 * 60 * 1000,
  },
]
