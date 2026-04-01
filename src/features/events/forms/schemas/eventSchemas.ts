import { z } from 'zod'

export const eventBasicInfoSchema = z
  .object({
    name: z.string().min(2, 'Event name must be at least 2 characters').trim(),
    date: z.number().min(1, 'Date is required'),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    location: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.startTime || !data.endTime) return true
      return data.startTime < data.endTime
    },
    {
      message: 'End time must be after start time',
      path: ['endTime'],
    },
  )

export type EventBasicInfoData = z.infer<typeof eventBasicInfoSchema>

export const eventDescriptionSchema = z.object({
  description: z.string().optional(),
})

export type EventDescriptionData = z.infer<typeof eventDescriptionSchema>

export const eventBannerSchema = z.object({
  bannerImage: z.string().optional(),
})

export type EventBannerData = z.infer<typeof eventBannerSchema>

export const eventFullSchema = eventBasicInfoSchema
  .merge(eventDescriptionSchema)
  .merge(eventBannerSchema)

export type EventFullFormData = z.infer<typeof eventFullSchema>

export function isValidImageUrl(url: string): boolean {
  if (!url) return false
  if (url.startsWith('data:image/')) return true
  if (url.startsWith('blob:')) return true
  if (url.startsWith('http://') || url.startsWith('https://')) return true
  return false
}
