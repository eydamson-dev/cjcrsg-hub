import { createFileRoute } from '@tanstack/react-router'
import { Layout } from '~/components/layout/Layout'
import { ProtectedRoute } from '~/components/auth/ProtectedRoute'
import { Button } from '~/components/ui/button'
import { requireAuth } from '~/lib/auth-guard'
import { useCurrentEvent } from '~/features/events/hooks/useEvents'
import { useQueryClient } from '@tanstack/react-query'

export const Route = createFileRoute('/events/test')({
  component: TestPage,
  beforeLoad: async ({ context }) => {
    requireAuth(context)
  },
})

function TestPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <TestContent />
      </Layout>
    </ProtectedRoute>
  )
}

function TestContent() {
  const queryClient = useQueryClient()
  const { data, isLoading, error, refetch } = useCurrentEvent()

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-3xl font-bold">Event Query Test</h1>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={() => refetch()}>Refetch Query</Button>
          <Button
            variant="outline"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['events'] })
              queryClient.invalidateQueries({ queryKey: ['currentEvent'] })
            }}
          >
            Invalidate Cache
          </Button>
        </div>

        <div className="rounded-lg border p-4 space-y-2">
          <h2 className="font-semibold">Query Status:</h2>
          <p>isLoading: {isLoading ? 'true' : 'false'}</p>
          <p>hasError: {error ? 'true' : 'false'}</p>
          <p>hasData: {data ? 'true' : 'false'}</p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500 bg-red-50 p-4">
            <h2 className="font-semibold text-red-700">Error:</h2>
            <pre className="text-sm text-red-600">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        )}

        {data ? (
          <div className="rounded-lg border bg-muted p-4 space-y-2">
            <h2 className="font-semibold">Active Event Data:</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="rounded-lg border bg-yellow-50 p-4">
            <p className="text-yellow-700">
              No active event found (data is null)
            </p>
            <p className="text-sm text-yellow-600 mt-2">
              This means the getCurrentEvent query returned null. Make sure you
              have an event with status='active' AND isActive=true in the
              database.
            </p>
          </div>
        )}

        <div className="rounded-lg border p-4">
          <h2 className="font-semibold mb-2">What the query looks for:</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>
              Events with <code>status: 'active'</code>
            </li>
            <li>
              AND <code>isActive: true</code>
            </li>
            <li>Returns null if no matching event found</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
