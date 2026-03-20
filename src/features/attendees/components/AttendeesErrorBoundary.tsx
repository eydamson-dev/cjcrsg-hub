import { ErrorState } from '~/components/ui/error-state'

interface AttendeesErrorBoundaryProps {
  error: Error
}

export function AttendeesErrorBoundary({ error }: AttendeesErrorBoundaryProps) {
  return (
    <div className="container mx-auto py-8 px-4">
      <ErrorState
        type="error"
        error={error}
        onRetry={() => window.location.reload()}
        onBack={() => (window.location.href = '/attendees')}
        title="Something Went Wrong"
        description="An unexpected error occurred while loading attendee data."
      />
    </div>
  )
}
