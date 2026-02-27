"use client"
import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { formatCurrency } from "@/lib/utils"
import { Plus, Trash2, GripVertical, Calculator } from "lucide-react"

const EMPTY_COMPONENT = {
  name: "",
  type: "EARNING",
  calculationType: "FIXED",
  value: "",
}

export default function SalaryStructureBuilder({ 
  basicSalary = 0,
  components = [],
  onChange,
  readonly = false
}) {
  const [basic, setBasic] = useState(basicSalary)
  const [comps, setComps] = useState(components)
  const [workingDays, setWorkingDays] = useState(26)
  const [lopDays, setLopDays] = useState(0)
  const [halfDays, setHalfDays] = useState(0)
  const [bonus, setBonus] = useState(0)

  const addComponent = () => {
    const newComp = { ...EMPTY_COMPONENT, id: Date.now().toString() }
    const updated = [...comps, newComp]
    setComps(updated)
    onChange?.({ basic, components: updated })
  }

  const updateComponent = (index, field, value) => {
    const updated = comps.map((c, i) => i === index ? { ...c, [field]: value } : c)
    setComps(updated)
    onChange?.({ basic, components: updated })
  }

  const removeComponent = (index) => {
    const updated = comps.filter((_, i) => i !== index)
    setComps(updated)
    onChange?.({ basic, components: updated })
  }

  const handleBasicChange = (val) => {
    const num = parseFloat(val) || 0
    setBasic(num)
    onChange?.({ basic: num, components: comps })
  }

  // Calculate salary
  const calculate = () => {
    const b = parseFloat(basic) || 0

    let grossEarnings = b
    let totalDeductions = 0

    comps.forEach((comp) => {
      const val = parseFloat(comp.value) || 0
      const amount = comp.calculationType === "PERCENTAGE" ? (b * val) / 100 : val

      if (comp.type === "EARNING") {
        grossEarnings += amount
      } else {
        totalDeductions += amount
      }
    })

    // LOP deduction
    const dailyRate = grossEarnings / workingDays
    const lopDeduction = dailyRate * (parseFloat(lopDays) || 0)
    const halfDayDeduction = dailyRate * 0.5 * (parseFloat(halfDays) || 0)

    totalDeductions += lopDeduction + halfDayDeduction
    const netSalary = grossEarnings + (parseFloat(bonus) || 0) - totalDeductions

    return {
      basic: b,
      grossSalary: grossEarnings,
      totalDeductions,
      lopDeduction,
      halfDayDeduction,
      bonus: parseFloat(bonus) || 0,
      netSalary: Math.max(0, netSalary),
      componentBreakdown: comps.map((comp) => {
        const val = parseFloat(comp.value) || 0
        const amount = comp.calculationType === "PERCENTAGE" ? (b * val) / 100 : val
        return { ...comp, amount }
      }),
    }
  }

  const calc = calculate()

  return (
    <div className="space-y-5">
      {/* Basic Salary */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
        <div className="flex-1">
          <label className="form-label">Basic Salary <span className="text-destructive">*</span></label>
          <p className="text-xs text-muted-foreground mb-2">Mandatory base component</p>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">₹</span>
            <Input
              type="number"
              placeholder="Enter basic salary"
              value={basic || ""}
              onChange={(e) => handleBasicChange(e.target.value)}
              className="pl-7"
              disabled={readonly}
            />
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Current Basic</p>
          <p className="text-xl font-bold text-primary">{formatCurrency(basic)}</p>
        </div>
      </div>

      {/* Components */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Salary Components</h3>
          {!readonly && (
            <Button size="sm" variant="outline" onClick={addComponent}>
              <Plus className="h-4 w-4" />
              Add Component
            </Button>
          )}
        </div>

        {comps.length === 0 ? (
          <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            <Calculator className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p>No components added yet</p>
            {!readonly && (
              <p className="text-xs mt-1">Click "Add Component" to add HRA, PF, allowances, etc.</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <div className="col-span-1" />
              <div className="col-span-3">Component Name</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Calculation</div>
              <div className="col-span-2">Value</div>
              <div className="col-span-1 text-right">Amount</div>
              <div className="col-span-1" />
            </div>

            {comps.map((comp, index) => {
              const val = parseFloat(comp.value) || 0
              const amount = comp.calculationType === "PERCENTAGE" ? (basic * val) / 100 : val

              return (
                <div
                  key={comp.id || index}
                  className={`grid grid-cols-12 gap-2 items-center p-2 rounded-lg border ${
                    comp.type === "EARNING"
                      ? "bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                      : "bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                  }`}
                >
                  <div className="col-span-1 flex justify-center">
                    {!readonly && <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />}
                  </div>

                  <div className="col-span-3">
                    <Input
                      placeholder="Component name"
                      value={comp.name}
                      onChange={(e) => updateComponent(index, "name", e.target.value)}
                      disabled={readonly}
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="col-span-2">
                    <Select
                      value={comp.type}
                      onChange={(e) => updateComponent(index, "type", e.target.value)}
                      disabled={readonly}
                      className="h-8 text-xs"
                    >
                      <option value="EARNING">Earning</option>
                      <option value="DEDUCTION">Deduction</option>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <Select
                      value={comp.calculationType}
                      onChange={(e) => updateComponent(index, "calculationType", e.target.value)}
                      disabled={readonly}
                      className="h-8 text-xs"
                    >
                      <option value="FIXED">Fixed ₹</option>
                      <option value="PERCENTAGE">% of Basic</option>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        {comp.calculationType === "PERCENTAGE" ? "%" : "₹"}
                      </span>
                      <Input
                        type="number"
                        placeholder="0"
                        value={comp.value}
                        onChange={(e) => updateComponent(index, "value", e.target.value)}
                        disabled={readonly}
                        className="h-8 text-xs pl-6"
                      />
                    </div>
                  </div>

                  <div className="col-span-1 text-right">
                    <span className={`text-xs font-semibold ${
                      comp.type === "EARNING" ? "text-green-600" : "text-red-600"
                    }`}>
                      {comp.type === "DEDUCTION" && "-"}{formatCurrency(amount)}
                    </span>
                  </div>

                  <div className="col-span-1 flex justify-end">
                    {!readonly && (
                      <button
                        onClick={() => removeComponent(index)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* LOP / Deduction inputs */}
      <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-muted/40 border">
        <div>
          <label className="form-label text-xs">Working Days/Month</label>
          <Input
            type="number"
            value={workingDays}
            onChange={(e) => setWorkingDays(parseInt(e.target.value) || 26)}
            disabled={readonly}
            className="h-8 text-xs"
          />
        </div>
        <div>
          <label className="form-label text-xs">LOP Days</label>
          <Input
            type="number"
            value={lopDays}
            onChange={(e) => setLopDays(parseFloat(e.target.value) || 0)}
            disabled={readonly}
            min="0"
            className="h-8 text-xs"
          />
        </div>
        <div>
          <label className="form-label text-xs">Half Days</label>
          <Input
            type="number"
            value={halfDays}
            onChange={(e) => setHalfDays(parseFloat(e.target.value) || 0)}
            disabled={readonly}
            min="0"
            className="h-8 text-xs"
          />
        </div>
      </div>

      {/* Bonus */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="form-label text-xs">Bonus / Incentive (One-time)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₹</span>
            <Input
              type="number"
              value={bonus}
              onChange={(e) => setBonus(parseFloat(e.target.value) || 0)}
              disabled={readonly}
              min="0"
              className="pl-6 h-8 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Salary Summary */}
      <div className="rounded-xl border overflow-hidden">
        <div className="bg-muted/30 px-4 py-2 border-b">
          <h4 className="font-semibold text-sm">Salary Summary</h4>
        </div>
        <div className="divide-y divide-border">
          <SummaryRow label="Basic Salary" amount={calc.basic} />
          {calc.componentBreakdown
            .filter((c) => c.type === "EARNING")
            .map((c, i) => (
              <SummaryRow key={i} label={c.name || "Earning"} amount={c.amount} />
            ))}
          <SummaryRow label="Gross Salary" amount={calc.grossSalary} highlight total />
          
          {calc.componentBreakdown
            .filter((c) => c.type === "DEDUCTION")
            .map((c, i) => (
              <SummaryRow key={i} label={c.name || "Deduction"} amount={-c.amount} />
            ))}
          {calc.lopDeduction > 0 && (
            <SummaryRow label={`LOP (${lopDays} days)`} amount={-calc.lopDeduction} />
          )}
          {calc.halfDayDeduction > 0 && (
            <SummaryRow label={`Half Day (${halfDays} days)`} amount={-calc.halfDayDeduction} />
          )}
          {calc.bonus > 0 && <SummaryRow label="Bonus / Incentive" amount={calc.bonus} />}
          
          <div className="px-4 py-3 flex justify-between items-center bg-primary/5">
            <span className="font-bold text-sm">Net Salary</span>
            <span className="text-xl font-bold text-primary">{formatCurrency(calc.netSalary)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryRow({ label, amount, highlight, total }) {
  const isNegative = amount < 0
  return (
    <div className={`flex justify-between items-center px-4 py-2 ${total ? "bg-muted/20" : ""}`}>
      <span className={`text-sm ${total ? "font-semibold" : "text-muted-foreground"}`}>{label}</span>
      <span className={`text-sm font-medium ${
        total ? "font-semibold text-foreground" : isNegative ? "text-red-600" : "text-green-600"
      }`}>
        {isNegative ? `-${formatCurrency(Math.abs(amount))}` : formatCurrency(amount)}
      </span>
    </div>
  )
}
