'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  Palmtree,
  DollarSign,
  CheckSquare,
  BarChart2,
  MapPin,
  Settings,
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
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/employees', label: 'Employees', icon: Users },
  { href: '/admin/attendance', label: 'Attendance', icon: Clock },
  { href: '/admin/leaves', label: 'Leaves', icon: Calendar },
  { href: '/admin/personal-holidays', label: 'Holidays', icon: Palmtree },
  { href: '/admin/payroll', label: 'Payroll', icon: DollarSign },
  { href: '/admin/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/admin/reports', label: 'Reports', icon: BarChart2 },
  { href: '/admin/geo-settings', label: 'Geo-Fence', icon: MapPin },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export function AdminSidebar() {
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
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-4">
        <Building2 className="h-6 w-6 shrink-0 text-primary" />
        {!collapsed && (
          <span className="ml-2 font-bold text-lg truncate">EMS</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href ||
              (item.href !== '/admin/dashboard' &&
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

      {/* Bottom */}
      <div className="border-t p-2 space-y-1">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className={cn(
            'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium',
            'text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors'
          )}
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
