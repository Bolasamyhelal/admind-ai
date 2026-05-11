"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Info } from "lucide-react"

interface MetricRow {
  label: string
  value: string
  benchmark: string
  status: "critical" | "warning" | "good" | "excellent"
  explanation: string
}

const metrics: MetricRow[] = [
  { label: "CTR", value: "2.15%", benchmark: "1.5%", status: "excellent", explanation: "Above average CTR indicates strong creative and audience targeting." },
  { label: "CPM", value: "$18.20", benchmark: "$15.00", status: "warning", explanation: "CPM is slightly above market average. May indicate audience saturation or competitive market." },
  { label: "CPA", value: "$24.50", benchmark: "$25.00", status: "good", explanation: "CPA is within healthy range. Good efficiency for this market vertical." },
  { label: "ROAS", value: "3.58x", benchmark: "3.0x", status: "excellent", explanation: "Strong ROAS indicates profitable campaigns with room to scale." },
  { label: "Frequency", value: "2.1", benchmark: "1.5", status: "warning", explanation: "Frequency is rising. Consider refreshing creatives to avoid ad fatigue." },
  { label: "Conversion Rate", value: "3.42%", benchmark: "2.5%", status: "excellent", explanation: "Strong conversion rate suggests effective landing pages and offer." },
  { label: "CPC", value: "$0.85", benchmark: "$1.00", status: "excellent", explanation: "Low CPC indicates good relevance score and targeting." },
]

const statusColors = {
  critical: "bg-red-500",
  warning: "bg-yellow-500",
  good: "bg-blue-500",
  excellent: "bg-green-500",
}

const statusBg = {
  critical: "bg-red-50 dark:bg-red-900/10",
  warning: "bg-yellow-50 dark:bg-yellow-900/10",
  good: "bg-blue-50 dark:bg-blue-900/10",
  excellent: "bg-green-50 dark:bg-green-900/10",
}

export function MetricsTable() {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="p-5 border-b border-gray-200 dark:border-gray-800">
        <h3 className="font-semibold text-gray-900 dark:text-white">Deep Metrics Analysis</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
              <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
              <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Benchmark</th>
              <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">AI Analysis</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((row, i) => (
              <motion.tr
                key={row.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
              >
                <td className="p-4">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{row.label}</span>
                </td>
                <td className="p-4">
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{row.value}</span>
                </td>
                <td className="p-4">
                  <span className="text-sm text-gray-500">{row.benchmark}</span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className={cn("h-2 w-2 rounded-full", statusColors[row.status])} />
                    <span className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full",
                      statusBg[row.status],
                      row.status === "critical" && "text-red-700 dark:text-red-300",
                      row.status === "warning" && "text-yellow-700 dark:text-yellow-300",
                      row.status === "good" && "text-blue-700 dark:text-blue-300",
                      row.status === "excellent" && "text-green-700 dark:text-green-300",
                    )}>
                      {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{row.explanation}</span>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
