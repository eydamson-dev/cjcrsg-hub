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
}

export function EventsBreadcrumb({ items }: EventsBreadcrumbProps) {
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
            <a href="/events">Events</a>
          </BreadcrumbLink>
        </BreadcrumbItem>

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
}

export function BackLink({ href, label = 'Back', onClick }: BackLinkProps) {
  return (
    <div className="mb-4">
      {href ? (
        <a
          href={href}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronRight className="size-4 rotate-180" />
          {label}
        </a>
      ) : (
        <button
          onClick={onClick}
          type="button"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronRight className="size-4 rotate-180" />
          {label}
        </button>
      )}
    </div>
  )
}
