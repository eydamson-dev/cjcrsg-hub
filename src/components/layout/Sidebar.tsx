import { Link, useLocation } from '@tanstack/react-router'
import { cn } from '~/lib/utils'
import { navItems, churchName, churchFullName } from '~/lib/navigation'
import { useAuthActions } from '@convex-dev/auth/react'
import { Avatar, AvatarFallback } from '~/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { LogOut, User } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../../convex/_generated/api'

function UserDisplay() {
  const { data, isPending } = useQuery(
    convexQuery(api.myFunctions.getCurrentUser),
  )

  return (
    <div className="flex flex-col items-start text-left">
      <span className="text-sm font-medium">User</span>
      <span className="text-xs text-muted-foreground">
        {isPending ? 'Loading...' : data?.email}
      </span>
    </div>
  )
}

export function Sidebar() {
  const location = useLocation()
  const { signOut } = useAuthActions()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate({ to: '/login' })
  }

  return (
    <aside className="hidden w-64 flex-col border-r bg-card lg:flex">
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-2xl font-bold">{churchName[0]}</span>
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold">{churchName}</h2>
            <p className="text-xs text-muted-foreground">{churchFullName}</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = location.href === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
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
      </div>

      <div className="mt-auto border-t p-6">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-auto w-full items-center justify-start gap-3 rounded-lg px-0 py-2 text-left hover:bg-muted">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <UserDisplay />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  navigate({ to: '/' })
                }}
              >
                <User className="mr-2 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
