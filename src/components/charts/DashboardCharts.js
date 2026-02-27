'use client'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

// ─── Attendance Trend Area Chart ─────────────────────────────────────────────
export function AttendanceTrendChart({ data = [] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Attendance Trend (30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="present"
              stroke="#2563EB"
              fill="url(#presentGrad)"
              strokeWidth={2}
              name="Present"
            />
            <Area
              type="monotone"
              dataKey="absent"
              stroke="#EF4444"
              fill="transparent"
              strokeWidth={2}
              strokeDasharray="4 4"
              name="Absent"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// ─── Department Headcount Bar Chart ──────────────────────────────────────────
export function DepartmentChart({ data = [] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Department Headcount</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="department" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} name="Employees" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// ─── Leave Status Pie Chart ───────────────────────────────────────────────────
const COLORS = ['#F59E0B', '#10B981', '#EF4444', '#3B82F6']

export function LeaveStatusChart({ data = [] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Leave Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// ─── Monthly Payroll Bar Chart ────────────────────────────────────────────────
export function PayrollChart({ data = [] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Monthly Payroll (₹)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(v) =>
                new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0,
                }).format(v)
              }
            />
            <Bar
              dataKey="totalPaid"
              fill="#10B981"
              radius={[4, 4, 0, 0]}
              name="Total Paid"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
