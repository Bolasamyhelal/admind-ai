"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { MetricsTable } from "@/components/analysis/metrics-table"
import { RecommendationsPanel } from "@/components/analysis/recommendations"
import { PredictionsPanel } from "@/components/analysis/predictions-panel"
import { AIChat } from "@/components/chat/ai-chat"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Loader2, ChevronRight, Download, Share2, Clock, BarChart3, Brain, TrendingUp, Activity, Layers, Image } from "lucide-react"

export default function AnalysisPage() {
  const params = useParams()
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/analyze?id=${params.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.analysis) setAnalysis(data.analysis)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-purple-600 mb-4" />
            <p className="text-gray-500">Loading analysis...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <span>Dashboard</span><ChevronRight className="h-3 w-3" />
              <span>Analysis</span><ChevronRight className="h-3 w-3" />
              <span className="text-purple-600 font-medium">{analysis?.title || "Campaign Analysis"}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{analysis?.title || "Campaign Analysis"}</h1>
            <div className="flex items-center gap-3 mt-2">
              {analysis?.level && (
                <Badge variant="outline" className="flex items-center gap-1">
                  {analysis.level === "campaign" ? <BarChart3 className="h-3 w-3" /> : analysis.level === "adset" ? <Layers className="h-3 w-3" /> : <Image className="h-3 w-3" />}
                  {analysis.level === "campaign" ? "تحليل الحملات" : analysis.level === "adset" ? "تحليل المجموعات" : "تحليل الإعلانات"}
                </Badge>
              )}
              <Badge variant="default">{(() => { try { return JSON.parse(analysis.rawData || "{}").platform } catch { return "Meta Ads" } })()}</Badge>
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {analysis?.createdAt ? new Date(analysis.createdAt).toLocaleString() : "Just now"}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2"><Share2 className="h-4 w-4" />Share</Button>
            <Button size="sm" className="gap-2"><Download className="h-4 w-4" />Export PDF</Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Overall Health", value: analysis?.summary ? "Analyzed" : "N/A", icon: Activity, color: "text-green-500" },
            { label: "Campaigns", value: "12", icon: BarChart3, color: "text-purple-500" },
            { label: "Recommendations", value: "6", icon: Brain, color: "text-blue-500" },
            { label: "Status", value: analysis?.status || "Completed", icon: TrendingUp, color: "text-yellow-500" },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                  <span className="text-xs text-gray-500">{stat.label}</span>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </motion.div>
            )
          })}
        </div>

        {analysis?.summary && (
          <div className="mb-8 p-4 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30">
            <p className="text-sm text-purple-700 dark:text-purple-300">{analysis.summary}</p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          <div className="xl:col-span-2"><MetricsTable /></div>
          <div>
            {analysis?.marketData && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Market Detection</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                    <div>
                      <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Detected Market</p>
                      <p className="text-lg font-bold text-purple-800 dark:text-purple-200">
                        {(() => { try { return JSON.parse(analysis.marketData).market } catch { return "Unknown" } })()}
                      </p>
                    </div>
                    <Badge variant="default">{(() => { try { return JSON.parse(analysis.marketData).confidence + "%" } catch { return "-" } })()}</Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Entity Breakdown */}
        {analysis?.level && analysis?.rawData && (() => {
          let rd: any = {}
          try { rd = JSON.parse(analysis.rawData) } catch {}
          if (!rd.breakdown) return null
          const entries = Object.entries(rd.breakdown) as [string, any][]
          if (!entries.length) return null
          return (
            <div className="mb-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                تفاصيل {analysis.level === "campaign" ? "الحملات" : analysis.level === "adset" ? "المجموعات الإعلانية" : "الإعلانات"}
                <span className="text-sm text-gray-400 font-normal mr-2">({entries.length})</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <th className="text-right py-2 px-3 text-gray-500 font-medium">الاسم</th>
                      <th className="text-right py-2 px-3 text-gray-500 font-medium">الإنفاق</th>
                      <th className="text-right py-2 px-3 text-gray-500 font-medium">الإيرادات</th>
                      <th className="text-right py-2 px-3 text-gray-500 font-medium">ROAS</th>
                      <th className="text-right py-2 px-3 text-gray-500 font-medium">المشاهدات</th>
                      <th className="text-right py-2 px-3 text-gray-500 font-medium">نقرات</th>
                      <th className="text-right py-2 px-3 text-gray-500 font-medium">تحويلات</th>
                      <th className="text-right py-2 px-3 text-gray-500 font-medium">CPA</th>
                      <th className="text-right py-2 px-3 text-gray-500 font-medium">CTR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map(([name, e], i) => (
                      <tr key={i} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                        <td className="py-2 px-3 text-gray-900 dark:text-white font-medium max-w-[200px] truncate">{name}</td>
                        <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{(() => { try { return formatCurrency(e.spend, JSON.parse(analysis.marketData || "{}").currency) } catch { return e.spend } })()}</td>
                        <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{(() => { try { return formatCurrency(e.revenue, JSON.parse(analysis.marketData || "{}").currency) } catch { return e.revenue } })()}</td>
                        <td className={`py-2 px-3 font-medium ${e.roas >= 2 ? "text-green-600" : e.roas >= 1 ? "text-yellow-600" : "text-red-600"}`}>{e.roas?.toFixed(2)}x</td>
                        <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{(e.impressions || 0).toLocaleString()}</td>
                        <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{(e.clicks || 0).toLocaleString()}</td>
                        <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{e.conversions || 0}</td>
                        <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{(() => { try { return formatCurrency(e.cpa, JSON.parse(analysis.marketData || "{}").currency) } catch { return e.cpa } })()}</td>
                        <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{e.ctr?.toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })()}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          <RecommendationsPanel />
          <PredictionsPanel />
        </div>

        <AIChat />
      </motion.div>
    </DashboardLayout>
  )
}
