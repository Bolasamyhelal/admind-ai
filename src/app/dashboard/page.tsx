"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { KPICard } from "@/components/dashboard/kpi-card"
import { OverviewChart } from "@/components/dashboard/overview-chart"
import { useAuth } from "@/context/auth-context"
import { formatCurrency } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { Loader2, Store, TrendingUp, DollarSign, Eye, Wallet, Repeat, Percent, CreditCard, MousePointerClick, Target } from "lucide-react"

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

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">لوحة التحكم</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">أداء حملاتك الإعلانية في لمحة</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-purple-600" /></div>
        ) : !data || allCurrencies.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-16 text-center">
            <p className="text-gray-500 mb-4">لا توجد بيانات بعد</p>
            <button onClick={() => router.push("/dashboard/upload")}
              className="rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-purple-700"
            >
              ارفع تقريرك الأول
            </button>
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

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              {kpiData.map((kpi, i) => (
                <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <KPICard {...kpi} />
                </motion.div>
              ))}
            </div>

            {/* Brands Overview */}
            {data?.brands?.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">البراندات</h2>
                  <button onClick={() => router.push("/dashboard/brands")} className="text-xs text-purple-600 hover:text-purple-700">عرض الكل</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                  {data.brands.map((brand: any) => (
                    <motion.div key={brand.id} whileHover={{ scale: 1.02 }}
                      onClick={() => router.push(`/dashboard/brands/${brand.id}`)}
                      className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 cursor-pointer hover:border-purple-400 dark:hover:border-purple-600 transition-all"
                    >
                      <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 mb-2 w-fit">
                        <Store className="h-4 w-4 text-purple-600" />
                      </div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{brand.name}</p>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                        {brand.niche && <span>{brand.niche}</span>}
                        {brand.monthlyBudget && <><span>·</span><DollarSign className="h-3 w-3" /></>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

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
