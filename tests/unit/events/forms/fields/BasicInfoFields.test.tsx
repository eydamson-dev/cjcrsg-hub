import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BasicInfoFields } from '~/features/events/forms/fields/BasicInfoFields'
import { useForm, FormProvider } from 'react-hook-form'

vi.mock('~/components/ui/date-picker', () => ({
  DatePicker: () => <div data-testid="date-picker" />,
}))

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm({
    defaultValues: {
      name: '',
      date: undefined,
      startTime: '',
      endTime: '',
      location: '',
    },
  })
  return <FormProvider {...methods}>{children}</FormProvider>
}

describe('BasicInfoFields', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders all form fields', () => {
    render(
      <Wrapper>
        <BasicInfoFields />
      </Wrapper>,
    )
    expect(screen.getByLabelText(/event name/i)).toBeInTheDocument()
    expect(screen.getByTestId('date-picker')).toBeInTheDocument()
    expect(screen.getByLabelText(/start time/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/end time/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument()
  })

  it('renders event name label with asterisk', () => {
    render(
      <Wrapper>
        <BasicInfoFields />
      </Wrapper>,
    )
    expect(screen.getByText(/event name \*/i)).toBeInTheDocument()
  })

  it('renders date picker', () => {
    render(
      <Wrapper>
        <BasicInfoFields />
      </Wrapper>,
    )
    expect(screen.getByTestId('date-picker')).toBeInTheDocument()
  })

  it('renders time select dropdowns with options', () => {
    render(
      <Wrapper>
        <BasicInfoFields />
      </Wrapper>,
    )
    expect(screen.getByLabelText(/start time/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/end time/i)).toBeInTheDocument()
  })

  it('renders location input', () => {
    render(
      <Wrapper>
        <BasicInfoFields />
      </Wrapper>,
    )
    expect(screen.getByPlaceholderText(/enter location/i)).toBeInTheDocument()
  })
})
