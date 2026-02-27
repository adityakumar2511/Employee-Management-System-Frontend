"use client"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import AdminLayout from "@/components/layout/AdminLayout"
import { Button } from "@/components/ui/Button"
import { SearchInput } from "@/components/ui/SearchInput"
import { Select } from "@/components/ui/Select"
import { Avatar } from "@/components/ui/Avatar"
import { StatusBadge } from "@/components/ui/Badge"
import { Table, TableHead, TableBody, TableRow, Th, Td, EmptyRow } from "@/components/ui/Table"
import { Pagination } from "@/components/ui/Pagination"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { Dropdown, DropdownItem, DropdownSeparator } from "@/components/ui/Dropdown"
import { PageLoader, SkeletonRow } from "@/components/ui/Spinner"
import { employeeService } from "@/services/employee.service"
import { useToast } from "@/hooks/useToast"
import { useDebounce } from "@/hooks/useDebounce"
import { formatDate, formatCurrency } from "@/lib/utils"
import {
  Plus, Upload, Download, Search, MoreHorizontal, Edit, Trash2,
  Key, Mail, Users, Filter, Eye, UserCheck, UserX
} from "lucide-react"
import AddEmployeeModal from "./components/AddEmployeeModal"
import ViewEmployeeModal from "./components/ViewEmployeeModal"
import EditEmployeeModal from "./components/EditEmployeeModal"
import BulkImportModal from "./components/BulkImportModal"

export default function EmployeesPage() {
  const { toast } = useToast()
  const qc = useQueryClient()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [department, setDepartment] = useState("")
  const [status, setStatus] = useState("")
  const [addOpen, setAddOpen] = useState(false)
  const [viewEmployee, setViewEmployee] = useState(null)
  const [editEmployee, setEditEmployee] = useState(null)
  const [deleteEmployee, setDeleteEmployee] = useState(null)
  const [bulkImportOpen, setBulkImportOpen] = useState(false)

  const debouncedSearch = useDebounce(search)

  const { data, isLoading } = useQuery({
    queryKey: ["employees", page, debouncedSearch, department, status],
    queryFn: () => employeeService.getAll({ page, limit: 15, search: debouncedSearch, department, status }),
    select: (d) => d.data,
  })

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: () => employeeService.getDepartments(),
    select: (d) => d.data,
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => employeeService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] })
      toast.success("Employee deleted successfully")
      setDeleteEmployee(null)
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to delete employee"),
  })

  const resetPasswordMutation = useMutation({
    mutationFn: (id) => employeeService.resetPassword(id, {}),
    onSuccess: () => toast.success("Password reset email sent!"),
    onError: (e) => toast.error("Failed to reset password"),
  })

  const sendCredentialsMutation = useMutation({
    mutationFn: (id) => employeeService.sendCredentials(id),
    onSuccess: () => toast.success("Credentials sent to employee!"),
    onError: (e) => toast.error("Failed to send credentials"),
  })

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }) => employeeService.toggleStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] })
      toast.success("Status updated")
    },
  })

  const employees = data?.employees || []
  const totalPages = data?.totalPages || 1
  const totalCount = data?.total || 0

  return (
    <AdminLayout title="Employees">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="page-header mb-0">
            <h1 className="page-title">Employees</h1>
            <p className="page-subtitle">{totalCount} total employees in your organization</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setBulkImportOpen(true)}>
              <Upload className="h-4 w-4" />
              Bulk Import
            </Button>
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Employee
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchInput
            placeholder="Search by name, ID, email..."
            value={search}
            onChange={setSearch}
            className="flex-1"
          />
          <Select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-44">
            <option value="">All Departments</option>
            {departments?.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </Select>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-36">
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="TERMINATED">Terminated</option>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHead>
              <tr>
                <Th>Employee</Th>
                <Th>Employee ID</Th>
                <Th>Department</Th>
                <Th>Designation</Th>
                <Th>Joining Date</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} cols={7} />)
              ) : employees.length === 0 ? (
                <EmptyRow colSpan={7} message="No employees found" />
              ) : (
                employees.map((emp) => (
                  <TableRow key={emp.id}>
                    <Td>
                      <div className="flex items-center gap-3">
                        <Avatar name={emp.name} size="sm" src={emp.avatar} />
                        <div>
                          <p className="font-medium text-sm">{emp.name}</p>
                          <p className="text-xs text-muted-foreground">{emp.email}</p>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{emp.employeeId}</span>
                    </Td>
                    <Td className="text-sm text-muted-foreground">{emp.department?.name || "—"}</Td>
                    <Td className="text-sm">{emp.designation || "—"}</Td>
                    <Td className="text-sm text-muted-foreground">{formatDate(emp.joiningDate)}</Td>
                    <Td>
                      <StatusBadge status={
                        emp.status === "ACTIVE" ? "Active" :
                        emp.status === "INACTIVE" ? "Inactive" : "Terminated"
                      } />
                    </Td>
                    <Td className="text-right">
                      <Dropdown
                        align="right"
                        trigger={
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        }
                      >
                        <DropdownItem onClick={() => setViewEmployee(emp)}>
                          <Eye className="h-4 w-4" />
                          View Profile
                        </DropdownItem>
                        <DropdownItem onClick={() => setEditEmployee(emp)}>
                          <Edit className="h-4 w-4" />
                          Edit Details
                        </DropdownItem>
                        <DropdownSeparator />
                        <DropdownItem onClick={() => sendCredentialsMutation.mutate(emp.id)}>
                          <Mail className="h-4 w-4" />
                          Send Credentials
                        </DropdownItem>
                        <DropdownItem onClick={() => resetPasswordMutation.mutate(emp.id)}>
                          <Key className="h-4 w-4" />
                          Reset Password
                        </DropdownItem>
                        <DropdownSeparator />
                        {emp.status === "ACTIVE" ? (
                          <DropdownItem onClick={() => toggleStatusMutation.mutate({ id: emp.id, status: "INACTIVE" })}>
                            <UserX className="h-4 w-4" />
                            Deactivate
                          </DropdownItem>
                        ) : (
                          <DropdownItem onClick={() => toggleStatusMutation.mutate({ id: emp.id, status: "ACTIVE" })}>
                            <UserCheck className="h-4 w-4" />
                            Activate
                          </DropdownItem>
                        )}
                        <DropdownItem danger onClick={() => setDeleteEmployee(emp)}>
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownItem>
                      </Dropdown>
                    </Td>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {employees.length} of {totalCount} employees
          </p>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      {/* Modals */}
      <AddEmployeeModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={() => {
          qc.invalidateQueries({ queryKey: ["employees"] })
          setAddOpen(false)
          toast.success("Employee added successfully! Welcome email sent.")
        }}
      />

      {viewEmployee && (
        <ViewEmployeeModal
          employee={viewEmployee}
          onClose={() => setViewEmployee(null)}
        />
      )}

      {editEmployee && (
        <EditEmployeeModal
          employee={editEmployee}
          onClose={() => setEditEmployee(null)}
          onSuccess={() => {
            qc.invalidateQueries({ queryKey: ["employees"] })
            setEditEmployee(null)
            toast.success("Employee updated successfully")
          }}
        />
      )}

      <BulkImportModal
        isOpen={bulkImportOpen}
        onClose={() => setBulkImportOpen(false)}
        onSuccess={() => {
          qc.invalidateQueries({ queryKey: ["employees"] })
          setBulkImportOpen(false)
          toast.success("Employees imported! Welcome emails sent to all.")
        }}
      />

      <ConfirmDialog
        isOpen={!!deleteEmployee}
        onClose={() => setDeleteEmployee(null)}
        onConfirm={() => deleteMutation.mutate(deleteEmployee?.id)}
        loading={deleteMutation.isPending}
        title="Delete Employee"
        message={`Are you sure you want to delete ${deleteEmployee?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </AdminLayout>
  )
}
