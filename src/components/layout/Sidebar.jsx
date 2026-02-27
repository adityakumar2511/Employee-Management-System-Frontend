"use client"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import useAuthStore from "@/store/authStore"
import { Avatar } from "@/components/ui/Avatar"
import {
  LayoutDashboard, Users, Clock, Calendar, DollarSign, CheckSquare,
  BarChart2, Settings, MapPin, Star, LogOut, ChevronLeft, ChevronRight,
  Menu, PartyPopper, Bell, FileText, Shield, HelpCircle, BookOpen,
  Package, Briefcase, TrendingUp
} from "lucide-react"

const adminNav = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Employees", href: "/admin/employees", icon: Users },
  { label: "Attendance", href: "/admin/attendance", icon: Clock },
  { label: "Leaves", href: "/admin/leaves", icon: Calendar },
  { label: "Personal Holidays", href: "/admin/personal-holidays", icon: PartyPopper },
  { label: "Payroll", href: "/admin/payroll", icon: DollarSign },
  { label: "Tasks", href: "/admin/tasks", icon: CheckSquare },
  { label: "Reports", href: "/admin/reports", icon: BarChart2 },
  { label: "Geo Settings", href: "/admin/geo-settings", icon: MapPin },
  { label: "Settings", href: "/admin/settings", icon: Settings },
]

const employeeNav = [
  { label: "Dashboard", href: "/employee/dashboard", icon: LayoutDashboard },
  { label: "Attendance", href: "/employee/attendance", icon: Clock },
  { label: "Leaves", href: "/employee/leaves", icon: Calendar },
  { label: "Personal Holidays", href: "/employee/personal-holidays", icon: PartyPopper },
  { label: "Tasks", href: "/employee/tasks", icon: CheckSquare },
  { label: "Salary", href: "/employee/salary", icon: DollarSign },
]

export default function Sidebar({ role = "admin" }) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const nav = role === "admin" ? adminNav : employeeNav

  return (
    <aside
      className={cn(
        "flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out flex-shrink-0",
        "border-r",
        collapsed ? "w-16" : "w-60",
      )}
      style={{
        background: "hsl(var(--sidebar-bg))",
        borderColor: "hsl(var(--sidebar-border))",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
              <span className="text-sm font-bold text-white">E</span>
            </div>
            <div>
              <p className="text-sm font-bold leading-none" style={{ color: "hsl(var(--sidebar-text))", fontFamily: "Syne, sans-serif" }}>
                EMS Pro
              </p>
              <p className="text-xs mt-0.5" style={{ color: "hsl(var(--sidebar-muted))" }}>
                {role === "admin" ? "Admin Panel" : "Employee Portal"}
              </p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary mx-auto">
            <span className="text-sm font-bold text-white">E</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors flex-shrink-0"
          style={{ color: "hsl(var(--sidebar-muted))" }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 sidebar-scroll space-y-0.5">
        {nav.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                "sidebar-nav-item",
                isActive && "active",
                collapsed && "justify-center px-2"
              )}
            >
              <Icon className={cn("h-4.5 w-4.5 flex-shrink-0 nav-icon", "h-[18px] w-[18px]")} />
              {!collapsed && <span className="truncate">{label}</span>}
              {!collapsed && isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-current opacity-60" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div
        className="border-t p-3"
        style={{ borderColor: "hsl(var(--sidebar-border))" }}
      >
        <div className={cn("flex items-center gap-2.5", collapsed && "justify-center")}>
          <Avatar name={user?.name || user?.employeeId} size="sm" />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: "hsl(var(--sidebar-text))" }}>
                {user?.name || user?.employeeId}
              </p>
              <p className="text-xs truncate" style={{ color: "hsl(var(--sidebar-muted))" }}>
                {user?.email || user?.employeeId}
              </p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={logout}
              className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-red-900/20"
              style={{ color: "hsl(var(--sidebar-muted))" }}
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
        {collapsed && (
          <button
            onClick={logout}
            className="mt-2 flex w-full items-center justify-center rounded-lg p-1.5 transition-colors hover:bg-red-900/20"
            style={{ color: "hsl(var(--sidebar-muted))" }}
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </aside>
  )
}
