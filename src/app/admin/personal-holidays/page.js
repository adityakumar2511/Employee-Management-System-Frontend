"use client"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import AdminLayout from "@/components/layout/AdminLayout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Select } from "@/components/ui/Select"
import { Textarea } from "@/components/ui/Textarea"
import { Avatar } from "@/components/ui/Avatar"
import { StatusBadge } from "@/components/ui/Badge"
import { Modal } from "@/components/ui/Modal"
import { Table, TableHead, TableBody, TableRow, Th, Td, EmptyRow } from "@/components/ui/Table"
import { Pagination } from "@/components/ui/Pagination"
import { SkeletonRow } from "@/components/ui/Spinner"
import { personalHolidayService } from "@/services/personalHoliday.service"
import { employeeService } from "@/services/employee.service"
import { useToast } from "@/hooks/useToast"
import { formatDate } from "@/lib/utils"
import { CheckCircle, XCircle, Settings, PartyPopper } from "lucide-react"

export default function PersonalHolidaysPage() {
  const { toast } = useToast()
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState("PENDING")
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [comment, setComment] = useState("")
  const [quotaModal, setQuotaModal] = useState(false)
  const [quotaForm, setQuotaForm] = useState({ quota: 3, applyTo: "all", departmentId: "" })

  const { data, isLoading } = useQuery({
    queryKey: ["personal-holidays-admin", page, statusFilter],
    queryFn: () => personalHolidayService.getAllHolidays({ page, limit: 15, status: statusFilter }),
    select: d => d.data,
  })

  const approveMutation = useMutation({
    mutationFn: ({ id, comment }) => personalHolidayService.approve(id, comment),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["personal-holidays-admin"] })
      toast.success("Personal holiday approved! No salary deduction will occur.")
      setSelectedRequest(null)
    },
    onError: e => toast.error(e.response?.data?.message || "Failed to approve"),
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, comment }) => personalHolidayService.reject(id, comment),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["personal-holidays-admin"] })
      toast.success("Request rejected")
      setSelectedRequest(null)
    },
    onError: e => toast.error(e.response?.data?.message || "Failed to reject"),
  })

  const bulkQuotaMutation = useMutation({
    mutationFn: payload => personalHolidayService.setBulkQuota(payload),
    onSuccess: () => { toast.success("Yearly quota updated!"); setQuotaModal(false) },
  })

  const requests = data?.requests || []
  const totalPages = data?.totalPages || 1

  return (
    <AdminLayout title="Personal Holidays">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="page-header mb-0">
            <h1 className="page-title">Personal Holidays</h1>
            <p className="page-subtitle">Festival & personal days — no salary deduction on approval</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setQuotaModal(true)}>
            <Settings className="h-4 w-4" /> Set Yearly Quota
          </Button>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800 p-4">
          <PartyPopper className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-purple-800 dark:text-purple-300">How Personal Holidays Work</p>
            <p className="text-purple-600 dark:text-purple-400 mt-0.5">
              When approved, attendance is marked as "Personal Holiday" and LOP is <strong>NOT deducted</strong>. Employee balance reduces by 1.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-40">
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </Select>
        </div>

        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHead>
              <tr>
                <Th>Employee</Th>
                <Th>Festival / Reason</Th>
                <Th>Date</Th>
                <Th>Days</Th>
                <Th>Balance After</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </TableHead>
            <TableBody>
              {isLoading ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={7} />) :
                requests.length === 0 ? <EmptyRow colSpan={7} message="No personal holiday requests" /> :
                requests.map(req => (
                  <TableRow key={req.id}>
                    <Td>
                      <div className="flex items-center gap-2">
                        <Avatar name={req.employee?.name} size="sm" />
                        <div>
                          <p className="font-medium text-sm">{req.employee?.name}</p>
                          <p className="text-xs text-muted-foreground">{req.employee?.employeeId}</p>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-1.5 text-sm">
                        <span>🎉</span>
                        <span>{req.reason}</span>
                      </div>
                    </Td>
                    <Td className="text-sm">{formatDate(req.fromDate)}{req.toDate !== req.fromDate ? ` → ${formatDate(req.toDate)}` : ""}</Td>
                    <Td className="text-sm font-medium">{req.days}</Td>
                    <Td className="text-sm">
                      {req.status === "APPROVED"
                        ? <span className="text-orange-600 font-medium">{req.balanceAfter} remaining</span>
                        : <span className="text-muted-foreground">{req.currentBalance} available</span>
                      }
                    </Td>
                    <Td><StatusBadge status={req.status === "PENDING" ? "Pending" : req.status === "APPROVED" ? "Approved" : "Rejected"} /></Td>
                    <Td className="text-right">
                      {req.status === "PENDING" ? (
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="success" onClick={() => { setSelectedRequest({ ...req, action: "approve" }); setComment("") }}>
                            <CheckCircle className="h-3.5 w-3.5" /> Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => { setSelectedRequest({ ...req, action: "reject" }); setComment("") }}>
                            <XCircle className="h-3.5 w-3.5" /> Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">{req.adminComment || "—"}</span>
                      )}
                    </Td>
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end"><Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} /></div>
      </div>

      {selectedRequest && (
        <Modal isOpen onClose={() => setSelectedRequest(null)}
          title={selectedRequest.action === "approve" ? "Approve Personal Holiday" : "Reject Personal Holiday"} size="sm">
          <div className="space-y-4">
            <div className="rounded-xl bg-muted/40 p-3 text-sm space-y-1">
              <p><strong>{selectedRequest.employee?.name}</strong> requests <strong>{selectedRequest.days} day(s)</strong></p>
              <p>Reason: {selectedRequest.reason}</p>
              <p className="text-muted-foreground">Date: {formatDate(selectedRequest.fromDate)}</p>
              {selectedRequest.action === "approve" && (
                <p className="text-green-600 font-medium">✅ No salary deduction will occur</p>
              )}
            </div>
            <div>
              <Label>Comment (optional)</Label>
              <Textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Optional comment..." className="mt-1.5" rows={2} />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setSelectedRequest(null)}>Cancel</Button>
              {selectedRequest.action === "approve"
                ? <Button variant="success" loading={approveMutation.isPending} onClick={() => approveMutation.mutate({ id: selectedRequest.id, comment })}>Approve</Button>
                : <Button variant="destructive" loading={rejectMutation.isPending} onClick={() => rejectMutation.mutate({ id: selectedRequest.id, comment })}>Reject</Button>
              }
            </div>
          </div>
        </Modal>
      )}

      <Modal isOpen={quotaModal} onClose={() => setQuotaModal(false)} title="Set Personal Holiday Quota" description="Configure yearly personal holiday allowance" size="sm">
        <div className="space-y-4">
          <div>
            <Label required>Yearly Quota (days per employee)</Label>
            <Input type="number" min="0" max="30" value={quotaForm.quota}
              onChange={e => setQuotaForm(f => ({ ...f, quota: parseInt(e.target.value) || 0 }))} className="mt-1.5" />
          </div>
          <div>
            <Label>Apply To</Label>
            <Select value={quotaForm.applyTo} onChange={e => setQuotaForm(f => ({ ...f, applyTo: e.target.value }))} className="mt-1.5">
              <option value="all">All Employees</option>
              <option value="department">Specific Department</option>
            </Select>
          </div>
          <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 text-sm text-blue-700 dark:text-blue-400">
            <p>This sets the <strong>annual</strong> personal holiday limit. Year-end unused days can be lapsed or carried forward.</p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setQuotaModal(false)}>Cancel</Button>
            <Button loading={bulkQuotaMutation.isPending} onClick={() => bulkQuotaMutation.mutate(quotaForm)}>Save Quota</Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  )
}
