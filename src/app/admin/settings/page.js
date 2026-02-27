"use client"
import { useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import AdminLayout from "@/components/layout/AdminLayout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Select } from "@/components/ui/Select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { settingsService } from "@/services/settings.service"
import { useToast } from "@/hooks/useToast"
import { formatDate } from "@/lib/utils"
import { Building, Calendar, Trash2, Plus, Save } from "lucide-react"
import { Table, TableHead, TableBody, TableRow, Th, Td, EmptyRow } from "@/components/ui/Table"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import dayjs from "dayjs"

export default function SettingsPage() {
  const { toast } = useToast()
  const [tab, setTab] = useState("company")
  const [year, setYear] = useState(new Date().getFullYear())
  const [newHoliday, setNewHoliday] = useState({ name: "", date: "", type: "NATIONAL" })
  const [deleteHoliday, setDeleteHoliday] = useState(null)

  const { data: company, isLoading } = useQuery({
    queryKey: ["company-settings"],
    queryFn: settingsService.getCompany,
    select: d => d.data,
  })

  const [companyForm, setCompanyForm] = useState({})
  const { data: holidays } = useQuery({
    queryKey: ["holidays", year],
    queryFn: () => settingsService.getHolidayList(year),
    select: d => d.data,
    enabled: tab === "holidays",
  })

  const updateCompanyMutation = useMutation({
    mutationFn: settingsService.updateCompany,
    onSuccess: () => toast.success("Company settings saved!"),
    onError: e => toast.error(e.response?.data?.message || "Failed to save"),
  })

  const addHolidayMutation = useMutation({
    mutationFn: settingsService.addHoliday,
    onSuccess: () => { toast.success("Holiday added!"); setNewHoliday({ name: "", date: "", type: "NATIONAL" }) },
  })

  const deleteHolidayMutation = useMutation({
    mutationFn: settingsService.deleteHoliday,
    onSuccess: () => { toast.success("Holiday deleted"); setDeleteHoliday(null) },
  })

  const tabs = [["company", "Company", Building], ["holidays", "Holidays", Calendar]]

  return (
    <AdminLayout title="Settings">
      <div className="space-y-5">
        <div className="page-header">
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Configure your organization settings</p>
        </div>

        <div className="flex rounded-xl border p-1 bg-muted/40 w-fit">
          {tabs.map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === k ? "bg-background shadow-sm" : "text-muted-foreground"}`}>
              {l}
            </button>
          ))}
        </div>

        {tab === "company" && (
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Basic organization details shown across the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                {[
                  { key: "name", label: "Company Name", placeholder: "Acme Corp" },
                  { key: "website", label: "Website", placeholder: "https://company.com" },
                  { key: "email", label: "Contact Email", placeholder: "hr@company.com" },
                  { key: "phone", label: "Contact Phone", placeholder: "+91 9876543210" },
                  { key: "address", label: "Registered Address", placeholder: "City, State, Country" },
                  { key: "employeeIdPrefix", label: "Employee ID Prefix", placeholder: "EMP" },
                  { key: "workingDaysPerMonth", label: "Working Days / Month", placeholder: "26", type: "number" },
                  { key: "financialYearStart", label: "Financial Year Start Month", placeholder: "4 (April)" },
                ].map(({ key, label, placeholder, type }) => (
                  <div key={key}>
                    <Label>{label}</Label>
                    <Input
                      type={type || "text"}
                      placeholder={placeholder}
                      defaultValue={company?.[key] || ""}
                      onChange={e => setCompanyForm(f => ({ ...f, [key]: e.target.value }))}
                      className="mt-1.5"
                    />
                  </div>
                ))}
              </div>
              <Button className="mt-5" loading={updateCompanyMutation.isPending}
                onClick={() => updateCompanyMutation.mutate({ ...company, ...companyForm })}>
                <Save className="h-4 w-4" /> Save Settings
              </Button>
            </CardContent>
          </Card>
        )}

        {tab === "holidays" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Add Holiday</CardTitle>
                <CardDescription>Add national, state, or company-specific holidays</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <Label required>Holiday Name</Label>
                    <Input placeholder="e.g. Republic Day, Diwali" value={newHoliday.name}
                      onChange={e => setNewHoliday(f => ({ ...f, name: e.target.value }))} className="mt-1.5" />
                  </div>
                  <div className="w-44">
                    <Label required>Date</Label>
                    <Input type="date" value={newHoliday.date}
                      onChange={e => setNewHoliday(f => ({ ...f, date: e.target.value }))} className="mt-1.5" />
                  </div>
                  <div className="w-36">
                    <Label>Type</Label>
                    <Select value={newHoliday.type} onChange={e => setNewHoliday(f => ({ ...f, type: e.target.value }))} className="mt-1.5">
                      <option value="NATIONAL">National</option>
                      <option value="STATE">State</option>
                      <option value="COMPANY">Company</option>
                    </Select>
                  </div>
                  <Button onClick={() => addHolidayMutation.mutate(newHoliday)} disabled={!newHoliday.name || !newHoliday.date} loading={addHolidayMutation.isPending}>
                    <Plus className="h-4 w-4" /> Add
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Holiday List {year}</CardTitle>
                  <Input type="number" value={year} onChange={e => setYear(parseInt(e.target.value))} className="w-24 h-8 text-center" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHead><tr><Th>Holiday</Th><Th>Date</Th><Th>Day</Th><Th>Type</Th><Th className="text-right">Action</Th></tr></TableHead>
                  <TableBody>
                    {holidays?.length === 0 ? <EmptyRow colSpan={5} message="No holidays configured" /> :
                      holidays?.map(h => (
                        <TableRow key={h.id}>
                          <Td className="font-medium text-sm">{h.name}</Td>
                          <Td className="text-sm">{formatDate(h.date)}</Td>
                          <Td className="text-sm text-muted-foreground">{dayjs(h.date).format("dddd")}</Td>
                          <Td><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            h.type === "NATIONAL" ? "bg-blue-100 text-blue-700" :
                            h.type === "STATE" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"
                          }`}>{h.type}</span></Td>
                          <Td className="text-right">
                            <Button variant="ghost" size="icon-sm" onClick={() => setDeleteHoliday(h)}>
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </Td>
                        </TableRow>
                      ))
                    }
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteHoliday} onClose={() => setDeleteHoliday(null)}
        onConfirm={() => deleteHolidayMutation.mutate(deleteHoliday?.id)} loading={deleteHolidayMutation.isPending}
        title="Delete Holiday" message={`Delete "${deleteHoliday?.name}"?`} confirmLabel="Delete"
      />
    </AdminLayout>
  )
}
