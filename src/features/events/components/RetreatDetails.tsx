import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { BookOpen, UserCircle, Clock, Users, Mountain } from 'lucide-react'
import { GenericEventDetails } from '~/features/events/components/GenericEventDetails'
import { AttendanceManager } from '~/features/events/components/AttendanceManager'
import { RetreatTeachers } from './RetreatTeachers'
import { RetreatSchedule } from './RetreatSchedule'
import { RetreatStaff } from './RetreatStaff'
import { useRetreatDetails } from '~/features/events/hooks/useRetreat'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip'
import type { Event } from '~/features/events/types'

export interface RetreatDetailsProps {
  event: Event
  layout?: 'tabs' | 'accordion'
  isCreating?: boolean
  onSave?: () => void
  onCancel?: () => void
}

export function RetreatDetails({
  event,
  layout = 'tabs',
  isCreating = false,
  onSave,
  onCancel,
}: RetreatDetailsProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const { data: retreatData, isLoading } = useRetreatDetails(event._id)

  const renderTabs = () => (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList variant="line" className="w-full justify-start flex-wrap">
        <TabsTrigger value="overview" className="gap-2">
          <BookOpen className="size-4" />
          Overview
        </TabsTrigger>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              render={
                <TabsTrigger
                  value="teachers"
                  className="gap-2 data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed"
                  disabled={isCreating}
                >
                  <UserCircle className="size-4" />
                  Teachers
                  {retreatData?.teachers && retreatData.teachers.length > 0 && (
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({retreatData.teachers.length})
                    </span>
                  )}
                </TabsTrigger>
              }
            />
            {isCreating && (
              <TooltipContent>Save event to access Teachers</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              render={
                <TabsTrigger
                  value="schedule"
                  className="gap-2 data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed"
                  disabled={isCreating}
                >
                  <Clock className="size-4" />
                  Schedule
                  {retreatData?.lessons && retreatData.lessons.length > 0 && (
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({retreatData.lessons.length})
                    </span>
                  )}
                </TabsTrigger>
              }
            />
            {isCreating && (
              <TooltipContent>Save event to access Schedule</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              render={
                <TabsTrigger
                  value="staff"
                  className="gap-2 data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed"
                  disabled={isCreating}
                >
                  <Users className="size-4" />
                  Staff
                  {retreatData?.staff && retreatData.staff.length > 0 && (
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({retreatData.staff.length})
                    </span>
                  )}
                </TabsTrigger>
              }
            />
            {isCreating && (
              <TooltipContent>Save event to access Staff</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        <TabsTrigger value="attendance" className="gap-2">
          <Mountain className="size-4" />
          Attendance
          {event.attendanceCount !== undefined && event.attendanceCount > 0 && (
            <span className="ml-1 text-xs text-muted-foreground">
              ({event.attendanceCount})
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <GenericEventDetails
          event={event}
          mode="dashboard"
          isUnsaved={isCreating}
          onSave={onSave}
          onCancel={onCancel}
        />
      </TabsContent>

      <TabsContent value="teachers">
        <RetreatTeachers
          eventId={event._id}
          retreatData={retreatData}
          isLoading={isLoading}
        />
      </TabsContent>

      <TabsContent value="schedule">
        <RetreatSchedule
          eventId={event._id}
          retreatData={retreatData}
          isLoading={isLoading}
        />
      </TabsContent>

      <TabsContent value="staff">
        <RetreatStaff
          eventId={event._id}
          retreatData={retreatData}
          isLoading={isLoading}
        />
      </TabsContent>

      <TabsContent value="attendance">
        <AttendanceManager eventId={event._id} />
      </TabsContent>
    </Tabs>
  )

  const renderAccordion = () => {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="size-5" />
            Overview
          </h2>
          <GenericEventDetails
            event={event}
            mode="dashboard"
            isUnsaved={isCreating}
            onSave={onSave}
            onCancel={onCancel}
          />
        </div>

        <div className={isCreating ? 'opacity-50' : ''}>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <UserCircle className="size-5" />
            Teachers
            {retreatData?.teachers && retreatData.teachers.length > 0 && (
              <span className="text-sm text-muted-foreground">
                ({retreatData.teachers.length})
              </span>
            )}
          </h2>
          <RetreatTeachers
            eventId={event._id}
            retreatData={retreatData}
            isLoading={isLoading}
          />
        </div>

        <div className={isCreating ? 'opacity-50' : ''}>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="size-5" />
            Schedule
            {retreatData?.lessons && retreatData.lessons.length > 0 && (
              <span className="text-sm text-muted-foreground">
                ({retreatData.lessons.length})
              </span>
            )}
          </h2>
          <RetreatSchedule
            eventId={event._id}
            retreatData={retreatData}
            isLoading={isLoading}
          />
        </div>

        <div className={isCreating ? 'opacity-50' : ''}>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="size-5" />
            Staff
            {retreatData?.staff && retreatData.staff.length > 0 && (
              <span className="text-sm text-muted-foreground">
                ({retreatData.staff.length})
              </span>
            )}
          </h2>
          <RetreatStaff
            eventId={event._id}
            retreatData={retreatData}
            isLoading={isLoading}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Mountain className="size-5" />
            Attendance
            {event.attendanceCount !== undefined &&
              event.attendanceCount > 0 && (
                <span className="text-sm text-muted-foreground">
                  ({event.attendanceCount})
                </span>
              )}
          </h2>
          <AttendanceManager eventId={event._id} />
        </div>
      </div>
    )
  }

  return layout === 'accordion' ? renderAccordion() : renderTabs()
}
