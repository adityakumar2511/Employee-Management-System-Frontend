"use client"
import { cn } from "@/lib/utils"

const variants = {
  default: "bg-primary/10 text-primary",
  secondary: "bg-secondary text-secondary-foreground",
  destructive: "bg-destructive/10 text-destructive",
  success: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  outline: "border border-input bg-background text-foreground",
}

export function Badge({ children, variant = "default", className, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export function StatusBadge({ status }) {
  const config = {
    Present: { label: "Present", class: "badge-present" },
    Absent: { label: "Absent", class: "badge-absent" },
    "Half Day": { label: "Half Day", class: "badge-halfday" },
    Leave: { label: "Leave", class: "badge-leave" },
    "Personal Holiday": { label: "Personal Holiday", class: "badge-holiday" },
    WFH: { label: "WFH", class: "badge-wfh" },
    Pending: { label: "Pending", class: "bg-yellow-100 text-yellow-700" },
    Approved: { label: "Approved", class: "bg-green-100 text-green-700" },
    Rejected: { label: "Rejected", class: "bg-red-100 text-red-700" },
    Active: { label: "Active", class: "bg-green-100 text-green-700" },
    Inactive: { label: "Inactive", class: "bg-gray-100 text-gray-600" },
    Terminated: { label: "Terminated", class: "bg-red-100 text-red-700" },
    "In Progress": { label: "In Progress", class: "bg-blue-100 text-blue-700" },
    Completed: { label: "Completed", class: "bg-green-100 text-green-700" },
    Overdue: { label: "Overdue", class: "bg-red-100 text-red-700" },
    Paid: { label: "Paid", class: "bg-green-100 text-green-700" },
    Generated: { label: "Generated", class: "bg-blue-100 text-blue-700" },
    Draft: { label: "Draft", class: "bg-gray-100 text-gray-600" },
    High: { label: "High", class: "priority-high" },
    Medium: { label: "Medium", class: "priority-medium" },
    Low: { label: "Low", class: "priority-low" },
  }

  const cfg = config[status] || { label: status, class: "bg-gray-100 text-gray-600" }
  return (
    <span className={cn("status-pill", cfg.class)}>
      {cfg.label}
    </span>
  )
}
