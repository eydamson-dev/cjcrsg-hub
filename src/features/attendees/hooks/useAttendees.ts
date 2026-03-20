import { useQuery, useMutation } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'

export function useAttendees(
  status?: string,
  cursor?: string | null,
  pageSize: number = 10,
) {
  return useQuery(
    convexQuery(api.attendees.queries.list, {
      paginationOpts: {
        numItems: pageSize,
        cursor: cursor || null,
      },
      status: status as any,
    }),
  )
}

export function useAttendeeCount(status?: string) {
  return useQuery(
    convexQuery(api.attendees.queries.count, {
      status: status as any,
    }),
  )
}

export function useAttendee(id: string) {
  return useQuery({
    ...convexQuery(api.attendees.queries.getById, {
      id: id as Id<'attendees'>,
    }),
    enabled: !!id,
  })
}

export function useSearchAttendees(query: string, status?: string) {
  return useQuery({
    ...convexQuery(api.attendees.queries.search, {
      query,
      status: status as any,
    }),
    enabled: query.length > 0,
  })
}

export function useCreateAttendee() {
  const mutationFn = useConvexMutation(api.attendees.mutations.create)
  return useMutation({ mutationFn })
}

export function useUpdateAttendee() {
  const mutationFn = useConvexMutation(api.attendees.mutations.update)
  return useMutation({ mutationFn })
}

export function useArchiveAttendee() {
  const mutationFn = useConvexMutation(api.attendees.mutations.archive)
  return useMutation({ mutationFn })
}
