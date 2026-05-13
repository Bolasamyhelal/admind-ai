"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import type { Decision, DecisionSummary } from "@/lib/decision-engine"
import {
  TrendingUp, TrendingDown, AlertTriangle, Target,
  ChevronDown, ChevronUp, Search, Brain, Loader2, Zap, Shield,
  DollarSign, BarChart3, Eye, MousePointerClick, Repeat, Layers, Filter,
} from "lucide-react"

const verdictDisplay: Record<string, { label: string; shortLabel: string; icon: any; color: string }> = {
  scale_high: { label: "Scale Up 50%", shortLabel: "توسع كبير", icon: TrendingUp, color: "emerald" },
  scale_medium: { label: "Scale Up 30%", shortLabel: "توسع وسط", icon: TrendingUp, color: "teal" },
  scale_low: { label: "Scale Up 15%", shortLabel: "توسع بسيط", icon: TrendingUp, color: "green" },
  optimize_creative: { label: "تغيير الكريتيف", shortLabel: "تغيير كريتيف", icon: Eye, color: "amber" },
  optimize_targeting: { label: "تحسين الاستهداف", shortLabel: "تحسين استهداف", icon: Target, color: "orange" },
  optimize_landing: { label: "تحسين الصفحة", shortLabel: "تحسين صفحة", icon: BarChart3, color: "yellow" },
  optimize_bid: { label: "تحسين Bid", shortLabel: "تحسين Bid", icon: DollarSign, color: "amber" },
  pause: { label: "إيقاف مؤقت", shortLabel: "إيقاف مؤقت", icon: Shield, color: "red" },
  kill: { label: "إيقاف نهائي", shortLabel: "إيقاف نهائي", icon: Shield, color: "rose" },
  monitor: { label: "مراقبة", shortLabel: "مراقبة", icon: Eye, color: "blue" },
  test: { label: "اختبار", shortLabel: "اختبار", icon: Layers, color: "purple" },
  review_attribution: { label: "مراجعة التتبع", shortLabel: "مراجعة تتبع", icon: AlertTriangle, color: "gray" },
}

const filterGroups = [
  { key: "all", label: "الكل" },
  { key: "scale", label: "Scale" },
  { key: "optimize", label: "Optimize" },
  { key: "pause_kill", label: "إيقاف" },
  { key: "monitor", label: "مراقبة" },
]

export default function DecisionsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [summary, setSummary] = useState<DecisionSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"confidence" | "spend" | "roas">("confidence")

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
      const res = await fetch(`/api/decisions?userId=${user.id}`)
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || "Failed")
      setDecisions(d.decisions)
      setSummary(d.summary)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filtered = decisions.filter(d => {
    if (filter !== "all") {
      if (filter === "scale") return d.verdict.startsWith("scale_")
      if (filter === "optimize") return d.verdict.startsWith("optimize_") || d.verdict === "review_attribution"
      if (filter === "pause_kill") return d.verdict === "pause" || d.verdict === "kill"
      if (filter === "monitor") return d.verdict === "monitor" || d.verdict === "test"
    }
    const q = search.toLowerCase()
    return !q || d.entityName.toLowerCase().includes(q) || d.brandName?.toLowerCase().includes(q)
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "confidence") return b.confidence - a.confidence
    if (sortBy === "spend") return b.metrics.spend - a.metrics.spend
    if (sortBy === "roas") return b.metrics.roas - a.metrics.roas
    return 0
  })

  const formatNum = (n: number) =>
    n >= 1000000 ? (n / 1000000).toFixed(1) + "M" :
    n >= 1000 ? (n / 1000).toFixed(1) + "K" :
    n.toFixed(2)

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-gray-800 to-slate-900 p-8 mb-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-violet-500/10 via-transparent to-transparent" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">لوحة القرارات</h1>
                <p className="text-sm text-gray-400">كل حملة وإعلان ومجموعة — مع قرار واضح: اسكيل، حسّن، أوقف، أو راقب</p>
              </div>
            </div>

            {summary && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-6">
                <StatBox label="إجمالي" value={summary.total.toString()} color="white" />
                <StatBox label="Scale" value={(summary.scaleHigh + summary.scaleMedium + summary.scaleLow).toString()} color="emerald" />
                <StatBox label="تحسين" value={summary.optimize.toString()} color="amber" />
                <StatBox label="إيقاف" value={summary.pauseKill.toString()} color="red" />
                <StatBox label="مراقبة" value={summary.monitor.toString()} color="blue" />
              </div>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        {summary && summary.total > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 p-4 border border-emerald-200 dark:border-emerald-800/30">
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">ميزانية قابلة للتوسع</p>
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{formatNum(Number(summary.monthlyBudgetOptimization))}</p>
              <p className="text-[10px] text-emerald-500 mt-1">إنفاق على حملات Scale — يمكن زيادتها</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 p-4 border border-purple-200 dark:border-purple-800/30">
              <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">الإيرادات المتوقعة بعد التوسع</p>
              <p className="text-lg font-bold text-purple-700 dark:text-purple-300">+{summary.potentialRevenueIncrease}</p>
              <p className="text-[10px] text-purple-500 mt-1">تقدير متحفظ بناءً على الأداء الحالي</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 p-4 border border-red-200 dark:border-red-800/30">
              <p className="text-xs text-red-600 dark:text-red-400 mb-1">حملات خاسرة</p>
              <p className="text-lg font-bold text-red-700 dark:text-red-300">{summary.pauseKill}</p>
              <p className="text-[10px] text-red-500 mt-1">حملة تحتاج إيقاف فوري — وقف النزيف</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="ابحث عن حملة، إعلان، أو براند..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-11 pr-10 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 text-sm text-gray-900 dark:text-white outline-none focus:border-purple-500" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {filterGroups.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                  filter === f.key
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:border-purple-300"
                }`}>
                {f.label}
              </button>
            ))}
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
            className="h-11 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 text-sm text-gray-900 dark:text-white outline-none focus:border-purple-500">
            <option value="confidence">حسب الثقة</option>
            <option value="spend">حسب الإنفاق</option>
            <option value="roas">حسب ROAS</option>
          </select>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-4" />
            <p className="text-sm text-gray-500">جارٍ تحليل القرارات...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-950/20 p-4 border border-red-200 dark:border-red-800/30 text-sm text-red-600 dark:text-red-400">
            {error} <button onClick={fetchData} className="mr-4 underline">إعادة</button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && sorted.length === 0 && (
          <div className="text-center py-20">
            <Brain className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium mb-1">لا توجد قرارات حالياً</p>
            <p className="text-sm text-gray-400">ارفع تقارير حملاتك لتحصل على قرارات واضحة</p>
          </div>
        )}

        {/* Decision Cards */}
        {!loading && sorted.length > 0 && (
          <div className="space-y-2">
            {sorted.map((d) => {
              const vd = verdictDisplay[d.verdict] || verdictDisplay.monitor
              const isExpanded = expandedId === d.entityId
              const confColor = d.confidence >= 80 ? "bg-emerald-500" : d.confidence >= 60 ? "bg-amber-500" : "bg-blue-500"
              return (
                <motion.div key={d.entityId} layout initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <button onClick={() => setExpandedId(isExpanded ? null : d.entityId)}
                    className="w-full flex items-center gap-3 p-4 text-right hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    {/* Verdict badge (always visible) */}
                    <div className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold text-white ${
                      d.verdict.startsWith("scale_") ? "bg-emerald-600" :
                      d.verdict.startsWith("optimize_") || d.verdict === "review_attribution" ? "bg-amber-600" :
                      d.verdict === "pause" || d.verdict === "kill" ? "bg-red-600" :
                      d.verdict === "monitor" ? "bg-blue-600" :
                      "bg-purple-600"
                    }`}>
                      {vd.shortLabel}
                    </div>

                    {/* Entity info */}
                    <div className="min-w-0 flex-1 text-right">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{d.entityName}</p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">{d.entityType}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400">
                        {d.brandName && <span>{d.brandName}</span>}
                        {d.platform && <><span>·</span><span>{d.platform}</span></>}
                      </div>
                    </div>

                    {/* Key metrics */}
                    <div className="hidden sm:flex items-center gap-4 text-[10px] text-gray-500" dir="ltr">
                      <span>ROAS {d.metrics.roas.toFixed(1)}x</span>
                      <span>CPA {d.metrics.cpa.toFixed(0)}</span>
                      <span>إنفاق {formatNum(d.metrics.spend)}</span>
                    </div>

                    {/* Confidence */}
                    <div className="hidden sm:flex items-center gap-1.5">
                      <div className="w-12 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        <div className={`h-full rounded-full ${confColor}`} style={{ width: `${d.confidence}%` }} />
                      </div>
                      <span className="text-[10px] text-gray-500 w-7">{d.confidence}%</span>
                    </div>

                    {/* Key metric icon */}
                    <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
                      <vd.icon className={`h-4 w-4 ${
                        d.verdict.startsWith("scale_") ? "text-emerald-500" :
                        d.verdict.startsWith("optimize_") || d.verdict === "review_attribution" ? "text-amber-500" :
                        d.verdict === "pause" || d.verdict === "kill" ? "text-red-500" :
                        "text-blue-500"
                      }`} />
                    </div>

                    <ChevronDown className={`h-4 w-4 text-gray-400 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </button>

                  {/* Expanded Details */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden"
                      >
                        <div className="px-4 pb-5 space-y-4 border-t border-gray-100 dark:border-gray-800 pt-4">
                          {/* Verdict + Reasoning */}
                          <div className="flex items-start gap-3">
                            <div className={`shrink-0 p-2 rounded-xl ${
                              d.verdict.startsWith("scale_") ? "bg-emerald-100 dark:bg-emerald-900/30" :
                              d.verdict.startsWith("optimize_") || d.verdict === "review_attribution" ? "bg-amber-100 dark:bg-amber-900/30" :
                              d.verdict === "pause" || d.verdict === "kill" ? "bg-red-100 dark:bg-red-900/30" :
                              "bg-blue-100 dark:bg-blue-900/30"
                            }`}>
                              <vd.icon className={`h-5 w-5 ${
                                d.verdict.startsWith("scale_") ? "text-emerald-600" :
                                d.verdict.startsWith("optimize_") || d.verdict === "review_attribution" ? "text-amber-600" :
                                d.verdict === "pause" || d.verdict === "kill" ? "text-red-600" :
                                "text-blue-600"
                              }`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">{vd.label}</h3>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                  d.confidenceLevel === "high" ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600" :
                                  d.confidenceLevel === "medium" ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600" :
                                  "bg-blue-50 dark:bg-blue-950/30 text-blue-600"
                                }`}>
                                  {d.confidence}% ثقة
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{d.reasoning}</p>
                            </div>
                          </div>

                          {/* Metrics Grid */}
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                            <MetricBox label="ROAS" value={d.metrics.roas.toFixed(1) + "x"} color={d.metrics.roas >= 3 ? "emerald" : d.metrics.roas >= 1.5 ? "amber" : "red"} />
                            <MetricBox label="CPA" value={d.metrics.cpa.toFixed(2)} color={d.metrics.cpa < 30 ? "emerald" : d.metrics.cpa < 80 ? "amber" : "red"} />
                            <MetricBox label="CTR" value={d.metrics.ctr.toFixed(2) + "%"} color={d.metrics.ctr >= 2 ? "emerald" : d.metrics.ctr >= 1 ? "amber" : "red"} />
                            <MetricBox label="إنفاق" value={formatNum(d.metrics.spend)} color="blue" />
                            <MetricBox label="أرباح" value={formatNum(d.metrics.profit)} color={d.metrics.profit >= 0 ? "emerald" : "red"} />
                            <MetricBox label={d.verdict === "scale_high" || d.verdict === "scale_medium" ? "تحويلات" : "Frequency"}
                              value={d.verdict.startsWith("scale_") ? d.metrics.conversions.toString() : d.metrics.frequency.toFixed(1)}
                              color="purple" />
                          </div>

                          {/* Action */}
                          <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 rounded-xl p-4 border border-violet-200 dark:border-violet-800/30">
                            <div className="flex items-center gap-2 mb-2">
                              <Zap className="h-4 w-4 text-violet-600" />
                              <h4 className="text-xs font-bold text-violet-700 dark:text-violet-300">القرار: {d.actionTitle}</h4>
                            </div>
                            <ul className="space-y-1.5">
                              {d.actionSteps.map((step, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-violet-500 shrink-0" />
                                  {step}
                                </li>
                              ))}
                            </ul>
                            {d.targetAfterAction && (
                              <p className="text-[10px] text-violet-500 mt-2">الهدف: {d.targetAfterAction}</p>
                            )}
                          </div>
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
    </DashboardLayout>
  )
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    white: "text-white",
    emerald: "text-emerald-400",
    amber: "text-amber-400",
    red: "text-red-400",
    blue: "text-blue-400",
  }
  return (
    <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-3">
      <p className="text-[10px] text-gray-400 mb-0.5">{label}</p>
      <p className={`text-lg font-bold ${colorMap[color] || "text-white"}`}>{value}</p>
    </div>
  )
}

function MetricBox({ label, value, color }: { label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/30",
    amber: "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/30",
    red: "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/30",
    blue: "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/30",
    purple: "bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/30",
  }
  return (
    <div className={`rounded-lg p-2.5 border ${colorMap[color] || colorMap.blue}`}>
      <p className="text-[10px] opacity-75 mb-0.5">{label}</p>
      <p className="text-xs font-bold">{value}</p>
    </div>
  )
}
