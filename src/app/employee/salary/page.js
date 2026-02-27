"use client"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import EmployeeLayout from "@/components/layout/EmployeeLayout"
import { Button } from "@/components/ui/Button"
import { StatusBadge } from "@/components/ui/Badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Modal } from "@/components/ui/Modal"
import { SkeletonRow } from "@/components/ui/Spinner"
import { payrollService } from "@/services/payroll.service"
import { useToast } from "@/hooks/useToast"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Download, DollarSign, TrendingDown, TrendingUp, FileText, Lock } from "lucide-react"
import dayjs from "dayjs"

export default function EmployeeSalaryPage() {
  const { toast } = useToast()
  const [selectedSlip, setSelectedSlip] = useState(null)
  const [downloadingId, setDownloadingId] = useState(null)

  const { data: slips, isLoading } = useQuery({
    queryKey: ["my-salary-slips"],
    queryFn: () => payrollService.getMySalarySlips({ limit: 24 }),
    select: d => d.data?.slips,
  })

  const handleDownload = async (slip) => {
    setDownloadingId(slip.id)
    try {
      const res = await payrollService.downloadSlip(slip.id)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement("a")
      a.href = url
      a.download = `salary-slip-${dayjs(slip.month).format("MMM-YYYY")}.pdf`
      a.click()
      toast.success("Salary slip downloaded!")
    } catch {
      toast.error("Failed to download slip")
    } finally {
      setDownloadingId(null)
    }
  }

  const latestSlip = slips?.[0]

  return (
    <EmployeeLayout title="My Salary">
      <div className="space-y-5">
        <div className="page-header">
          <h1 className="page-title">Salary & Payslips</h1>
          <p className="page-subtitle">View your salary details and download payslips</p>
        </div>

        {/* Latest Salary Summary */}
        {latestSlip && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              { label: "Net Salary", value: formatCurrency(latestSlip.netSalary), icon: DollarSign, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
              { label: "Gross Salary", value: formatCurrency(latestSlip.grossSalary), icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
              { label: "Total Deductions", value: formatCurrency(latestSlip.totalDeductions), icon: TrendingDown, color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20" },
              { label: "LOP Days", value: `${latestSlip.lopDays || 0} days`, icon: FileText, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20" },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="metric-card">
                <div className="flex justify-between mb-2">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${bg}`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                </div>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{dayjs(latestSlip.month).format("MMMM YYYY")}</p>
              </div>
            ))}
          </div>
        )}

        {/* Slips Grid */}
        <div>
          <h2 className="font-semibold mb-3">Salary History</h2>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({length:6}).map((_,i) => <div key={i} className="shimmer h-32 rounded-xl" />)}
            </div>
          ) : !slips?.length ? (
            <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground rounded-xl border border-dashed">
              <Lock className="h-10 w-10 opacity-30" />
              <div className="text-center">
                <p className="font-medium">No salary slips available yet</p>
                <p className="text-sm">Salary slips appear here after admin marks payment for the month</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {slips.map(slip => (
                <div key={slip.id} className="rounded-xl border bg-card p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold">{dayjs(slip.month).format("MMMM YYYY")}</p>
                      <p className="text-xs text-muted-foreground">Paid: {formatDate(slip.paidDate)}</p>
                    </div>
                    <StatusBadge status="Paid" />
                  </div>
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Gross</span>
                      <span>{formatCurrency(slip.grossSalary)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Deductions</span>
                      <span className="text-red-600">-{formatCurrency(slip.totalDeductions)}</span>
                    </div>
                    {slip.lopDays > 0 && (
                      <div className="flex justify-between text-xs text-red-600">
                        <span>LOP ({slip.lopDays} days)</span>
                        <span>-{formatCurrency(slip.lopAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-base pt-1 border-t">
                      <span>Net Pay</span>
                      <span className="text-green-600">{formatCurrency(slip.netSalary)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => setSelectedSlip(slip)}>
                      <FileText className="h-3.5 w-3.5" /> View
                    </Button>
                    <Button size="sm" className="flex-1" loading={downloadingId === slip.id} onClick={() => handleDownload(slip)}>
                      <Download className="h-3.5 w-3.5" /> Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Slip Detail Modal */}
      {selectedSlip && (
        <Modal isOpen onClose={() => setSelectedSlip(null)} title={`Salary Slip — ${dayjs(selectedSlip.month).format("MMMM YYYY")}`} size="md">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
              <div><p className="font-medium">Payment Date</p><p className="text-sm text-muted-foreground">{formatDate(selectedSlip.paidDate)}</p></div>
              <StatusBadge status="Paid" />
            </div>

            <div className="rounded-xl border overflow-hidden">
              <div className="bg-muted/30 px-4 py-2 border-b text-xs font-semibold uppercase tracking-wider text-muted-foreground">Earnings</div>
              <div className="divide-y divide-border">
                <SlipRow label="Basic Salary" amount={selectedSlip.basicSalary} />
                {selectedSlip.components?.filter(c => c.type === "EARNING").map((c, i) => (
                  <SlipRow key={i} label={c.name} amount={c.amount} />
                ))}
                <SlipRow label="Gross Salary" amount={selectedSlip.grossSalary} bold />
              </div>
            </div>

            <div className="rounded-xl border overflow-hidden">
              <div className="bg-muted/30 px-4 py-2 border-b text-xs font-semibold uppercase tracking-wider text-muted-foreground">Deductions</div>
              <div className="divide-y divide-border">
                {selectedSlip.components?.filter(c => c.type === "DEDUCTION").map((c, i) => (
                  <SlipRow key={i} label={c.name} amount={-c.amount} />
                ))}
                {selectedSlip.lopDays > 0 && <SlipRow label={`LOP (${selectedSlip.lopDays} days)`} amount={-selectedSlip.lopAmount} />}
                {selectedSlip.halfDayCount > 0 && <SlipRow label={`Half Days (${selectedSlip.halfDayCount})`} amount={-selectedSlip.halfDayAmount} />}
                <SlipRow label="Total Deductions" amount={-selectedSlip.totalDeductions} bold />
              </div>
            </div>

            {selectedSlip.bonus > 0 && (
              <div className="flex justify-between px-4 py-2 rounded-xl border border-green-200 bg-green-50 dark:bg-green-900/20">
                <span className="text-sm font-medium text-green-700">Bonus / Incentive</span>
                <span className="text-sm font-bold text-green-700">+{formatCurrency(selectedSlip.bonus)}</span>
              </div>
            )}

            <div className="flex justify-between items-center px-4 py-3 rounded-xl bg-primary/5 border border-primary/20">
              <span className="font-bold">Net Salary</span>
              <span className="text-2xl font-bold text-primary">{formatCurrency(selectedSlip.netSalary)}</span>
            </div>

            <Button className="w-full" loading={downloadingId === selectedSlip.id} onClick={() => handleDownload(selectedSlip)}>
              <Download className="h-4 w-4" /> Download PDF
            </Button>
          </div>
        </Modal>
      )}
    </EmployeeLayout>
  )
}

function SlipRow({ label, amount, bold }) {
  const negative = amount < 0
  return (
    <div className="flex justify-between items-center px-4 py-2">
      <span className={`text-sm ${bold ? "font-semibold" : "text-muted-foreground"}`}>{label}</span>
      <span className={`text-sm font-medium ${bold ? "font-bold" : ""} ${negative ? "text-red-600" : ""}`}>
        {negative ? `-${formatCurrency(Math.abs(amount))}` : formatCurrency(amount)}
      </span>
    </div>
  )
}
