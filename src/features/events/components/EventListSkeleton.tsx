import { Skeleton } from '~/components/ui/skeleton'

interface EventListSkeletonProps {
  viewMode: 'table' | 'cards'
  rowCount?: number
}

export function EventListSkeleton({
  viewMode,
  rowCount = 5,
}: EventListSkeletonProps) {
  if (viewMode === 'table') {
    return (
      <div className="space-y-4">
        {[...Array(rowCount)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 border rounded-lg"
          >
            <Skeleton className="h-16 w-24 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    )
  }

  // Cards view skeleton
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[...Array(rowCount)].map((_, i) => (
        <div key={i} className="border rounded-lg overflow-hidden">
          <Skeleton className="h-32 w-full" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}
