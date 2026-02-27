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
import { Select } from "@/components/ui/Select"
import { Textarea } from "@/components/ui/Textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { StatusBadge, Badge } from "@/components/ui/Badge"
import { Modal } from "@/components/ui/Modal"
import { Table, TableHead, TableBody, TableRow, Th, Td, EmptyRow } from "@/components/ui/Table"
import { SkeletonRow } from "@/components/ui/Spinner"
import { leaveService } from "@/services/leave.service"
import { useToast } from "@/hooks/useToast"
import { formatDate } from "@/lib/utils"
import { Plus, Calendar, X } from "lucide-react"

const leaveSchema = z.object({
  leaveTypeId: z.string().min(1, "Select a leave type"),
  fromDate: z.string().min(1, "Select start date"),
  toDate: z.string().min(1, "Select end date"),
  reason: z.string().min(5, "Reason must be at least 5 characters"),
  isHalfDay: z.boolean().optional(),
})

export default function EmployeeLeavesPage() {
  const { toast } = useToast()
  const qc = useQueryClient()
  const [applyModal, setApplyModal] = useState(false)

  const { data: balance } = useQuery({
    queryKey: ["leave-balance"],
    queryFn: leaveService.getBalance,
    select: d => d.data,
  })

  const { data: leaveTypes } = useQuery({
    queryKey: ["leave-types"],
    queryFn: leaveService.getLeaveTypes,
    select: d => d.data,
  })

  const { data: myLeaves, isLoading } = useQuery({
    queryKey: ["my-leaves"],
    queryFn: () => leaveService.getMyLeaves({ limit: 20 }),
    select: d => d.data?.leaves,
  })

  const applyMutation = useMutation({
    mutationFn: leaveService.apply,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-leaves"] })
      qc.invalidateQueries({ queryKey: ["leave-balance"] })
      toast.success("Leave application submitted!")
      setApplyModal(false)
    },
    onError: e => toast.error(e.response?.data?.message || "Failed to apply"),
  })

  const cancelMutation = useMutation({
    mutationFn: leaveService.cancel,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["my-leaves"] }); toast.success("Leave cancelled") },
  })

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(leaveSchema),
    defaultValues: { isHalfDay: false },
  })

  const fromDate = watch("fromDate")
  const toDate = watch("toDate")
  const isHalfDay = watch("isHalfDay")
  const days = fromDate && toDate
    ? isHalfDay ? 0.5 : Math.max(0, Math.ceil((new Date(toDate) - new Date(fromDate)) / (1000 * 60 * 60 * 24)) + 1)
    : 0

  return (
    <EmployeeLayout title="Leave Management">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="page-header mb-0">
            <h1 className="page-title">My Leaves</h1>
            <p className="page-subtitle">Apply for leave, track status and balance</p>
          </div>
          <Button size="sm" onClick={() => setApplyModal(true)}>
            <Plus className="h-4 w-4" /> Apply for Leave
          </Button>
        </div>

        {/* Leave Balance Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {balance?.map(b => (
            <div key={b.type} className="metric-card text-center">
              <p className="text-2xl font-bold text-primary">{b.remaining}</p>
              <p className="text-sm font-medium">{b.type}</p>
              <p className="text-xs text-muted-foreground">{b.used} used / {b.total} total</p>
              <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(b.remaining / b.total) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Leave History */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHead>
              <tr>
                <Th>Leave Type</Th>
                <Th>From</Th>
                <Th>To</Th>
                <Th>Days</Th>
                <Th>Reason</Th>
                <Th>Status</Th>
                <Th className="text-right">Action</Th>
              </tr>
            </TableHead>
            <TableBody>
              {isLoading ? Array.from({length:5}).map((_,i)=><SkeletonRow key={i} cols={7}/>) :
                !myLeaves?.length ? <EmptyRow colSpan={7} message="No leave applications yet"/> :
                myLeaves.map(leave => (
                  <TableRow key={leave.id}>
                    <Td>
                      <span className="text-sm font-medium">{leave.leaveType?.name}</span>
                      {leave.isHalfDay && <Badge variant="info" className="ml-1.5 text-xs">Half Day</Badge>}
                    </Td>
                    <Td className="text-sm">{formatDate(leave.fromDate)}</Td>
                    <Td className="text-sm">{formatDate(leave.toDate)}</Td>
                    <Td className="text-sm font-medium">{leave.days}</Td>
                    <Td className="text-sm text-muted-foreground max-w-[180px] truncate">{leave.reason}</Td>
                    <Td>
                      <div>
                        <StatusBadge status={leave.status === "PENDING" ? "Pending" : leave.status === "APPROVED" ? "Approved" : "Rejected"} />
                        {leave.adminComment && <p className="text-xs text-muted-foreground mt-0.5 max-w-[120px] truncate">{leave.adminComment}</p>}
                      </div>
                    </Td>
                    <Td className="text-right">
                      {leave.status === "PENDING" && (
                        <Button size="sm" variant="ghost" onClick={() => cancelMutation.mutate(leave.id)}>
                          <X className="h-3.5 w-3.5" /> Cancel
                        </Button>
                      )}
                    </Td>
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
        </div>
      </div>

      <Modal isOpen={applyModal} onClose={() => setApplyModal(false)} title="Apply for Leave" size="md">
        <form onSubmit={handleSubmit(d => applyMutation.mutate(d))} className="space-y-4">
          <div>
            <Label required>Leave Type</Label>
            <Select {...register("leaveTypeId")} className="mt-1.5">
              <option value="">Select type</option>
              {leaveTypes?.map(lt => (
                <option key={lt.id} value={lt.id}>{lt.name} (Balance: {balance?.find(b => b.typeId === lt.id)?.remaining || 0} days)</option>
              ))}
            </Select>
            {errors.leaveTypeId && <p className="form-error">{errors.leaveTypeId.message}</p>}
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/40">
            <input type="checkbox" id="halfDay" {...register("isHalfDay")} className="rounded" />
            <label htmlFor="halfDay" className="text-sm font-medium cursor-pointer">Apply for Half Day only</label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label required>From Date</Label>
              <Input type="date" {...register("fromDate")} className="mt-1.5" min={new Date().toISOString().split("T")[0]} />
              {errors.fromDate && <p className="form-error">{errors.fromDate.message}</p>}
            </div>
            <div>
              <Label required>To Date</Label>
              <Input type="date" {...register("toDate")} className="mt-1.5" min={fromDate || new Date().toISOString().split("T")[0]} disabled={isHalfDay} />
            </div>
          </div>

          {days > 0 && (
            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 text-sm text-blue-700 dark:text-blue-400">
              <p>Total: <strong>{days} day{days !== 1 ? "s" : ""}</strong> of leave requested</p>
            </div>
          )}

          <div>
            <Label required>Reason</Label>
            <Textarea placeholder="Reason for leave..." {...register("reason")} className="mt-1.5" rows={3} />
            {errors.reason && <p className="form-error">{errors.reason.message}</p>}
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setApplyModal(false)} type="button">Cancel</Button>
            <Button type="submit" loading={applyMutation.isPending}><Calendar className="h-4 w-4" /> Submit Application</Button>
          </div>
        </form>
      </Modal>
    </EmployeeLayout>
  )
}
