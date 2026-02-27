import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0)
}

export function formatDate(date, format = "DD MMM YYYY") {
  if (!date) return "—"
  const d = new Date(date)
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
  const day = d.getDate().toString().padStart(2, "0")
  const month = months[d.getMonth()]
  const year = d.getFullYear()
  const hours = d.getHours().toString().padStart(2, "0")
  const minutes = d.getMinutes().toString().padStart(2, "0")
  
  switch (format) {
    case "DD MMM YYYY": return `${day} ${month} ${year}`
    case "MMM DD, YYYY": return `${month} ${day}, ${year}`
    case "YYYY-MM-DD": return `${year}-${(d.getMonth()+1).toString().padStart(2,"0")}-${day}`
    case "DD/MM/YYYY": return `${day}/${(d.getMonth()+1).toString().padStart(2,"0")}/${year}`
    case "hh:mm": return `${hours}:${minutes}`
    case "DD MMM, hh:mm": return `${day} ${month}, ${hours}:${minutes}`
    default: return `${day} ${month} ${year}`
  }
}

export function formatTime(date) {
  if (!date) return "—"
  const d = new Date(date)
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
}

export function getInitials(name) {
  if (!name) return "??"
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
}

export function getStatusColor(status) {
  const colors = {
    Present: "badge-present",
    Absent: "badge-absent",
    "Half Day": "badge-halfday",
    Leave: "badge-leave",
    "Personal Holiday": "badge-holiday",
    WFH: "badge-wfh",
    Pending: "bg-yellow-100 text-yellow-700",
    Approved: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
    Active: "bg-green-100 text-green-700",
    Inactive: "bg-gray-100 text-gray-700",
    Terminated: "bg-red-100 text-red-700",
    "In Progress": "bg-blue-100 text-blue-700",
    Completed: "bg-green-100 text-green-700",
    Overdue: "bg-red-100 text-red-700",
    Paid: "bg-green-100 text-green-700",
    Generated: "bg-blue-100 text-blue-700",
    Draft: "bg-gray-100 text-gray-700",
    High: "priority-high",
    Medium: "priority-medium",
    Low: "priority-low",
  }
  return colors[status] || "bg-gray-100 text-gray-700"
}

export function getPriorityIcon(priority) {
  const icons = {
    High: "🔴",
    Medium: "🟡",
    Low: "🟢",
  }
  return icons[priority] || "⚪"
}

export function calculateLOP(totalWorkingDays, present, halfDays, approvedLeaves) {
  const effectivePresent = present + (halfDays * 0.5) + approvedLeaves
  const lop = Math.max(0, totalWorkingDays - effectivePresent)
  return parseFloat(lop.toFixed(2))
}

export function truncate(str, length = 30) {
  if (!str) return ""
  return str.length > length ? str.substring(0, length) + "..." : str
}

export function debounce(fn, delay = 300) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export function generateEmployeeId(prefix = "EMP", currentCount = 0) {
  return `${prefix}-${String(currentCount + 1).padStart(3, "0")}`
}

export function getMonthName(monthIndex) {
  const months = ["January","February","March","April","May","June",
                  "July","August","September","October","November","December"]
  return months[monthIndex] || ""
}

export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

export function isWeekend(date) {
  const d = new Date(date)
  return d.getDay() === 0 || d.getDay() === 6
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function classifyRole(role) {
  return role === "ADMIN" ? "admin" : "employee"
}
