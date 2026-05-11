"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { TrendingUp, DollarSign, Target, Play, Loader2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface CampaignExec {
  id: string
  name: string
  brand: string
  totalBudget: number
  totalSpend: number
  status: string
  currency: string
  platform: string
  goal: string
}

export function CampaignSpendSection({ brandName }: { brandName: string }) {
  const [campaigns, setCampaigns] = useState<CampaignExec[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const r = await fetch("/api/campaign-exec")
        const all: CampaignExec[] = await r.json()
        setCampaigns(all.filter((c) => c.brand?.toLowerCase() === brandName.toLowerCase()))
      } catch {}
      setLoading(false)
    })()
  }, [brandName])

  if (loading) return null
  if (campaigns.length === 0) return null

  const totalSpend = campaigns.reduce((s, c) => s + c.totalSpend, 0)
  const totalBudget = campaigns.reduce((s, c) => s + c.totalBudget, 0)
  const activeCount = campaigns.filter((c) => c.status === "active").length
  const cur = campaigns[0]?.currency || "USD"
  const spendPercent = totalBudget > 0 ? Math.min(100, (totalSpend / totalBudget) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 mb-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
          <TrendingUp className="h-5 w-5 text-purple-600" />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white">إنفاق الحملات</h3>
        <span className="text-xs text-gray-400">({campaigns.length} {campaigns.length === 1 ? "حملة" : "حملات"})</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/30">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
            <DollarSign className="h-3.5 w-3.5" />
            إجمالي الصرف
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(totalSpend, cur)}</p>
        </div>
        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/30">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
            <Target className="h-3.5 w-3.5" />
            إجمالي الميزانية
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(totalBudget, cur)}</p>
        </div>
        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/30">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
            <Play className="h-3.5 w-3.5 text-green-500" />
            حملات نشطة
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{activeCount}</p>
        </div>
        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/30">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
            <TrendingUp className="h-3.5 w-3.5" />
            استخدام الميزانية
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{spendPercent.toFixed(0)}%</p>
        </div>
      </div>

      <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-purple-600 transition-all"
          style={{ width: `${spendPercent}%` }}
        />
      </div>

      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {campaigns.map((c) => (
          <div key={c.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/20 text-xs text-gray-500">
            <div className={`h-2 w-2 rounded-full ${c.status === "active" ? "bg-green-500" : c.status === "paused" ? "bg-yellow-500" : "bg-gray-400"}`} />
            <span className="truncate">{c.name}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
