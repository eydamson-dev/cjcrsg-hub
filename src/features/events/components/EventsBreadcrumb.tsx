import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '~/components/ui/breadcrumb'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItemData {
  label: string
  href?: string
}

interface EventsBreadcrumbProps {
  items: BreadcrumbItemData[]
  parentEventTypeId?: string
  parentEventTypeName?: string
  showParentLink?: boolean
}

function toSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-')
}

export function EventsBreadcrumb({
  items,
  parentEventTypeId,
  parentEventTypeName,
  showParentLink = true,
}: EventsBreadcrumbProps) {
  // Generate the correct Events URL based on parent event type
  const getEventsUrl = () => {
    if (parentEventTypeId && parentEventTypeName) {
      return `/events/${toSlug(parentEventTypeName)}`
    }
    return '/events'
  }

  const eventsUrl = getEventsUrl()

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink className="flex items-center gap-1">
            <a href="/" className="flex items-center gap-1">
              <Home className="size-4" />
              <span className="sr-only">Home</span>
            </a>
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator>
          <ChevronRight className="size-4" />
        </BreadcrumbSeparator>

        <BreadcrumbItem>
          <BreadcrumbLink>
            <a href={eventsUrl}>Events</a>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {/* Show parent event type if provided */}
        {parentEventTypeId && parentEventTypeName && showParentLink && (
          <BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="size-4" />
            </BreadcrumbSeparator>
            <BreadcrumbLink>
              <a href={eventsUrl}>{parentEventTypeName}</a>
            </BreadcrumbLink>
          </BreadcrumbItem>
        )}

        {items.map((item, index) => (
          <BreadcrumbItem key={index}>
            <BreadcrumbSeparator>
              <ChevronRight className="size-4" />
            </BreadcrumbSeparator>
            {item.href ? (
              <BreadcrumbLink>
                <a href={item.href}>{item.label}</a>
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPage className="font-semibold">
                {item.label}
              </BreadcrumbPage>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

interface BackLinkProps {
  href?: string
  label?: string
  onClick?: () => void
  parentEventTypeName?: string
}

export function BackLink({
  href,
  label,
  onClick,
  parentEventTypeName,
}: BackLinkProps) {
  // Generate dynamic back label
  const backLabel = parentEventTypeName
    ? `Back to ${parentEventTypeName}`
    : label || 'Back to Events'

  return (
    <div className="mb-4">
      {href ? (
        <a
          href={href}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronRight className="size-4 rotate-180" />
          {backLabel}
        </a>
      ) : (
        <button
          onClick={onClick}
          type="button"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronRight className="size-4 rotate-180" />
          {backLabel}
        </button>
      )}
    </div>
  )
}
