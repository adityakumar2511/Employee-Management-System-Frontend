"use client"
import { useState, useEffect } from "react"
import { Bell, Search, Moon, Sun, ChevronDown } from "lucide-react"
import useAuthStore from "@/store/authStore"
import useNotificationStore from "@/store/notificationStore"
import { Avatar } from "@/components/ui/Avatar"
import { Badge } from "@/components/ui/Badge"
import { Dropdown, DropdownItem, DropdownSeparator } from "@/components/ui/Dropdown"
import { subscribeToNotifications, markNotificationRead } from "@/lib/firebase"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { useRouter } from "next/navigation"

dayjs.extend(relativeTime)

export default function TopBar({ title }) {
  const { user, logout } = useAuthStore()
  const { notifications, unreadCount, setNotifications, markRead } = useNotificationStore()
  const [notifOpen, setNotifOpen] = useState(false)
  const router = useRouter()

  // Subscribe to Firebase notifications
  useEffect(() => {
    if (!user?.id) return
    const unsub = subscribeToNotifications(user.id, setNotifications)
    return () => unsub()
  }, [user?.id])

  const handleMarkRead = async (notifId) => {
    markRead(notifId)
    await markNotificationRead(notifId)
  }

  const notifIcons = {
    task: "📋",
    leave: "📅",
    salary: "💰",
    holiday: "🎉",
    announcement: "📢",
    default: "🔔",
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/95 backdrop-blur-sm px-5 gap-4">
      <div className="flex items-center gap-3">
        <h1 className="text-base font-semibold font-display truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted transition-colors"
          >
            <Bell className="h-4.5 w-4.5 h-[18px] w-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-11 z-50 w-80 rounded-xl border bg-card shadow-xl animate-fade-in">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <span className="font-semibold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <button className="text-xs text-primary hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto divide-y divide-border">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  notifications.slice(0, 15).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkRead(n.id)}
                      className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors ${!n.read ? "bg-primary/5" : ""}`}
                    >
                      <span className="text-lg flex-shrink-0">
                        {notifIcons[n.type] || notifIcons.default}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!n.read ? "font-medium" : ""}`}>{n.message}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {n.createdAt ? dayjs(n.createdAt.toDate?.() || n.createdAt).fromNow() : ""}
                        </p>
                      </div>
                      {!n.read && (
                        <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <Dropdown
          align="right"
          trigger={
            <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted transition-colors">
              <Avatar name={user?.name || user?.employeeId} size="sm" />
              <span className="text-sm font-medium hidden sm:block max-w-[120px] truncate">
                {user?.name || user?.employeeId}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
            </button>
          }
        >
          <div className="px-3 py-2 border-b mb-1">
            <p className="text-sm font-medium">{user?.name || user?.employeeId}</p>
            <p className="text-xs text-muted-foreground">{user?.email || user?.role}</p>
          </div>
          <DropdownItem onClick={() => {
            const base = user?.role === "ADMIN" ? "/admin" : "/employee"
            router.push(`${base}/settings`)
          }}>
            Profile Settings
          </DropdownItem>
          <DropdownSeparator />
          <DropdownItem danger onClick={logout}>
            Sign Out
          </DropdownItem>
        </Dropdown>
      </div>
    </header>
  )
}
