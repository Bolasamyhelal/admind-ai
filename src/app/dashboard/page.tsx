"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { KPICard } from "@/components/dashboard/kpi-card"
import { OverviewChart } from "@/components/dashboard/overview-chart"
import { useAuth } from "@/context/auth-context"
import { formatCurrency, cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import {
  Loader2, Store, TrendingUp, DollarSign, Eye, Wallet, Repeat,
  Percent, CreditCard, MousePointerClick, Target, Plus, Play,
  BarChart3, Sparkles, Rocket, Building2, ChevronRight,
} from "lucide-react"

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCur, setSelectedCur] = useState("")
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      fetch(`/api/dashboard?userId=${user.id}`)
        .then((r) => r.json())
        .then((d) => { if (d.metricsByCurrency) { setData(d); setSelectedCur(d.metricsByCurrency[0]?.currency || "") } })
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [user])

  const allCurrencies = data?.metricsByCurrency || []
  const m = allCurrencies.find((c: any) => c.currency === selectedCur) || allCurrencies[0] || {}
  const currency = m?.currency || "USD"
  const currencies = allCurrencies.map((c: any) => c.currency)
  const multiCurrency = currencies.length > 1

  const kpiData = m?.spend !== undefined ? [
    { label: "إجمالي الإنفاق", value: formatCurrency(m.spend || 0, currency), change: 12.5, icon: "DollarSign", status: "good" as const, metricKey: "spend" },
    { label: "الإيرادات", value: formatCurrency(m.revenue || 0, currency), change: 23.1, icon: "TrendingUp", status: "excellent" as const, metricKey: "revenue" },
    { label: "ROAS", value: `${(m.roas || 0).toFixed(2)}x`, change: 8.2, icon: "Target", status: "excellent" as const, metricKey: "roas" },
    { label: "CPA", value: formatCurrency(m.cpa || 0, currency), change: -5.3, icon: "CreditCard", status: "good" as const, metricKey: "cpa" },
    { label: "CTR", value: `${(m.ctr || 0).toFixed(2)}%`, change: 15.7, icon: "MousePointerClick", status: "excellent" as const, metricKey: "ctr" },
    { label: "CPM", value: formatCurrency(m.cpm || 0, currency), change: 3.4, icon: "Eye", status: "good" as const, metricKey: "cpm" },
    { label: "CPC", value: formatCurrency(m.cpc || 0, currency), change: -2.1, icon: "MousePointerClick", status: "excellent" as const, metricKey: "cpc" },
    { label: "معدل التحويل", value: `${(m.conversionRate || 0).toFixed(2)}%`, change: 10.8, icon: "Percent", status: "excellent" as const, metricKey: "conversionRate" },
    { label: "التكرار", value: `${(m.frequency || 0).toFixed(1)}x`, change: 8.5, icon: "Repeat", status: "warning" as const, metricKey: "frequency" },
    { label: "الأرباح", value: formatCurrency(m.profit || 0, currency), change: 28.4, icon: "Wallet", status: "excellent" as const, metricKey: "profit" },
  ] : []

  const brands = data?.brands || []
  const totalCampaigns = data?.totalCampaigns || 0
  const totalBrands = data?.totalBrands || 0
  const totalSpend = allCurrencies.reduce((s: number, c: any) => s + (c.spend || 0), 0)

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* Agency Header */}
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 p-6 md:p-8">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <motion.div
            className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl"
            animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="relative flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-5 w-5 text-purple-200" />
                <span className="text-xs font-medium text-purple-200 tracking-wider uppercase">Agency Dashboard</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">AdMind AI</h1>
              <p className="text-purple-200 text-sm">Performance Marketing Platform</p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <button onClick={() => router.push("/dashboard/brands")}
                className="flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 text-white px-4 py-2 text-sm font-medium transition-all backdrop-blur-sm border border-white/10"
              >
                <Plus className="h-4 w-4" />
                إضافة براند
              </button>
              <button onClick={() => router.push("/dashboard/upload")}
                className="flex items-center gap-2 rounded-xl bg-white text-purple-700 hover:bg-purple-50 px-4 py-2 text-sm font-medium transition-all shadow-lg shadow-purple-900/30"
              >
                <BarChart3 className="h-4 w-4" />
                رفع تقرير
              </button>
            </div>
          </div>
          {/* Stats row */}
          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[
              { label: "البراندات", value: totalBrands, icon: Store },
              { label: "الحملات المنطلقة", value: totalCampaigns, icon: Rocket },
              { label: "إجمالي الإنفاق", value: formatCurrency(totalSpend / (allCurrencies.length || 1), currency), icon: DollarSign },
              { label: "متوسط ROAS", value: `${(m.roas || 0).toFixed(2)}x`, icon: TrendingUp },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 p-4"
              >
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className="h-4 w-4 text-purple-200" />
                  <span className="text-xs text-purple-200">{stat.label}</span>
                </div>
                <p className="text-xl font-bold text-white">{stat.value}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-purple-600" /></div>
        ) : !data || allCurrencies.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-16 text-center">
            <Rocket className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">لا توجد بيانات بعد — ابدأ بإضافة براند أو رفع تقرير</p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => router.push("/dashboard/brands")}
                className="rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-purple-700"
              >
                إضافة براند
              </button>
              <button onClick={() => router.push("/dashboard/upload")}
                className="rounded-xl bg-gray-100 dark:bg-gray-800 px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                رفع تقرير
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Currency Tabs */}
            {multiCurrency && (
              <div className="flex gap-1 mb-6 overflow-x-auto">
                {allCurrencies.map((c: any) => (
                  <button key={c.currency} onClick={() => setSelectedCur(c.currency)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedCur === c.currency
                        ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 bg-gray-50 dark:bg-gray-800 border border-transparent"
                    }`}
                  >
                    {c.currency} ({c.analysisCount} تحليل{c.analysisCount > 1 ? "ات" : ""})
                  </button>
                ))}
              </div>
            )}

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              {kpiData.map((kpi, i) => (
                <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <KPICard {...kpi} />
                </motion.div>
              ))}
            </div>

            {/* Brands Grid */}
            {brands.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Store className="h-5 w-5 text-purple-600" />
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">البراندات</h2>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">{brands.length}</span>
                  </div>
                  <button onClick={() => router.push("/dashboard/brands")} className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1">
                    إدارة البراندات <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {brands.map((brand: any, idx: number) => {
                    const healthScore = brand.roas >= 2 ? "excellent" : brand.roas >= 1 ? "good" : "critical"
                    const healthColors = { excellent: "from-green-500 to-emerald-600", good: "from-yellow-500 to-amber-600", critical: "from-red-500 to-rose-600" }
                    return (
                      <motion.div
                        key={brand.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ y: -3, scale: 1.01 }}
                        onClick={() => router.push(`/dashboard/brands/${brand.id}`)}
                        className="group relative rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 cursor-pointer hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300"
                      >
                        {/* Top color bar */}
                        <div className={cn("h-1 rounded-full mb-3 bg-gradient-to-r", healthColors[healthScore])} />
                        <div className="flex items-start justify-between mb-3">
                          <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                            <Store className="h-4 w-4 text-purple-600" />
                          </div>
                          <span className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full font-medium",
                            healthScore === "excellent" ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400" :
                            healthScore === "good" ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400" :
                            "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                          )}>
                            {healthScore === "excellent" ? "ممتاز" : healthScore === "good" ? "جيد" : "تحتاج تحسين"}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate mb-2">{brand.name}</p>
                        {brand.niche && <p className="text-[10px] text-gray-400 mb-3">{brand.niche}</p>}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                          <div>
                            <p className="text-[9px] text-gray-400">الحملات</p>
                            <p className="text-xs font-bold text-gray-900 dark:text-white">{brand.campaignCount || 0}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-gray-400">التقارير</p>
                            <p className="text-xs font-bold text-gray-900 dark:text-white">{brand.uploadCount || 0}</p>
                          </div>
                        </div>
                        {/* Hover shimmer */}
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Chart + Recent Uploads */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <OverviewChart data={data?.monthlyData} currency={currency} />
              </div>
              <div>
                <RecentUploads uploads={data.recentUploads || []} />
              </div>
            </div>

            <AlertsPanel alerts={data.alerts || []} />
          </>
        )}
      </motion.div>
    </DashboardLayout>
  )
}

function RecentUploads({ uploads }: { uploads: any[] }) {
  const router = useRouter()
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">آخر التقارير</h3>
      {uploads.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">لا توجد تقارير</p>
      ) : (
        <div className="space-y-3">
          {uploads.slice(0, 5).map((upload: any) => (
            <div key={upload.id}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => {
                const analysisId = upload.analyses?.[0]?.id
                if (analysisId) router.push(`/dashboard/analysis/${analysisId}`)
              }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{upload.fileName}</p>
                <p className="text-xs text-gray-500">{upload.platform}</p>
              </div>
              <div className={`h-2 w-2 rounded-full shrink-0 mr-2 ${
                upload.status === "completed" ? "bg-green-500" : upload.status === "processing" ? "bg-yellow-500 animate-pulse" : "bg-red-500"
              }`} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AlertsPanel({ alerts }: { alerts: any[] }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">التنبيهات الذكية</h3>
      {alerts.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">لا توجد تنبيهات</p>
      ) : (
        <div className="space-y-2">
          {alerts.slice(0, 5).map((alert: any) => (
            <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                alert.severity === "critical" ? "bg-red-500" : alert.severity === "warning" ? "bg-yellow-500" : "bg-blue-500"
              }`} />
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{alert.message}</p>
                <p className="text-xs text-gray-500 mt-0.5">{new Date(alert.createdAt).toLocaleDateString("ar-EG")}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
