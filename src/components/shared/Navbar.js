'use client'
import { useAuth } from '@/hooks/useAuth'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { getInitials, getAvatarColor } from '@/lib/utils'
import { cn } from '@/lib/utils'

export function Navbar({ title }) {
  const { user } = useAuth()

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div>
        {title && (
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <NotificationBell />

        {/* User Avatar */}
        {user && (
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white',
                getAvatarColor(user.name)
              )}
            >
              {getInitials(user.name)}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.employeeId}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
