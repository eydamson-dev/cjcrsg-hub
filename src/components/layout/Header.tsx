import { Menu } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { churchName } from '~/lib/navigation'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex flex-1 items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <span className="text-lg font-bold">{churchName[0]}</span>
        </div>
        <div className="hidden md:block">
          <h1 className="text-lg font-semibold">{churchName}</h1>
          <p className="text-xs text-muted-foreground">
            Church Management System
          </p>
        </div>
      </div>
    </header>
  )
}
