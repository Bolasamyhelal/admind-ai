"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"
import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown, Minus, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

const predictions = [
  { budgetIncrease: 0, cpa: 24.5, roas: 3.58, frequency: 2.1, revenue: 445200 },
  { budgetIncrease: 10, cpa: 25.2, roas: 3.52, frequency: 2.3, revenue: 489720 },
  { budgetIncrease: 20, cpa: 26.1, roas: 3.45, frequency: 2.6, revenue: 534240 },
  { budgetIncrease: 30, cpa: 27.5, roas: 3.32, frequency: 2.9, revenue: 578760 },
  { budgetIncrease: 40, cpa: 29.8, roas: 3.12, frequency: 3.3, revenue: 623280 },
  { budgetIncrease: 50, cpa: 33.2, roas: 2.85, frequency: 3.8, revenue: 667800 },
  { budgetIncrease: 60, cpa: 38.5, roas: 2.52, frequency: 4.4, revenue: 712320 },
  { budgetIncrease: 80, cpa: 48.2, roas: 2.05, frequency: 5.2, revenue: 756840 },
  { budgetIncrease: 100, cpa: 62.0, roas: 1.58, frequency: 6.1, revenue: 801360 },
]

export function PredictionsPanel() {
  const [selectedBudget, setSelectedBudget] = useState(30)

  const prediction = predictions.find((p) => p.budgetIncrease === selectedBudget) || predictions[0]

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="p-5 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">Predictive AI Forecast</h3>
          <Badge variant="info" className="gap-1">
            <TrendingUp className="h-3 w-3" />
            Beta
          </Badge>
        </div>
        <p className="text-sm text-gray-500">Predict how budget changes affect performance</p>
      </div>

      <div className="p-5">
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
            Budget Increase: <span className="text-purple-600 font-bold">{selectedBudget}%</span>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            step={10}
            value={selectedBudget}
            onChange={(e) => setSelectedBudget(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>+0%</span>
            <span>+50%</span>
            <span>+100%</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Predicted CPA", value: `$${prediction.cpa}`, current: "$24.50", trend: prediction.cpa > 24.5 ? "up" : "down" as const },
            { label: "Predicted ROAS", value: `${prediction.roas}x`, current: "3.58x", trend: prediction.roas < 3.58 ? "down" : "up" as const },
            { label: "Predicted Frequency", value: `${prediction.frequency}`, current: "2.1", trend: prediction.frequency > 2.1 ? "up" : "down" as const },
            { label: "Estimated Revenue", value: `$${(prediction.revenue / 1000).toFixed(0)}K`, current: "$445K", trend: "up" as const },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">{stat.label}</span>
                {stat.trend === "up" ? (
                  <ArrowUp className="h-3 w-3 text-green-500" />
                ) : stat.trend === "down" ? (
                  <ArrowDown className="h-3 w-3 text-red-500" />
                ) : (
                  <Minus className="h-3 w-3 text-gray-400" />
                )}
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-[10px] text-gray-400">Current: {stat.current}</p>
            </div>
          ))}
        </div>

        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={predictions}>
              <defs>
                <linearGradient id="cpaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="roasGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-800" />
              <XAxis dataKey="budgetIncrease" tickFormatter={(v) => `+${v}%`} tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--background)",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
              />
              <Area yAxisId="left" type="monotone" dataKey="cpa" stroke="#EF4444" fill="url(#cpaGrad)" strokeWidth={2} name="CPA ($)" />
              <Area yAxisId="right" type="monotone" dataKey="roas" stroke="#10B981" fill="url(#roasGrad)" strokeWidth={2} name="ROAS (x)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
          <p className="text-sm text-purple-700 dark:text-purple-300">
            <strong>AI Insight:</strong> At {selectedBudget}% budget increase, CPA is predicted to rise to ${prediction.cpa} 
            and ROAS to drop to {prediction.roas}x. The sweet spot for scaling is between 20-30% increase 
            where you maximize incremental revenue without significant efficiency loss.
          </p>
        </div>
      </div>
    </div>
  )
}
