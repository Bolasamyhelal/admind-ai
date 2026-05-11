"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import {
  Search, Loader2, TrendingUp, AlertTriangle, Lightbulb, Target, Star,
  ShoppingCart, BarChart3, DollarSign, Users, Hash, Shield, Award,
  ArrowLeft, Clock, Trash2, Globe, Zap,
} from "lucide-react"

export default function NicheResearchPage() {
  const [niche, setNiche] = useState("")
  const [market, setMarket] = useState("")
  const [researching, setResearching] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")
  const [history, setHistory] = useState<any[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [currentId, setCurrentId] = useState<string | null>(null)

  const handleResearch = async () => {
    if (!niche.trim()) return
    setResearching(true)
    setError("")
    setResult(null)

    try {
      const res = await fetch("/api/niche-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: niche.trim(), market: market.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "فشل البحث")
      setResult(data.result)
      setCurrentId(data.id)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setResearching(false)
    }
  }

  const loadHistory = async () => {
    try {
      const res = await fetch("/api/niche-research")
      const data = await res.json()
      if (Array.isArray(data)) setHistory(data)
      setShowHistory(!showHistory)
    } catch {}
  }

  const deleteResearch = async (id: string) => {
    try {
      await fetch("/api/niche-research", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      setHistory((prev) => prev.filter((h) => h.id !== id))
      if (currentId === id) { setResult(null); setCurrentId(null) }
    } catch {}
  }

  const loadFromHistory = (item: any) => {
    setResult(item.result)
    setCurrentId(item.id)
    setNiche(item.niche)
    setMarket(item.market)
    setShowHistory(false)
  }

  const r = result

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">أبحاث النيتش</h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">تحليل متعمق لأي مجال وسوق — المنافسة، الجمهور، التكاليف، الفرص</p>
          </div>
          <button onClick={loadHistory} className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Clock className="h-4 w-4" />
            السجل
          </button>
        </div>

        {showHistory && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 mb-6 overflow-hidden">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">الأبحاث السابقة</h3>
            {history.length === 0 ? (
              <p className="text-sm text-gray-400">لا توجد أبحاث سابقة</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {history.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 group">
                    <button onClick={() => loadFromHistory(item)} className="flex items-center gap-3 text-right flex-1">
                      <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                        <Search className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.niche}</p>
                        <p className="text-xs text-gray-400">{item.market} · {new Date(item.createdAt).toLocaleDateString("ar-EG")}</p>
                      </div>
                    </button>
                    <button onClick={() => deleteResearch(item.id)} className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="h-4 w-4 text-red-400 hover:text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleResearch()}
                placeholder="اسم المجال (مثال: العناية بالبشرة، الأثاث المكتبي، الملابس الرياضية)"
                className="flex h-12 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 pr-11 px-4 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400"
              />
            </div>
            <div className="relative">
              <Globe className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                value={market}
                onChange={(e) => setMarket(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleResearch()}
                placeholder="السوق (مثال: السعودية، مصر، الإمارات)"
                className="flex h-12 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 pr-11 px-4 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400"
              />
            </div>
          </div>
          <button
            onClick={handleResearch}
            disabled={researching || !niche.trim()}
            className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-medium text-white hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {researching ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> جاري البحث والتحليل...</>
            ) : (
              <><Zap className="h-4 w-4" /> تحليل النيتش</>
            )}
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 mb-8 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {researching && (
          <div className="rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 p-8 text-center mb-8">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-purple-600 mb-4" />
            <p className="text-purple-700 dark:text-purple-300 font-medium">الذكاء الاصطناعي يحلل النيتش...</p>
            <p className="text-sm text-purple-500 mt-1">تحليل المنافسة، الجمهور، التكاليف، الفرص والتوصيات</p>
          </div>
        )}

        <AnimatePresence>
          {r && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Score + Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                  <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-center">
                    <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-4xl font-bold mb-3 ${
                      r.overallScore >= 7 ? "bg-green-50 dark:bg-green-900/20 text-green-600" :
                      r.overallScore >= 4 ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600" :
                      "bg-red-50 dark:bg-red-900/20 text-red-600"
                    }`}>
                      {r.overallScore}
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">جاذبية النيتش</p>
                    <p className="text-xs text-gray-500">من 10</p>
                  </div>
                </div>
                <div className="lg:col-span-3">
                  <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 h-full flex flex-col justify-center">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{niche} — {market || "الوطن العربي"}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{r.summary}</p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard icon={BarChart3} label="حجم السوق" value={r.marketSize} />
                <StatCard icon={Award} label="المنافسة" value={r.competitionLevel} color={r.competitionLevel === "مرتفع" || r.competitionLevel === "شديد" ? "red" : r.competitionLevel === "متوسط" ? "yellow" : "green"} />
                <StatCard icon={DollarSign} label="CPC تقريبي" value={r.cpc} />
                <StatCard icon={DollarSign} label="CPA تقريبي" value={r.cpa} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard icon={TrendingUp} label="ROAS متوقع" value={r.roas} />
                <StatCard icon={Shield} label="حاجز الدخول" value={r.entryBarrier} />
                <StatCard icon={BarChart3} label="هامش الربح" value={r.profitMargin} />
                <StatCard icon={Target} label="الموسمية" value={r.seasonality} />
              </div>

              {/* Competitors */}
              {r.competitors && r.competitors.length > 0 && (
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
                      <Users className="h-5 w-5 text-red-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">أبرز المنافسين</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {r.competitors.map((c: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/20">
                        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-red-500 text-white text-xs font-bold shrink-0">{i + 1}</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Target Audience */}
              {r.targetAudience && (
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">الجمهور المستهدف</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/30">
                      <p className="text-xs text-gray-400 mb-1">الفئة العمرية</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{r.targetAudience.ageRange || "-"}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/30">
                      <p className="text-xs text-gray-400 mb-1">الجنس</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{r.targetAudience.gender || "-"}</p>
                    </div>
                  </div>
                  {r.targetAudience.interests && r.targetAudience.interests.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-400 mb-2">الاهتمامات</p>
                      <div className="flex flex-wrap gap-2">
                        {r.targetAudience.interests.map((i: string, idx: number) => (
                          <span key={idx} className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-xs text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/20">{i}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {r.targetAudience.painPoints && r.targetAudience.painPoints.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-2">نقاط الألم</p>
                      <div className="flex flex-wrap gap-2">
                        {r.targetAudience.painPoints.map((p: string, idx: number) => (
                          <span key={idx} className="px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-xs text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/20">{p}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Trends */}
              {r.trends && r.trends.length > 0 && (
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">التوجهات الحالية</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {r.trends.map((t: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/20">
                        <TrendingUp className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Best Platforms */}
              {r.bestPlatforms && r.bestPlatforms.length > 0 && (
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                      <ShoppingCart className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">أفضل المنصات الإعلانية</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {r.bestPlatforms.map((p: string, i: number) => (
                      <span key={i} className="px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-sm text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/20">{p}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Content Ideas + Opportunities */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {r.contentIdeas && r.contentIdeas.length > 0 && (
                  <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                        <Lightbulb className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">أفكار محتوى</h3>
                    </div>
                    <ul className="space-y-3">
                      {r.contentIdeas.map((c: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-500 text-white text-[10px] font-bold shrink-0">{i + 1}</span>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {r.opportunities && r.opportunities.length > 0 && (
                  <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                        <Star className="h-5 w-5 text-emerald-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">الفرص غير المستغلة</h3>
                    </div>
                    <ul className="space-y-3">
                      {r.opportunities.map((o: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center justify-center h-5 w-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold shrink-0">{i + 1}</span>
                          {o}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Threats */}
              {r.threats && r.threats.length > 0 && (
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">التهديدات والمخاطر</h3>
                  </div>
                  <ul className="space-y-3">
                    {r.threats.map((t: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {r.recommendations && r.recommendations.length > 0 && (
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                      <Lightbulb className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">التوصيات الاستراتيجية</h3>
                  </div>
                  <div className="space-y-3">
                    {r.recommendations.map((r: string, i: number) => (
                      <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800/20">
                        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-purple-500 text-white text-xs font-bold shrink-0">{i + 1}</span>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{r}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Keywords */}
              {r.keywords && r.keywords.length > 0 && (
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
                      <Hash className="h-5 w-5 text-indigo-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">الكلمات المفتاحية المقترحة</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {r.keywords.map((k: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/10 text-sm text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/20">{k}</span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </DashboardLayout>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color?: string }) {
  const colors: Record<string, string> = {
    red: "bg-red-50 dark:bg-red-900/20 text-red-600 border-red-200 dark:border-red-800/20",
    yellow: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 border-yellow-200 dark:border-yellow-800/20",
    green: "bg-green-50 dark:bg-green-900/20 text-green-600 border-green-200 dark:border-green-800/20",
  }
  const iconBg = color ? colors[color] : "bg-purple-50 dark:bg-purple-900/20 text-purple-600 border-purple-200 dark:border-purple-800/20"
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded-lg ${iconBg || "bg-purple-50 dark:bg-purple-900/20"}`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{value || "-"}</p>
    </div>
  )
}
