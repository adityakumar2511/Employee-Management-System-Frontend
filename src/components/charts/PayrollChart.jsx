"use client"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { formatCurrency } from "@/lib/utils"

export default function PayrollChart({ data = [] }) {
  const formatY = (value) => `₹${(value / 1000).toFixed(0)}K`

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Payroll (Last 6 Months)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis tickFormatter={formatY} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip
              formatter={(value) => [formatCurrency(value), ""]}
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.75rem",
                fontSize: "12px",
              }}
            />
            <Legend />
            <Bar dataKey="grossSalary" name="Gross Salary" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="netSalary" name="Net Salary" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
