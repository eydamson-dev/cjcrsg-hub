import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { HexColorPicker } from 'react-colorful'
import { useState, useCallback } from 'react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { Dice5 } from 'lucide-react'

const eventTypeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').trim(),
  description: z.string().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format')
    .optional()
    .nullable(),
})

type EventTypeFormData = z.infer<typeof eventTypeSchema>

interface EventTypeFormProps {
  initialData?: Partial<EventTypeFormData>
  onSubmit: (data: EventTypeFormData) => void
  onCancel?: () => void
  isSubmitting?: boolean
}

function generateRandomColor(): string {
  return (
    '#' +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')
  )
}

export function EventTypeForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: EventTypeFormProps) {
  const [color, setColor] = useState(initialData?.color || '#3b82f6')

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<EventTypeFormData>({
    resolver: zodResolver(eventTypeSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      color: initialData?.color || '#3b82f6',
    },
  })

  const handleColorChange = useCallback(
    (newColor: string) => {
      setColor(newColor)
      setValue('color', newColor)
    },
    [setValue],
  )

  const handleRandomizeColor = () => {
    const randomColor = generateRandomColor()
    setColor(randomColor)
    setValue('color', randomColor)
  }

  const handleFormSubmit = (data: EventTypeFormData) => {
    onSubmit({
      ...data,
      name: data.name.trim(),
      color: data.color || null,
    })
  }

  const isEditMode = !!initialData?.name

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">
          {isEditMode ? 'Edit Event Type' : 'Create Event Type'}
        </h2>
      </div>

      {/* Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="e.g., Sunday Service"
          {...register('name')}
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Description Field */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Optional description..."
          {...register('description')}
          disabled={isSubmitting}
          rows={3}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* Color Field */}
      <div className="space-y-2">
        <Label htmlFor="color">Color</Label>
        <div className="flex gap-2">
          <Input
            id="color"
            placeholder="#3b82f6"
            {...register('color')}
            value={color}
            onChange={(e) => handleColorChange(e.target.value)}
            disabled={isSubmitting}
            className="font-mono"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleRandomizeColor}
            disabled={isSubmitting}
            title="Randomize color"
          >
            <Dice5 className="h-4 w-4" />
          </Button>
        </div>
        {errors.color && (
          <p className="text-sm text-red-500">{errors.color.message}</p>
        )}
      </div>

      {/* Color Picker */}
      <div className="space-y-2">
        <Controller
          name="color"
          control={control}
          render={({ field }) => (
            <HexColorPicker
              color={field.value || '#3b82f6'}
              onChange={handleColorChange}
              style={{ width: '100%' }}
            />
          )}
        />
      </div>

      {/* Form Buttons */}
      <div className="flex justify-end gap-2" data-testid="form-buttons">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
