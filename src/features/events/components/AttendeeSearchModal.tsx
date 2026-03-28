'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, User, Users, Plus, Trash2 } from 'lucide-react'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Badge } from '~/components/ui/badge'
import { Checkbox } from '~/components/ui/checkbox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '~/components/ui/command'
import { useSearchAttendees } from '~/features/attendees/hooks/useAttendees'
import { useDebounce } from '~/hooks/useDebounce'
import { CreateAttendeeModal } from './CreateAttendeeModal'
import { InviterSelectionModal } from './InviterSelectionModal'
import type { Attendee } from '~/features/attendees/types'

interface SelectedAttendee {
  _id: string
  firstName: string
  lastName: string
  status: 'member' | 'visitor' | 'inactive'
}

type AttendeeSearchModalMode = 'groupAdd' | 'generalAdd'

interface AttendeeSearchModalProps {
  open?: boolean
  mode?: AttendeeSearchModalMode
  inviterName?: string
  title?: string
  onSelect: (attendeeIds: string[], inviterId: string | null) => void
  onClose: () => void
  excludeAttendeeIds?: string[]
}

export function AttendeeSearchModal({
  open,
  mode = 'generalAdd',
  inviterName,
  title,
  onSelect,
  onClose,
  excludeAttendeeIds = [],
}: AttendeeSearchModalProps) {
  const [isOpen, setIsOpen] = useState(open ?? false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAttendees, setSelectedAttendees] = useState<
    SelectedAttendee[]
  >([])
  const [showCreateAttendeeModal, setShowCreateAttendeeModal] = useState(false)
  const [showInviterModal, setShowInviterModal] = useState(false)
  const [currentInviterId, setCurrentInviterId] = useState<string | null>(null)

  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const { data: searchResults, isLoading: isSearching } =
    useSearchAttendees(debouncedSearchQuery)

  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open)
    }
  }, [open])

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('')
      setSelectedAttendees([])
      setCurrentInviterId(null)
    }
  }, [isOpen])

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen)
    if (!newOpen && onClose) {
      onClose()
    }
  }

  // Filter search results to exclude already-checked-in attendees
  const availableAttendees = useMemo(() => {
    if (!searchResults) return []
    return searchResults.filter(
      (attendee) => !excludeAttendeeIds.includes(attendee._id),
    )
  }, [searchResults, excludeAttendeeIds])

  const toggleAttendeeSelection = (attendee: SelectedAttendee) => {
    const exists = selectedAttendees.find((a) => a._id === attendee._id)
    if (exists) {
      setSelectedAttendees(
        selectedAttendees.filter((a) => a._id !== attendee._id),
      )
    } else {
      setSelectedAttendees([...selectedAttendees, attendee])
    }
  }

  const removeAttendee = (attendeeId: string) => {
    setSelectedAttendees(selectedAttendees.filter((a) => a._id !== attendeeId))
  }

  const handleSave = () => {
    if (selectedAttendees.length === 0) return
    onSelect(
      selectedAttendees.map((a) => a._id),
      currentInviterId,
    )
    handleOpenChange(false)
  }

  // Dynamic title based on mode
  const getModalTitle = () => {
    if (title) return title
    if (mode === 'groupAdd' && inviterName) {
      return `Add Attendees to ${inviterName}'s Invites`
    }
    return 'Add Attendance'
  }

  const handleCreateAttendee = () => {
    setShowCreateAttendeeModal(true)
  }

  const handleAttendeeCreated = (attendee: Attendee) => {
    // Auto-add the newly created attendee
    setSelectedAttendees([
      {
        _id: attendee._id,
        firstName: attendee.firstName,
        lastName: attendee.lastName,
        status: attendee.status,
      },
    ])
    setShowCreateAttendeeModal(false)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{getModalTitle()}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Phase 2: Inviter Selection Button */}
            {mode === 'generalAdd' && (
              <Button
                variant="outline"
                onClick={() => setShowInviterModal(true)}
                className="w-full justify-between"
              >
                <span>
                  Inviter: {currentInviterId ? 'Selected' : 'Walk-in'}
                </span>
                <span className="text-muted-foreground text-sm">Change</span>
              </Button>
            )}

            {/* Phase 3: Selected Attendees Section */}
            {selectedAttendees.length > 0 && (
              <div className="border rounded-md">
                <div className="flex items-center justify-between p-3 bg-muted/50">
                  <span className="text-sm font-medium">
                    Selected Attendees ({selectedAttendees.length})
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedAttendees([])}
                  >
                    Clear All
                  </Button>
                </div>
                <div className="max-h-[200px] overflow-auto p-2 space-y-2">
                  {selectedAttendees.map((attendee) => (
                    <div
                      key={attendee._id}
                      className="flex items-center justify-between p-2 bg-background rounded-md"
                    >
                      <div className="flex items-center gap-2">
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
                          {attendee.status === 'member' ? 'Member' : 'Visitor'}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttendee(attendee._id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search for attendees..."
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
                      <Users className="size-8 mx-auto mb-2 text-muted-foreground" />
                      Type a name to search for attendees
                    </div>
                  ) : isSearching ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      Searching...
                    </div>
                  ) : availableAttendees.length === 0 ? (
                    <CommandEmpty>
                      <div className="p-4 text-center space-y-3">
                        <p className="text-muted-foreground">
                          No attendees found matching &quot;
                          {debouncedSearchQuery}&quot;
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCreateAttendee}
                          className="w-full"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Create new attendee: &quot;{debouncedSearchQuery}
                          &quot;
                        </Button>
                      </div>
                    </CommandEmpty>
                  ) : (
                    <CommandGroup
                      heading={`${availableAttendees.length} available`}
                    >
                      {availableAttendees.map((attendee) => {
                        const isSelected = selectedAttendees.some(
                          (a) => a._id === attendee._id,
                        )
                        return (
                          <CommandItem
                            key={attendee._id}
                            className="flex items-center justify-between py-3 cursor-pointer"
                            onSelect={() =>
                              toggleAttendeeSelection({
                                _id: attendee._id,
                                firstName: attendee.firstName,
                                lastName: attendee.lastName,
                                status: attendee.status,
                              })
                            }
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() =>
                                  toggleAttendeeSelection({
                                    _id: attendee._id,
                                    firstName: attendee.firstName,
                                    lastName: attendee.lastName,
                                    status: attendee.status,
                                  })
                                }
                                onClick={(e) => e.stopPropagation()}
                              />
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
                        )
                      })}
                    </CommandGroup>
                  )}
                  {selectedAttendees.length > 0 && (
                    <div className="border-t p-3 flex items-center justify-between bg-muted/50">
                      <span className="text-sm font-medium">
                        {selectedAttendees.length} selected
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedAttendees([])}
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                </CommandList>
              </Command>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={selectedAttendees.length === 0}
            >
              Add{' '}
              {selectedAttendees.length > 0 && `(${selectedAttendees.length})`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Attendee Modal */}
      <CreateAttendeeModal
        open={showCreateAttendeeModal}
        onSave={handleAttendeeCreated}
        onClose={() => setShowCreateAttendeeModal(false)}
      />

      {/* Phase 2: Inviter Selection Modal */}
      <InviterSelectionModal
        open={showInviterModal}
        onSelect={(inviterId) => {
          setCurrentInviterId(inviterId)
          setShowInviterModal(false)
        }}
        onClose={() => setShowInviterModal(false)}
        excludeAttendeeIds={excludeAttendeeIds}
      />
    </>
  )
}
