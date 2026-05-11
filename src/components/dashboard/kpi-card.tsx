"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { 
  TrendingUp, TrendingDown, DollarSign, Target, 
  Eye, MousePointerClick, CreditCard, Percent, Repeat, Wallet
} from "lucide-react"
import { MetricDetail } from "@/components/ui/metric-detail"
import { metricExplanations } from "@/lib/metric-explanations"

const iconMap: Record<string, React.ElementType> = {
  DollarSign, TrendingUp, Target, CreditCard, MousePointerClick,
  Eye, MousePointer2: MousePointerClick, Percent, Repeat, Wallet
}

interface KPICardProps {
  label: string
  value: string
  change?: number
  icon: string
  status?: "critical" | "warning" | "good" | "excellent"
  metricKey?: string
}

export function KPICard({ label, value, change, icon, status, metricKey }: KPICardProps) {
  const [showDetail, setShowDetail] = useState(false)
  const Icon = iconMap[icon] || DollarSign
  const isPositive = change && change > 0
  const explanation = metricKey ? metricExplanations[metricKey] : undefined

  return (
    <>
      <motion.div
        whileHover={{ y: -2, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowDetail(true)}
        className={cn(
          "group cursor-pointer rounded-xl border p-5 transition-all duration-300",
          "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900",
          "hover:border-purple-200 dark:hover:border-purple-800 hover:shadow-lg hover:shadow-purple-500/5"
        )}
      >
        <div className="flex items-start justify-between mb-3">
          <div className={cn(
            "rounded-lg p-2.5 transition-colors",
            status === "critical" && "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
            status === "warning" && "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400",
            status === "excellent" && "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
            (!status || status === "good") && "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
          )}>
            <Icon className="h-5 w-5" />
          </div>
          {change !== undefined && (
            <div className={cn(
              "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              isPositive ? "bg-green-50 dark:bg-green-900/20 text-green-600" : "bg-red-50 dark:bg-red-900/20 text-red-600"
            )}>
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(change).toFixed(1)}%
            </div>
          )}
        </div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      </motion.div>

      <MetricDetail
        label={label}
        value={value}
        explanation={explanation}
        open={showDetail}
        onClose={() => setShowDetail(false)}
      />
    </>
  )
}
