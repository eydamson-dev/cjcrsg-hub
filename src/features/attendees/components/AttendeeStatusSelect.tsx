'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Field, FieldLabel, FieldError } from '~/components/ui/field'
import { Badge } from '~/components/ui/badge'
import type { AttendeeStatus } from '../types'
import type { FieldError as RHFError } from 'react-hook-form'

const STATUS_OPTIONS: {
  value: AttendeeStatus
  label: string
  badgeClass: string
}[] = [
  { value: 'member', label: 'Member', badgeClass: 'bg-green-500' },
  { value: 'visitor', label: 'Visitor', badgeClass: 'bg-blue-500' },
  { value: 'inactive', label: 'Inactive', badgeClass: 'bg-gray-500' },
]

interface AttendeeStatusSelectProps {
  value?: AttendeeStatus | '' | null
  onChange: (value: AttendeeStatus | '') => void
  mode?: 'form' | 'filter' | 'simple'
  name?: string
  label?: string
  required?: boolean
  error?: RHFError
  showAllOption?: boolean
  className?: string
  placeholder?: string
  disabled?: boolean
}

function StatusOption({
  label,
  badgeClass,
}: {
  label: string
  badgeClass: string
}) {
  return (
    <div className="flex items-center gap-2">
      <Badge className={`${badgeClass} h-2 w-2 rounded-full p-0`} />
      <span>{label}</span>
    </div>
  )
}

export function AttendeeStatusSelect({
  value,
  onChange,
  mode = 'simple',
  name,
  label,
  required,
  error,
  showAllOption = false,
  className,
  placeholder = 'Select status',
  disabled = false,
}: AttendeeStatusSelectProps) {
  const renderSelect = (
    fieldValue: AttendeeStatus | '' | null | undefined,
    fieldOnChange: (value: AttendeeStatus | '') => void,
  ) => (
    <Select
      value={fieldValue || ''}
      onValueChange={(val) => fieldOnChange(val as AttendeeStatus | '')}
      disabled={disabled}
    >
      <SelectTrigger
        className={className}
        id={mode === 'form' ? name : undefined}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {showAllOption && <SelectItem value="">All Status</SelectItem>}
        {STATUS_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <StatusOption {...option} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  if (mode === 'form' && name) {
    return (
      <Field data-invalid={!!error}>
        {label && (
          <FieldLabel htmlFor={name}>
            {label}
            {required && ' *'}
          </FieldLabel>
        )}
        {renderSelect(value, onChange)}
        {error && <FieldError errors={[error]} />}
      </Field>
    )
  }

  return renderSelect(value, onChange)
}

export function getStatusBadgeClass(status: AttendeeStatus): string {
  const option = STATUS_OPTIONS.find((opt) => opt.value === status)
  return option?.badgeClass || 'bg-gray-500'
}

export function getStatusLabel(status: AttendeeStatus): string {
  const option = STATUS_OPTIONS.find((opt) => opt.value === status)
  return option?.label || status
}
