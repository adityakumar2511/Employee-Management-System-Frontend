"use client"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import AdminLayout from "@/components/layout/AdminLayout"
import { Button } from "@/components/ui/Button"
import { SearchInput } from "@/components/ui/SearchInput"
import { Select } from "@/components/ui/Select"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Textarea } from "@/components/ui/Textarea"
import { Avatar } from "@/components/ui/Avatar"
import { StatusBadge, Badge } from "@/components/ui/Badge"
import { Table, TableHead, TableBody, TableRow, Th, Td, EmptyRow } from "@/components/ui/Table"
import { Pagination } from "@/components/ui/Pagination"
import { Modal } from "@/components/ui/Modal"
import { SkeletonRow } from "@/components/ui/Spinner"
import { leaveService } from "@/services/leave.service"
import { useToast } from "@/hooks/useToast"
import { useDebounce } from "@/hooks/useDebounce"
import { formatDate } from "@/lib/utils"
import { CheckCircle, XCircle, Eye, Plus, Settings } from "lucide-react"

export default function LeavesPage() {
  const { toast } = useToast()
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("PENDING")
  const [selectedLeave, setSelectedLeave] = useState(null)
  const [comment, setComment] = useState("")
  const [leaveTypesModal, setLeaveTypesModal] = useState(false)

  const debouncedSearch = useDebounce(search)

  const { data, isLoading } = useQuery({
    queryKey: ["leaves-admin", page, debouncedSearch, statusFilter],
    queryFn: () => leaveService.getAllLeaves({ page, limit: 15, search: debouncedSearch, status: statusFilter }),
    select: (d) => d.data,
  })

  const { data: leaveTypes } = useQuery({
    queryKey: ["leave-types"],
    queryFn: () => leaveService.getLeaveTypes(),
    select: (d) => d.data,
  })

  const approveMutation = useMutation({
    mutationFn: ({ id, comment }) => leaveService.approve(id, comment),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leaves-admin"] })
      toast.success("Leave approved successfully")
      setSelectedLeave(null)
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to approve"),
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, comment }) => leaveService.reject(id, comment),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leaves-admin"] })
      toast.success("Leave rejected")
      setSelectedLeave(null)
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to reject"),
  })

  const leaves = data?.leaves || []
  const totalPages = data?.totalPages || 1

  const pendingCount = data?.pendingCount || 0

  return (
    <AdminLayout title="Leave Management">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="page-header mb-0">
            <h1 className="page-title">Leave Management</h1>
            <p className="page-subtitle">
              {pendingCount > 0 && <span className="text-yellow-600 font-medium">{pendingCount} pending approvals · </span>}
              Review and manage employee leave requests
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setLeaveTypesModal(true)}>
            <Settings className="h-4 w-4" />
            Configure Leave Types
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchInput
            placeholder="Search by employee name..."
            value={search}
            onChange={setSearch}
            className="flex-1"
          />
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHead>
              <tr>
                <Th>Employee</Th>
                <Th>Leave Type</Th>
                <Th>From</Th>
                <Th>To</Th>
                <Th>Days</Th>
                <Th>Reason</Th>
                <Th>Applied On</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={9} />)
              ) : leaves.length === 0 ? (
                <EmptyRow colSpan={9} message="No leave requests found" />
              ) : (
                leaves.map((leave) => (
                  <TableRow key={leave.id}>
                    <Td>
                      <div className="flex items-center gap-2">
                        <Avatar name={leave.employee?.name} size="sm" />
                        <div>
                          <p className="font-medium text-sm">{leave.employee?.name}</p>
                          <p className="text-xs text-muted-foreground">{leave.employee?.employeeId}</p>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <span className="text-sm">{leave.leaveType?.name}</span>
                      {leave.isHalfDay && <Badge variant="info" className="ml-1.5 text-xs">Half Day</Badge>}
                    </Td>
                    <Td className="text-sm">{formatDate(leave.fromDate)}</Td>
                    <Td className="text-sm">{formatDate(leave.toDate)}</Td>
                    <Td className="text-sm font-medium">{leave.days}</Td>
                    <Td className="text-sm max-w-[180px] truncate text-muted-foreground">{leave.reason}</Td>
                    <Td className="text-xs text-muted-foreground">{formatDate(leave.createdAt)}</Td>
                    <Td><StatusBadge status={leave.status === "PENDING" ? "Pending" : leave.status === "APPROVED" ? "Approved" : "Rejected"} /></Td>
                    <Td className="text-right">
                      {leave.status === "PENDING" ? (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => { setSelectedLeave({ ...leave, action: "approve" }); setComment("") }}
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => { setSelectedLeave({ ...leave, action: "reject" }); setComment("") }}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {leave.adminComment && `"${leave.adminComment.slice(0, 20)}..."`}
                        </span>
                      )}
                    </Td>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      {/* Approve / Reject Modal */}
      {selectedLeave && (
        <Modal
          isOpen
          onClose={() => setSelectedLeave(null)}
          title={selectedLeave.action === "approve" ? "Approve Leave" : "Reject Leave"}
          size="sm"
        >
          <div className="space-y-4">
            <div className="rounded-xl bg-muted/40 p-3 text-sm">
              <p><strong>{selectedLeave.employee?.name}</strong> has requested <strong>{selectedLeave.days} day(s)</strong> of {selectedLeave.leaveType?.name}</p>
              <p className="text-muted-foreground mt-1">{formatDate(selectedLeave.fromDate)} → {formatDate(selectedLeave.toDate)}</p>
              <p className="mt-1">Reason: {selectedLeave.reason}</p>
            </div>
            <div>
              <Label>Comment {selectedLeave.action === "reject" && <span className="text-destructive">*</span>}</Label>
              <Textarea
                placeholder={selectedLeave.action === "reject" ? "Reason for rejection..." : "Optional comment..."}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mt-1.5"
                rows={3}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setSelectedLeave(null)}>Cancel</Button>
              {selectedLeave.action === "approve" ? (
                <Button
                  variant="success"
                  loading={approveMutation.isPending}
                  onClick={() => approveMutation.mutate({ id: selectedLeave.id, comment })}
                >
                  Confirm Approval
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  loading={rejectMutation.isPending}
                  onClick={() => rejectMutation.mutate({ id: selectedLeave.id, comment })}
                >
                  Confirm Rejection
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  )
}
