'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2, GripVertical, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

const DEFAULT_COMPONENT = {
  name: '',
  type: 'EARNING',
  calculationType: 'FIXED',
  value: '',
}

/**
 * SalaryBuilder — Dynamic salary structure editor
 * Only Basic Salary is mandatory. Admin adds all other rows.
 */
export function SalaryBuilder({ initialComponents = [], basicSalary = 0, onChange }) {
  const [components, setComponents] = useState(initialComponents)

  useEffect(() => {
    setComponents(initialComponents)
  }, [initialComponents])

  // Calculated values
  const calcAmount = (comp) => {
    if (!comp.value) return 0
    if (comp.calculationType === 'FIXED') return Number(comp.value)
    if (comp.calculationType === 'PERCENTAGE_OF_BASIC')
      return (Number(basicSalary) * Number(comp.value)) / 100
    if (comp.calculationType === 'PERCENTAGE_OF_GROSS') {
      const gross = calcGross()
      return (gross * Number(comp.value)) / 100
    }
    return 0
  }

  const calcGross = () => {
    const earningsTotal = components
      .filter((c) => c.type === 'EARNING')
      .reduce((sum, c) => sum + calcAmount(c), 0)
    return Number(basicSalary) + earningsTotal
  }

  const calcTotalDeductions = () =>
    components
      .filter((c) => c.type === 'DEDUCTION')
      .reduce((sum, c) => sum + calcAmount(c), 0)

  const calcNetSalary = () => calcGross() - calcTotalDeductions()

  const addComponent = () => {
    const newComps = [...components, { ...DEFAULT_COMPONENT, id: Date.now() }]
    setComponents(newComps)
    onChange?.(newComps)
  }

  const updateComponent = (index, field, value) => {
    const newComps = components.map((c, i) =>
      i === index ? { ...c, [field]: value } : c
    )
    setComponents(newComps)
    onChange?.(newComps)
  }

  const removeComponent = (index) => {
    const newComps = components.filter((_, i) => i !== index)
    setComponents(newComps)
    onChange?.(newComps)
  }

  const earnings = components.filter((c) => c.type === 'EARNING')
  const deductions = components.filter((c) => c.type === 'DEDUCTION')

  return (
    <div className="space-y-4">
      {/* Basic Salary Row (locked) */}
      <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm">Basic Salary</p>
            <p className="text-xs text-muted-foreground">Mandatory — earning</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">{formatCurrency(basicSalary)}</p>
            <p className="text-xs text-muted-foreground">Fixed Amount</p>
          </div>
        </div>
      </div>

      {/* Components Table */}
      {components.length > 0 && (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-left font-medium text-muted-foreground w-8"></th>
                <th className="p-3 text-left font-medium text-muted-foreground">Component Name</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Type</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Calculation</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Value</th>
                <th className="p-3 text-right font-medium text-muted-foreground">Amount</th>
                <th className="p-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {components.map((comp, i) => (
                <tr key={comp.id || i} className="border-t">
                  <td className="p-3 cursor-grab text-muted-foreground">
                    <GripVertical className="h-4 w-4" />
                  </td>
                  <td className="p-3">
                    <Input
                      value={comp.name}
                      onChange={(e) =>
                        updateComponent(i, 'name', e.target.value)
                      }
                      placeholder="e.g. HRA, PF, Travel..."
                      className="h-8 text-sm"
                    />
                  </td>
                  <td className="p-3">
                    <Select
                      value={comp.type}
                      onChange={(e) =>
                        updateComponent(i, 'type', e.target.value)
                      }
                      className="h-8 text-sm"
                    >
                      <option value="EARNING">Earning</option>
                      <option value="DEDUCTION">Deduction</option>
                    </Select>
                  </td>
                  <td className="p-3">
                    <Select
                      value={comp.calculationType}
                      onChange={(e) =>
                        updateComponent(i, 'calculationType', e.target.value)
                      }
                      className="h-8 text-sm"
                    >
                      <option value="FIXED">Fixed Amount</option>
                      <option value="PERCENTAGE_OF_BASIC">
                        % of Basic
                      </option>
                      <option value="PERCENTAGE_OF_GROSS">
                        % of Gross
                      </option>
                    </Select>
                  </td>
                  <td className="p-3">
                    <Input
                      type="number"
                      value={comp.value}
                      onChange={(e) =>
                        updateComponent(i, 'value', e.target.value)
                      }
                      placeholder={
                        comp.calculationType === 'FIXED' ? '2000' : '40'
                      }
                      className="h-8 text-sm w-24"
                    />
                    {comp.calculationType !== 'FIXED' && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        %
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <span
                      className={
                        comp.type === 'EARNING'
                          ? 'text-green-600 font-medium'
                          : 'text-red-500 font-medium'
                      }
                    >
                      {comp.type === 'DEDUCTION' ? '-' : '+'}
                      {formatCurrency(calcAmount(comp))}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => removeComponent(i)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Component Button */}
      <Button variant="outline" size="sm" onClick={addComponent}>
        <Plus className="mr-1.5 h-4 w-4" />
        Add Component
      </Button>

      {/* Summary */}
      <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Basic Salary</span>
          <span className="font-medium">{formatCurrency(basicSalary)}</span>
        </div>
        {earnings.map((c, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{c.name || 'Unnamed Earning'}</span>
            <span className="text-green-600">+{formatCurrency(calcAmount(c))}</span>
          </div>
        ))}
        <div className="flex justify-between text-sm font-semibold border-t pt-2">
          <span>Gross Salary</span>
          <span>{formatCurrency(calcGross())}</span>
        </div>
        {deductions.map((c, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{c.name || 'Unnamed Deduction'}</span>
            <span className="text-red-500">-{formatCurrency(calcAmount(c))}</span>
          </div>
        ))}
        {/* Auto deductions note */}
        <div className="flex justify-between text-sm text-muted-foreground italic">
          <span>LOP / Half Day (auto-calc at month-end)</span>
          <span>—</span>
        </div>
        <div className="flex justify-between font-bold border-t pt-2">
          <span>Net Salary (before LOP)</span>
          <span className="text-lg">{formatCurrency(calcNetSalary())}</span>
        </div>
      </div>
    </div>
  )
}
