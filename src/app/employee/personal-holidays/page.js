"use client"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
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
import { personalHolidayService } from "@/services/personalHoliday.service"
import { useToast } from "@/hooks/useToast"
import { formatDate } from "@/lib/utils"
import { Plus, PartyPopper, Gift, Star } from "lucide-react"

const schema = z.object({
  reason: z.string().min(3, "Enter festival/reason name"),
  fromDate: z.string().min(1, "Select date"),
  toDate: z.string().optional(),
  description: z.string().optional(),
})

const FESTIVAL_SUGGESTIONS = ["Eid", "Diwali", "Holi", "Christmas", "Birthday", "Anniversary", "Family Function", "Navratri", "Durga Puja", "Pongal"]

export default function EmployeePersonalHolidaysPage() {
  const { toast } = useToast()
  const qc = useQueryClient()
  const [applyModal, setApplyModal] = useState(false)

  const { data: balance } = useQuery({
    queryKey: ["personal-holiday-balance"],
    queryFn: personalHolidayService.getBalance,
    select: d => d.data,
  })

  const { data: myHolidays, isLoading } = useQuery({
    queryKey: ["my-personal-holidays"],
    queryFn: () => personalHolidayService.getMyHolidays({ limit: 20 }),
    select: d => d.data?.holidays,
  })

  const applyMutation = useMutation({
    mutationFn: personalHolidayService.apply,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-personal-holidays"] })
      qc.invalidateQueries({ queryKey: ["personal-holiday-balance"] })
      toast.success("Personal holiday request submitted! Admin will review it.")
      setApplyModal(false)
    },
    onError: e => toast.error(e.response?.data?.message || "Failed to apply"),
  })

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({ resolver: zodResolver(schema) })
  const fromDate = watch("fromDate")

  return (
    <EmployeeLayout title="Personal Holidays">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="page-header mb-0">
            <h1 className="page-title">Personal Holidays</h1>
            <p className="page-subtitle">Festival & personal days with no salary deduction</p>
          </div>
          <Button size="sm" onClick={() => setApplyModal(true)}>
            <Plus className="h-4 w-4" /> Apply for Holiday
          </Button>
        </div>

        {/* Balance Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="col-span-1 sm:col-span-1 border-purple-200 dark:border-purple-800">
            <CardContent className="pt-5 text-center">
              <div className="flex justify-center mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <PartyPopper className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-purple-600">{balance?.remaining || 0}</p>
              <p className="text-sm font-medium mt-1">Personal Holidays Left</p>
              <p className="text-xs text-muted-foreground">{balance?.used || 0} used of {balance?.total || 0} this year</p>
              <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-purple-500 transition-all"
                  style={{ width: `${balance?.total ? ((balance.remaining / balance.total) * 100) : 0}%` }} />
              </div>
            </CardContent>
          </Card>

          <div className="col-span-1 sm:col-span-2 flex items-center gap-3 rounded-xl border border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800 p-5">
            <Gift className="h-8 w-8 text-purple-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-purple-800 dark:text-purple-300">How It Works</p>
              <ul className="text-sm text-purple-700 dark:text-purple-400 mt-1 space-y-0.5 list-disc list-inside">
                <li>You get {balance?.total || 3} personal/festival days per year</li>
                <li>Submit request in advance with festival name</li>
                <li>On admin approval — <strong>NO salary deduction</strong></li>
                <li>Attendance marked as "Personal Holiday"</li>
              </ul>
            </div>
          </div>
        </div>

        {/* History */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHead>
              <tr>
                <Th>Festival / Reason</Th>
                <Th>Date</Th>
                <Th>Days</Th>
                <Th>Status</Th>
                <Th>Admin Comment</Th>
              </tr>
            </TableHead>
            <TableBody>
              {isLoading ? Array.from({length:4}).map((_,i)=><SkeletonRow key={i} cols={5}/>) :
                !myHolidays?.length ? <EmptyRow colSpan={5} message="No personal holiday requests yet"/> :
                myHolidays.map(h => (
                  <TableRow key={h.id}>
                    <Td>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🎉</span>
                        <div>
                          <p className="text-sm font-medium">{h.reason}</p>
                          {h.description && <p className="text-xs text-muted-foreground">{h.description}</p>}
                        </div>
                      </div>
                    </Td>
                    <Td className="text-sm">{formatDate(h.fromDate)}{h.toDate !== h.fromDate ? ` → ${formatDate(h.toDate)}` : ""}</Td>
                    <Td className="text-sm font-medium">{h.days}</Td>
                    <Td>
                      <StatusBadge status={h.status === "PENDING" ? "Pending" : h.status === "APPROVED" ? "Approved" : "Rejected"} />
                      {h.status === "APPROVED" && <p className="text-xs text-green-600 mt-0.5">No salary deduction ✅</p>}
                    </Td>
                    <Td className="text-sm text-muted-foreground">{h.adminComment || "—"}</Td>
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
        </div>
      </div>

      <Modal isOpen={applyModal} onClose={() => setApplyModal(false)} title="Apply for Personal Holiday" description="Festival or personal days — no salary cut" size="sm">
        <form onSubmit={handleSubmit(d => applyMutation.mutate(d))} className="space-y-4">
          <div>
            <Label required>Festival / Reason Name</Label>
            <Input placeholder="e.g. Eid, Diwali, Birthday" {...register("reason")} className="mt-1.5" />
            {errors.reason && <p className="form-error">{errors.reason.message}</p>}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {FESTIVAL_SUGGESTIONS.map(f => (
                <button key={f} type="button" onClick={() => setValue("reason", f)}
                  className="text-xs px-2 py-0.5 rounded-full border hover:bg-primary/10 hover:border-primary transition-colors">
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label required>From Date</Label>
              <Input type="date" {...register("fromDate")} className="mt-1.5" min={new Date().toISOString().split("T")[0]} />
              {errors.fromDate && <p className="form-error">{errors.fromDate.message}</p>}
            </div>
            <div>
              <Label>To Date (optional)</Label>
              <Input type="date" {...register("toDate")} className="mt-1.5" min={fromDate || new Date().toISOString().split("T")[0]} />
            </div>
          </div>

          <div>
            <Label>Additional Note (optional)</Label>
            <Textarea placeholder="Any additional context..." {...register("description")} className="mt-1.5" rows={2} />
          </div>

          <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 text-sm text-green-700 dark:text-green-400">
            ✅ If approved, this day will <strong>NOT be deducted</strong> from your salary
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setApplyModal(false)} type="button">Cancel</Button>
            <Button type="submit" loading={applyMutation.isPending}><PartyPopper className="h-4 w-4" /> Submit Request</Button>
          </div>
        </form>
      </Modal>
    </EmployeeLayout>
  )
}
