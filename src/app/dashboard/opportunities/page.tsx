"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import type { GrowthOpportunity, GrowthAnalysisResult } from "@/lib/growth-analyzer"
import {
  TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Target,
  ChevronDown, ChevronUp, Search, Brain, X, Loader2,
  DollarSign, Users, Image, MapPin, ShoppingCart, BarChart3,
  Rocket, Shield, Flag, Zap, Layers,
} from "lucide-react"

const typeConfig = {
  scale: { label: "فرص التوسع", icon: Rocket, desc: "حملات جاهزة لزيادة الميزانية" },
  optimize: { label: "تحسين مطلوب", icon: Target, desc: "حملات تحتاج تعديل" },
  kill: { label: "إيقاف فوري", icon: Shield, desc: "حملات خاسرة" },
  explore: { label: "استكشاف", icon: Layers, desc: "فرص تحسين الجمهور والتكلفة" },
}

const typeBadgeClass: Record<string, string> = {
  scale: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400",
  optimize: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400",
  kill: "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400",
  explore: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
}

const typeIconBg: Record<string, string> = {
  scale: "from-emerald-500 to-teal-500",
  optimize: "from-amber-500 to-orange-500",
  kill: "from-red-500 to-rose-500",
  explore: "from-blue-500 to-indigo-500",
}

const categoryIcons: Record<string, any> = {
  budget: DollarSign, audience: Users, creative: Image,
  placement: MapPin, conversion: ShoppingCart, strategy: BarChart3,
}

const categoryLabels: Record<string, string> = {
  budget: "الميزانية", audience: "الجمهور", creative: "الكريتيف",
  placement: "المكان الإعلاني", conversion: "التحويلات", strategy: "الاستراتيجية",
}

const priorityBadgeClass: Record<string, string> = {
  high: "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400",
  medium: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400",
  low: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
}

const priorityLabel: Record<string, string> = {
  high: "عاجل", medium: "متوسط", low: "منخفض",
}

const healthColor: Record<string, string> = {
  good: "bg-emerald-500",
  warning: "bg-amber-500",
  critical: "bg-red-500",
}

const healthBorder: Record<string, string> = {
  good: "border-emerald-200 dark:border-emerald-800/30",
  critical: "border-red-200 dark:border-red-800/30",
  warning: "border-amber-200 dark:border-amber-800/30",
}

const healthBg: Record<string, string> = {
  good: "bg-emerald-50 dark:bg-emerald-950/20",
  critical: "bg-red-50 dark:bg-red-950/20",
  warning: "bg-amber-50 dark:bg-amber-950/20",
}

const filterActiveClass = "bg-purple-600 text-white border-purple-600"
const filterInactiveClass = "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800"

export default function OpportunitiesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<GrowthAnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedOpp, setExpandedOpp] = useState<string | null>(null)
  const [aiModal, setAiModal] = useState<{ open: boolean; opp: GrowthOpportunity | null; result: any; loading: boolean }>({
    open: false, opp: null, result: null, loading: false,
  })

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push("/sign-in"); return }
    fetchData()
  }, [user, authLoading])

  async function fetchData() {
    if (!user) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/opportunities?userId=${user.id}`)
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || "Failed")
      setData(d)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function analyzeWithAI(opp: GrowthOpportunity) {
    setAiModal({ open: true, opp, result: null, loading: true })
    try {
      const res = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunity: opp,
          brandName: opp.brandName,
          metrics: { [opp.metricKey]: opp.currentValue },
          currency: opp.currency,
        }),
      })
      const d = await res.json()
      setAiModal(prev => ({ ...prev, result: d, loading: false }))
    } catch {
      setAiModal(prev => ({ ...prev, loading: false, result: { deepAnalysis: "فشل الاتصال" } }))
    }
  }

  const filteredOpps = (data?.opportunities || []).filter(o => {
    const matchType = selectedType === "all" || o.type === selectedType
    const matchSearch = !searchQuery ||
      o.title.includes(searchQuery) ||
      o.brandName?.includes(searchQuery) ||
      o.description.includes(searchQuery)
    return matchType && matchSearch
  })

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 p-8 mb-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">فرص النمو</h1>
                <p className="text-sm text-gray-400">تحليل ذكي لاكتشاف فرص التوسع والتحسين في حملاتك</p>
              </div>
            </div>
            {data && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                <SummaryCard label="إجمالي الفرص" value={data.summary.totalOpportunities.toString()} />
                <SummaryCard label="فرص توسع" value={data.summary.scalingOpportunities.toString()} />
                <SummaryCard label="تحسين مطلوب" value={data.summary.optimizeOpportunities.toString()} />
                <SummaryCard label="إيقاف فوري" value={data.summary.killOpportunities.toString()} />
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        {data && data.summary.totalOpportunities > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 p-4 border border-emerald-200 dark:border-emerald-800/30">
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">النمو المحتمل</p>
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{data.summary.totalPotentialGrowth}</p>
              <p className="text-[10px] text-emerald-500 mt-1">إيرادات إضافية متوقعة</p>
            </div>
            <div className="rounded-xl bg-red-50 dark:bg-red-950/20 p-4 border border-red-200 dark:border-red-800/30">
              <p className="text-xs text-red-600 dark:text-red-400 mb-1">المبلغ المعرض للخطر</p>
              <p className="text-lg font-bold text-red-700 dark:text-red-300">{data.summary.totalAtRisk}</p>
              <p className="text-[10px] text-red-500 mt-1">إنفاق يحتاج تحسين أو إيقاف</p>
            </div>
            <div className="rounded-xl bg-blue-50 dark:bg-blue-950/20 p-4 border border-blue-200 dark:border-blue-800/30">
              <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">تم تحليل</p>
              <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{data.summary.brandsAnalyzed} براند · {data.summary.campaignsAnalyzed} حملة</p>
              <p className="text-[10px] text-blue-500 mt-1">البراندات والحملات في التحليل</p>
            </div>
          </div>
        )}

        {/* Brand Health */}
        {data?.brandBreakdown && data.brandBreakdown.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3">حالة البراندات</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {data.brandBreakdown.map(b => (
                <div key={b.brandId} className={`rounded-xl p-3 border ${healthBg[b.health] || "bg-gray-50"} ${healthBorder[b.health] || "border-gray-200"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{b.brandName}</p>
                    <span className={`h-2 w-2 rounded-full ${healthColor[b.health] || "bg-gray-400"} shrink-0`} />
                  </div>
                  <p className="text-[10px] text-gray-500">{b.topMetric}</p>
                  <p className="text-[10px] text-gray-400">{b.opportunities} فرصة</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text" placeholder="ابحث في الفرص..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pr-10 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 text-sm text-gray-900 dark:text-white outline-none focus:border-purple-500"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button onClick={() => setSelectedType("all")}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${selectedType === "all" ? filterActiveClass : filterInactiveClass}`}>
              الكل ({data?.opportunities.length || 0})
            </button>
            {(Object.entries(typeConfig) as [string, typeof typeConfig['scale']][]).map(([key, cfg]) => {
              const isActive = selectedType === key
              return (
                <button key={key} onClick={() => setSelectedType(key)}
                  className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${isActive ? filterActiveClass : filterInactiveClass}`}>
                  <cfg.icon className="h-4 w-4" />
                  {cfg.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-4" />
            <p className="text-sm text-gray-500">جارٍ تحليل فرص النمو...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-950/20 p-4 border border-red-200 dark:border-red-800/30 text-sm text-red-600 dark:text-red-400">
            {error}
            <button onClick={fetchData} className="mr-4 underline">إعادة المحاولة</button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && data?.opportunities.length === 0 && (
          <div className="text-center py-20">
            <Rocket className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium mb-1">لا توجد فرص حالياً</p>
            <p className="text-sm text-gray-400">ارفع تقارير حملاتك لتحليل فرص النمو</p>
          </div>
        )}

        {/* Opportunities List */}
        {!loading && filteredOpps.length > 0 && (
          <div className="space-y-3">
            {filteredOpps.map((opp) => {
              const cfg = typeConfig[opp.type]
              const CatIcon = categoryIcons[opp.category] || BarChart3
              const isExpanded = expandedOpp === opp.id
              return (
                <motion.div key={opp.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <button onClick={() => setExpandedOpp(isExpanded ? null : opp.id)}
                    className="w-full flex items-center justify-between p-4 text-right hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-xl bg-gradient-to-br ${typeIconBg[opp.type]} shrink-0`}>
                        <cfg.icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="min-w-0 text-right">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{opp.title}</h3>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${priorityBadgeClass[opp.priority]}`}>
                            {priorityLabel[opp.priority] || opp.priority}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 truncate mt-0.5">
                          {opp.brandName} · {opp.entityName || opp.platform || ""} · {categoryLabels[opp.category] || opp.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${typeBadgeClass[opp.type]}`}>
                        {cfg.label}
                      </span>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden"
                      >
                        <div className="px-4 pb-5 space-y-4 border-t border-gray-100 dark:border-gray-800 pt-4">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="sm:col-span-2">
                              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{opp.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <CatIcon className="h-3.5 w-3.5 text-gray-400" />
                                <span className="text-[10px] text-gray-500">{categoryLabels[opp.category]}</span>
                                {opp.platform && <><span className="text-[10px] text-gray-300">·</span><span className="text-[10px] text-gray-500">{opp.platform}</span></>}
                              </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800/30 rounded-xl p-3 border border-gray-100 dark:border-gray-800">
                              <p className="text-[10px] text-gray-500 mb-1">المقياس: {opp.metricKey.toUpperCase()}</p>
                              <p className="text-lg font-bold text-gray-900 dark:text-white">
                                {typeof opp.currentValue === "number" ? opp.currentValue.toLocaleString(undefined, { maximumFractionDigits: 2 }) : opp.currentValue}
                              </p>
                              {opp.targetValue && (
                                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                                  الهدف: {opp.targetValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-xl p-3 border border-purple-200 dark:border-purple-800/30">
                            <p className="text-[10px] text-purple-600 dark:text-purple-400 mb-1">التأثير المتوقع</p>
                            <p className="text-xs text-purple-700 dark:text-purple-300">{opp.potentialImpact}</p>
                          </div>

                          <div>
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
                              <Zap className="h-3.5 w-3.5 text-amber-500" />
                              الإجراءات المقترحة
                            </h4>
                            <ul className="space-y-1.5">
                              {opp.actionItems.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <button onClick={() => analyzeWithAI(opp)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium hover:from-purple-700 hover:to-indigo-700 transition-all"
                          >
                            <Brain className="h-4 w-4" />
                            تحليل متعمق بالذكاء الاصطناعي
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* AI Modal */}
      <AnimatePresence>
        {aiModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setAiModal({ open: false, opp: null, result: null, loading: false })}
          >
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gradient-to-br from-purple-600 to-indigo-700 p-5 text-white z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    <h2 className="text-sm font-bold">تحليل ذكي</h2>
                  </div>
                  <button onClick={() => setAiModal({ open: false, opp: null, result: null, loading: false })}
                    className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 transition-all">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {aiModal.opp && <p className="text-xs text-purple-200">{aiModal.opp.title}</p>}
              </div>

              <div className="p-5">
                {aiModal.loading ? (
                  <div className="flex flex-col items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-4" />
                    <p className="text-sm text-gray-500">الذكاء الاصطناعي يحلل الفرصة...</p>
                  </div>
                ) : aiModal.result ? (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-2">تحليل عميق</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{aiModal.result.deepAnalysis}</p>
                    </div>

                    {aiModal.result.rootCauses?.length > 0 && (
                      <div>
                        <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 text-red-500" /> الأسباب الجذرية
                        </h3>
                        <ul className="space-y-1.5">
                          {aiModal.result.rootCauses.map((c: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" /> {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {aiModal.result.actionPlan?.length > 0 && (
                      <div>
                        <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
                          <Zap className="h-3.5 w-3.5 text-amber-500" /> خطة العمل
                        </h3>
                        <ul className="space-y-1.5">
                          {aiModal.result.actionPlan.map((s: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" /> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {aiModal.result.timeline && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {aiModal.result.timeline.immediate?.length > 0 && (
                          <div className="rounded-xl bg-red-50 dark:bg-red-950/20 p-3 border border-red-200 dark:border-red-800/30">
                            <h4 className="text-[10px] font-bold text-red-700 dark:text-red-300 mb-2">فوري</h4>
                            {aiModal.result.timeline.immediate.map((item: string, i: number) => (
                              <p key={i} className="text-[10px] text-gray-600 dark:text-gray-400 mb-1">{item}</p>
                            ))}
                          </div>
                        )}
                        {aiModal.result.timeline.shortTerm?.length > 0 && (
                          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 p-3 border border-amber-200 dark:border-amber-800/30">
                            <h4 className="text-[10px] font-bold text-amber-700 dark:text-amber-300 mb-2">قصير المدى</h4>
                            {aiModal.result.timeline.shortTerm.map((item: string, i: number) => (
                              <p key={i} className="text-[10px] text-gray-600 dark:text-gray-400 mb-1">{item}</p>
                            ))}
                          </div>
                        )}
                        {aiModal.result.timeline.longTerm?.length > 0 && (
                          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 p-3 border border-emerald-200 dark:border-emerald-800/30">
                            <h4 className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 mb-2">طويل المدى</h4>
                            {aiModal.result.timeline.longTerm.map((item: string, i: number) => (
                              <p key={i} className="text-[10px] text-gray-600 dark:text-gray-400 mb-1">{item}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 p-3 border border-emerald-200 dark:border-emerald-800/30">
                        <div className="flex items-center gap-1.5 mb-1">
                          <TrendingUp className="h-3 w-3 text-emerald-500" />
                          <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">التحسين المتوقع</p>
                        </div>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 leading-relaxed">{aiModal.result.expectedImprovement || "غير محدد"}</p>
                      </div>
                      <div className="rounded-xl bg-red-50 dark:bg-red-950/20 p-3 border border-red-200 dark:border-red-800/30">
                        <div className="flex items-center gap-1.5 mb-1">
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                          <p className="text-[10px] font-bold text-red-700 dark:text-red-300">المخاطر</p>
                        </div>
                        <p className="text-[11px] text-red-600 dark:text-red-400 leading-relaxed">{aiModal.result.risks?.join("، ") || "غير محدد"}</p>
                      </div>
                      <div className="rounded-xl bg-blue-50 dark:bg-blue-950/20 p-3 border border-blue-200 dark:border-blue-800/30">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Flag className="h-3 w-3 text-blue-500" />
                          <p className="text-[10px] font-bold text-blue-700 dark:text-blue-300">مؤشرات النجاح</p>
                        </div>
                        <p className="text-[11px] text-blue-600 dark:text-blue-400 leading-relaxed">{aiModal.result.successIndicators?.join("، ") || "غير محدد"}</p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 p-3">
      <p className="text-[10px] text-gray-400 mb-1">{label}</p>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  )
}
