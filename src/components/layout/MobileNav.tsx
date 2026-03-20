import { Link, useLocation } from '@tanstack/react-router'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/sheet'
import { navItems, churchName, churchFullName } from '~/lib/navigation'
import { cn } from '~/lib/utils'
import { Button } from '~/components/ui/button'
import { LogOut } from 'lucide-react'
import { useAuthActions } from '@convex-dev/auth/react'
import { useNavigate } from '@tanstack/react-router'

interface MobileNavProps {
  open: boolean
  onClose: () => void
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const location = useLocation()
  const { signOut } = useAuthActions()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    onClose()
    navigate({ to: '/login' })
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="border-b p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-xl font-bold">{churchName[0]}</span>
            </div>
            <div className="flex flex-col">
              <SheetTitle className="text-lg font-semibold">
                {churchName}
              </SheetTitle>
              <p className="text-xs text-muted-foreground">{churchFullName}</p>
            </div>
          </div>
        </SheetHeader>

        <div className="flex h-[calc(100%-88px)] flex-col">
          <nav className="flex flex-col gap-1 p-4">
            {navItems.map((item) => {
              const isActive = location.href === item.href
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto border-t p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
