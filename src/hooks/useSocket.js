import { useEffect, useRef } from "react"
import { socket } from "@/lib/socket"
import { queryClient } from "@/lib/queryClient"

// ✅ Actual page query keys se match kiya
const TYPE_TO_QUERY_KEYS = {
  employees: [
    ["employees"],
    ["dashboard-stats"],
  ],

  attendance: [
    ["attendance"],
    ["attendance-admin"],
    ["attendance", "today"],
    ["attendance", "my"],
    ["dashboard-stats"],
  ],

  leaves: [
    // Admin page
    ["leaves-admin"],
    // Employee page
    ["my-leaves"],
    ["leave-balance"],
    ["leave-types"],
    ["dashboard-stats"],
  ],

  tasks: [
    ["tasks"],
    ["tasks", "my"],
    ["dashboard-stats"],
  ],

  payroll: [
    ["payroll"],
    ["payroll", "my-slips"],
    ["salary-structure"],
  ],

  "personal-holidays": [
    ["personal-holidays"],
    ["personal-holidays", "my"],
    ["personal-holidays", "balance"],
    ["dashboard-stats"],
  ],

  wfh: [
    ["attendance"],
    ["attendance-admin"],
    ["attendance", "today"],
  ],

  dashboard: [
    ["dashboard-stats"],
  ],

  profile: [
    ["me"],
    ["employees"],
  ],

  documents: [
    ["documents"],
    ["employees"],
  ],
}

export function useSocket(employeeId, isAdmin) {
  // ✅ Track karo ki join ho chuke hain — dobara join mat karo
  const joinedRef = useRef(false)

  useEffect(() => {
    if (!employeeId) return

    // ─── Connect (agar already connected hai toh skip) ──────────────────────
    if (!socket.connected) {
      socket.connect()
    }

    // ─── Rooms join karo (sirf ek baar) ─────────────────────────────────────
    if (!joinedRef.current) {
      socket.emit("join", employeeId)
      if (isAdmin) socket.emit("joinAdmin")
      joinedRef.current = true
    }

    // ─── data:refresh — broad invalidate for all matching keys ───────────────
    function onDataRefresh({ type }) {
      const keys = TYPE_TO_QUERY_KEYS[type]
      if (!keys) return

      keys.forEach((key) => {
        // exact: false — partial match bhi invalidate hoga
        // e.g. ["leaves-admin"] match karega ["leaves-admin", page, search, ...]
        queryClient.invalidateQueries({ queryKey: key, exact: false })
      })
    }

    // ─── Attendance specific ─────────────────────────────────────────────────
    function onAttendanceUpdated() {
      queryClient.invalidateQueries({ queryKey: ["attendance"], exact: false })
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] })
    }

    // ─── Reconnect par rooms rejoin karo ─────────────────────────────────────
    function onReconnect() {
      console.log("🔄 Socket reconnected — rejoining rooms")
      joinedRef.current = false
      socket.emit("join", employeeId)
      if (isAdmin) socket.emit("joinAdmin")
      joinedRef.current = true
    }

    function onConnect() {
      console.log("🟢 Socket connected:", socket.id)
      // Reconnect case handle karo
      if (joinedRef.current) {
        socket.emit("join", employeeId)
        if (isAdmin) socket.emit("joinAdmin")
      }
    }

    function onDisconnect(reason) {
      console.log("🔴 Socket disconnected:", reason)
      joinedRef.current = false
    }

    function onConnectError(err) {
      console.warn("⚠️ Socket error:", err.message)
    }

    socket.on("data:refresh", onDataRefresh)
    socket.on("attendance:updated", onAttendanceUpdated)
    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)
    socket.on("connect_error", onConnectError)

    // ✅ Cleanup — sirf listeners remove karo, disconnect mat karo
    return () => {
      socket.off("data:refresh", onDataRefresh)
      socket.off("attendance:updated", onAttendanceUpdated)
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
      socket.off("connect_error", onConnectError)
      // ❌ socket.disconnect() — REMOVED — connection live rakhna hai
    }
  }, [employeeId, isAdmin])
}