import { Controller, useFormContext } from 'react-hook-form'
import { Label } from '~/components/ui/label'
import { Input } from '~/components/ui/input'
import { DatePicker } from '~/components/ui/date-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import type { TimeOption } from '../utils/timeOptions'
import { generateTimeOptions } from '../utils/timeOptions'

const timeOptions: TimeOption[] = generateTimeOptions()

interface BasicInfoFieldsProps {
  name?: string
  label?: string
}

export function BasicInfoFields({ name = 'name' }: BasicInfoFieldsProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext()

  const nameError = errors[name]?.message as string | undefined
  const dateError = errors['date']?.message as string | undefined
  const endTimeError = errors['endTime']?.message as string | undefined
  const locationError = errors['location']?.message as string | undefined

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={name}>Event Name *</Label>
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Input
              id={name}
              placeholder="Enter event name"
              {...field}
              value={field.value ?? ''}
            />
          )}
        />
        {nameError && <p className="text-sm text-destructive">{nameError}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date *</Label>
        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <DatePicker
              value={field.value}
              onChange={(date) => field.onChange(date)}
            />
          )}
        />
        {dateError && <p className="text-sm text-destructive">{dateError}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time</Label>
          <Controller
            name="startTime"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ?? ''}
                onValueChange={(value) => field.onChange(value || undefined)}
              >
                <SelectTrigger id="startTime">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {timeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endTime">End Time</Label>
          <Controller
            name="endTime"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ?? ''}
                onValueChange={(value) => field.onChange(value || undefined)}
              >
                <SelectTrigger id="endTime">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {timeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {endTimeError && (
            <p className="text-sm text-destructive">{endTimeError}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Controller
          name="location"
          control={control}
          render={({ field }) => (
            <Input
              id="location"
              placeholder="Enter location"
              {...field}
              value={field.value ?? ''}
            />
          )}
        />
        {locationError && (
          <p className="text-sm text-destructive">{locationError}</p>
        )}
      </div>
    </div>
  )
}
