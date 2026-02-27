"use client"
import { useState, useRef } from "react"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { employeeService } from "@/services/employee.service"
import { useMutation } from "@tanstack/react-query"
import { Upload, Download, FileSpreadsheet, CheckCircle, X } from "lucide-react"

export default function BulkImportModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const inputRef = useRef(null)

  const importMutation = useMutation({
    mutationFn: (formData) => employeeService.bulkImport(formData),
    onSuccess: (data) => {
      setPreview(data.data)
    },
  })

  const handleFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(null)
  }

  const handleUpload = () => {
    if (!file) return
    const formData = new FormData()
    formData.append("file", file)
    importMutation.mutate(formData)
  }

  const handleDownloadTemplate = async () => {
    try {
      const response = await employeeService.downloadTemplate()
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.download = "employee-bulk-import-template.xlsx"
      link.click()
    } catch (e) {
      console.error(e)
    }
  }

  if (preview?.success) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Import Complete" size="md">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-7 w-7 text-green-600" />
          </div>
          <div>
            <p className="text-lg font-semibold">Import Successful!</p>
            <p className="text-sm text-muted-foreground mt-1">
              {preview.created} employees created. Welcome emails sent automatically.
            </p>
          </div>
          {preview.errors?.length > 0 && (
            <div className="w-full rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-left">
              <p className="text-xs font-medium text-red-700 mb-1">Errors ({preview.errors.length} rows skipped):</p>
              {preview.errors.map((err, i) => (
                <p key={i} className="text-xs text-red-600">Row {err.row}: {err.message}</p>
              ))}
            </div>
          )}
          <Button onClick={onSuccess} className="w-full">Done</Button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bulk Import Employees" description="Upload Excel file to create multiple employees at once" size="md">
      <div className="space-y-4">
        {/* Download template */}
        <div className="flex items-center justify-between rounded-xl border border-dashed p-4 bg-muted/30">
          <div>
            <p className="text-sm font-medium">Download Template</p>
            <p className="text-xs text-muted-foreground">Fill in employee data using our Excel template</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
            <Download className="h-4 w-4" />
            Template
          </Button>
        </div>

        {/* File upload */}
        <div
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors hover:border-primary/50 hover:bg-primary/5 ${
            file ? "border-primary/50 bg-primary/5" : ""
          }`}
        >
          {file ? (
            <div className="flex flex-col items-center gap-2">
              <FileSpreadsheet className="h-10 w-10 text-green-600" />
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="text-xs text-destructive hover:underline"
              >
                Remove file
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm font-medium">Click to upload Excel file</p>
              <p className="text-xs text-muted-foreground">.xlsx or .csv files supported</p>
            </div>
          )}
        </div>
        <input ref={inputRef} type="file" accept=".xlsx,.csv" className="hidden" onChange={handleFile} />

        {importMutation.error && (
          <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
            {importMutation.error.response?.data?.message || "Import failed"}
          </p>
        )}

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleUpload} disabled={!file} loading={importMutation.isPending}>
            <Upload className="h-4 w-4" />
            Import & Send Emails
          </Button>
        </div>
      </div>
    </Modal>
  )
}
