'use client'

import { useRef } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { eventFullSchema, type EventFullFormData } from './schemas/eventSchemas'
import { BasicInfoFields } from './fields/BasicInfoFields'
import { DescriptionField } from './fields/DescriptionField'
import {
  BannerUploadField,
  type BannerUploadFieldRef,
} from './fields/BannerUploadField'
import { useCreateEvent, useUpdateEvent } from '../hooks/useEventMutations'

interface GenericEventFormProps {
  mode: 'create' | 'edit'
  eventId?: string
  eventTypeId: string
  eventTypeName?: string
  initialData?: Partial<EventFullFormData>
}

export function GenericEventForm({
  mode,
  eventId,
  eventTypeId,
  eventTypeName,
  initialData,
}: GenericEventFormProps) {
  const navigate = useNavigate()
  const bannerRef = useRef<BannerUploadFieldRef>(null)

  const createEvent = useCreateEvent()
  const updateEvent = useUpdateEvent()
  const isPending = createEvent.isPending || updateEvent.isPending

  const form = useForm<EventFullFormData>({
    resolver: zodResolver(eventFullSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      date: initialData?.date ?? Date.now(),
      startTime: initialData?.startTime ?? '',
      endTime: initialData?.endTime ?? '',
      location: initialData?.location ?? '',
      description: initialData?.description ?? '',
      bannerImage: initialData?.bannerImage ?? '',
    },
  })

  const formValues = form.watch()
  const isPastDate = formValues.date && formValues.date < Date.now()

  const onSubmit = async (data: EventFullFormData) => {
    try {
      const hasPendingFile = bannerRef.current?.getPendingFile()

      if (mode === 'create') {
        const { bannerImage, ...eventData } = data
        const newEventId = await createEvent.mutateAsync({
          ...eventData,
          eventTypeId,
        })

        if (hasPendingFile) {
          await bannerRef.current?.uploadPendingFile()
        } else if (bannerImage && !bannerImage.startsWith('blob:')) {
          await updateEvent.mutateAsync({
            id: newEventId,
            bannerImage,
          })
        }

        toast.success('Event created successfully')
        navigate({ to: '/events' })
      } else if (mode === 'edit' && eventId) {
        const { bannerImage, ...updateData } = data

        if (hasPendingFile && eventId) {
          const url = await bannerRef.current?.uploadPendingFile()
          if (url) {
            await updateEvent.mutateAsync({
              id: eventId,
              bannerImage: url,
            })
          }
        } else if (bannerImage !== initialData?.bannerImage) {
          await updateEvent.mutateAsync({
            id: eventId,
            ...updateData,
          })
        }

        toast.success('Event updated successfully')
        navigate({ to: '/events/$id', params: { id: eventId } })
      }
    } catch (error) {
      console.error('Form submission error:', error)
      toast.error('Failed to save event')
    }
  }

  const handleCancel = () => {
    bannerRef.current?.clearPendingFile()
    if (mode === 'edit' && eventId) {
      navigate({ to: '/events/$id', params: { id: eventId } })
    } else {
      navigate({ to: '/events' })
    }
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {isPastDate && (
          <Alert className="flex items-center gap-2 border-yellow-500 bg-yellow-50 text-yellow-800">
            <AlertTriangle className="size-4" />
            <span>Warning: You are creating an event with a past date.</span>
          </Alert>
        )}

        <div className="rounded-lg border">
          <div className="border-b p-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            {eventTypeName && (
              <p className="text-sm text-muted-foreground">
                Event Type: {eventTypeName}
              </p>
            )}
          </div>
          <div className="p-4">
            <BasicInfoFields />
          </div>
        </div>

        <div className="rounded-lg border">
          <div className="border-b p-4">
            <h3 className="text-lg font-semibold">Description</h3>
          </div>
          <div className="p-4">
            <DescriptionField />
          </div>
        </div>

        <div className="rounded-lg border">
          <div className="border-b p-4">
            <h3 className="text-lg font-semibold">Banner Image</h3>
          </div>
          <div className="p-4">
            <BannerUploadField
              ref={bannerRef}
              eventId={mode === 'edit' ? eventId : undefined}
              mode={mode}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving...
              </>
            ) : mode === 'create' ? (
              'Create Event'
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}

function Alert({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={`rounded-md border p-4 ${className ?? ''}`}>{children}</div>
  )
}
