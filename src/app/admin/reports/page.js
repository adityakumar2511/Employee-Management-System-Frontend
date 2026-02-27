"use client"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import AdminLayout from "@/components/layout/AdminLayout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Select } from "@/components/ui/Select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Avatar } from "@/components/ui/Avatar"
import { StatusBadge } from "@/components/ui/Badge"
import { Table, TableHead, TableBody, TableRow, Th, Td, EmptyRow } from "@/components/ui/Table"
import { SkeletonRow } from "@/components/ui/Spinner"
import { reportService } from "@/services/report.service"
import { useToast } from "@/hooks/useToast"
import { formatDate, formatCurrency } from "@/lib/utils"
import dayjs from "dayjs"
import { Download, BarChart2, Clock, Calendar, DollarSign, CheckSquare, PartyPopper } from "lucide-react"

const REPORT_TYPES = [
  { id: "attendance", label: "Attendance Report", icon: Clock, color: "text-blue-600" },
  { id: "leave", label: "Leave Report", icon: Calendar, color: "text-yellow-600" },
  { id: "payroll", label: "Payroll Report", icon: DollarSign, color: "text-green-600" },
  { id: "lop", label: "LOP Report", icon: BarChart2, color: "text-red-600" },
  { id: "tasks", label: "Task Completion", icon: CheckSquare, color: "text-purple-600" },
  { id: "personal-holidays", label: "Personal Holidays", icon: PartyPopper, color: "text-pink-600" },
]

export default function ReportsPage() {
  const { toast } = useToast()
  const [activeReport, setActiveReport] = useState("attendance")
  const [month, setMonth] = useState(dayjs().format("YYYY-MM"))
  const [fromDate, setFromDate] = useState(dayjs().startOf("month").format("YYYY-MM-DD"))
  const [toDate, setToDate] = useState(dayjs().format("YYYY-MM-DD"))
  const [exportLoading, setExportLoading] = useState(false)

  const reportQueries = {
    attendance: { fn: () => reportService.getAttendanceReport({ month }), key: ["report-attendance", month] },
    leave: { fn: () => reportService.getLeaveReport({ month }), key: ["report-leave", month] },
    payroll: { fn: () => reportService.getPayrollReport({ month }), key: ["report-payroll", month] },
    lop: { fn: () => reportService.getLOPReport({ month }), key: ["report-lop", month] },
    tasks: { fn: () => reportService.getTaskReport({ fromDate, toDate }), key: ["report-tasks", fromDate, toDate] },
    "personal-holidays": { fn: () => reportService.getPersonalHolidayReport({ month }), key: ["report-ph", month] },
  }

  const { data, isLoading } = useQuery({
    queryKey: reportQueries[activeReport]?.key,
    queryFn: reportQueries[activeReport]?.fn,
    select: d => d.data,
  })

  const handleExport = async (format = "excel") => {
    setExportLoading(true)
    try {
      const res = await reportService.exportReport(activeReport, { month, fromDate, toDate, format })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement("a")
      a.href = url
      a.download = `${activeReport}-report-${month}.${format === "excel" ? "xlsx" : "pdf"}`
      a.click()
      toast.success("Report exported!")
    } catch {
      toast.error("Export failed")
    } finally {
      setExportLoading(false)
    }
  }

  const records = data?.records || []

  return (
    <AdminLayout title="Reports">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="page-header mb-0">
            <h1 className="page-title">Reports & Analytics</h1>
            <p className="page-subtitle">Generate and export detailed HR reports</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleExport("excel")} loading={exportLoading}>
              <Download className="h-4 w-4" /> Excel
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport("pdf")} loading={exportLoading}>
              <Download className="h-4 w-4" /> PDF
            </Button>
          </div>
        </div>

        {/* Report type selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {REPORT_TYPES.map(({ id, label, icon: Icon, color }) => (
            <button key={id} onClick={() => setActiveReport(id)}
              className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-all ${activeReport === id ? "border-primary bg-primary/5 shadow-sm" : "hover:bg-muted/50"}`}>
              <Icon className={`h-5 w-5 ${activeReport === id ? "text-primary" : color}`} />
              <span className={`text-xs font-medium ${activeReport === id ? "text-primary" : ""}`}>{label}</span>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 items-end">
          {activeReport === "tasks" ? (
            <>
              <div>
                <Label>From Date</Label>
                <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="mt-1 w-40" />
              </div>
              <div>
                <Label>To Date</Label>
                <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="mt-1 w-40" />
              </div>
            </>
          ) : (
            <div>
              <Label>Month</Label>
              <Input type="month" value={month} onChange={e => setMonth(e.target.value)} className="mt-1 w-44" />
            </div>
          )}
        </div>

        {/* Summary Cards */}
        {data?.summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(data.summary).map(([key, value]) => (
              <div key={key} className="metric-card text-center">
                <p className="text-2xl font-bold">{typeof value === "number" && key.toLowerCase().includes("salary") ? formatCurrency(value) : value}</p>
                <p className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</p>
              </div>
            ))}
          </div>
        )}

        {/* Report Table */}
        <div className="rounded-xl border bg-card overflow-hidden">
          {activeReport === "attendance" && <AttendanceReportTable data={records} isLoading={isLoading} />}
          {activeReport === "leave" && <LeaveReportTable data={records} isLoading={isLoading} />}
          {activeReport === "payroll" && <PayrollReportTable data={records} isLoading={isLoading} />}
          {activeReport === "lop" && <LOPReportTable data={records} isLoading={isLoading} />}
          {activeReport === "tasks" && <TaskReportTable data={records} isLoading={isLoading} />}
          {activeReport === "personal-holidays" && <PHReportTable data={records} isLoading={isLoading} />}
        </div>
      </div>
    </AdminLayout>
  )
}

function AttendanceReportTable({ data, isLoading }) {
  return (
    <Table>
      <TableHead><tr><Th>Employee</Th><Th>Present</Th><Th>Absent</Th><Th>Half Days</Th><Th>Leave</Th><Th>LOP</Th><Th>WFH</Th></tr></TableHead>
      <TableBody>
        {isLoading ? Array.from({length:5}).map((_,i)=><SkeletonRow key={i} cols={7}/>) :
          data.length===0 ? <EmptyRow colSpan={7}/> :
          data.map(r=>(
            <TableRow key={r.employeeId}>
              <Td><div className="flex items-center gap-2"><Avatar name={r.name} size="sm"/><div><p className="text-sm font-medium">{r.name}</p><p className="text-xs text-muted-foreground">{r.employeeId}</p></div></div></Td>
              <Td className="text-green-600 font-medium">{r.present}</Td>
              <Td className="text-red-600 font-medium">{r.absent}</Td>
              <Td className="text-orange-600">{r.halfDays}</Td>
              <Td className="text-yellow-600">{r.onLeave}</Td>
              <Td className="text-red-600 font-medium">{r.lop}</Td>
              <Td className="text-blue-600">{r.wfh}</Td>
            </TableRow>
          ))
        }
      </TableBody>
    </Table>
  )
}

function LeaveReportTable({ data, isLoading }) {
  return (
    <Table>
      <TableHead><tr><Th>Employee</Th><Th>Leave Type</Th><Th>Total Allotted</Th><Th>Used</Th><Th>Balance</Th><Th>LOP Leaves</Th></tr></TableHead>
      <TableBody>
        {isLoading ? Array.from({length:5}).map((_,i)=><SkeletonRow key={i} cols={6}/>) :
          data.length===0 ? <EmptyRow colSpan={6}/> :
          data.map((r,i)=>(
            <TableRow key={i}>
              <Td><div className="flex items-center gap-2"><Avatar name={r.name} size="sm"/><p className="text-sm font-medium">{r.name}</p></div></Td>
              <Td className="text-sm">{r.leaveType}</Td>
              <Td className="text-sm">{r.total}</Td>
              <Td className="text-sm text-red-600">{r.used}</Td>
              <Td className="text-sm text-green-600 font-medium">{r.balance}</Td>
              <Td className="text-sm text-red-600">{r.lopLeaves}</Td>
            </TableRow>
          ))
        }
      </TableBody>
    </Table>
  )
}

function PayrollReportTable({ data, isLoading }) {
  return (
    <Table>
      <TableHead><tr><Th>Employee</Th><Th>Basic</Th><Th>Gross</Th><Th>Deductions</Th><Th>LOP</Th><Th>Net Salary</Th><Th>Status</Th></tr></TableHead>
      <TableBody>
        {isLoading ? Array.from({length:5}).map((_,i)=><SkeletonRow key={i} cols={7}/>) :
          data.length===0 ? <EmptyRow colSpan={7}/> :
          data.map(r=>(
            <TableRow key={r.employeeId}>
              <Td><div className="flex items-center gap-2"><Avatar name={r.name} size="sm"/><div><p className="text-sm font-medium">{r.name}</p><p className="text-xs text-muted-foreground">{r.employeeId}</p></div></div></Td>
              <Td className="text-sm">{formatCurrency(r.basic)}</Td>
              <Td className="text-sm">{formatCurrency(r.gross)}</Td>
              <Td className="text-sm text-red-600">-{formatCurrency(r.deductions)}</Td>
              <Td className="text-sm text-red-600">{r.lopDays} days</Td>
              <Td className="font-bold text-green-600">{formatCurrency(r.net)}</Td>
              <Td><StatusBadge status={r.status === "PAID" ? "Paid" : "Generated"} /></Td>
            </TableRow>
          ))
        }
      </TableBody>
    </Table>
  )
}

function LOPReportTable({ data, isLoading }) {
  return (
    <Table>
      <TableHead><tr><Th>Employee</Th><Th>Working Days</Th><Th>Present Days</Th><Th>LOP Days</Th><Th>LOP Amount</Th></tr></TableHead>
      <TableBody>
        {isLoading ? Array.from({length:5}).map((_,i)=><SkeletonRow key={i} cols={5}/>) :
          data.length===0 ? <EmptyRow colSpan={5}/> :
          data.map(r=>(
            <TableRow key={r.employeeId}>
              <Td><div className="flex items-center gap-2"><Avatar name={r.name} size="sm"/><p className="text-sm font-medium">{r.name}</p></div></Td>
              <Td className="text-sm">{r.workingDays}</Td>
              <Td className="text-sm text-green-600">{r.presentDays}</Td>
              <Td className="text-sm font-bold text-red-600">{r.lopDays}</Td>
              <Td className="text-sm font-bold text-red-600">-{formatCurrency(r.lopAmount)}</Td>
            </TableRow>
          ))
        }
      </TableBody>
    </Table>
  )
}

function TaskReportTable({ data, isLoading }) {
  return (
    <Table>
      <TableHead><tr><Th>Employee</Th><Th>Total Tasks</Th><Th>Completed</Th><Th>In Progress</Th><Th>Overdue</Th><Th>Avg Completion %</Th></tr></TableHead>
      <TableBody>
        {isLoading ? Array.from({length:5}).map((_,i)=><SkeletonRow key={i} cols={6}/>) :
          data.length===0 ? <EmptyRow colSpan={6}/> :
          data.map(r=>(
            <TableRow key={r.employeeId}>
              <Td><div className="flex items-center gap-2"><Avatar name={r.name} size="sm"/><p className="text-sm font-medium">{r.name}</p></div></Td>
              <Td className="text-sm font-medium">{r.total}</Td>
              <Td className="text-sm text-green-600">{r.completed}</Td>
              <Td className="text-sm text-blue-600">{r.inProgress}</Td>
              <Td className="text-sm text-red-600 font-medium">{r.overdue}</Td>
              <Td>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{width:`${r.avgCompletion||0}%`}}/></div>
                  <span className="text-sm">{r.avgCompletion || 0}%</span>
                </div>
              </Td>
            </TableRow>
          ))
        }
      </TableBody>
    </Table>
  )
}

function PHReportTable({ data, isLoading }) {
  return (
    <Table>
      <TableHead><tr><Th>Employee</Th><Th>Yearly Quota</Th><Th>Used</Th><Th>Balance</Th><Th>Approved Festivals</Th></tr></TableHead>
      <TableBody>
        {isLoading ? Array.from({length:5}).map((_,i)=><SkeletonRow key={i} cols={5}/>) :
          data.length===0 ? <EmptyRow colSpan={5}/> :
          data.map(r=>(
            <TableRow key={r.employeeId}>
              <Td><div className="flex items-center gap-2"><Avatar name={r.name} size="sm"/><p className="text-sm font-medium">{r.name}</p></div></Td>
              <Td className="text-sm">{r.quota}</Td>
              <Td className="text-sm text-orange-600">{r.used}</Td>
              <Td className="text-sm text-green-600 font-medium">{r.balance}</Td>
              <Td className="text-sm text-muted-foreground">{r.festivals?.join(", ") || "—"}</Td>
            </TableRow>
          ))
        }
      </TableBody>
    </Table>
  )
}
