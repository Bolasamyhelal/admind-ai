"use client"

import { useState } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { formatCurrency } from "@/lib/utils"

interface OverviewChartProps {
  data?: { month: string; spend: number; revenue: number; roas: number }[]
  currency?: string
}

const defaultData = [
  { month: "Jan", spend: 0, revenue: 0, roas: 0 },
  { month: "Feb", spend: 0, revenue: 0, roas: 0 },
  { month: "Mar", spend: 0, revenue: 0, roas: 0 },
]

export function OverviewChart({ data, currency = "USD" }: OverviewChartProps) {
  const [metric, setMetric] = useState<"spend" | "revenue" | "roas">("revenue")
  const chartData = data && data.length > 0 ? data : defaultData

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white">Performance Overview</h3>
        <div className="flex gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-0.5">
          {(["revenue", "spend", "roas"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                metric === m
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {m === "revenue" ? "الإيرادات" : m === "spend" ? "الإنفاق" : "ROAS"}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-800" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} className="text-gray-400" />
            <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} className="text-gray-400"
              tickFormatter={(v: number) => metric === "roas" ? `${v}x` : formatCurrency(v, currency)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--background)",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "13px",
              }}
              formatter={(value: any, name: any) => {
                const num = Number(value) || 0
                if (name === "roas") return [`${num.toFixed(2)}x`, "ROAS"]
                return [formatCurrency(num, currency), name === "revenue" ? "الإيرادات" : "الإنفاق"]
              }}
            />
            {metric === "revenue" && (
              <Area type="monotone" dataKey="revenue" stroke="#7C3AED" fill="url(#colorRevenue)" strokeWidth={2} />
            )}
            {metric === "spend" && (
              <Area type="monotone" dataKey="spend" stroke="#F59E0B" fill="url(#colorSpend)" strokeWidth={2} />
            )}
            {metric === "roas" && (
              <Area type="monotone" dataKey="roas" stroke="#10B981" fill="url(#colorRevenue)" strokeWidth={2} />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
