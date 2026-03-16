import { useEffect } from "react"
import { socket } from "@/lib/socket"
import { queryClient } from "@/lib/queryClient"

// data:refresh event ke type ko React Query keys se map karo
const TYPE_TO_QUERY_KEYS = {
  employees:         [["employees"], ["dashboard-stats"]],
  attendance:        [["attendance"], ["attendance", "today"], ["attendance", "my"], ["dashboard-stats"]],
  leaves:            [["leaves"], ["leaves", "my"], ["leaves", "balance"], ["dashboard-stats"]],
  tasks:             [["tasks"], ["tasks", "my"], ["dashboard-stats"]],
  payroll:           [["payroll"], ["payroll", "my-slips"]],
  "personal-holidays": [["personal-holidays"], ["personal-holidays", "my"], ["personal-holidays", "balance"], ["dashboard-stats"]],
  wfh:               [["wfh"], ["attendance"]],
  dashboard:         [["dashboard-stats"]],
  profile:           [["me"], ["employees"]],
  documents:         [["documents"]],
}

export function useSocket(employeeId, isAdmin) {
  useEffect(() => {
    // employeeId nahi hai toh connect mat karo
    if (!employeeId) return

    // Connect
    socket.connect()

    // Personal room join karo
    socket.emit("join", employeeId)

    // Admin room join karo
    if (isAdmin) {
      socket.emit("joinAdmin")
    }

    // ─── data:refresh event — sabse important ────────────────────────────────
    socket.on("data:refresh", ({ type }) => {
      const keys = TYPE_TO_QUERY_KEYS[type] || []
      keys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    })

    // ─── Attendance specific event ────────────────────────────────────────────
    socket.on("attendance:updated", (data) => {
      queryClient.invalidateQueries({ queryKey: ["attendance", "today"] })
      queryClient.invalidateQueries({ queryKey: ["attendance", "my"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] })
    })

    // ─── Connection events (debug ke liye) ────────────────────────────────────
    socket.on("connect", () => {
      console.log("🟢 Socket connected:", socket.id)
    })

    socket.on("disconnect", (reason) => {
      console.log("🔴 Socket disconnected:", reason)
    })

    socket.on("connect_error", (err) => {
      console.warn("⚠️ Socket connection error:", err.message)
    })

    // Cleanup on unmount
    return () => {
      socket.off("data:refresh")
      socket.off("attendance:updated")
      socket.off("connect")
      socket.off("disconnect")
      socket.off("connect_error")
      socket.disconnect()
    }
  }, [employeeId, isAdmin])
}