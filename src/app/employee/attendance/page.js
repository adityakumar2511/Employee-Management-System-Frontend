"use client"
import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import dynamic from "next/dynamic"
import EmployeeLayout from "@/components/layout/EmployeeLayout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Select } from "@/components/ui/Select"
import { Textarea } from "@/components/ui/Textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { StatusBadge, Badge } from "@/components/ui/Badge"
import { Modal } from "@/components/ui/Modal"
import { Table, TableHead, TableBody, TableRow, Th, Td, EmptyRow } from "@/components/ui/Table"
import { SkeletonRow } from "@/components/ui/Spinner"
import { attendanceService } from "@/services/attendance.service"
import { settingsService } from "@/services/settings.service"
import { useToast } from "@/hooks/useToast"
import { useGeolocation, isWithinRadius } from "@/hooks/useGeolocation"
import { formatDate, formatTime } from "@/lib/utils"
import dayjs from "dayjs"
import { Navigation, MapPin, Clock, CheckCircle, LogOut, Home, AlertTriangle, Loader2 } from "lucide-react"

const GeoFenceMap = dynamic(() => import("@/components/maps/GeoFenceMap"), { ssr: false })

export default function EmployeeAttendancePage() {
  const { toast } = useToast()
  const qc = useQueryClient()
  const [wfhModal, setWfhModal] = useState(false)
  const [wfhReason, setWfhReason] = useState("")
  const [month, setMonth] = useState(dayjs().format("YYYY-MM"))

  const { location, error: geoError, loading: geoLoading, refresh: refreshLocation } = useGeolocation()

  const { data: todayStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["attendance-today"],
    queryFn: attendanceService.getTodayStatus,
    select: d => d.data,
    refetchInterval: 30000,
  })

  const { data: officeLocations } = useQuery({
    queryKey: ["geo-locations"],
    queryFn: settingsService.getGeoLocations,
    select: d => d.data,
  })

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ["my-attendance", month],
    queryFn: () => attendanceService.getMyAttendance({ month }),
    select: d => d.data,
  })

  const checkInMutation = useMutation({
    mutationFn: attendanceService.checkIn,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["attendance-today"] }); toast.success("Checked in successfully! 🎉") },
    onError: e => toast.error(e.response?.data?.message || "Check-in failed"),
  })

  const checkOutMutation = useMutation({
    mutationFn: attendanceService.checkOut,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["attendance-today"] }); toast.success("Checked out! Have a great day! 👋") },
    onError: e => toast.error(e.response?.data?.message || "Check-out failed"),
  })

  const wfhMutation = useMutation({
    mutationFn: attendanceService.requestWFH,
    onSuccess: () => { setWfhModal(false); toast.success("WFH request submitted!") },
  })

  // Find nearest office and compute distance
  const nearestOffice = officeLocations?.[0]
  const distanceInfo = location && nearestOffice
    ? isWithinRadius(location.latitude, location.longitude, parseFloat(nearestOffice.latitude), parseFloat(nearestOffice.longitude), nearestOffice.radius || 500)
    : null

  const canCheckIn = !geoLoading && !geoError && distanceInfo?.within && !todayStatus?.checkIn
  const canCheckOut = todayStatus?.checkIn && !todayStatus?.checkOut
  const isWFH = todayStatus?.status === "WFH"

  const handleCheckIn = () => {
    if (!location) return
    checkInMutation.mutate({
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
    })
  }

  const handleCheckOut = () => {
    if (!location) return
    checkOutMutation.mutate({
      latitude: location.latitude,
      longitude: location.longitude,
    })
  }

  const summary = history?.summary || {}
  const records = history?.records || []

  return (
    <EmployeeLayout title="Attendance">
      <div className="space-y-5">
        <div className="page-header">
          <h1 className="page-title">My Attendance</h1>
          <p className="page-subtitle">Geo-fenced check-in · {formatDate(new Date())}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Check-in/out card */}
          <div className="lg:col-span-3 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Today's Attendance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status */}
                {todayStatus?.checkIn ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-700 dark:text-green-400">Checked In</p>
                      <p className="text-xs text-green-600 dark:text-green-500">at {formatTime(todayStatus.checkIn)}</p>
                    </div>
                    {todayStatus?.checkOut && (
                      <>
                        <div className="ml-2 text-muted-foreground">→</div>
                        <div>
                          <p className="text-sm font-medium">Checked Out</p>
                          <p className="text-xs text-muted-foreground">at {formatTime(todayStatus.checkOut)}</p>
                        </div>
                      </>
                    )}
                  </div>
                ) : isWFH ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                    <Home className="h-5 w-5 text-blue-600" />
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-400">WFH Mode — Location bypass active</p>
                  </div>
                ) : null}

                {/* Location status */}
                <div className={`flex items-center gap-3 p-3 rounded-xl border ${
                  geoLoading ? "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20" :
                  geoError ? "border-red-200 bg-red-50 dark:bg-red-900/20" :
                  distanceInfo?.within ? "border-green-200 bg-green-50 dark:bg-green-900/20" :
                  "border-red-200 bg-red-50 dark:bg-red-900/20"
                }`}>
                  {geoLoading ? <Loader2 className="h-5 w-5 text-yellow-600 animate-spin" /> :
                    geoError ? <AlertTriangle className="h-5 w-5 text-red-600" /> :
                    distanceInfo?.within ? <Navigation className="h-5 w-5 text-green-600" /> :
                    <MapPin className="h-5 w-5 text-red-600" />
                  }
                  <div className="flex-1">
                    {geoLoading && <p className="text-sm font-medium text-yellow-700">Fetching your location...</p>}
                    {geoError && <p className="text-sm font-medium text-red-700">{geoError}</p>}
                    {!geoLoading && !geoError && distanceInfo && (
                      <>
                        <p className={`text-sm font-medium ${distanceInfo.within ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
                          {distanceInfo.within ? "✅ You are within office range" : `⚠️ You are ${distanceInfo.distance}m away from office`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Distance: <strong>{distanceInfo.distance}m</strong> · Required: within {nearestOffice?.radius || 500}m
                        </p>
                      </>
                    )}
                  </div>
                  <Button variant="ghost" size="icon-sm" onClick={refreshLocation} title="Refresh location">
                    <Navigation className="h-4 w-4" />
                  </Button>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    size="lg"
                    variant="success"
                    disabled={!canCheckIn && !isWFH}
                    loading={checkInMutation.isPending}
                    onClick={handleCheckIn}
                    className="h-12"
                  >
                    <CheckCircle className="h-5 w-5" />
                    Check In
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    disabled={!canCheckOut}
                    loading={checkOutMutation.isPending}
                    onClick={handleCheckOut}
                    className="h-12"
                  >
                    <LogOut className="h-5 w-5" />
                    Check Out
                  </Button>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    {canCheckIn ? "You can check in" : !todayStatus?.checkIn ? "You must be within office range to check in" : ""}
                  </p>
                  <Button variant="ghost" size="sm" onClick={() => setWfhModal(true)} className="text-xs">
                    <Home className="h-3.5 w-3.5" /> Request WFH
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Summary */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {[
                { label: "Present", value: summary.present || 0, color: "text-green-600" },
                { label: "Absent", value: summary.absent || 0, color: "text-red-600" },
                { label: "Half Day", value: summary.halfDays || 0, color: "text-orange-600" },
                { label: "Leave", value: summary.onLeave || 0, color: "text-yellow-600" },
                { label: "WFH", value: summary.wfh || 0, color: "text-blue-600" },
                { label: "LOP", value: summary.lop || 0, color: "text-red-600" },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-xl border bg-card p-2.5 text-center">
                  <p className={`text-xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader><CardTitle className="text-base">Office Location</CardTitle></CardHeader>
              <CardContent>
                {nearestOffice ? (
                  <GeoFenceMap
                    center={{ lat: parseFloat(nearestOffice.latitude), lng: parseFloat(nearestOffice.longitude) }}
                    radius={nearestOffice.radius || 500}
                    userLocation={location ? { lat: location.latitude, lng: location.longitude } : null}
                    height="300px"
                    readonly
                  />
                ) : (
                  <div className="h-64 flex items-center justify-center rounded-xl border border-dashed text-muted-foreground text-sm">
                    <div className="text-center"><MapPin className="h-8 w-8 mx-auto mb-2 opacity-30" /><p>No office location configured</p></div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* History Table */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Attendance History</h2>
            <Input type="month" value={month} onChange={e => setMonth(e.target.value)} className="w-44 h-8" />
          </div>
          <div className="rounded-xl border bg-card overflow-hidden">
            <Table>
              <TableHead><tr><Th>Date</Th><Th>Status</Th><Th>Check In</Th><Th>Check Out</Th><Th>Hours</Th></tr></TableHead>
              <TableBody>
                {historyLoading ? Array.from({length:6}).map((_,i)=><SkeletonRow key={i} cols={5}/>) :
                  records.length===0 ? <EmptyRow colSpan={5} message="No records for this month"/> :
                  records.map(r=>(
                    <TableRow key={r.id}>
                      <Td className="font-medium text-sm">{formatDate(r.date)}</Td>
                      <Td><StatusBadge status={r.status}/></Td>
                      <Td className="text-sm font-mono">{r.checkIn ? formatTime(r.checkIn) : "—"}</Td>
                      <Td className="text-sm font-mono">{r.checkOut ? formatTime(r.checkOut) : "—"}</Td>
                      <Td className="text-sm">{r.hoursWorked ? `${r.hoursWorked}h` : "—"}</Td>
                    </TableRow>
                  ))
                }
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Modal isOpen={wfhModal} onClose={() => setWfhModal(false)} title="Request Work From Home" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Submit a WFH request. Admin approval will bypass location check for the day.</p>
          <div>
            <Label required>Date</Label>
            <Input type="date" min={dayjs().format("YYYY-MM-DD")} className="mt-1.5" id="wfh-date" />
          </div>
          <div>
            <Label required>Reason</Label>
            <Textarea value={wfhReason} onChange={e => setWfhReason(e.target.value)} placeholder="Reason for WFH..." className="mt-1.5" rows={3} />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setWfhModal(false)}>Cancel</Button>
            <Button loading={wfhMutation.isPending}
              onClick={() => wfhMutation.mutate({ date: document.getElementById("wfh-date").value, reason: wfhReason })}>
              <Home className="h-4 w-4" /> Submit Request
            </Button>
          </div>
        </div>
      </Modal>
    </EmployeeLayout>
  )
}
