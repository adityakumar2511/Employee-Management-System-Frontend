"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Select } from "@/components/ui/Select"
import { employeeService } from "@/services/employee.service"
import { useEffect } from "react"

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  departmentId: z.string().min(1),
  designation: z.string().min(1),
  joiningDate: z.string().min(1),
  gender: z.string().optional(),
  address: z.string().optional(),
})

export default function EditEmployeeModal({ employee, onClose, onSuccess }) {
  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: () => employeeService.getDepartments(),
    select: (d) => d.data,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    reset({
      name: employee.name,
      email: employee.email,
      phone: employee.phone || "",
      departmentId: employee.departmentId || employee.department?.id || "",
      designation: employee.designation || "",
      joiningDate: employee.joiningDate ? employee.joiningDate.split("T")[0] : "",
      gender: employee.gender || "",
      address: employee.address || "",
    })
  }, [employee, reset])

  const mutation = useMutation({
    mutationFn: (data) => employeeService.update(employee.id, data),
    onSuccess,
  })

  return (
    <Modal isOpen onClose={onClose} title="Edit Employee" size="md">
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label required>Full Name</Label>
            <Input {...register("name")} className="mt-1.5" />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>
          <div>
            <Label required>Email</Label>
            <Input type="email" {...register("email")} className="mt-1.5" />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>
          <div>
            <Label required>Phone</Label>
            <Input {...register("phone")} className="mt-1.5" />
          </div>
          <div>
            <Label required>Joining Date</Label>
            <Input type="date" {...register("joiningDate")} className="mt-1.5" />
          </div>
          <div>
            <Label required>Department</Label>
            <Select {...register("departmentId")} className="mt-1.5">
              <option value="">Select department</option>
              {departments?.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          </div>
          <div>
            <Label required>Designation</Label>
            <Input {...register("designation")} className="mt-1.5" />
          </div>
          <div>
            <Label>Gender</Label>
            <Select {...register("gender")} className="mt-1.5">
              <option value="">Select</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </Select>
          </div>
          <div>
            <Label>Address</Label>
            <Input {...register("address")} placeholder="City, State" className="mt-1.5" />
          </div>
        </div>

        {mutation.error && (
          <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
            {mutation.error.response?.data?.message || "Failed to update employee"}
          </p>
        )}

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
          <Button type="submit" loading={mutation.isPending}>Save Changes</Button>
        </div>
      </form>
    </Modal>
  )
}
