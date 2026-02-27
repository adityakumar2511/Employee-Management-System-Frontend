"use client"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import EmployeeLayout from "@/components/layout/EmployeeLayout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Select } from "@/components/ui/Select"
import { Textarea } from "@/components/ui/Textarea"
import { StatusBadge, Badge } from "@/components/ui/Badge"
import { Modal } from "@/components/ui/Modal"
import { Card, CardContent } from "@/components/ui/Card"
import { Table, TableHead, TableBody, TableRow, Th, Td, EmptyRow } from "@/components/ui/Table"
import { SkeletonRow } from "@/components/ui/Spinner"
import { taskService } from "@/services/task.service"
import { useToast } from "@/hooks/useToast"
import { formatDate } from "@/lib/utils"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, ChevronUp, MessageSquare } from "lucide-react"
import dayjs from "dayjs"

export default function EmployeeTasksPage() {
  const { toast } = useToast()
  const qc = useQueryClient()
  const [statusFilter, setStatusFilter] = useState("")
  const [progressModal, setProgressModal] = useState(null)
  const [selfTaskModal, setSelfTaskModal] = useState(false)
  const [progress, setProgress] = useState({ completionPercent: 0, incompletionReason: "" })

  const { data: myTasks, isLoading } = useQuery({
    queryKey: ["my-tasks", statusFilter],
    queryFn: () => taskService.getMyTasks({ status: statusFilter, limit: 50 }),
    select: d => d.data?.tasks,
  })

  const updateProgressMutation = useMutation({
    mutationFn: ({ id, ...data }) => taskService.updateProgress(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-tasks"] })
      toast.success("Task progress updated!")
      setProgressModal(null)
    },
    onError: e => toast.error(e.response?.data?.message || "Failed to update"),
  })

  const selfTaskSchema = z.object({
    title: z.string().min(3),
    description: z.string().optional(),
    priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
    deadline: z.string().min(1),
  })

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(selfTaskSchema),
    defaultValues: { priority: "MEDIUM" },
  })

  const selfTaskMutation = useMutation({
    mutationFn: data => taskService.create({ ...data, isSelfAssigned: true }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["my-tasks"] }); toast.success("Self-assigned task added!"); setSelfTaskModal(false) },
  })

  const tasks = myTasks || []
  const overdue = tasks.filter(t => t.status !== "COMPLETED" && new Date(t.deadline) < new Date()).length
  const pending = tasks.filter(t => t.status === "PENDING").length
  const inProgress = tasks.filter(t => t.status === "IN_PROGRESS").length
  const completed = tasks.filter(t => t.status === "COMPLETED").length

  const priorityColors = { HIGH: "bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800", MEDIUM: "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800", LOW: "bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800" }
  const priorityDot = { HIGH: "bg-red-500", MEDIUM: "bg-yellow-500", LOW: "bg-green-500" }

  return (
    <EmployeeLayout title="My Tasks">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="page-header mb-0">
            <h1 className="page-title">My Tasks</h1>
            <p className="page-subtitle">Track your assigned tasks and update progress</p>
          </div>
          <Button size="sm" onClick={() => setSelfTaskModal(true)}>
            <Plus className="h-4 w-4" /> Add Self Task
          </Button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Pending", value: pending, color: "text-yellow-600" },
            { label: "In Progress", value: inProgress, color: "text-blue-600" },
            { label: "Completed", value: completed, color: "text-green-600" },
            { label: "Overdue", value: overdue, color: "text-red-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl border bg-card p-3 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => setStatusFilter(label.replace(" ", "_").toUpperCase())}>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-40">
            <option value="">All Tasks</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="OVERDUE">Overdue</option>
          </Select>
        </div>

        {/* Task Cards */}
        <div className="space-y-3">
          {isLoading ? Array.from({length:4}).map((_,i) => (
            <div key={i} className="shimmer h-24 rounded-xl" />
          )) : tasks.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
              <span className="text-4xl">✅</span>
              <p className="font-medium">No tasks found</p>
            </div>
          ) : (
            tasks.map(task => {
              const isOverdue = task.status !== "COMPLETED" && new Date(task.deadline) < new Date()
              return (
                <div key={task.id} className={`rounded-xl border p-4 transition-colors hover:shadow-sm ${priorityColors[task.priority] || ""}`}>
                  <div className="flex items-start gap-3">
                    <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 mt-1.5 ${priorityDot[task.priority] || "bg-gray-400"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{task.title}</p>
                            {task.isSelfAssigned && <Badge variant="secondary" className="text-xs">Self</Badge>}
                          </div>
                          {task.description && <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <StatusBadge status={task.status?.replace("_", " ")} />
                          {isOverdue && <Badge variant="destructive" className="text-xs">Overdue</Badge>}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-2 flex-1">
                          <div className="flex-1 h-1.5 rounded-full bg-white/70 dark:bg-black/20 overflow-hidden">
                            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${task.completionPercent || 0}%` }} />
                          </div>
                          <span className="text-xs font-medium">{task.completionPercent || 0}%</span>
                        </div>
                        <p className={`text-xs ${isOverdue ? "text-red-600 font-medium" : "text-muted-foreground"}`}>
                          Due: {formatDate(task.deadline)}
                        </p>
                        {task.status !== "COMPLETED" && (
                          <Button size="sm" variant="outline" onClick={() => { setProgressModal(task); setProgress({ completionPercent: task.completionPercent || 0, incompletionReason: "" }) }}>
                            <ChevronUp className="h-3.5 w-3.5" /> Update
                          </Button>
                        )}
                      </div>

                      {task.incompletionReason && (
                        <p className="text-xs text-muted-foreground mt-1 italic">Reason: {task.incompletionReason}</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Progress Update Modal */}
      {progressModal && (
        <Modal isOpen onClose={() => setProgressModal(null)} title="Update Task Progress" size="sm">
          <div className="space-y-4">
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="text-sm font-medium">{progressModal.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Due: {formatDate(progressModal.deadline)}</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label required>Completion Percentage</Label>
                <span className="text-lg font-bold text-primary">{progress.completionPercent}%</span>
              </div>
              <input type="range" min="0" max="100" step="5" value={progress.completionPercent}
                onChange={e => setProgress(p => ({ ...p, completionPercent: parseInt(e.target.value) }))}
                className="w-full accent-primary" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0%</span><span>50%</span><span>100%</span>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[0, 25, 50, 75, 100].map(v => (
                <button key={v} onClick={() => setProgress(p => ({ ...p, completionPercent: v }))}
                  className={`rounded-lg py-1.5 text-xs font-medium transition-colors border ${progress.completionPercent === v ? "bg-primary text-white border-primary" : "hover:bg-muted border-input"}`}>
                  {v}%
                </button>
              ))}
            </div>
            {progress.completionPercent < 100 && (
              <div>
                <Label>Reason for Incomplete {progress.completionPercent < 100 && progress.completionPercent > 0 && "(optional)"}</Label>
                <Textarea value={progress.incompletionReason} onChange={e => setProgress(p => ({ ...p, incompletionReason: e.target.value }))}
                  placeholder="Explain why task is not fully completed..." className="mt-1.5" rows={2} />
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setProgressModal(null)}>Cancel</Button>
              <Button loading={updateProgressMutation.isPending}
                onClick={() => updateProgressMutation.mutate({ id: progressModal.id, ...progress })}>
                Save Progress
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Self Task Modal */}
      <Modal isOpen={selfTaskModal} onClose={() => setSelfTaskModal(false)} title="Add Self-Assigned Task" description="Tasks you add are visible to admin" size="sm">
        <form onSubmit={handleSubmit(d => selfTaskMutation.mutate(d))} className="space-y-4">
          <div>
            <Label required>Task Title</Label>
            <Input placeholder="What do you want to accomplish?" {...register("title")} className="mt-1.5" />
            {errors.title && <p className="form-error">{errors.title.message}</p>}
          </div>
          <div>
            <Label>Description</Label>
            <Textarea placeholder="Additional details..." {...register("description")} className="mt-1.5" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label required>Priority</Label>
              <Select {...register("priority")} className="mt-1.5">
                <option value="HIGH">🔴 High</option>
                <option value="MEDIUM">🟡 Medium</option>
                <option value="LOW">🟢 Low</option>
              </Select>
            </div>
            <div>
              <Label required>Deadline</Label>
              <Input type="date" {...register("deadline")} className="mt-1.5" min={new Date().toISOString().split("T")[0]} />
              {errors.deadline && <p className="form-error">{errors.deadline.message}</p>}
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setSelfTaskModal(false)} type="button">Cancel</Button>
            <Button type="submit" loading={selfTaskMutation.isPending}><Plus className="h-4 w-4" /> Add Task</Button>
          </div>
        </form>
      </Modal>
    </EmployeeLayout>
  )
}
