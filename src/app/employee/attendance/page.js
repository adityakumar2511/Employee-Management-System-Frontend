"use client"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import EmployeeLayout from "@/components/layout/EmployeeLayout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Textarea } from "@/components/ui/Textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { StatusBadge } from "@/components/ui/Badge"
import { Modal } from "@/components/ui/Modal"
import { Table, TableHead, TableBody, TableRow, Th, Td, EmptyRow } from "@/components/ui/Table"
import { SkeletonRow } from "@/components/ui/Spinner"
import { attendanceService } from "@/services/attendance.service"
import { settingsService } from "@/services/settings.service"
import { useToast } from "@/hooks/useToast"
import { useGeolocation, isWithinRadius } from "@/hooks/useGeolocation"
import { formatDate, formatTime } from "@/lib/utils"
import dayjs from "dayjs"
import {
  Navigation, MapPin, CheckCircle, LogOut,
  Home, AlertTriangle, Loader2, ExternalLink, RefreshCw,
} from "lucide-react"

export default function EmployeeAttendancePage() {
  const { toast } = useToast()
  const qc = useQueryClient()
  const [wfhModal, setWfhModal] = useState(false)
  const [wfhReason, setWfhReason] = useState("")
  const [wfhDate, setWfhDate] = useState(dayjs().format("YYYY-MM-DD"))
  const [month, setMonth] = useState(dayjs().format("YYYY-MM"))

  const {
    location,
    error: geoError,
    loading: geoLoading,
    refresh: refreshLocation,
  } = useGeolocation()

  const { data: todayStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["attendance-today"],
    queryFn: attendanceService.getTodayStatus,
    select: (d) => d.data,
    refetchInterval: 30000,
  })

  const { data: officeLocations } = useQuery({
    queryKey: ["geo-locations"],
    queryFn: settingsService.getGeoLocations,
    select: (d) => d.data,
  })

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ["my-attendance", month],
    queryFn: () => attendanceService.getMyAttendance({ month }),
    select: (d) => d.data,
  })

  const checkInMutation = useMutation({
    mutationFn: attendanceService.checkIn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attendance-today"] })
      toast.success("Checked in successfully! 🎉")
    },
    onError: (e) => toast.error(e.response?.data?.message || "Check-in failed"),
  })

  const checkOutMutation = useMutation({
    mutationFn: attendanceService.checkOut,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attendance-today"] })
      toast.success("Checked out! Have a great day! 👋")
    },
    onError: (e) => toast.error(e.response?.data?.message || "Check-out failed"),
  })

  const wfhMutation = useMutation({
    mutationFn: attendanceService.requestWFH,
    onSuccess: () => {
      setWfhModal(false)
      setWfhReason("")
      toast.success("WFH request submitted!")
    },
    onError: (e) => toast.error(e.response?.data?.message || "Request failed"),
  })

  const nearestOffice = officeLocations?.[0]

  const distanceInfo =
    location && nearestOffice
      ? isWithinRadius(
          location.latitude,
          location.longitude,
          parseFloat(nearestOffice.latitude),
          parseFloat(nearestOffice.longitude),
          nearestOffice.radius || 500
        )
      : null

  const isWFH = todayStatus?.status === "WFH"
  const canCheckIn =
    !todayStatus?.checkIn &&
    (isWFH || (!geoLoading && !geoError && distanceInfo?.within))
  const canCheckOut = todayStatus?.checkIn && !todayStatus?.checkOut

  const handleCheckIn = () => {
    if (!location && !isWFH) return
    checkInMutation.mutate({
      latitude: location?.latitude,
      longitude: location?.longitude,
      accuracy: location?.accuracy,
    })
  }

  const handleCheckOut = () => {
    if (!location) return
    checkOutMutation.mutate({
      latitude: location?.latitude,
      longitude: location?.longitude,
    })
  }

  const summary = history?.summary || {}
  const records = history?.records || []

  const googleMapsUrl =
    nearestOffice
      ? `https://www.google.com/maps?q=${nearestOffice.latitude},${nearestOffice.longitude}&z=16`
      : null

  return (
    <EmployeeLayout title="Attendance">
      <div className="space-y-5">

        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">My Attendance</h1>
          <p className="page-subtitle">
            Geo-fenced check-in · {formatDate(new Date())}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* ── Left: Check-in card ─────────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Today's Attendance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

                {/* Check-in/out status */}
                {todayStatus?.checkIn ? (
                  <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-700 dark:text-green-400">
                        Checked In
                      </p>
                      <p className="text-xs text-green-600">
                        at {formatTime(todayStatus.checkIn)}
                      </p>
                    </div>
                    {todayStatus?.checkOut && (
                      <>
                        <span className="text-muted-foreground">→</span>
                        <div>
                          <p className="text-sm font-medium">Checked Out</p>
                          <p className="text-xs text-muted-foreground">
                            at {formatTime(todayStatus.checkOut)}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                ) : isWFH ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <Home className="h-5 w-5 text-blue-600" />
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                      WFH Mode — Location bypass active
                    </p>
                  </div>
                ) : null}

                {/* GPS / Location status */}
                <div
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    geoLoading
                      ? "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20"
                      : geoError
                      ? "border-red-200 bg-red-50 dark:bg-red-900/20"
                      : distanceInfo?.within
                      ? "border-green-200 bg-green-50 dark:bg-green-900/20"
                      : "border-red-200 bg-red-50 dark:bg-red-900/20"
                  }`}
                >
                  {geoLoading ? (
                    <Loader2 className="h-5 w-5 text-yellow-600 animate-spin flex-shrink-0" />
                  ) : geoError ? (
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  ) : distanceInfo?.within ? (
                    <Navigation className="h-5 w-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <MapPin className="h-5 w-5 text-red-600 flex-shrink-0" />
                  )}

                  <div className="flex-1 min-w-0">
                    {geoLoading && (
                      <p className="text-sm font-medium text-yellow-700">
                        Fetching your location...
                      </p>
                    )}
                    {geoError && (
                      <p className="text-sm font-medium text-red-700">
                        {geoError}
                      </p>
                    )}
                    {!geoLoading && !geoError && distanceInfo && (
                      <>
                        <p
                          className={`text-sm font-medium ${
                            distanceInfo.within
                              ? "text-green-700 dark:text-green-400"
                              : "text-red-700 dark:text-red-400"
                          }`}
                        >
                          {distanceInfo.within
                            ? "✅ You are within office range"
                            : `⚠️ You are ${distanceInfo.distance}m away`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Distance:{" "}
                          <strong>{distanceInfo.distance}m</strong> · Required:
                          within {nearestOffice?.radius || 500}m
                        </p>
                      </>
                    )}
                    {!geoLoading && !geoError && !distanceInfo && (
                      <p className="text-sm text-muted-foreground">
                        No office location configured
                      </p>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={refreshLocation}
                    title="Refresh location"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    size="lg"
                    variant="success"
                    disabled={!canCheckIn || todayStatus?.checkIn}
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
                    {canCheckIn
                      ? "You can check in now"
                      : !todayStatus?.checkIn
                      ? "Must be within office range to check in"
                      : ""}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setWfhModal(true)}
                    className="text-xs"
                  >
                    <Home className="h-3.5 w-3.5" /> Request WFH
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Summary */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {[
                { label: "Present", value: summary.present || 0, color: "text-green-600" },
                { label: "Absent",  value: summary.absent  || 0, color: "text-red-600" },
                { label: "Half Day",value: summary.halfDays|| 0, color: "text-orange-600" },
                { label: "Leave",   value: summary.onLeave || 0, color: "text-yellow-600" },
                { label: "WFH",     value: summary.wfh     || 0, color: "text-blue-600" },
                { label: "LOP",     value: summary.lop     || 0, color: "text-red-600" },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="rounded-xl border bg-card p-2.5 text-center"
                >
                  <p className={`text-xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Office location info (no map) ────────────────────── */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-base">Office Location</CardTitle>
              </CardHeader>
              <CardContent>
                {nearestOffice ? (
                  <div className="space-y-4">
                    {/* Office info */}
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          {nearestOffice.name}
                        </p>
                        {nearestOffice.address && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {nearestOffice.address}
                          </p>
                        )}
                        <p className="text-xs text-blue-600 mt-1">
                          Geo-fence radius: {nearestOffice.radius || 500}m
                        </p>
                      </div>
                    </div>

                    {/* Coordinates */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-muted/40 p-2.5 text-center">
                        <p className="font-mono text-xs font-medium">
                          {parseFloat(nearestOffice.latitude).toFixed(4)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Latitude
                        </p>
                      </div>
                      <div className="rounded-lg bg-muted/40 p-2.5 text-center">
                        <p className="font-mono text-xs font-medium">
                          {parseFloat(nearestOffice.longitude).toFixed(4)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Longitude
                        </p>
                      </div>
                    </div>

                    {/* Your location */}
                    {location && (
                      <div className="rounded-lg border p-3 space-y-1">
                        <p className="text-xs font-medium flex items-center gap-1.5">
                          <Navigation className="h-3.5 w-3.5 text-blue-600" />
                          Your Current Location
                        </p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {location.latitude.toFixed(4)},{" "}
                          {location.longitude.toFixed(4)}
                        </p>
                        {distanceInfo && (
                          <p
                            className={`text-xs font-medium ${
                              distanceInfo.within
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {distanceInfo.within
                              ? `✅ Within range (${distanceInfo.distance}m away)`
                              : `❌ Out of range (${distanceInfo.distance}m away)`}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Google Maps link */}
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full rounded-xl border border-dashed p-3 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Office on Google Maps
                    </a>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center rounded-xl border border-dashed text-muted-foreground text-sm">
                    <div className="text-center">
                      <MapPin className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p>No office location configured</p>
                      <p className="text-xs mt-1">
                        Contact admin to set office location
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── Attendance History Table ──────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Attendance History</h2>
            <Input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-44 h-8"
            />
          </div>
          <div className="rounded-xl border bg-card overflow-hidden">
            <Table>
              <TableHead>
                <tr>
                  <Th>Date</Th>
                  <Th>Status</Th>
                  <Th>Check In</Th>
                  <Th>Check Out</Th>
                  <Th>Hours</Th>
                </tr>
              </TableHead>
              <TableBody>
                {historyLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonRow key={i} cols={5} />
                  ))
                ) : records.length === 0 ? (
                  <EmptyRow colSpan={5} message="No records for this month" />
                ) : (
                  records.map((r) => (
                    <TableRow key={r.id}>
                      <Td className="font-medium text-sm">
                        {formatDate(r.date)}
                      </Td>
                      <Td>
                        <StatusBadge status={r.status} />
                      </Td>
                      <Td className="text-sm font-mono">
                        {r.checkIn ? formatTime(r.checkIn) : "—"}
                      </Td>
                      <Td className="text-sm font-mono">
                        {r.checkOut ? formatTime(r.checkOut) : "—"}
                      </Td>
                      <Td className="text-sm">
                        {r.hoursWorked ? `${r.hoursWorked}h` : "—"}
                      </Td>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* ── WFH Modal ──────────────────────────────────────────────────── */}
      <Modal
        isOpen={wfhModal}
        onClose={() => setWfhModal(false)}
        title="Request Work From Home"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Submit a WFH request. Admin approval will bypass location check for
            the day.
          </p>
          <div>
            <Label required>Date</Label>
            <Input
              type="date"
              value={wfhDate}
              min={dayjs().format("YYYY-MM-DD")}
              onChange={(e) => setWfhDate(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label required>Reason</Label>
            <Textarea
              value={wfhReason}
              onChange={(e) => setWfhReason(e.target.value)}
              placeholder="Reason for WFH..."
              className="mt-1.5"
              rows={3}
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setWfhModal(false)}>
              Cancel
            </Button>
            <Button
              loading={wfhMutation.isPending}
              disabled={!wfhDate || !wfhReason}
              onClick={() =>
                wfhMutation.mutate({ date: wfhDate, reason: wfhReason })
              }
            >
              <Home className="h-4 w-4" /> Submit Request
            </Button>
          </div>
        </div>
      </Modal>
    </EmployeeLayout>
  )
}