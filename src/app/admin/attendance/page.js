"use client"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import AdminLayout from "@/components/layout/AdminLayout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Label } from "@/components/ui/Label"
import { SearchInput } from "@/components/ui/SearchInput"
import { Avatar } from "@/components/ui/Avatar"
import { StatusBadge } from "@/components/ui/Badge"
import { Table, TableHead, TableBody, TableRow, Th, Td, EmptyRow } from "@/components/ui/Table"
import { Pagination } from "@/components/ui/Pagination"
import { Modal } from "@/components/ui/Modal"
import { SkeletonRow } from "@/components/ui/Spinner"
import { attendanceService } from "@/services/attendance.service"
import { useToast } from "@/hooks/useToast"
import { useDebounce } from "@/hooks/useDebounce"
import { formatDate, formatTime } from "@/lib/utils"
import dayjs from "dayjs"
import { Download, Filter, Edit, MapPin, Calendar } from "lucide-react"

export default function AttendancePage() {
  const { toast } = useToast()
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"))
  const [month, setMonth] = useState(dayjs().format("YYYY-MM"))
  const [viewMode, setViewMode] = useState("daily") // daily | monthly
  const [overrideModal, setOverrideModal] = useState(null)
  const [overrideForm, setOverrideForm] = useState({ status: "Present", checkIn: "", checkOut: "", reason: "" })

  const debouncedSearch = useDebounce(search)

  const { data, isLoading } = useQuery({
    queryKey: ["attendance-admin", page, debouncedSearch, viewMode === "daily" ? date : month],
    queryFn: () => attendanceService.getAllAttendance({
      page, limit: 20, search: debouncedSearch,
      date: viewMode === "daily" ? date : undefined,
      month: viewMode === "monthly" ? month : undefined,
    }),
    select: (d) => d.data,
  })

  const overrideMutation = useMutation({
    mutationFn: (payload) => attendanceService.manualOverride(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attendance-admin"] })
      toast.success("Attendance updated successfully")
      setOverrideModal(null)
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to update attendance"),
  })

  const records = data?.records || []
  const totalPages = data?.totalPages || 1

  const statusOptions = ["Present", "Absent", "Half Day", "Leave", "Personal Holiday", "WFH"]

  return (
    <AdminLayout title="Attendance">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="page-header mb-0">
            <h1 className="page-title">Attendance Management</h1>
            <p className="page-subtitle">Track and manage employee attendance records</p>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>

        {/* View mode + Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex rounded-xl border p-1 bg-muted/40">
            {["daily", "monthly"].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex-1 px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                  viewMode === mode ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {viewMode === "daily" ? (
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" />
          ) : (
            <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-44" />
          )}

          <SearchInput
            placeholder="Search employee..."
            value={search}
            onChange={setSearch}
            className="flex-1"
          />
        </div>

        {/* Summary */}
        {viewMode === "daily" && data?.summary && (
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            {[
              { label: "Present", value: data.summary.present, color: "text-green-600" },
              { label: "Absent", value: data.summary.absent, color: "text-red-600" },
              { label: "Half Day", value: data.summary.halfDay, color: "text-orange-600" },
              { label: "Leave", value: data.summary.leave, color: "text-yellow-600" },
              { label: "WFH", value: data.summary.wfh, color: "text-blue-600" },
              { label: "LOP", value: data.summary.lop, color: "text-red-600" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-xl border bg-card p-3 text-center">
                <p className={`text-xl font-bold ${color}`}>{value || 0}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHead>
              <tr>
                <Th>Employee</Th>
                <Th>Date</Th>
                <Th>Status</Th>
                <Th>Check In</Th>
                <Th>Check Out</Th>
                <Th>Hours</Th>
                <Th>Location</Th>
                <Th className="text-right">Override</Th>
              </tr>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} cols={8} />)
              ) : records.length === 0 ? (
                <EmptyRow colSpan={8} message="No attendance records found" />
              ) : (
                records.map((rec) => (
                  <TableRow key={rec.id}>
                    <Td>
                      <div className="flex items-center gap-2">
                        <Avatar name={rec.employee?.name} size="sm" />
                        <div>
                          <p className="font-medium text-sm">{rec.employee?.name}</p>
                          <p className="text-xs text-muted-foreground">{rec.employee?.employeeId}</p>
                        </div>
                      </div>
                    </Td>
                    <Td className="text-sm">{formatDate(rec.date)}</Td>
                    <Td><StatusBadge status={rec.status} /></Td>
                    <Td className="text-sm font-mono">{rec.checkIn ? formatTime(rec.checkIn) : "—"}</Td>
                    <Td className="text-sm font-mono">{rec.checkOut ? formatTime(rec.checkOut) : "—"}</Td>
                    <Td className="text-sm">{rec.hoursWorked ? `${rec.hoursWorked}h` : "—"}</Td>
                    <Td>
                      {rec.latitude && rec.longitude ? (
                        <a
                          href={`https://maps.google.com/?q=${rec.latitude},${rec.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <MapPin className="h-3 w-3" />
                          View
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </Td>
                    <Td className="text-right">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          setOverrideModal(rec)
                          setOverrideForm({
                            status: rec.status || "Present",
                            checkIn: rec.checkIn ? dayjs(rec.checkIn).format("HH:mm") : "",
                            checkOut: rec.checkOut ? dayjs(rec.checkOut).format("HH:mm") : "",
                            reason: "",
                          })
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Td>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      {/* Override Modal */}
      <Modal
        isOpen={!!overrideModal}
        onClose={() => setOverrideModal(null)}
        title="Override Attendance"
        description={`Manually override attendance for ${overrideModal?.employee?.name}`}
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <Label required>Status</Label>
            <Select
              value={overrideForm.status}
              onChange={(e) => setOverrideForm(f => ({ ...f, status: e.target.value }))}
              className="mt-1.5"
            >
              {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Check In Time</Label>
              <Input type="time" value={overrideForm.checkIn} onChange={(e) => setOverrideForm(f => ({ ...f, checkIn: e.target.value }))} className="mt-1.5" />
            </div>
            <div>
              <Label>Check Out Time</Label>
              <Input type="time" value={overrideForm.checkOut} onChange={(e) => setOverrideForm(f => ({ ...f, checkOut: e.target.value }))} className="mt-1.5" />
            </div>
          </div>
          <div>
            <Label required>Reason for Override</Label>
            <Input placeholder="e.g. System error, Admin correction" value={overrideForm.reason} onChange={(e) => setOverrideForm(f => ({ ...f, reason: e.target.value }))} className="mt-1.5" />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setOverrideModal(null)}>Cancel</Button>
            <Button
              loading={overrideMutation.isPending}
              onClick={() => overrideMutation.mutate({
                attendanceId: overrideModal.id,
                employeeId: overrideModal.employeeId,
                date: overrideModal.date,
                ...overrideForm,
              })}
            >
              Save Override
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  )
}
