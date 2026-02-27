"use client"
import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import EmployeeLayout from "@/components/layout/EmployeeLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { StatusBadge, Badge } from "@/components/ui/Badge"
import { Avatar } from "@/components/ui/Avatar"
import { reportService } from "@/services/report.service"
import { attendanceService } from "@/services/attendance.service"
import { taskService } from "@/services/task.service"
import { formatDate, formatCurrency, formatTime } from "@/lib/utils"
import useAuthStore from "@/store/authStore"
import { subscribeToAnnouncements } from "@/lib/firebase"
import dayjs from "dayjs"
import {
  Clock, Calendar, DollarSign, CheckSquare, PartyPopper,
  AlertTriangle, TrendingUp, Megaphone
} from "lucide-react"

export default function EmployeeDashboard() {
  const { user } = useAuthStore()
  const [announcements, setAnnouncements] = useState([])

  useEffect(() => {
    const unsub = subscribeToAnnouncements(user?.departmentId, setAnnouncements)
    return () => unsub()
  }, [user?.departmentId])

  const { data: today } = useQuery({
    queryKey: ["attendance-today"],
    queryFn: attendanceService.getTodayStatus,
    select: d => d.data,
    refetchInterval: 60000,
  })

  const { data: stats } = useQuery({
    queryKey: ["employee-dashboard-stats"],
    queryFn: reportService.getDashboardStats,
    select: d => d.data,
  })

  const { data: myTasks } = useQuery({
    queryKey: ["my-tasks-pending"],
    queryFn: () => taskService.getMyTasks({ status: "PENDING", limit: 5 }),
    select: d => d.data?.tasks,
  })

  const statusConfig = {
    checked_in: { label: "Checked In ✅", color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
    checked_out: { label: "Checked Out 🏠", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
    not_checked_in: { label: "Not Checked In ⏳", color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
    on_leave: { label: "On Leave 📅", color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
    holiday: { label: "Public Holiday 🎉", color: "text-pink-600", bg: "bg-pink-50 dark:bg-pink-900/20" },
    wfh: { label: "Work From Home 🏡", color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
  }

  const todayStatus = today?.status || "not_checked_in"
  const sc = statusConfig[todayStatus] || statusConfig.not_checked_in

  return (
    <EmployeeLayout title="My Dashboard">
      <div className="space-y-5">
        {/* Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border"
          style={{ background: "linear-gradient(135deg, hsl(217 91% 55% / 0.08), hsl(217 91% 55% / 0.02))" }}>
          <div className="flex items-center gap-4">
            <Avatar name={user?.name} size="lg" src={user?.avatar} />
            <div>
              <h2 className="text-xl font-bold">Good {dayjs().hour() < 12 ? "Morning" : dayjs().hour() < 17 ? "Afternoon" : "Evening"}, {user?.name?.split(" ")[0]}! 👋</h2>
              <p className="text-muted-foreground text-sm">{user?.designation} · {formatDate(new Date())}</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 rounded-xl px-4 py-2.5 ${sc.bg}`}>
            <Clock className={`h-4 w-4 ${sc.color}`} />
            <div>
              <p className={`text-sm font-semibold ${sc.color}`}>{sc.label}</p>
              {today?.checkIn && <p className="text-xs text-muted-foreground">In: {formatTime(today.checkIn)}{today?.checkOut ? ` · Out: ${formatTime(today.checkOut)}` : ""}</p>}
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Leave Balance", value: `${stats?.leaveBalance?.casual || 0} CL`, sub: `${stats?.leaveBalance?.sick || 0} SL · ${stats?.leaveBalance?.earned || 0} EL`, icon: Calendar, color: "text-yellow-600" },
            { label: "Personal Holidays", value: `${stats?.personalHolidayBalance || 0} left`, sub: "This year", icon: PartyPopper, color: "text-pink-600" },
            { label: "LOP This Month", value: `${stats?.lopThisMonth || 0} days`, sub: stats?.lopThisMonth > 0 ? "Salary deducted" : "No deductions", icon: AlertTriangle, color: stats?.lopThisMonth > 0 ? "text-red-600" : "text-green-600" },
            { label: "Tasks Pending", value: stats?.pendingTasks || 0, sub: `${stats?.overdueTasks || 0} overdue`, icon: CheckSquare, color: "text-purple-600" },
          ].map(({ label, value, sub, icon: Icon, color }) => (
            <div key={label} className="metric-card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">{label}</p>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className="text-lg font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Latest Salary Slip */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Latest Salary Slip</CardTitle>
                <a href="/employee/salary" className="text-xs text-primary hover:underline">View all</a>
              </div>
            </CardHeader>
            <CardContent>
              {stats?.latestSalary ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
                    <div>
                      <p className="text-sm font-medium">{dayjs(stats.latestSalary.month).format("MMMM YYYY")}</p>
                      <p className="text-xs text-muted-foreground">Payment Date: {formatDate(stats.latestSalary.paidDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-600">{formatCurrency(stats.latestSalary.netSalary)}</p>
                      <StatusBadge status="Paid" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-lg bg-muted/30 p-2">
                      <p className="text-xs text-muted-foreground">Gross Salary</p>
                      <p className="font-medium">{formatCurrency(stats.latestSalary.grossSalary)}</p>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-2">
                      <p className="text-xs text-muted-foreground">Total Deductions</p>
                      <p className="font-medium text-red-600">-{formatCurrency(stats.latestSalary.totalDeductions)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
                  <DollarSign className="h-8 w-8 opacity-30" />
                  <p className="text-sm">No salary slip available yet</p>
                  <p className="text-xs">Salary slips appear after admin marks payment</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Tasks */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Pending Tasks</CardTitle>
                <a href="/employee/tasks" className="text-xs text-primary hover:underline">View all</a>
              </div>
            </CardHeader>
            <CardContent>
              {myTasks?.length === 0 || !myTasks ? (
                <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
                  <CheckSquare className="h-8 w-8 opacity-30" />
                  <p className="text-sm">No pending tasks 🎉</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {myTasks.map(task => (
                    <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className={`h-2 w-2 rounded-full flex-shrink-0 ${
                        task.priority === "HIGH" ? "bg-red-500" : task.priority === "MEDIUM" ? "bg-yellow-500" : "bg-green-500"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        <p className="text-xs text-muted-foreground">Due: {formatDate(task.deadline)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-10 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{width:`${task.completionPercent||0}%`}}/></div>
                        <span className="text-xs text-muted-foreground">{task.completionPercent||0}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Announcements */}
        {announcements.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Announcements</CardTitle>
                <Badge variant="info" className="text-xs">Live</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {announcements.slice(0, 3).map(ann => (
                  <div key={ann.id} className="rounded-xl border p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{ann.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{ann.message}</p>
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0 ml-3">{formatDate(ann.createdAt?.toDate?.() || ann.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </EmployeeLayout>
  )
}
