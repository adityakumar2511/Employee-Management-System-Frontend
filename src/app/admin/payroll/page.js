"use client"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import AdminLayout from "@/components/layout/AdminLayout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Select } from "@/components/ui/Select"
import { Textarea } from "@/components/ui/Textarea"
import { SearchInput } from "@/components/ui/SearchInput"
import { Avatar } from "@/components/ui/Avatar"
import { StatusBadge, Badge } from "@/components/ui/Badge"
import { Modal } from "@/components/ui/Modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Table, TableHead, TableBody, TableRow, Th, Td, EmptyRow } from "@/components/ui/Table"
import { Pagination } from "@/components/ui/Pagination"
import { SkeletonRow } from "@/components/ui/Spinner"
import SalaryStructureBuilder from "@/components/salary-builder/SalaryStructureBuilder"
import { payrollService } from "@/services/payroll.service"
import { employeeService } from "@/services/employee.service"
import { useToast } from "@/hooks/useToast"
import { useDebounce } from "@/hooks/useDebounce"
import { formatCurrency, formatDate } from "@/lib/utils"
import dayjs from "dayjs"
import {
  Play, CheckCircle, Download, DollarSign, Eye, Edit, Wallet,
  Settings, Users, AlertCircle, Building
} from "lucide-react"

export default function PayrollPage() {
  const { toast } = useToast()
  const qc = useQueryClient()
  const [tab, setTab] = useState("payroll") // payroll | structure
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [month, setMonth] = useState(dayjs().format("YYYY-MM"))
  const [generateModal, setGenerateModal] = useState(false)
  const [overrideModal, setOverrideModal] = useState(null)
  const [structureEmployee, setStructureEmployee] = useState(null)
  const [overrideForm, setOverrideForm] = useState({ netSalary: "", reason: "" })
  const debouncedSearch = useDebounce(search)

  const { data, isLoading } = useQuery({
    queryKey: ["payroll", page, debouncedSearch, month],
    queryFn: () => payrollService.getPayrollList({ page, limit: 15, search: debouncedSearch, month }),
    select: (d) => d.data,
    enabled: tab === "payroll",
  })

  const { data: employees } = useQuery({
    queryKey: ["employees-simple"],
    queryFn: () => employeeService.getAll({ limit: 100, status: "ACTIVE" }),
    select: (d) => d.data?.employees,
    enabled: tab === "structure",
  })

  const generateMutation = useMutation({
    mutationFn: (payload) => payrollService.generate(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payroll"] })
      toast.success("Salary generated for all employees!")
      setGenerateModal(false)
    },
    onError: (e) => toast.error(e.response?.data?.message || "Generation failed"),
  })

  const markPaidMutation = useMutation({
    mutationFn: (id) => payrollService.markPaid(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payroll"] })
      toast.success("Marked as paid! Employee can now see their salary slip.")
    },
  })

  const overrideMutation = useMutation({
    mutationFn: ({ id, ...payload }) => payrollService.overrideSalary(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payroll"] })
      toast.success("Salary overridden")
      setOverrideModal(null)
    },
  })

  const downloadSlip = async (payrollId, employeeName) => {
    try {
      const res = await payrollService.downloadSlip(payrollId)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement("a")
      link.href = url
      link.download = `salary-slip-${employeeName}-${month}.pdf`
      link.click()
    } catch {
      toast.error("Failed to download slip")
    }
  }

  const payrollList = data?.payrolls || []
  const totalPages = data?.totalPages || 1
  const summary = data?.summary

  return (
    <AdminLayout title="Payroll">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="page-header mb-0">
            <h1 className="page-title">Payroll Management</h1>
            <p className="page-subtitle">Generate, review and disburse employee salaries</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => payrollService.getBankExport({ month }).then(r => {
              const url = window.URL.createObjectURL(new Blob([r.data]))
              const a = document.createElement("a"); a.href = url; a.download = `bank-export-${month}.csv`; a.click()
            })}>
              <Download className="h-4 w-4" /> Bank Export
            </Button>
            <Button size="sm" onClick={() => setGenerateModal(true)}>
              <Play className="h-4 w-4" /> Generate Salary
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl border p-1 bg-muted/40 w-fit">
          {[["payroll", "Payroll List"], ["structure", "Salary Structures"]].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === k ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>
              {l}
            </button>
          ))}
        </div>

        {tab === "payroll" && (
          <>
            {/* Summary cards */}
            {summary && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Total Gross", value: formatCurrency(summary.totalGross), icon: DollarSign, color: "text-blue-600" },
                  { label: "Total Net", value: formatCurrency(summary.totalNet), icon: Wallet, color: "text-green-600" },
                  { label: "Total Deductions", value: formatCurrency(summary.totalDeductions), icon: AlertCircle, color: "text-red-600" },
                  { label: "Paid / Total", value: `${summary.paid}/${summary.total}`, icon: CheckCircle, color: "text-green-600" },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="metric-card">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs text-muted-foreground">{label}</span>
                      <Icon className={`h-4 w-4 ${color}`} />
                    </div>
                    <p className="text-xl font-bold">{value}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <SearchInput placeholder="Search employee..." value={search} onChange={setSearch} className="flex-1" />
              <Input type="month" value={month} onChange={e => setMonth(e.target.value)} className="w-44" />
            </div>

            <div className="rounded-xl border bg-card overflow-hidden">
              <Table>
                <TableHead>
                  <tr>
                    <Th>Employee</Th>
                    <Th>Basic</Th>
                    <Th>Gross</Th>
                    <Th>Deductions</Th>
                    <Th>LOP Days</Th>
                    <Th>Net Salary</Th>
                    <Th>Status</Th>
                    <Th className="text-right">Actions</Th>
                  </tr>
                </TableHead>
                <TableBody>
                  {isLoading ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} cols={8} />) :
                    payrollList.length === 0 ? <EmptyRow colSpan={8} message="No payroll records. Click 'Generate Salary' to start." /> :
                    payrollList.map(p => (
                      <TableRow key={p.id}>
                        <Td>
                          <div className="flex items-center gap-2">
                            <Avatar name={p.employee?.name} size="sm" />
                            <div>
                              <p className="font-medium text-sm">{p.employee?.name}</p>
                              <p className="text-xs text-muted-foreground">{p.employee?.employeeId}</p>
                            </div>
                          </div>
                        </Td>
                        <Td className="text-sm">{formatCurrency(p.basicSalary)}</Td>
                        <Td className="text-sm font-medium">{formatCurrency(p.grossSalary)}</Td>
                        <Td className="text-sm text-red-600">-{formatCurrency(p.totalDeductions)}</Td>
                        <Td className="text-sm">{p.lopDays || 0}</Td>
                        <Td className="font-bold text-green-600">{formatCurrency(p.netSalary)}</Td>
                        <Td><StatusBadge status={p.status === "PAID" ? "Paid" : p.status === "GENERATED" ? "Generated" : "Draft"} /></Td>
                        <Td className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="ghost" onClick={() => setOverrideModal(p)} title="Override salary">
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            {p.status !== "PAID" && (
                              <Button size="sm" variant="success" onClick={() => markPaidMutation.mutate(p.id)} loading={markPaidMutation.isPending}>
                                <CheckCircle className="h-3.5 w-3.5" /> Mark Paid
                              </Button>
                            )}
                            {p.status === "PAID" && (
                              <Button size="sm" variant="outline" onClick={() => downloadSlip(p.id, p.employee?.name)}>
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </Td>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}

        {tab === "structure" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <Card>
                <CardHeader><CardTitle className="text-base">Select Employee</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-1 max-h-[500px] overflow-y-auto scrollbar-thin">
                    {employees?.map(emp => (
                      <button key={emp.id} onClick={() => setStructureEmployee(emp)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${structureEmployee?.id === emp.id ? "bg-primary/10 text-primary" : "hover:bg-muted/50"}`}>
                        <Avatar name={emp.name} size="sm" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{emp.name}</p>
                          <p className="text-xs text-muted-foreground">{emp.employeeId}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="sm:col-span-2">
              {structureEmployee ? (
                <SalaryStructureEmployeePanel employee={structureEmployee} />
              ) : (
                <div className="flex h-64 items-center justify-center rounded-xl border border-dashed text-muted-foreground">
                  <div className="text-center">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Select an employee to manage their salary structure</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Generate Modal */}
      <Modal isOpen={generateModal} onClose={() => setGenerateModal(false)} title="Generate Salary" description="Auto-calculate salaries for all active employees" size="sm">
        <div className="space-y-4">
          <div className="rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 text-sm">
            <p className="font-medium text-yellow-800 dark:text-yellow-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> Important
            </p>
            <p className="text-yellow-700 dark:text-yellow-400 mt-1">
              This will calculate salaries for ALL active employees for the selected month based on attendance, leaves, and LOP data.
            </p>
          </div>
          <div>
            <Label required>Month</Label>
            <Input type="month" value={month} onChange={e => setMonth(e.target.value)} className="mt-1.5" />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setGenerateModal(false)}>Cancel</Button>
            <Button loading={generateMutation.isPending} onClick={() => generateMutation.mutate({ month })}>
              <Play className="h-4 w-4" /> Generate All
            </Button>
          </div>
        </div>
      </Modal>

      {/* Override Modal */}
      {overrideModal && (
        <Modal isOpen onClose={() => setOverrideModal(null)} title="Override Salary" description={`Override net salary for ${overrideModal.employee?.name}`} size="sm">
          <div className="space-y-4">
            <div className="rounded-xl bg-muted/40 p-3 text-sm space-y-1">
              <div className="flex justify-between"><span>Calculated Net:</span><strong>{formatCurrency(overrideModal.netSalary)}</strong></div>
              <div className="flex justify-between text-muted-foreground"><span>Gross:</span><span>{formatCurrency(overrideModal.grossSalary)}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Deductions:</span><span>-{formatCurrency(overrideModal.totalDeductions)}</span></div>
            </div>
            <div>
              <Label required>Override Net Salary (₹)</Label>
              <Input type="number" value={overrideForm.netSalary} onChange={e => setOverrideForm(f => ({ ...f, netSalary: e.target.value }))} placeholder="Enter override amount" className="mt-1.5" />
            </div>
            <div>
              <Label required>Reason</Label>
              <Textarea value={overrideForm.reason} onChange={e => setOverrideForm(f => ({ ...f, reason: e.target.value }))} placeholder="Reason for override..." className="mt-1.5" rows={2} />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setOverrideModal(null)}>Cancel</Button>
              <Button loading={overrideMutation.isPending} onClick={() => overrideMutation.mutate({ id: overrideModal.id, ...overrideForm })}>
                Save Override
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  )
}

function SalaryStructureEmployeePanel({ employee }) {
  const { toast } = useToast()
  const [structure, setStructure] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ["salary-structure", employee.id],
    queryFn: () => payrollService.getStructure(employee.id),
    select: d => d.data,
    onSuccess: d => setStructure(d),
  })

  const saveMutation = useMutation({
    mutationFn: (payload) => payrollService.saveStructure(employee.id, payload),
    onSuccess: () => toast.success("Salary structure saved!"),
    onError: e => toast.error(e.response?.data?.message || "Failed to save"),
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar name={employee.name} size="sm" />
            <div>
              <CardTitle className="text-base">{employee.name}</CardTitle>
              <p className="text-xs text-muted-foreground">{employee.employeeId}</p>
            </div>
          </div>
          <Button size="sm" loading={saveMutation.isPending} onClick={() => structure && saveMutation.mutate(structure)}>
            Save Structure
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? <div className="shimmer h-48 rounded-lg" /> : (
          <SalaryStructureBuilder
            basicSalary={data?.basicSalary || 0}
            components={data?.components || []}
            onChange={setStructure}
          />
        )}
      </CardContent>
    </Card>
  )
}
