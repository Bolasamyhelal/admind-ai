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
  Users, Monitor, Smartphone, ShoppingBag,
} from "lucide-react"

export default function BrandDetailPage() {
  const [brand, setBrand] = useState<any>(null)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
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

  const metrics = data?.analyses?.length ? aggregateMetrics(data.analyses) : null
  const currency = brand.currency || "USD"

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

            {/* Metrics */}
            {metrics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "إجمالي الإنفاق", value: formatCurrency(metrics.spend, currency), icon: DollarSign, color: "text-red-500" },
                  { label: "الإيرادات", value: formatCurrency(metrics.revenue, currency), icon: TrendingUp, color: "text-green-500" },
                  { label: "ROAS", value: `${metrics.roas.toFixed(2)}x`, icon: Target, color: "text-purple-500" },
                  { label: "عدد التحليلات", value: data.analyses.length, icon: BarChart3, color: "text-blue-500" },
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

            {data.creatives?.length > 0 && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">الكريتفز</h3>
                <div className="grid grid-cols-3 gap-2">
                  {data.creatives.slice(0, 6).map((c: any) => (
                    <div key={c.id} className="aspect-square rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      {c.fileData?.startsWith("data:image/") ? (
                        <img src={c.fileData} alt={c.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full"><Image className="h-5 w-5 text-gray-300" /></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  )
}

function aggregateMetrics(analyses: any[]) {
  const m = { spend: 0, revenue: 0, roas: 0, count: 0 }
  for (const a of analyses) {
    if (!a.metrics) continue
    try {
      const parsed = JSON.parse(a.metrics)
      m.spend += parsed.spend || 0
      m.revenue += parsed.revenue || 0
      m.roas += parsed.roas || 0
      m.count++
    } catch {}
  }
  if (m.count > 0) m.roas = m.roas / m.count
  return m
}
