"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useAuth } from "@/context/auth-context"
import { useRouter, useParams } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import {
  ArrowLeft, Store, Globe, Loader2, TrendingUp, DollarSign, Target,
  BarChart3, Image, Play, Download, Trash2, ExternalLink, Sparkles, Lightbulb,
  Users, Monitor, Smartphone, ShoppingBag, ListChecks, Plus, CheckCircle2, Circle,
  Layers,
} from "lucide-react"

const LEVELS = [
  { key: "campaign", label: "الحملات", icon: BarChart3 },
  { key: "adset", label: "المجموعات الإعلانية", icon: Layers },
  { key: "ad", label: "الإعلانات", icon: Image },
]

export default function BrandDetailPage() {
  const [brand, setBrand] = useState<any>(null)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedCurrency, setSelectedCurrency] = useState("USD")
  const [selectedLevel, setSelectedLevel] = useState("campaign")
  const [brandTasks, setBrandTasks] = useState<any[]>([])
  const [showQuickTask, setShowQuickTask] = useState(false)
  const [quickTaskTitle, setQuickTaskTitle] = useState("")
  const [savingTask, setSavingTask] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const brandId = params?.id as string

  useEffect(() => {
    if (!user || !brandId) return
    fetch(`/api/brands?id=${brandId}&userId=${user.id}`)
      .then((r) => r.json())
      .then((d) => { setBrand(d.brand); setData(d); setLoading(false) })
      .catch(() => { setError("فشل تحميل البراند"); setLoading(false) })
  }, [user, brandId])

  useEffect(() => {
    if (!data?.analyses?.length) return
    const currencies = [...new Set(data.analyses.map((a: any) => getCurrency(a)))] as string[]
    if (currencies.length > 0 && !currencies.includes(selectedCurrency)) {
      setSelectedCurrency(currencies[0])
    }
    const availLevels = ["campaign", "adset", "ad"] as const
    const firstLevel = availLevels.find(l => data.analyses.some((a: any) => a.level === l))
    if (firstLevel && selectedLevel !== firstLevel) {
      setSelectedLevel(firstLevel)
    }
  }, [data])

  useEffect(() => {
    if (!brandId) return
    fetch(`/api/tasks?brandId=${brandId}`)
      .then((r) => r.json())
      .then((d) => setBrandTasks(d.tasks || []))
      .catch(() => {})
  }, [brandId])

  const addQuickTask = async () => {
    if (!quickTaskTitle.trim() || !user || !brandId) return
    setSavingTask(true)
    try {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: quickTaskTitle.trim(), brandId, taskType: "ad_upload", date: new Date().toISOString().slice(0, 10), userId: user.id }),
      })
      const res = await fetch(`/api/tasks?brandId=${brandId}`)
      const d = await res.json()
      setBrandTasks(d.tasks || [])
      setQuickTaskTitle("")
      setShowQuickTask(false)
    } catch {} finally { setSavingTask(false) }
  }

  const toggleTaskStatus = async (task: any) => {
    await fetch("/api/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: task.id, status: task.status === "completed" ? "pending" : "completed" }),
    })
    const res = await fetch(`/api/tasks?brandId=${brandId}`)
    const d = await res.json()
    setBrandTasks(d.tasks || [])
  }

  const handleExport = () => {
    if (!data) return
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = `brand-${brand.name}.json`; a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return (<DashboardLayout><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-purple-600" /></div></DashboardLayout>)
  if (error || !brand) return (<DashboardLayout><div className="text-center py-20"><p className="text-gray-500">{error || "البراند غير موجود"}</p></div></DashboardLayout>)

  const analysesList = data?.analyses || []
  const filteredAnalyses = analysesList.filter((a: any) => a.level === selectedLevel)

  const byCurrencyMap: Record<string, any[]> = {}
  for (const a of filteredAnalyses) {
    const cur = getCurrency(a)
    if (!byCurrencyMap[cur]) byCurrencyMap[cur] = []
    byCurrencyMap[cur].push(a)
  }
  const currencies = Object.keys(byCurrencyMap)
  const activeCur = currencies.includes(selectedCurrency) ? selectedCurrency : (currencies[0] || "USD")
  const metrics = filteredAnalyses.length ? calcMetrics(byCurrencyMap[activeCur] || []) : null
  const currency = activeCur

  // Build per-entity breakdown table for selected level
  const entities: any[] = []
  for (const a of filteredAnalyses) {
    if (!a.rawData) continue
    try {
      const rd = JSON.parse(a.rawData)
      if (rd.breakdown) {
        for (const [name, em] of Object.entries(rd.breakdown)) {
          entities.push({ name, ...em as any, analysisTitle: a.title })
        }
      }
    } catch {}
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/dashboard/brands")} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/30">
              <Store className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{brand.name}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {brand.niche && <span>{brand.niche}</span>}
                {brand.country && <><span>·</span><span>{brand.country}</span></>}
                {brand.platforms && <><span>·</span><span>{brand.platforms}</span></>}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {brand.website && (
              <a href={brand.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                <ExternalLink className="h-4 w-4" /> الموقع
              </a>
            )}
            <button onClick={handleExport} className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
              <Download className="h-4 w-4" /> تصدير
            </button>
          </div>
        </div>

        {/* Brand Info Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Onboarding Data */}
            <div className="rounded-xl border border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-gray-900 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">معلومات البراند</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "الأهداف", value: brand.goals, icon: Target },
                  { label: "الجمهور المستهدف", value: brand.targetAudience, icon: Users },
                  { label: "المنصات", value: brand.platforms, icon: Monitor },
                  { label: "الميزانية الشهرية", value: brand.monthlyBudget ? formatCurrency(brand.monthlyBudget, currency) : null, icon: DollarSign },
                  { label: "التخصص", value: brand.niche, icon: ShoppingBag },
                  { label: "البلد", value: brand.country, icon: Globe },
                ].map((item) => item.value ? (
                  <div key={item.label} className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
                    <item.icon className="h-5 w-5 text-purple-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">{item.label}</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</p>
                    </div>
                  </div>
                ) : null)}
              </div>
              {brand.notes && (
                <div className="mt-4 p-3 rounded-lg bg-white dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-400 mb-1">ملاحظات</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{brand.notes}</p>
                </div>
              )}
            </div>

            {/* Website Analysis */}
            {brand.websiteAnalysis && (() => {
              let wa: any = {}
              try { wa = JSON.parse(brand.websiteAnalysis) } catch {}
              return wa.title ? (
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Globe className="h-5 w-5 text-blue-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">تحليل الموقع</h3>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{wa.title}</p>
                    {wa.description && <p className="text-sm text-gray-500">{wa.description}</p>}
                    <div className="flex flex-wrap gap-2">
                      {wa.tags?.map((t: string, i: number) => (
                        <span key={i} className="text-xs px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null
            })()}

            {/* Level Tabs */}
            <div className="flex flex-wrap gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-1 w-fit">
              {LEVELS.map((lv) => {
                const Icon = lv.icon
                const count = analysesList.filter((a: any) => a.level === lv.key).length
                return (
                  <button key={lv.key} onClick={() => setSelectedLevel(lv.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      selectedLevel === lv.key ? "bg-white dark:bg-gray-700 text-purple-600 shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {lv.label}
                    <span className="text-[10px] opacity-60">({count})</span>
                  </button>
                )
              })}
            </div>

            {/* Currency Tabs */}
            {currencies.length > 1 && metrics && (
              <div className="flex gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-1 w-fit">
                {currencies.map((cur) => (
                  <button key={cur} onClick={() => setSelectedCurrency(cur)}
                    className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                      activeCur === cur ? "bg-white dark:bg-gray-700 text-purple-600 shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    {cur}
                  </button>
                ))}
              </div>
            )}

            {/* Metrics */}
            {metrics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "إجمالي الإنفاق", value: formatCurrency(metrics.spend, currency), icon: DollarSign, color: "text-red-500" },
                  { label: "الإيرادات", value: formatCurrency(metrics.revenue, currency), icon: TrendingUp, color: "text-green-500" },
                  { label: "ROAS", value: `${metrics.roas.toFixed(2)}x`, icon: Target, color: "text-purple-500" },
                  { label: "CPA", value: formatCurrency(metrics.cpa, currency), icon: Target, color: "text-yellow-500" },
                  { label: "CTR", value: `${metrics.ctr.toFixed(2)}%`, icon: BarChart3, color: "text-blue-500" },
                  { label: "CPM", value: formatCurrency(metrics.cpm, currency), icon: BarChart3, color: "text-orange-500" },
                  { label: "التحويلات", value: metrics.conversions || 0, icon: Target, color: "text-green-500" },
                  { label: "الأرباح", value: formatCurrency(metrics.profit, currency), icon: DollarSign, color: "text-blue-500" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <s.icon className={`h-4 w-4 ${s.color}`} />
                      <span className="text-xs text-gray-400">{s.label}</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{s.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Per-Entity Breakdown Table */}
            {entities.length > 0 && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  تفاصيل {LEVELS.find(l => l.key === selectedLevel)?.label}
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
                      {entities.map((e, i) => (
                        <tr key={i} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                          <td className="py-2 px-3 text-gray-900 dark:text-white font-medium">{e.name}</td>
                          <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{formatCurrency(e.spend, currency)}</td>
                          <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{formatCurrency(e.revenue, currency)}</td>
                          <td className={`py-2 px-3 font-medium ${e.roas >= 2 ? "text-green-600" : e.roas >= 1 ? "text-yellow-600" : "text-red-600"}`}>{e.roas?.toFixed(2)}x</td>
                          <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{(e.impressions || 0).toLocaleString()}</td>
                          <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{(e.clicks || 0).toLocaleString()}</td>
                          <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{e.conversions || 0}</td>
                          <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{formatCurrency(e.cpa, currency)}</td>
                          <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{e.ctr?.toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {data.uploads?.length > 0 && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">التقارير المرفوعة</h3>
                <div className="space-y-2">
                  {data.uploads.slice(0, 5).map((u: any) => (
                    <div key={u.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/30 text-xs text-gray-500">
                      <BarChart3 className="h-3 w-3 shrink-0" />
                      <span className="truncate">{u.fileName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.campaigns?.length > 0 && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">الحملات</h3>
                <div className="space-y-2">
                  {data.campaigns.slice(0, 5).map((c: any) => (
                    <div key={c.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/30 text-xs text-gray-500">
                      <Play className="h-3 w-3 shrink-0" />
                      <span className="truncate">{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tasks */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">المهام</h3>
                <button onClick={() => setShowQuickTask(true)} className="text-purple-600 hover:text-purple-700 p-1">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {showQuickTask && (
                <div className="mb-3 flex gap-2">
                  <input value={quickTaskTitle} onChange={(e) => setQuickTaskTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addQuickTask()}
                    placeholder="مهمة جديدة..."
                    className="flex-1 h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 text-xs text-gray-900 dark:text-white placeholder:text-gray-400"
                    autoFocus
                  />
                  <button onClick={addQuickTask} disabled={savingTask || !quickTaskTitle.trim()}
                    className="px-3 rounded-lg bg-purple-600 text-xs text-white font-medium hover:bg-purple-700 disabled:opacity-50"
                  >
                    {savingTask ? "..." : "إضافة"}
                  </button>
                </div>
              )}
              {brandTasks.length > 0 ? (
                <div className="space-y-1.5">
                  {brandTasks.slice(0, 5).map((t: any) => (
                    <div key={t.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/30 text-xs">
                      <button onClick={() => toggleTaskStatus(t)} className="shrink-0">
                        {t.status === "completed" ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4 text-gray-300 dark:text-gray-600" />}
                      </button>
                      <span className={`flex-1 truncate ${t.status === "completed" ? "text-gray-400 line-through" : "text-gray-700 dark:text-gray-300"}`}>
                        {t.title}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center py-3">لا توجد مهام</p>
              )}
            </div>

          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  )
}

function getCurrency(a: any): string {
  if (a.marketData) {
    try { const md = JSON.parse(a.marketData); if (md.currency) return md.currency } catch {}
  }
  return "USD"
}

function calcMetrics(analyses: any[]) {
  const m = { spend: 0, revenue: 0, roas: 0, cpa: 0, ctr: 0, cpm: 0, cpc: 0, conversionRate: 0, frequency: 0, impressions: 0, clicks: 0, conversions: 0, profit: 0, count: 0 }
  for (const a of analyses) {
    if (!a.metrics) continue
    try {
      const p = JSON.parse(a.metrics)
      m.spend += p.spend || 0; m.revenue += p.revenue || 0
      m.impressions += p.impressions || 0; m.clicks += p.clicks || 0; m.conversions += p.conversions || 0
      m.cpa += p.cpa || 0; m.ctr += p.ctr || 0; m.cpm += p.cpm || 0; m.cpc += p.cpc || 0
      m.conversionRate += p.conversionRate || 0; m.frequency += p.frequency || 0; m.profit += p.profit || 0
      m.roas += p.roas || 0; m.count++
    } catch {}
  }
  if (m.count > 0) {
    m.cpa /= m.count; m.ctr /= m.count; m.cpm /= m.count; m.cpc /= m.count
    m.conversionRate /= m.count; m.frequency /= m.count; m.roas /= m.count
  }
  return m
}
