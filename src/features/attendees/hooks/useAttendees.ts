import { useQuery, useMutation } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'

export function useAttendees(status?: string) {
  return useQuery(
    convexQuery(api.attendees.list, {
      paginationOpts: {
        numItems: 10,
        cursor: null,
        alias: null,
      },
      status: status as any,
    }),
  )
}

export function useAttendee(id: string) {
  return useQuery(
    convexQuery(api.attendees.getById, { id: id as Id<'attendees'> }),
    {
      enabled: !!id,
    },
  )
}

export function useSearchAttendees(query: string, status?: string) {
  return useQuery(
    convexQuery(api.attendees.search, {
      query,
      status: status as any,
    }),
    {
      enabled: query.length > 0,
    },
  )
}

export function useCreateAttendee() {
  return useMutation({
    mutationFn: async (args: any) => {
      return await api.attendees.create({}, args)
    },
  })
}

export function useUpdateAttendee() {
  return useMutation({
    mutationFn: async (args: any) => {
      return await api.attendees.update({}, args)
    },
  })
}

export function useArchiveAttendee() {
  return useMutation({
    mutationFn: async (id: string) => {
      return await api.attendees.archive({}, { id })
    },
  })
}
