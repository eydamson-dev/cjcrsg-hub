import { Loader2 } from 'lucide-react'
import { cn } from '~/lib/utils'

interface LoadingSpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  message?: string
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
}

export function LoadingSpinner({
  className,
  size = 'md',
  message,
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        className,
      )}
    >
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  )
}

interface PageLoaderProps {
  message?: string
}

export function PageLoader({ message = 'Loading...' }: PageLoaderProps) {
  return (
    <div className="flex h-64 w-full items-center justify-center">
      <LoadingSpinner size="lg" message={message} />
    </div>
  )
}
