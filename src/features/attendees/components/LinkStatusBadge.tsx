'use client'

import { Link2Off, Link } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip'

interface LinkStatusBadgeProps {
  isLinked: boolean
  userEmail?: string
  userName?: string
}

export function LinkStatusBadge({
  isLinked,
  userEmail,
  userName,
}: LinkStatusBadgeProps) {
  const badge = (
    <div className="flex items-center gap-1.5">
      {isLinked ? (
        <>
          <Link className="h-3.5 w-3.5 text-green-600" />
          <span className="text-xs font-medium text-green-600">Linked</span>
        </>
      ) : (
        <>
          <Link2Off className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Not linked</span>
        </>
      )}
    </div>
  )

  if (!isLinked) {
    return badge
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>{badge}</TooltipTrigger>
        <TooltipContent>
          <p>Linked to {userName || userEmail}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
