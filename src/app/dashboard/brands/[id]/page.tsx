"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useAuth } from "@/context/auth-context"
import { useRouter, useParams } from "next/navigation"
import { formatCurrency, cn } from "@/lib/utils"
import { MetricDetail } from "@/components/ui/metric-detail"
import { metricExplanations } from "@/lib/metric-explanations"
import { OverviewChart } from "@/components/dashboard/overview-chart"
import { KPICard } from "@/components/dashboard/kpi-card"
import { CampaignSpendSection } from "@/components/dashboard/campaign-spend-section"
import {
  Store, Globe, Music2, Search, Ghost,
  FileSpreadsheet, CheckCircle2, XCircle, Loader2, Download,
  TrendingUp, DollarSign, Target, MousePointer,
  ArrowLeft, Upload, BarChart3, AlertCircle, Trash2, Zap,
  Lightbulb, Sparkles, Image, Eye, Play, Pause,
  Wallet, Repeat, Percent, CreditCard, Smartphone,
  Users, MessageSquare, Share2, Clock, Star,
} from "lucide-react"

export default function BrandDetailPage() {
  const [brand, setBrand] = useState<any>(null)
  const [dashData, setDashData] = useState<any>(null)
  const [allData, setAllData] = useState<any>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [loadingExtra, setLoadingExtra] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [selectedCreative, setSelectedCreative] = useState<any>(null)
  const [activeSection, setActiveSection] = useState("all")
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const brandId = params?.id as string

  const fetchData = useCallback(async () => {
    if (!user || !brandId) return
    setLoading(true)
    setError("")
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 12000)
      const res = await fetch(`/api/brand-dashboard?id=${brandId}`, { signal: controller.signal })
      clearTimeout(timeoutId)
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || "فشل تحميل البراند")
      }
      const data = await res.json()
      setBrand(data.brand)
      setAllData(data)
      setDashData({ metrics: data.metrics, monthlyData: null, alerts: [], currency: "USD" })

      setLoading(false)
      // Lazy-load extra data after initial render
      setLoadingExtra(true)
      fetch(`/api/brand-extra?brandId=${brandId}&type=all`)
        .then((r) => r.json())
        .then((extra) => {
          setAllData((prev: any) => ({ ...prev, ...extra }))
          setDashData((prev: any) => ({ ...prev, alerts: extra.alerts || [], currency: extra.campaignStats?.currency || "USD" }))
        })
        .catch(() => {})
        .finally(() => setLoadingExtra(false))
    } catch (err: any) {
      if (err.name === "AbortError") {
        setError("انتهت مهلة التحميل — الخادم يستغرق وقتًا طويلاً. حاول مرة أخرى.")
      } else {
        setError(err.message || "حدث خطأ أثناء تحميل البيانات")
      }
      setLoading(false)
    }
  }, [user, brandId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDelete = async () => {
    if (!window.confirm("هل أنت متأكد من حذف هذا البراند؟ لا يمكن التراجع عن هذا الإجراء.")) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/brands?id=${brandId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("فشل الحذف")
      router.push("/dashboard/brands")
    } catch (err: any) {
      setError(err.message)
      setDeleting(false)
    }
  }

  const handleExport = async () => {
    if (!allData) return
    setExporting(true)
    try {
      const exportObj = {
        brand: allData.brand,
        metrics: allData.metrics,
        insights: allData.insights,
        recommendations: allData.recommendations,
        predictions: allData.predictions,
        marketData: allData.marketData,
        campaigns: allData.campaigns,
        creatives: allData.creatives,
        alerts: allData.alerts,
        exportedAt: new Date().toISOString(),
      }
      const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `brand-${allData.brand.name}-data-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch {}
    setExporting(false)
  }

  const sections = [
    { id: "all", label: "الكل", icon: BarChart3 },
    { id: "kpis", label: "المؤشرات", icon: TrendingUp },
    { id: "insights", label: "التوصيات", icon: Lightbulb },
    { id: "campaigns", label: "الحملات", icon: Play },
    { id: "creatives", label: "الكريتفز", icon: Image },
    { id: "charts", label: "الرسوم", icon: BarChart3 },
    { id: "history", label: "التاريخ", icon: Clock },
  ]

  const m = dashData?.metrics || allData?.metrics
  const currency = dashData?.currency || allData?.campaignStats?.currency || "USD"
  const alerts = dashData?.alerts || allData?.alerts || []
  const insights = allData?.insights || []
  const recommendations = allData?.recommendations || []
  const predictions = allData?.predictions || []
  const campaigns = allData?.campaigns || []
  const creatives = allData?.creatives || []
  const campaignStats = allData?.campaignStats || {}

  const kpiList = m ? [
    { label: "إجمالي الإنفاق", value: formatCurrency(m.spend || 0, currency), change: 0, icon: "DollarSign", status: "good" as const, metricKey: "spend" },
    { label: "الإيرادات", value: formatCurrency(m.revenue || 0, currency), change: 0, icon: "TrendingUp", status: "excellent" as const, metricKey: "revenue" },
    { label: "ROAS", value: `${(m.roas || 0).toFixed(2)}x`, change: 0, icon: "Target", status: "excellent" as const, metricKey: "roas" },
    { label: "CPA", value: formatCurrency(m.cpa || 0, currency), change: 0, icon: "CreditCard", status: "good" as const, metricKey: "cpa" },
    { label: "CTR", value: `${(m.ctr || 0).toFixed(2)}%`, change: 0, icon: "MousePointerClick", status: "excellent" as const, metricKey: "ctr" },
    { label: "CPM", value: formatCurrency(m.cpm || 0, currency), change: 0, icon: "Eye", status: "good" as const, metricKey: "cpm" },
    { label: "CPC", value: formatCurrency(m.cpc || 0, currency), change: 0, icon: "MousePointerClick", status: "excellent" as const, metricKey: "cpc" },
    { label: "معدل التحويل", value: `${(m.conversionRate || 0).toFixed(2)}%`, change: 0, icon: "Percent", status: "excellent" as const, metricKey: "conversionRate" },
    { label: "التكرار", value: `${(m.frequency || 0).toFixed(1)}x`, change: 0, icon: "Repeat", status: "warning" as const, metricKey: "frequency" },
    { label: "الأرباح", value: formatCurrency(m.profit || 0, currency), change: 0, icon: "Wallet", status: "excellent" as const, metricKey: "profit" },
  ] : []

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !brand) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <AlertCircle className="mx-auto h-10 w-10 text-red-400 mb-3" />
          <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">تعذر تحميل صفحة البراند</p>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">{error || "البراند غير موجود"}</p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={fetchData} className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-700 transition-colors">
              إعادة المحاولة
            </button>
            <button onClick={() => router.push("/dashboard/brands")} className="rounded-xl border border-gray-200 dark:border-gray-700 px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              العودة للبراندات
            </button>
          </div>
          {error?.includes("مهلة") && (
            <p className="text-xs text-gray-400 mt-6">قد يكون الخادم بطيئًا في أول استخدام (Cold Start). انتظر دقيقة وحاول مرة أخرى.</p>
          )}
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

        {/* ===== HEADER ===== */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard/brands")}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/30">
              <Store className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{brand.name}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {brand.niche && <span>{brand.niche}</span>}
                {brand.country && <span>· {brand.country}</span>}
                <span>· {allData?.totalAnalyses || 0} تحليل</span>
                <span>· {allData?.campaignStats?.total || 0} حملة</span>
                <span>· {allData?.creatives?.length || 0} كريتف</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => router.push("/dashboard/upload")}
              className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
            >
              <Upload className="h-4 w-4" />
              رفع تقرير
            </button>
            <button
              onClick={handleExport}
              disabled={exporting || !allData}
              className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {exporting ? "...جارٍ" : "تصدير البيانات"}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-800 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? "...جارٍ" : "حذف"}
            </button>
          </div>
        </div>

        {/* ===== QUICK STATS BAR ===== */}
        {campaignStats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { label: "إجمالي الإنفاق", value: formatCurrency(campaignStats.totalSpend || 0, campaignStats.currency || currency), icon: DollarSign, color: "purple" },
              { label: "إجمالي الميزانية", value: formatCurrency(campaignStats.totalBudget || 0, campaignStats.currency || currency), icon: Wallet, color: "blue" },
              { label: "الحملات النشطة", value: `${campaignStats.active || 0} / ${campaignStats.total || 0}`, icon: Play, color: "green" },
              { label: "الكريتفز", value: creatives.length || 0, icon: Image, color: "pink" },
              { label: "التحليلات", value: allData?.totalAnalyses || 0, icon: BarChart3, color: "amber" },
              { label: "التنبيهات", value: alerts.filter((a: any) => a.severity === "critical").length || 0, icon: AlertCircle, color: "red" },
            ].map((stat, i) => (
              <motion.div key={stat.label}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-lg bg-${stat.color}-50 dark:bg-${stat.color}-900/20`}>
                    <stat.icon className={`h-4 w-4 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                  </div>
                  <span className="text-xs text-gray-400">{stat.label}</span>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </motion.div>
            ))}
          </div>
        )}

        {loadingExtra && (
          <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 py-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            جاري تحميل الحملات والكريتفز...
          </div>
        )}

        {/* ===== SECTION TABS ===== */}
        <div className="flex gap-1 overflow-x-auto pb-2">
          {sections.map((s) => {
            const Icon = s.icon
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id === activeSection ? "all" : s.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                  activeSection === s.id
                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {s.label}
              </button>
            )
          })}
        </div>

        {!m && !allData ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-16 text-center mb-8">
            <BarChart3 className="mx-auto h-10 w-10 text-gray-400 mb-3" />
            <p className="text-gray-500 mb-1">لا توجد تحليلات لهذا البراند بعد</p>
            <p className="text-xs text-gray-400 mb-4">ارفع تقرير لبدء التحليل</p>
            <button
              onClick={() => router.push("/dashboard/upload")}
              className="rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
            >
              ارفع تقريرك الأول
            </button>
          </div>
        ) : (
          <>
            {/* ===== AI INSIGHTS & RECOMMENDATIONS ===== */}
            {(activeSection === "all" || activeSection === "insights") && insights.length > 0 && (() => {
              const insightText = typeof insights === "string" ? insights : Array.isArray(insights) ? insights.join("\n") : ""
              const recs = recommendations.length > 0 ? recommendations : []
              const preds = predictions.length > 0 ? predictions : []
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-gray-900 p-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">تحليلات وتوصيات الذكاء الاصطناعي</h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Insights */}
                    {insightText && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1.5">
                          <Lightbulb className="h-4 w-4 text-yellow-500" /> الرؤى والتحليلات
                        </h4>
                        <div className="space-y-2">
                          {(Array.isArray(insights) ? insights : [insightText]).map((ins: string, i: number) => (
                            <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-white dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
                              <div className="mt-0.5 h-2 w-2 rounded-full bg-purple-500 shrink-0" />
                              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{ins}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {recs.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1.5">
                          <Zap className="h-4 w-4 text-orange-500" /> التوصيات
                        </h4>
                        <div className="space-y-2">
                          {recs.map((rec: any, i: number) => {
                            const text = typeof rec === "string" ? rec : rec.text || rec.recommendation || ""
                            return (
                              <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/10 border border-orange-100 dark:border-orange-900/20">
                                <div className="mt-0.5 h-2 w-2 rounded-full bg-orange-500 shrink-0" />
                                <p className="text-sm text-gray-700 dark:text-gray-300">{text}</p>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Predictions */}
                  {preds.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-800">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1.5">
                        <TrendingUp className="h-4 w-4 text-blue-500" /> التوقعات
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {preds.map((pred: any, i: number) => {
                          const text = typeof pred === "string" ? pred : pred.text || pred.prediction || ""
                          const label = typeof pred === "object" ? pred.label || pred.metric || "" : ""
                          return (
                            <div key={i} className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/20">
                              {label && <p className="text-xs font-medium text-blue-600 mb-1">{label}</p>}
                              <p className="text-sm text-gray-700 dark:text-gray-300">{text}</p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })()}

            {/* ===== KPIS ===== */}
            {(activeSection === "all" || activeSection === "kpis") && m && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {kpiList.map((kpi, i) => (
                  <motion.div
                    key={kpi.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <KPICard {...kpi} />
                  </motion.div>
                ))}
              </div>
            )}

            {/* ===== CAMPAIGNS ===== */}
            {(activeSection === "all" || activeSection === "campaigns") && (
              <>
                <CampaignSpendSection brandName={brand.name} />
                {campaigns.length > 0 && (
                  <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                        <Play className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">جميع الحملات</h3>
                      <span className="text-xs text-gray-400">({campaigns.length} حملة)</span>
                    </div>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {campaigns.map((c: any) => (
                        <div key={c.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`h-2.5 w-2.5 rounded-full ${
                              c.status === "active" ? "bg-green-500" :
                              c.status === "paused" ? "bg-yellow-500" : "bg-gray-400"
                            }`} />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{c.name}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                <span>{c.platform}</span>
                                <span>·</span>
                                <span>{c.goal}</span>
                                {c.clientName && <><span>·</span><span>{c.clientName}</span></>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 shrink-0 text-xs text-gray-500">
                            <span>ميزانية: {formatCurrency(c.totalBudget, c.currency)}</span>
                            <span>صرف: {formatCurrency(c.totalSpend, c.currency)}</span>
                            <span>{c.logCount || 0} تسجيل</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ===== CREATIVES GALLERY ===== */}
            {(activeSection === "all" || activeSection === "creatives") && creatives.length > 0 && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-pink-50 dark:bg-pink-900/20">
                    <Image className="h-5 w-5 text-pink-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">معرض الكريتفز</h3>
                  <span className="text-xs text-gray-400">({creatives.length} إعلان)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {creatives.slice(0, 15).map((c: any, i: number) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => setSelectedCreative(c)}
                      className="group cursor-pointer rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600 transition-all"
                    >
                      <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 relative">
                        {c.fileData && c.fileData.startsWith("data:image/") ? (
                          <img src={c.fileData} alt={c.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Image className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                          </div>
                        )}
                        {c.aiScore && (
                          <div className={`absolute top-1.5 right-1.5 text-xs font-bold px-1.5 py-0.5 rounded-md ${
                            c.aiScore >= 7 ? "bg-green-500 text-white" :
                            c.aiScore >= 4 ? "bg-yellow-500 text-white" : "bg-red-500 text-white"
                          }`}>
                            {c.aiScore}
                          </div>
                        )}
                        {c.status === "pending" && (
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <Loader2 className="h-5 w-5 animate-spin text-white" />
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{c.name}</p>
                        {c.platform && <p className="text-[10px] text-gray-400">{c.platform}</p>}
                      </div>
                    </motion.div>
                  ))}
                  {creatives.length > 15 && (
                    <button
                      onClick={() => router.push("/dashboard/creatives")}
                      className="aspect-[4/3] rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-xs text-gray-500 hover:border-purple-400 hover:text-purple-600 transition-all"
                    >
                      +{creatives.length - 15} المزيد
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ===== CHARTS + SIDEBAR ===== */}
            {(activeSection === "all" || activeSection === "charts") && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <OverviewChart data={dashData?.monthlyData} currency={currency} />
                </div>
                <div className="space-y-6">
                  <AlertsCard alerts={alerts} router={router} />
                  <BrandInfoCard brand={brand} currency={currency} allData={allData} />
                </div>
              </div>
            )}

            {/* ===== UPLOADS & ANALYSES HISTORY ===== */}
            {(activeSection === "all" || activeSection === "history") && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <UploadsList brand={brand} fetchData={fetchData} />
                <AnalysesList brand={brand} fetchData={fetchData} />
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Creative Analysis Modal */}
      <AnimatePresence>
        {selectedCreative && (
          <CreativeQuickView creative={selectedCreative} onClose={() => setSelectedCreative(null)} />
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}

/* ===== SUPPORTING COMPONENTS ===== */

function AlertsCard({ alerts, router }: { alerts: any[]; router: any }) {
  const critical = alerts.filter((a: any) => a.severity === "critical")
  const warning = alerts.filter((a: any) => a.severity === "warning")
  const info = alerts.filter((a: any) => a.severity === "info")

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">التنبيهات</h3>
      {alerts.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">لا توجد تنبيهات</p>
      ) : (
        <div className="space-y-2 max-h-[220px] overflow-y-auto">
          {alerts.slice(0, 8).map((alert: any) => (
            <div key={alert.id} className="flex items-start gap-2 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                alert.severity === "critical" ? "bg-red-500" : alert.severity === "warning" ? "bg-yellow-500" : "bg-blue-500"
              }`} />
              <div className="min-w-0">
                <p className="text-xs text-gray-700 dark:text-gray-300">{alert.message}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{new Date(alert.createdAt).toLocaleDateString("ar-EG")}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {critical.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs text-red-500 font-medium">{critical.length} تنبيه حرج</p>
        </div>
      )}
    </div>
  )
}

function BrandInfoCard({ brand, currency, allData }: { brand: any; currency: string; allData: any }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">معلومات البراند</h3>
      <div className="space-y-3">
        {[
          { label: "الاسم", value: brand.name },
          { label: "التخصص", value: brand.niche || "-" },
          { label: "البلد", value: brand.country || "-" },
          { label: "العملة", value: currency },
          { label: "إجمالي التحليلات", value: allData?.totalAnalyses || 0 },
          { label: "إجمالي الرفعات", value: allData?.totalUploads || 0 },
          { label: "الحملات", value: allData?.campaignStats?.total || 0 },
          { label: "الكريتفز", value: allData?.creatives?.length || 0 },
          { label: "تاريخ الإنشاء", value: new Date(brand.createdAt).toLocaleDateString("ar-EG") },
        ].map((s) => (
          <div key={s.label} className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{s.label}</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function UploadsList({ brand, fetchData }: { brand: any; fetchData: () => void }) {
  const platformIcons: Record<string, any> = {
    meta: Globe, tiktok: Music2, google: Search, snapchat: Ghost,
  }

  const handleDeleteUpload = async (e: React.MouseEvent, uploadId: string) => {
    e.stopPropagation()
    if (!window.confirm("هل أنت متأكد من حذف هذا التقرير؟")) return
    try {
      await fetch(`/api/upload?id=${uploadId}`, { method: "DELETE" })
      fetchData()
    } catch {}
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">التقارير المرفوعة</h3>
      {(!brand.uploads || brand.uploads.length === 0) ? (
        <p className="text-sm text-gray-500 text-center py-4">لا توجد تقارير بعد</p>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {brand.uploads?.map((item: any) => {
            const Icon = platformIcons[item.platform] || FileSpreadsheet
            return (
              <div key={item.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
                onClick={() => item.analyses?.[0] && window.open(`/dashboard/analysis/${item.analyses[0].id}`, "_blank")}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="h-5 w-5 shrink-0 text-gray-400" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.fileName}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      <span className="capitalize">{item.platform}</span>
                      <span>·</span>
                      <span>{item.fileType}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString("ar-EG")}</span>
                  {item.status === "completed" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  {item.status === "processing" && <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />}
                  {item.status === "failed" && <XCircle className="h-4 w-4 text-red-500" />}
                  <button
                    onClick={(e) => handleDeleteUpload(e, item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function AnalysesList({ brand, fetchData }: { brand: any; fetchData: () => void }) {
  const handleDeleteAnalysis = async (e: React.MouseEvent, analysisId: string) => {
    e.stopPropagation()
    if (!window.confirm("هل أنت متأكد من حذف هذا التحليل؟")) return
    try {
      await fetch(`/api/analyze?id=${analysisId}`, { method: "DELETE" })
      fetchData()
    } catch {}
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">التحليلات</h3>
      {(!brand.analyses || brand.analyses.length === 0) ? (
        <p className="text-sm text-gray-500 text-center py-4">لا توجد تحليلات بعد</p>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {brand.analyses?.map((item: any) => (
            <div key={item.id}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
              onClick={() => window.open(`/dashboard/analysis/${item.id}`, "_blank")}
            >
              <div className="flex items-center gap-3 min-w-0">
                <BarChart3 className="h-5 w-5 shrink-0 text-gray-400" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.title}</p>
                  <p className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleDateString("ar-EG")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {item.status === "completed" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                {item.status === "processing" && <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />}
                {item.status === "failed" && <XCircle className="h-4 w-4 text-red-500" />}
                <button
                  onClick={(e) => handleDeleteAnalysis(e, item.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CreativeQuickView({ creative, onClose }: { creative: any; onClose: () => void }) {
  let analysis: any = null
  let score = 0
  try {
    analysis = JSON.parse(creative.aiAnalysis || "{}")
    score = analysis.score || creative.aiScore || 0
  } catch {}

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95 }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Creative Image */}
        {creative.fileData && creative.fileData.startsWith("data:image/") && (
          <div className="aspect-video bg-gray-100 dark:bg-gray-800">
            <img src={creative.fileData} alt={creative.name} className="w-full h-full object-contain" />
          </div>
        )}

        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">{creative.name}</h3>
              {creative.platform && <p className="text-xs text-gray-500 mt-0.5">{creative.platform}</p>}
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800">
              <XCircle className="h-5 w-5" />
            </button>
          </div>

          {analysis && analysis.summary ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold ${
                  score >= 7 ? "bg-green-50 dark:bg-green-900/20 text-green-600" :
                  score >= 4 ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600" :
                  "bg-red-50 dark:bg-red-900/20 text-red-600"
                }`}>
                  {score}
                </div>
                <p className="text-xs text-gray-500 mt-1">التقييم</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                <p className="text-sm text-gray-700 dark:text-gray-300">{analysis.summary}</p>
              </div>

              {analysis.strengths?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-green-600 mb-2">نقاط القوة</p>
                  {analysis.strengths.map((s: string, i: number) => (
                    <p key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1.5 mb-1">
                      <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />{s}
                    </p>
                  ))}
                </div>
              )}

              {analysis.weaknesses?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-red-600 mb-2">نقاط الضعف</p>
                  {analysis.weaknesses.map((w: string, i: number) => (
                    <p key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1.5 mb-1">
                      <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />{w}
                    </p>
                  ))}
                </div>
              )}

              {analysis.recommendations?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-purple-600 mb-2">التوصيات</p>
                  {analysis.recommendations.map((r: string, i: number) => (
                    <p key={i} className="text-xs text-gray-600 dark:text-gray-400 bg-purple-50 dark:bg-purple-900/10 rounded-lg p-3 mb-1">{r}</p>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <AlertCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">
                {creative.status === "pending" ? "جارٍ تحليل الإعلان..." : "لا يوجد تحليل متاح"}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
