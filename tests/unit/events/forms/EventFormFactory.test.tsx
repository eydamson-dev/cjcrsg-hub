import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EventFormFactory } from '~/features/events/forms/EventFormFactory'

const mockNavigate = vi.fn()
const mockOnSave = vi.fn()
const mockOnCancel = vi.fn()

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}))

vi.mock('~/features/events/forms/GenericEventForm', () => ({
  GenericEventForm: (props: any) => (
    <div
      data-testid="generic-form"
      data-mode={props.mode}
      data-type-name={props.eventTypeName}
      data-onsave={!!props.onSave}
      data-oncancel={!!props.onCancel}
    />
  ),
}))

vi.mock('~/features/events/forms/SpiritualRetreatForm', () => ({
  SpiritualRetreatForm: (props: any) => (
    <div
      data-testid="retreat-form"
      data-mode={props.mode}
      data-type-id={props.eventTypeId}
      data-onsave={!!props.onSave}
      data-oncancel={!!props.onCancel}
    />
  ),
}))

describe('EventFormFactory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Event Type Detection', () => {
    it('renders SpiritualRetreatForm when eventTypeName is "Spiritual Retreat"', () => {
      render(
        <EventFormFactory
          mode="create"
          eventTypeId="type-123"
          eventTypeName="Spiritual Retreat"
        />,
      )

      expect(screen.getByTestId('retreat-form')).toBeInTheDocument()
    })

    it('renders GenericEventForm when eventTypeName is "Sunday Service"', () => {
      render(
        <EventFormFactory
          mode="create"
          eventTypeId="type-123"
          eventTypeName="Sunday Service"
        />,
      )

      expect(screen.getByTestId('generic-form')).toBeInTheDocument()
    })

    it('renders GenericEventForm when eventTypeName is "Youth Event"', () => {
      render(
        <EventFormFactory
          mode="create"
          eventTypeId="type-456"
          eventTypeName="Youth Event"
        />,
      )

      expect(screen.getByTestId('generic-form')).toBeInTheDocument()
    })
  })

  describe('Props Passing', () => {
    it('passes mode to SpiritualRetreatForm', () => {
      render(
        <EventFormFactory
          mode="edit"
          eventTypeId="type-123"
          eventTypeName="Spiritual Retreat"
        />,
      )

      const form = screen.getByTestId('retreat-form')
      expect(form.getAttribute('data-mode')).toBe('edit')
    })

    it('passes eventTypeId to SpiritualRetreatForm', () => {
      render(
        <EventFormFactory
          mode="create"
          eventTypeId="retreat-type-id"
          eventTypeName="Spiritual Retreat"
        />,
      )

      const form = screen.getByTestId('retreat-form')
      expect(form.getAttribute('data-type-id')).toBe('retreat-type-id')
    })

    it('passes eventTypeName to GenericEventForm', () => {
      render(
        <EventFormFactory
          mode="create"
          eventTypeId="type-123"
          eventTypeName="Sunday Service"
        />,
      )

      const form = screen.getByTestId('generic-form')
      expect(form.getAttribute('data-type-name')).toBe('Sunday Service')
    })

    it('forwards onSave callback to SpiritualRetreatForm', () => {
      render(
        <EventFormFactory
          mode="create"
          eventTypeId="type-123"
          eventTypeName="Spiritual Retreat"
          onSave={mockOnSave}
        />,
      )

      const form = screen.getByTestId('retreat-form')
      expect(form.getAttribute('data-onsave')).toBe('true')
    })

    it('forwards onCancel callback to GenericEventForm', () => {
      render(
        <EventFormFactory
          mode="create"
          eventTypeId="type-123"
          eventTypeName="Sunday Service"
          onCancel={mockOnCancel}
        />,
      )

      const form = screen.getByTestId('generic-form')
      expect(form.getAttribute('data-oncancel')).toBe('true')
    })

    it('does not forward callbacks when not provided', () => {
      render(
        <EventFormFactory
          mode="create"
          eventTypeId="type-123"
          eventTypeName="Spiritual Retreat"
        />,
      )

      const form = screen.getByTestId('retreat-form')
      expect(form.getAttribute('data-onsave')).toBe('false')
      expect(form.getAttribute('data-oncancel')).toBe('false')
    })
  })

  describe('Edit Mode', () => {
    it('passes edit mode to GenericEventForm', () => {
      render(
        <EventFormFactory
          mode="edit"
          eventId="event-123"
          eventTypeId="type-123"
          eventTypeName="Sunday Service"
        />,
      )

      const form = screen.getByTestId('generic-form')
      expect(form.getAttribute('data-mode')).toBe('edit')
    })

    it('passes edit mode to SpiritualRetreatForm', () => {
      render(
        <EventFormFactory
          mode="edit"
          eventId="event-456"
          eventTypeId="type-123"
          eventTypeName="Spiritual Retreat"
        />,
      )

      const form = screen.getByTestId('retreat-form')
      expect(form.getAttribute('data-mode')).toBe('edit')
    })
  })
})
