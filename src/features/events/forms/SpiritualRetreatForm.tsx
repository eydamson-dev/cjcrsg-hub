'use client'

import { useRef, useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertTriangle,
  BookOpen,
  Loader2,
  UserCircle,
  Clock,
  Users,
} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { eventFullSchema, type EventFullFormData } from './schemas/eventSchemas'
import { BasicInfoFields } from './fields/BasicInfoFields'
import { DescriptionField } from './fields/DescriptionField'
import {
  BannerUploadField,
  type BannerUploadFieldRef,
} from './fields/BannerUploadField'
import { useCreateEvent, useUpdateEvent } from '../hooks/useEventMutations'
import { RetreatTeachers } from '../components/RetreatTeachers'
import { RetreatSchedule } from '../components/RetreatSchedule'
import { RetreatStaff } from '../components/RetreatStaff'
import { useRetreatDetails } from '../hooks/useRetreat'
import type { RetreatDetails } from '../types'

interface SpiritualRetreatFormProps {
  mode: 'create' | 'edit'
  isUnsaved?: boolean
  eventId?: string
  eventTypeId: string
  initialData?: {
    name?: string
    date?: number
    startTime?: string
    endTime?: string
    location?: string
    description?: string
    bannerImage?: string
    retreatData?: RetreatDetails
  }
  onSave?: (data: unknown) => Promise<unknown>
  onCancel?: () => void
}

export function SpiritualRetreatForm({
  mode,
  isUnsaved = false,
  eventId,
  eventTypeId,
  initialData,
  onSave,
  onCancel,
}: SpiritualRetreatFormProps) {
  const navigate = useNavigate()
  const bannerRef = useRef<BannerUploadFieldRef>(null)
  const [activeTab, setActiveTab] = useState('overview')

  const createEvent = useCreateEvent()
  const updateEvent = useUpdateEvent()
  const isPending = createEvent.isPending || updateEvent.isPending

  const { data: retreatData, isLoading: isLoadingRetreat } = useRetreatDetails(
    mode === 'edit' && eventId ? eventId : '',
  )

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
  const isPastDate =
    formValues.date && formValues.date < Date.now() && mode === 'create'

  const onSubmit = async (data: EventFullFormData) => {
    try {
      const hasPendingFile = bannerRef.current?.getPendingFile()
      const { bannerImage, ...eventData } = data

      if (onSave) {
        await onSave({ ...eventData, eventTypeId })
        return
      }

      if (mode === 'create') {
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

        toast.success('Spiritual Retreat created successfully')
        navigate({ to: '/events/spiritual-retreat' })
      } else if (mode === 'edit' && eventId) {
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
            ...eventData,
          })
        }

        toast.success('Spiritual Retreat updated successfully')
        navigate({ to: '/events/$id', params: { id: eventId } })
      }
    } catch (error) {
      console.error('Form submission error:', error)
      toast.error('Failed to save Spiritual Retreat')
    }
  }

  const handleCancel = () => {
    bannerRef.current?.clearPendingFile()
    if (onCancel) {
      onCancel()
    } else if (mode === 'edit' && eventId) {
      navigate({ to: '/events/$id', params: { id: eventId } })
    } else {
      navigate({ to: '/events' })
    }
  }

  const teachersCount =
    retreatData?.teachers?.length ??
    initialData?.retreatData?.teachers?.length ??
    0
  const lessonsCount =
    retreatData?.lessons?.length ??
    initialData?.retreatData?.lessons?.length ??
    0
  const staffCount =
    retreatData?.staff?.length ?? initialData?.retreatData?.staff?.length ?? 0

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {isPastDate && (
          <Alert className="flex items-center gap-2 border-yellow-500 bg-yellow-50 text-yellow-800">
            <AlertTriangle className="size-4" />
            <span>Warning: You are creating an event with a past date.</span>
          </Alert>
        )}

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList variant="line" className="w-full justify-start flex-wrap">
            <TabsTrigger value="overview" className="gap-2">
              <BookOpen className="size-4" />
              Overview
            </TabsTrigger>
            {!isUnsaved && (
              <>
                <TabsTrigger value="teachers" className="gap-2">
                  <UserCircle className="size-4" />
                  Teachers
                  {teachersCount > 0 && (
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({teachersCount})
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="schedule" className="gap-2">
                  <Clock className="size-4" />
                  Schedule
                  {lessonsCount > 0 && (
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({lessonsCount})
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="staff" className="gap-2">
                  <Users className="size-4" />
                  Staff
                  {staffCount > 0 && (
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({staffCount})
                    </span>
                  )}
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="rounded-lg border">
              <div className="border-b p-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <p className="text-sm text-muted-foreground">
                  Event Type: Spiritual Retreat
                </p>
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

            {!isUnsaved && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Teachers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{teachersCount}</div>
                    <Button
                      variant="link"
                      size="sm"
                      className="mt-2 h-auto p-0 text-muted-foreground"
                      onClick={() => setActiveTab('teachers')}
                    >
                      View teachers →
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Lessons
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{lessonsCount}</div>
                    <Button
                      variant="link"
                      size="sm"
                      className="mt-2 h-auto p-0 text-muted-foreground"
                      onClick={() => setActiveTab('schedule')}
                    >
                      View schedule →
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Staff</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{staffCount}</div>
                    <Button
                      variant="link"
                      size="sm"
                      className="mt-2 h-auto p-0 text-muted-foreground"
                      onClick={() => setActiveTab('staff')}
                    >
                      View staff →
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {!isUnsaved && (
            <>
              <TabsContent value="teachers">
                <RetreatTeachers
                  eventId={eventId ?? ''}
                  retreatData={retreatData}
                  isLoading={isLoadingRetreat}
                />
              </TabsContent>

              <TabsContent value="schedule">
                <RetreatSchedule
                  eventId={eventId ?? ''}
                  retreatData={retreatData}
                  isLoading={isLoadingRetreat}
                />
              </TabsContent>

              <TabsContent value="staff">
                <RetreatStaff
                  eventId={eventId ?? ''}
                  retreatData={retreatData}
                  isLoading={isLoadingRetreat}
                />
              </TabsContent>
            </>
          )}
        </Tabs>

        <div className="flex justify-end gap-2 border-t pt-4">
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
              isUnsaved ? (
                'Start Retreat'
              ) : (
                'Create Retreat'
              )
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
    <div
      className={`rounded-md border border-destructive bg-destructive/10 p-4 ${className ?? ''}`}
    >
      {children}
    </div>
  )
}
