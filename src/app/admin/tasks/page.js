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
import { Table, TableHead, TableBody, TableRow, Th, Td, EmptyRow } from "@/components/ui/Table"
import { Pagination } from "@/components/ui/Pagination"
import { SkeletonRow } from "@/components/ui/Spinner"
import { taskService } from "@/services/task.service"
import { employeeService } from "@/services/employee.service"
import { useToast } from "@/hooks/useToast"
import { useDebounce } from "@/hooks/useDebounce"
import { formatDate } from "@/lib/utils"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Edit, Trash2, Eye, AlertTriangle, MoreHorizontal } from "lucide-react"
import { Dropdown, DropdownItem, DropdownSeparator } from "@/components/ui/Dropdown"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"

const taskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  assignedToId: z.string().min(1, "Assign to an employee"),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
  deadline: z.string().min(1, "Set a deadline"),
})

export default function TasksPage() {
  const { toast } = useToast()
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("")
  const [addModal, setAddModal] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [viewTask, setViewTask] = useState(null)
  const [deleteTask, setDeleteTask] = useState(null)
  const debouncedSearch = useDebounce(search)

  const { data, isLoading } = useQuery({
    queryKey: ["tasks-admin", page, debouncedSearch, statusFilter, priorityFilter],
    queryFn: () => taskService.getAll({ page, limit: 15, search: debouncedSearch, status: statusFilter, priority: priorityFilter }),
    select: d => d.data,
  })

  const { data: employees } = useQuery({
    queryKey: ["employees-simple"],
    queryFn: () => employeeService.getAll({ limit: 200, status: "ACTIVE" }),
    select: d => d.data?.employees,
  })

  const createMutation = useMutation({
    mutationFn: taskService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks-admin"] }); toast.success("Task created and employee notified!"); setAddModal(false) },
    onError: e => toast.error(e.response?.data?.message || "Failed to create task"),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => taskService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks-admin"] }); toast.success("Task updated"); setEditTask(null) },
  })

  const deleteMutation = useMutation({
    mutationFn: taskService.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks-admin"] }); toast.success("Task deleted"); setDeleteTask(null) },
  })

  const tasks = data?.tasks || []
  const totalPages = data?.totalPages || 1

  const priorityColors = { HIGH: "text-red-600 bg-red-50", MEDIUM: "text-yellow-600 bg-yellow-50", LOW: "text-green-600 bg-green-50" }
  const statusColors = { Pending: "text-yellow-600", "In Progress": "text-blue-600", Completed: "text-green-600", Overdue: "text-red-600" }

  return (
    <AdminLayout title="Tasks">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="page-header mb-0">
            <h1 className="page-title">Task Management</h1>
            <p className="page-subtitle">Assign tasks, track progress, monitor completion</p>
          </div>
          <Button size="sm" onClick={() => setAddModal(true)}>
            <Plus className="h-4 w-4" /> Create Task
          </Button>
        </div>

        {/* Stats row */}
        {data?.stats && (
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Pending", value: data.stats.pending, color: "text-yellow-600" },
              { label: "In Progress", value: data.stats.inProgress, color: "text-blue-600" },
              { label: "Completed", value: data.stats.completed, color: "text-green-600" },
              { label: "Overdue", value: data.stats.overdue, color: "text-red-600" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-xl border bg-card p-3 text-center">
                <p className={`text-2xl font-bold ${color}`}>{value || 0}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <SearchInput placeholder="Search tasks..." value={search} onChange={setSearch} className="flex-1" />
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-36">
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="OVERDUE">Overdue</option>
          </Select>
          <Select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="w-32">
            <option value="">All Priority</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </Select>
        </div>

        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHead>
              <tr>
                <Th>Task</Th>
                <Th>Assigned To</Th>
                <Th>Priority</Th>
                <Th>Deadline</Th>
                <Th>Progress</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </TableHead>
            <TableBody>
              {isLoading ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} cols={7} />) :
                tasks.length === 0 ? <EmptyRow colSpan={7} message="No tasks found" /> :
                tasks.map(task => (
                  <TableRow key={task.id}>
                    <Td>
                      <p className="font-medium text-sm">{task.title}</p>
                      {task.description && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{task.description}</p>}
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <Avatar name={task.assignedTo?.name} size="xs" />
                        <span className="text-sm">{task.assignedTo?.name}</span>
                      </div>
                    </Td>
                    <Td>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityColors[task.priority] || ""}`}>
                        {task.priority}
                      </span>
                    </Td>
                    <Td>
                      <span className={`text-sm ${new Date(task.deadline) < new Date() && task.status !== "COMPLETED" ? "text-red-600 font-medium" : ""}`}>
                        {formatDate(task.deadline)}
                      </span>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${task.completionPercent || 0}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{task.completionPercent || 0}%</span>
                      </div>
                    </Td>
                    <Td><StatusBadge status={task.status?.replace("_", " ")} /></Td>
                    <Td className="text-right">
                      <Dropdown align="right" trigger={<Button variant="ghost" size="icon-sm"><MoreHorizontal className="h-4 w-4" /></Button>}>
                        <DropdownItem onClick={() => setViewTask(task)}><Eye className="h-4 w-4" />View Details</DropdownItem>
                        <DropdownItem onClick={() => setEditTask(task)}><Edit className="h-4 w-4" />Edit</DropdownItem>
                        <DropdownSeparator />
                        <DropdownItem danger onClick={() => setDeleteTask(task)}><Trash2 className="h-4 w-4" />Delete</DropdownItem>
                      </Dropdown>
                    </Td>
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end"><Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} /></div>
      </div>

      <TaskFormModal
        isOpen={addModal}
        onClose={() => setAddModal(false)}
        employees={employees || []}
        onSubmit={data => createMutation.mutate(data)}
        loading={createMutation.isPending}
      />
      {editTask && (
        <TaskFormModal
          isOpen
          onClose={() => setEditTask(null)}
          employees={employees || []}
          defaultValues={editTask}
          onSubmit={data => updateMutation.mutate({ id: editTask.id, ...data })}
          loading={updateMutation.isPending}
          isEdit
        />
      )}
      {viewTask && (
        <Modal isOpen onClose={() => setViewTask(null)} title="Task Details" size="md">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div><h3 className="font-semibold">{viewTask.title}</h3>
                {viewTask.description && <p className="text-sm text-muted-foreground mt-1">{viewTask.description}</p>}
              </div>
              <StatusBadge status={viewTask.status?.replace("_", " ")} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Assigned To:</span><p className="font-medium">{viewTask.assignedTo?.name}</p></div>
              <div><span className="text-muted-foreground">Priority:</span><p className="font-medium">{viewTask.priority}</p></div>
              <div><span className="text-muted-foreground">Deadline:</span><p className="font-medium">{formatDate(viewTask.deadline)}</p></div>
              <div><span className="text-muted-foreground">Progress:</span><p className="font-medium">{viewTask.completionPercent || 0}%</p></div>
            </div>
            {viewTask.incompletionReason && (
              <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-3 text-sm">
                <p className="font-medium text-yellow-800 dark:text-yellow-300">Incomplete Reason:</p>
                <p className="text-yellow-700 dark:text-yellow-400">{viewTask.incompletionReason}</p>
              </div>
            )}
            {viewTask.comments?.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Comments</p>
                <div className="space-y-2">
                  {viewTask.comments.map((c, i) => (
                    <div key={i} className="rounded-lg bg-muted/40 p-2 text-sm">
                      <p className="font-medium text-xs text-muted-foreground">{c.author} • {formatDate(c.createdAt, "DD MMM, hh:mm")}</p>
                      <p>{c.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
      <ConfirmDialog
        isOpen={!!deleteTask} onClose={() => setDeleteTask(null)}
        onConfirm={() => deleteMutation.mutate(deleteTask?.id)} loading={deleteMutation.isPending}
        title="Delete Task" message={`Delete "${deleteTask?.title}"? This cannot be undone.`} confirmLabel="Delete"
      />
    </AdminLayout>
  )
}

function TaskFormModal({ isOpen, onClose, employees, defaultValues, onSubmit, loading, isEdit }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: defaultValues ? {
      ...defaultValues,
      assignedToId: defaultValues.assignedToId || defaultValues.assignedTo?.id || "",
      deadline: defaultValues.deadline ? defaultValues.deadline.split("T")[0] : "",
    } : { priority: "MEDIUM" },
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Task" : "Create Task"} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label required>Task Title</Label>
          <Input placeholder="e.g. Complete Q3 report" {...register("title")} className="mt-1.5" />
          {errors.title && <p className="form-error">{errors.title.message}</p>}
        </div>
        <div>
          <Label>Description</Label>
          <Textarea placeholder="Detailed task description..." {...register("description")} className="mt-1.5" rows={3} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label required>Assign To</Label>
            <Select {...register("assignedToId")} className="mt-1.5">
              <option value="">Select employee</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </Select>
            {errors.assignedToId && <p className="form-error">{errors.assignedToId.message}</p>}
          </div>
          <div>
            <Label required>Priority</Label>
            <Select {...register("priority")} className="mt-1.5">
              <option value="HIGH">🔴 High</option>
              <option value="MEDIUM">🟡 Medium</option>
              <option value="LOW">🟢 Low</option>
            </Select>
          </div>
        </div>
        <div>
          <Label required>Deadline</Label>
          <Input type="date" {...register("deadline")} className="mt-1.5" />
          {errors.deadline && <p className="form-error">{errors.deadline.message}</p>}
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
          <Button type="submit" loading={loading}>{isEdit ? "Save Changes" : "Create & Notify"}</Button>
        </div>
      </form>
    </Modal>
  )
}
