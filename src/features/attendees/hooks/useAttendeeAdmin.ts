import { useQuery } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'

export function useAttendeeUserLink(attendeeId: string) {
  return useQuery(
    convexQuery(api.attendees.admin.getAttendeeUserLink, {
      attendeeId: attendeeId as Id<'attendees'>,
    }),
  )
}

export function useLinkToUser() {
  return useConvexMutation(api.attendees.admin.linkToUser)
}

export function useUnlinkFromUser() {
  return useConvexMutation(api.attendees.admin.unlinkFromUser)
}

export function useListUnlinkedAttendees() {
  return useQuery(convexQuery(api.attendees.admin.listUnlinked, { count: 100 }))
}

export function useListLinkedAttendees() {
  return useQuery(convexQuery(api.attendees.admin.listLinked, { count: 100 }))
}
