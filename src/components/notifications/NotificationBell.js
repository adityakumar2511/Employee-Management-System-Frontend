'use client'
import { useState } from 'react'
import { Bell, BellRing, Check, CheckCheck } from 'lucide-react'
import { useFirebaseNotifications } from '@/hooks/useFirebaseNotifications'
import { fromNow } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const notifIcons = {
  TASK_ASSIGNED: '📋',
  LEAVE_APPROVED: '✅',
  LEAVE_REJECTED: '❌',
  SALARY_CREDITED: '💰',
  PERSONAL_HOLIDAY_APPROVED: '🎉',
  ANNOUNCEMENT: '📢',
  DEFAULT: '🔔',
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useFirebaseNotifications()

  const handleNotifClick = async (notif) => {
    if (!notif.isRead) {
      await markAsRead(notif.id)
    }
  }

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        {unreadCount > 0 ? (
          <BellRing className="h-5 w-5" />
        ) : (
          <Bell className="h-5 w-5" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-12 z-50 w-80 rounded-lg border bg-background shadow-xl fade-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="font-semibold">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                    {unreadCount}
                  </span>
                )}
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <CheckCheck className="h-3 w-3" />
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-muted-foreground">
                  <Bell className="mb-2 h-8 w-8" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotifClick(notif)}
                    className={cn(
                      'flex cursor-pointer gap-3 border-b px-4 py-3 transition-colors last:border-0 hover:bg-muted/50',
                      !notif.isRead && 'bg-blue-50/50'
                    )}
                  >
                    <span className="mt-0.5 text-xl">
                      {notifIcons[notif.type] || notifIcons.DEFAULT}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'text-sm',
                          !notif.isRead && 'font-semibold'
                        )}
                      >
                        {notif.message}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {fromNow(notif.createdAt?.toDate?.())}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
