'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, User, Users } from 'lucide-react'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Badge } from '~/components/ui/badge'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '~/components/ui/command'
import { useSearchAttendees } from '~/features/attendees/hooks/useAttendees'
import { useDebounce } from '~/hooks/useDebounce'

interface InviterSelectionModalProps {
  open?: boolean
  onSelect: (inviterId: string | null) => void
  onClose?: () => void
  excludeAttendeeIds?: string[]
}

export function InviterSelectionModal({
  open,
  onSelect,
  onClose,
  excludeAttendeeIds = [],
}: InviterSelectionModalProps) {
  const [isOpen, setIsOpen] = useState(open ?? false)
  const [searchQuery, setSearchQuery] = useState('')

  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const { data: searchResults, isLoading: isSearching } =
    useSearchAttendees(debouncedSearchQuery)

  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open)
    }
  }, [open])

  // Reset search when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('')
    }
  }, [isOpen])

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen)
    if (!newOpen && onClose) {
      onClose()
    }
  }

  const handleSelectInviter = (inviterId: string | null) => {
    onSelect(inviterId)
    handleOpenChange(false)
  }

  // Filter out excluded attendees
  const availableAttendees = useMemo(() => {
    if (!searchResults) return []
    return searchResults.filter(
      (attendee) => !excludeAttendeeIds.includes(attendee._id),
    )
  }, [searchResults, excludeAttendeeIds])

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Select Inviter</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Walk-in Option */}
          <Button
            variant="outline"
            className="w-full justify-start h-auto py-4 px-4 border-2 hover:border-primary"
            onClick={() => handleSelectInviter(null)}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                <Users className="size-5 text-muted-foreground" />
              </div>
              <div className="text-left">
                <div className="font-medium">Walk-in</div>
                <div className="text-sm text-muted-foreground">
                  Attendee came without an inviter
                </div>
              </div>
            </div>
          </Button>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search for an inviter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>

          <div className="border rounded-md">
            <Command>
              <CommandList className="max-h-[300px] overflow-auto">
                {debouncedSearchQuery.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    <User className="size-8 mx-auto mb-2 text-muted-foreground" />
                    Type a name to search for an inviter
                  </div>
                ) : isSearching ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    Searching...
                  </div>
                ) : availableAttendees.length === 0 ? (
                  <CommandEmpty>
                    <div className="p-4 text-center">
                      <p className="text-muted-foreground">
                        No attendees found matching "{debouncedSearchQuery}"
                      </p>
                    </div>
                  </CommandEmpty>
                ) : (
                  <CommandGroup heading={`${availableAttendees.length} found`}>
                    {availableAttendees.map((attendee) => (
                      <CommandItem
                        key={attendee._id}
                        className="flex items-center justify-between py-3 cursor-pointer"
                        onSelect={() => handleSelectInviter(attendee._id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                            <User className="size-4 text-primary" />
                          </div>
                          <span className="font-medium">
                            {attendee.firstName} {attendee.lastName}
                          </span>
                          <Badge
                            variant={
                              attendee.status === 'member'
                                ? 'default'
                                : 'secondary'
                            }
                            className="text-xs"
                          >
                            {attendee.status === 'member'
                              ? 'Member'
                              : 'Visitor'}
                          </Badge>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
