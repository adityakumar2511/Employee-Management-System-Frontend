'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Clock,
  Calendar,
  Palmtree,
  CheckSquare,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { authStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

const navItems = [
  { href: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/employee/attendance', label: 'Attendance', icon: Clock },
  { href: '/employee/leaves', label: 'My Leaves', icon: Calendar },
  { href: '/employee/personal-holidays', label: 'Holidays', icon: Palmtree },
  { href: '/employee/tasks', label: 'My Tasks', icon: CheckSquare },
  { href: '/employee/salary', label: 'Salary Slips', icon: FileText },
]

export function EmployeeSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      await api.post('/auth/logout')
    } catch {}
    authStore.clearAuth()
    router.push('/auth/login')
  }

  return (
    <aside
      className={cn(
        'flex flex-col border-r bg-card transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center border-b px-4">
        <Building2 className="h-6 w-6 shrink-0 text-primary" />
        {!collapsed && (
          <span className="ml-2 font-bold text-lg truncate">EMS</span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href ||
              (item.href !== '/employee/dashboard' &&
                pathname.startsWith(item.href))
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t p-2 space-y-1">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5 mx-auto" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5 shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
