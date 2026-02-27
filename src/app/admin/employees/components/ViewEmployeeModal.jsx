"use client"
import { useQuery } from "@tanstack/react-query"
import { Modal } from "@/components/ui/Modal"
import { Avatar } from "@/components/ui/Avatar"
import { StatusBadge, Badge } from "@/components/ui/Badge"
import { PageLoader } from "@/components/ui/Spinner"
import { employeeService } from "@/services/employee.service"
import { formatDate, formatCurrency } from "@/lib/utils"
import { Phone, Mail, MapPin, Calendar, Briefcase, CreditCard, FileText } from "lucide-react"

export default function ViewEmployeeModal({ employee, onClose }) {
  const { data: detail, isLoading } = useQuery({
    queryKey: ["employee", employee.id],
    queryFn: () => employeeService.getById(employee.id),
    select: (d) => d.data,
  })

  const emp = detail || employee

  return (
    <Modal isOpen onClose={onClose} title="Employee Profile" size="lg">
      {isLoading ? (
        <PageLoader />
      ) : (
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/40">
            <Avatar name={emp.name} size="xl" src={emp.avatar} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{emp.name}</h2>
                <StatusBadge status={emp.status === "ACTIVE" ? "Active" : "Inactive"} />
              </div>
              <p className="text-muted-foreground">{emp.designation}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="font-mono text-xs bg-background border px-2 py-0.5 rounded">{emp.employeeId}</span>
                <span className="text-xs text-muted-foreground">{emp.department?.name}</span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <InfoItem icon={Mail} label="Email" value={emp.email} />
            <InfoItem icon={Phone} label="Phone" value={emp.phone} />
            <InfoItem icon={Calendar} label="Joining Date" value={formatDate(emp.joiningDate)} />
            <InfoItem icon={Briefcase} label="Department" value={emp.department?.name} />
            {emp.address && <InfoItem icon={MapPin} label="Address" value={emp.address} className="col-span-2" />}
          </div>

          {/* Documents */}
          {emp.documents?.length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-2">Documents</p>
              <div className="grid grid-cols-2 gap-2">
                {emp.documents.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-lg border p-2.5 hover:bg-muted/50 transition-colors text-sm"
                  >
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="truncate">{doc.name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}

function InfoItem({ icon: Icon, label, value, className }) {
  return (
    <div className={`flex items-start gap-2.5 ${className}`}>
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted flex-shrink-0 mt-0.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value || "—"}</p>
      </div>
    </div>
  )
}
