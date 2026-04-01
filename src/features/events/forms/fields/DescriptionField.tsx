import { Controller, useFormContext } from 'react-hook-form'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'

interface DescriptionFieldProps {
  name?: string
  label?: string
  showCharCount?: boolean
  maxChars?: number
}

export function DescriptionField({
  name = 'description',
  label = 'Description',
  showCharCount = true,
  maxChars = 1000,
}: DescriptionFieldProps) {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext()

  const descriptionValue = watch(name) ?? ''
  const charCount = descriptionValue.length
  const error = errors[name]?.message as string | undefined

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Textarea
            id={name}
            placeholder="Enter event description..."
            className="min-h-[150px]"
            {...field}
            value={field.value ?? ''}
          />
        )}
      />
      {showCharCount && (
        <p className="text-xs text-muted-foreground text-right">
          {charCount}/{maxChars}
        </p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
