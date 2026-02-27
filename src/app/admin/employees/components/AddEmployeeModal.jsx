"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Select } from "@/components/ui/Select"
import { Textarea } from "@/components/ui/Textarea"
import { employeeService } from "@/services/employee.service"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Eye, EyeOff, RefreshCw } from "lucide-react"

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(10, "Enter a valid phone number"),
  departmentId: z.string().min(1, "Select a department"),
  designation: z.string().min(1, "Enter designation"),
  joiningDate: z.string().min(1, "Select joining date"),
  passwordMode: z.enum(["auto", "manual"]),
  password: z.string().optional(),
  employeeIdPrefix: z.string().optional(),
  basicSalary: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  address: z.string().optional(),
})

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%"
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
}

export default function AddEmployeeModal({ isOpen, onClose, onSuccess }) {
  const [showPassword, setShowPassword] = useState(false)

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: () => employeeService.getDepartments(),
    select: (d) => d.data,
    enabled: isOpen,
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { passwordMode: "auto", joiningDate: new Date().toISOString().split("T")[0] },
  })

  const passwordMode = watch("passwordMode")

  const mutation = useMutation({
    mutationFn: (data) => employeeService.create(data),
    onSuccess,
  })

  const onSubmit = (data) => {
    const payload = {
      ...data,
      basicSalary: data.basicSalary ? parseFloat(data.basicSalary) : undefined,
    }
    mutation.mutate(payload)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Employee" description="Employee will receive welcome email with login credentials" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <Label required>Full Name</Label>
            <Input placeholder="John Doe" {...register("name")} error={errors.name} className="mt-1.5" />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Label required>Email Address</Label>
            <Input type="email" placeholder="john@company.com" {...register("email")} error={errors.email} className="mt-1.5" />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Label required>Phone Number</Label>
            <Input placeholder="+91 9876543210" {...register("phone")} error={errors.phone} className="mt-1.5" />
            {errors.phone && <p className="form-error">{errors.phone.message}</p>}
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Label required>Joining Date</Label>
            <Input type="date" {...register("joiningDate")} error={errors.joiningDate} className="mt-1.5" />
            {errors.joiningDate && <p className="form-error">{errors.joiningDate.message}</p>}
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Label required>Department</Label>
            <Select {...register("departmentId")} error={errors.departmentId} className="mt-1.5">
              <option value="">Select department</option>
              {departments?.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </Select>
            {errors.departmentId && <p className="form-error">{errors.departmentId.message}</p>}
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Label required>Designation</Label>
            <Input placeholder="Software Engineer" {...register("designation")} error={errors.designation} className="mt-1.5" />
            {errors.designation && <p className="form-error">{errors.designation.message}</p>}
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Label>Gender</Label>
            <Select {...register("gender")} className="mt-1.5">
              <option value="">Select gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </Select>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Label>Basic Salary (₹)</Label>
            <Input type="number" placeholder="Enter basic salary" {...register("basicSalary")} className="mt-1.5" />
          </div>
        </div>

        {/* Password Setup */}
        <div className="rounded-xl border p-4 space-y-3">
          <p className="text-sm font-semibold">Password Setup</p>
          <div className="flex gap-4">
            {["auto", "manual"].map((mode) => (
              <label key={mode} className={`flex-1 flex items-center gap-2.5 cursor-pointer rounded-lg border p-3 transition-colors ${
                passwordMode === mode ? "border-primary bg-primary/5" : "hover:bg-muted/50"
              }`}>
                <input type="radio" value={mode} {...register("passwordMode")} className="sr-only" />
                <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                  passwordMode === mode ? "border-primary" : "border-muted-foreground"
                }`}>
                  {passwordMode === mode && <div className="h-2 w-2 rounded-full bg-primary" />}
                </div>
                <div>
                  <p className="text-xs font-medium">{mode === "auto" ? "Auto Generate" : "Manual Set"}</p>
                  <p className="text-xs text-muted-foreground">
                    {mode === "auto" ? "System creates random strong password" : "You set the password"}
                  </p>
                </div>
              </label>
            ))}
          </div>

          {passwordMode === "manual" && (
            <div>
              <Label required>Password</Label>
              <div className="relative mt-1.5">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  {...register("password")}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => setValue("password", generatePassword())}
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                    title="Generate random password"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {mutation.error && (
          <p className="text-sm text-destructive rounded-lg bg-destructive/10 px-3 py-2">
            {mutation.error.response?.data?.message || "Failed to add employee"}
          </p>
        )}

        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={mutation.isPending}>Add Employee & Send Email</Button>
        </div>
      </form>
    </Modal>
  )
}
