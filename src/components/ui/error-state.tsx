'use client'

import { Button } from '~/components/ui/button'
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from '~/components/ui/empty'
import {
  AlertCircle,
  WifiOff,
  ShieldAlert,
  SearchX,
  RotateCcw,
  ArrowLeft,
} from 'lucide-react'

type ErrorType = 'not-found' | 'error' | 'network' | 'unauthorized'

interface ErrorStateProps {
  type?: ErrorType
  title?: string
  description?: string
  error?: Error | null
  onRetry?: () => void
  onBack?: () => void
  backLabel?: string
  retryLabel?: string
  showRetry?: boolean
  showBack?: boolean
}

const errorConfig: Record<
  ErrorType,
  {
    icon: typeof AlertCircle
    defaultTitle: string
    defaultDescription: string
  }
> = {
  'not-found': {
    icon: SearchX,
    defaultTitle: 'Not Found',
    defaultDescription:
      "The item you're looking for doesn't exist or has been removed.",
  },
  error: {
    icon: AlertCircle,
    defaultTitle: 'Something Went Wrong',
    defaultDescription: 'An unexpected error occurred. Please try again.',
  },
  network: {
    icon: WifiOff,
    defaultTitle: 'Connection Error',
    defaultDescription:
      'Unable to connect to the server. Please check your connection.',
  },
  unauthorized: {
    icon: ShieldAlert,
    defaultTitle: 'Access Denied',
    defaultDescription: "You don't have permission to access this resource.",
  },
}

export function ErrorState({
  type = 'error',
  title,
  description,
  error,
  onRetry,
  onBack,
  backLabel = 'Back to Attendees',
  retryLabel = 'Try Again',
  showRetry = true,
  showBack = true,
}: ErrorStateProps) {
  const config = errorConfig[type]
  const Icon = config.icon

  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    } else {
      window.location.reload()
    }
  }

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      window.location.href = '/attendees'
    }
  }

  return (
    <Empty className="min-h-[400px]">
      <EmptyHeader>
        <EmptyMedia
          variant="icon"
          className="bg-destructive/10 text-destructive"
        >
          <Icon />
        </EmptyMedia>
        <EmptyTitle>{title || config.defaultTitle}</EmptyTitle>
        <EmptyDescription>
          {description || config.defaultDescription}
          {error?.message && (
            <span className="block mt-2 text-xs text-muted-foreground">
              Error: {error.message}
            </span>
          )}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-col sm:flex-row gap-3">
        {showRetry && (
          <Button onClick={handleRetry}>
            <RotateCcw className="mr-2 h-4 w-4" />
            {retryLabel}
          </Button>
        )}
        {showBack && (
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backLabel}
          </Button>
        )}
      </EmptyContent>
    </Empty>
  )
}
