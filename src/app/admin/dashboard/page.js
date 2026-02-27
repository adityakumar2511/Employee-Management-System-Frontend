"use client"
import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import AdminLayout from "@/components/layout/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge, StatusBadge } from "@/components/ui/Badge"
import { Avatar } from "@/components/ui/Avatar"
import AttendanceChart from "@/components/charts/AttendanceChart"
import DepartmentChart from "@/components/charts/DepartmentChart"
import PayrollChart from "@/components/charts/PayrollChart"
import TaskChart from "@/components/charts/TaskChart"
import { reportService } from "@/services/report.service"
import { formatCurrency, formatDate } from "@/lib/utils"
import { subscribeToDashboardCounters, subscribeToActivityLogs } from "@/lib/firebase"
import {
  Users, Clock, Calendar, DollarSign, CheckSquare, TrendingUp,
  UserCheck, UserX, Coffee, Home, ArrowUpRight, Bell, Activity
} from "lucide-react"
import { Spinner } from "@/components/ui/Spinner"

export default function AdminDashboard() {
  const [liveCounters, setLiveCounters] = useState({
    present: 0, absent: 0, halfDay: 0, wfh: 0, onLeave: 0
  })
  const [activityLogs, setActivityLogs] = useState([])

  // Firebase realtime counters
  useEffect(() => {
    const unsub1 = subscribeToDashboardCounters(setLiveCounters)
    const unsub2 = subscribeToActivityLogs(setActivityLogs)
    return () => { unsub1(); unsub2() }
  }, [])

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => reportService.getDashboardStats(),
    select: (d) => d.data,
  })

  const counterCards = [
    { label: "Present Today", value: liveCounters.present, icon: UserCheck, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20", live: true },
    { label: "Absent Today", value: liveCounters.absent, icon: UserX, color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20", live: true },
    { label: "Half Day", value: liveCounters.halfDay, icon: Coffee, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20", live: true },
    { label: "Work From Home", value: liveCounters.wfh, icon: Home, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20", live: true },
  ]

  const statsCards = [
    { label: "Total Employees", value: stats?.totalEmployees || 0, icon: Users, color: "text-primary", change: stats?.employeeGrowth },
    { label: "Pending Leaves", value: stats?.pendingLeaves || 0, icon: Calendar, color: "text-yellow-600" },
    { label: "Pending Tasks", value: stats?.pendingTasks || 0, icon: CheckSquare, color: "text-purple-600" },
    { label: "This Month Payroll", value: formatCurrency(stats?.monthlyPayroll || 0), icon: DollarSign, color: "text-green-600", isAmount: true },
  ]

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="page-header mb-0">
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Real-time overview of your organization • {formatDate(new Date())}</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-green-50 dark:bg-green-900/20">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-green-700 dark:text-green-400">Live Updates</span>
          </div>
        </div>

        {/* Live Attendance Counters */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold">Today's Attendance</span>
            <Badge variant="info" className="text-xs">Live</Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {counterCards.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="metric-card">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground">{label}</span>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${bg}`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                </div>
                <p className={`text-3xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statsCards.map(({ label, value, icon: Icon, color, change, isAmount }) => (
            <div key={label} className="metric-card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">{label}</span>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              {isLoading ? (
                <div className="shimmer h-8 w-20 rounded" />
              ) : (
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-bold">{value}</p>
                  {change && (
                    <div className="flex items-center gap-0.5 text-green-600 mb-0.5">
                      <ArrowUpRight className="h-3 w-3" />
                      <span className="text-xs font-medium">+{change}%</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <AttendanceChart data={stats?.attendanceTrend || []} />
          </div>
          <DepartmentChart data={stats?.departmentHeadcount || []} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <PayrollChart data={stats?.payrollTrend || []} />
          </div>
          <div className="space-y-5">
            <TaskChart data={stats?.taskStats || []} />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Recent Pending Leaves */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Pending Leave Requests</CardTitle>
                <a href="/admin/leaves" className="text-xs text-primary hover:underline">View all</a>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <div key={i} className="shimmer h-12 rounded-lg" />)}
                </div>
              ) : stats?.recentLeaves?.length ? (
                <div className="space-y-3">
                  {stats.recentLeaves.slice(0, 5).map((leave) => (
                    <div key={leave.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <Avatar name={leave.employeeName} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{leave.employeeName}</p>
                        <p className="text-xs text-muted-foreground">{leave.leaveType} • {leave.days} day(s)</p>
                      </div>
                      <StatusBadge status="Pending" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">No pending leaves</p>
              )}
            </CardContent>
          </Card>

          {/* Activity Log (Firebase Realtime) */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">Activity Feed</CardTitle>
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {activityLogs.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
                  <Activity className="h-8 w-8 opacity-30" />
                  <p className="text-sm">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activityLogs.slice(0, 6).map((log) => (
                    <div key={log.id} className="flex items-start gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs flex-shrink-0">
                        {log.emoji || "📋"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground">{log.message}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{log.actor} • {log.timeAgo}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
