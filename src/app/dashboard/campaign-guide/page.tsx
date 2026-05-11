"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useLang } from "@/context/language-context"
import {
  Lightbulb, Loader2, Target, DollarSign, LayoutGrid, BarChart3,
  TrendingUp, Users, ShoppingCart, Zap, Clock, Trash2, ChevronDown,
  ChevronUp, Search, Star, AlertTriangle, CheckCircle2, XCircle, Eye,
  MousePointerClick, Globe, Smartphone,
} from "lucide-react"

export default function CampaignGuidePage() {
  const { lang } = useLang()
  const t = (ar: string, en: string) => lang === "ar" ? ar : en

  const [product, setProduct] = useState("")
  const [market, setMarket] = useState("")
  const [goal, setGoal] = useState("تحويلات (مبيعات)")
  const [budget, setBudget] = useState("متوسطة")
  const [platform, setPlatform] = useState("فيسبوك/إنستغرام")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")
  const [history, setHistory] = useState<any[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

  const toggleSection = (key: string) => setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }))

  const sections = [
    { key: "campaignStructure", icon: LayoutGrid, label: t("هيكل الحملة", "Campaign Structure") },
    { key: "targeting", icon: Target, label: t("الاستهداف", "Targeting") },
    { key: "budgetStrategy", icon: DollarSign, label: t("استراتيجية الميزانية", "Budget Strategy") },
    { key: "adCreatives", icon: Eye, label: t("الكريتف والإعلانات", "Ad Creatives") },
    { key: "funnelStrategy", icon: TrendingUp, label: t("استراتيجية القمع التسويقي", "Funnel Strategy") },
    { key: "tracking", icon: BarChart3, label: t("التتبع والتحليلات", "Tracking & Analytics") },
    { key: "testingStrategy", icon: MousePointerClick, label: t("استراتيجية الاختبار", "Testing Strategy") },
    { key: "scalingStrategy", icon: Zap, label: t("استراتيجية التوسع", "Scaling Strategy") },
    { key: "marketInsights", icon: Globe, label: t("رؤى السوق", "Market Insights") },
    { key: "weeklyPlan", icon: Clock, label: t("الخطة الأسبوعية", "Weekly Plan") },
    { key: "expectedResults", icon: BarChart3, label: t("النتائج المتوقعة", "Expected Results") },
  ]

  const handleGenerate = async () => {
    if (!product.trim()) return
    setLoading(true)
    setError("")
    setResult(null)
    try {
      const res = await fetch("/api/campaign-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: product.trim(),
          market: market.trim(),
          goal, budget, platform,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t("فشل", "Failed"))
      setResult(data.result)
      const allKeys: Record<string, boolean> = {}
      sections.forEach((s) => { allKeys[s.key] = true })
      setExpandedSections(allKeys)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadHistory = async () => {
    try {
      const res = await fetch("/api/campaign-guide")
      const data = await res.json()
      if (Array.isArray(data)) setHistory(data)
      setShowHistory(!showHistory)
    } catch {}
  }

  const loadFromHistory = (item: any) => {
    setResult(item.result)
    setProduct(item.product)
    setMarket(item.market)
    setGoal(item.goal)
    setBudget(item.budget)
    setPlatform(item.platform)
    setShowHistory(false)
  }

  const deleteGuide = async (id: string) => {
    try {
      await fetch("/api/campaign-guide", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
      setHistory((prev) => prev.filter((h) => h.id !== id))
    } catch {}
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t("مستشار الحملات", "Campaign Advisor")}
            </h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              {t("دليل إعلاني متكامل A-Z — الاستراتيجية، الاستهداف، الميزانية، الكريتف، والتوسع", "Complete A-Z ad guide — strategy, targeting, budget, creatives, and scaling")}
            </p>
          </div>
          <button onClick={loadHistory} className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Clock className="h-4 w-4" />
            {t("السجل", "History")}
          </button>
        </div>

        {showHistory && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 mb-6 overflow-hidden">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{t("الخطط السابقة", "Previous Guides")}</h3>
            {history.length === 0 ? (
              <p className="text-sm text-gray-400">{t("لا توجد خطط سابقة", "No previous guides")}</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {history.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 group">
                    <button onClick={() => loadFromHistory(item)} className="flex items-center gap-3 text-right flex-1">
                      <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                        <Lightbulb className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.product}</p>
                        <p className="text-xs text-gray-400">{item.market} · {item.goal} · {new Date(item.createdAt).toLocaleDateString("ar-EG")}</p>
                      </div>
                    </button>
                    <button onClick={() => deleteGuide(item.id)} className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="h-4 w-4 text-red-400 hover:text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Form */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
            <div className="sm:col-span-2 lg:col-span-3 relative">
              <ShoppingCart className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                placeholder={t("المنتج أو الخدمة (مثال: ماسك طبيعي للوجه، application محاسبة للشركات)", "Product or service (e.g. organic face mask, accounting software for businesses)")}
                className="flex h-12 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 pr-11 px-4 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400"
              />
            </div>
            <div className="relative">
              <Globe className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                value={market}
                onChange={(e) => setMarket(e.target.value)}
                placeholder={t("السوق", "Market")}
                className="flex h-12 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 pr-11 px-4 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400"
              />
            </div>
            <div className="relative">
              <Target className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="flex h-12 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 pr-11 px-4 py-2 text-sm text-gray-900 dark:text-white appearance-none cursor-pointer"
              >
                <option>{t("تحويلات (مبيعات)", "Conversions (Sales)")}</option>
                <option>{t("وعي بالعلامة التجارية", "Brand Awareness")}</option>
                <option>{t("تفاعل", "Engagement")}</option>
                <option>{t("زيارة الموقع", "Traffic")}</option>
                <option>{t("توليد عملاء محتملين", "Lead Generation")}</option>
                <option>{t("مبيعات التطبيق", "App Installs")}</option>
              </select>
            </div>
            <div className="relative">
              <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="flex h-12 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 pr-11 px-4 py-2 text-sm text-gray-900 dark:text-white appearance-none cursor-pointer"
              >
                <option>{t("صغيرة (أقل من 1000$ شهرياً)", "Small (under $1000/month)")}</option>
                <option>{t("متوسطة (1000$-5000$ شهرياً)", "Medium ($1000-$5000/month)")}</option>
                <option>{t("كبيرة (5000$-20000$ شهرياً)", "Large ($5000-$20000/month)")}</option>
                <option>{t("ضخمة (أكثر من 20000$ شهرياً)", "Enterprise (over $20000/month)")}</option>
              </select>
            </div>
            <div className="relative">
              <Smartphone className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="flex h-12 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 pr-11 px-4 py-2 text-sm text-gray-900 dark:text-white appearance-none cursor-pointer"
              >
                <option>فيسبوك/إنستغرام</option>
                <option>تيك توك</option>
                <option>جوجل إعلانات</option>
                <option>سناب شات</option>
                <option>تويتر/X</option>
                <option>جميع المنصات</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading || !product.trim()}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-medium text-white hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> {t("جاري إنشاء الخطة...", "Generating guide...")}</>
            ) : (
              <><Zap className="h-4 w-4" /> {t("إنشاء الخطة الإعلانية", "Generate Campaign Plan")}</>
            )}
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 mb-8 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {loading && (
          <div className="rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 p-8 text-center mb-8">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-purple-600 mb-4" />
            <p className="text-purple-700 dark:text-purple-300 font-medium">{t("الذكاء الاصطناعي يبني خطتك الإعلانية...", "AI is building your campaign plan...")}</p>
            <p className="text-sm text-purple-500 mt-1">{t("الهيكل، الاستهداف، الميزانية، الكريتف، التوسع", "Structure, targeting, budget, creatives, scaling")}</p>
          </div>
        )}

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Summary */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                    <Lightbulb className="h-5 w-5 text-purple-600" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("الخطة الإعلانية", "Campaign Plan")}: {product}
                  </h2>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{result.summary}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-900/20 text-xs text-purple-700 dark:text-purple-300">{market || t("الوطن العربي", "Arab World")}</span>
                  <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-xs text-blue-700 dark:text-blue-300">{goal}</span>
                  <span className="px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-xs text-green-700 dark:text-green-300">{budget}</span>
                  <span className="px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-900/20 text-xs text-orange-700 dark:text-orange-300">{platform}</span>
                </div>
              </div>

              {/* Sections */}
              {sections.map((section) => {
                const data = result[section.key]
                if (!data) return null
                const isOpen = expandedSections[section.key]
                return (
                  <div key={section.key} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
                    <button
                      onClick={() => toggleSection(section.key)}
                      className="w-full flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                          <section.icon className="h-5 w-5 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{section.label}</h3>
                      </div>
                      {isOpen ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 border-t border-gray-200 dark:border-gray-800 pt-4">
                            <RenderSection data={data} keyPrefix={section.key} t={t} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </DashboardLayout>
  )
}

function RenderSection({ data, keyPrefix, t }: { data: any; keyPrefix: string; t: (a: string, b: string) => string }) {
  if (typeof data === "string") {
    return <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{data}</p>
  }
  if (Array.isArray(data)) {
    return (
      <ul className="space-y-2">
        {data.map((item: any, i: number) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
            <CheckCircle2 className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
            {typeof item === "string" ? <span>{item}</span> : <RenderObjectInline obj={item} />}
          </li>
        ))}
      </ul>
    )
  }
  return (
    <div className="space-y-4">
      {Object.entries(data).map(([key, value]: [string, any]) => {
        if (!value) return null
        if (Array.isArray(value)) {
          return (
            <div key={key}>
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2 capitalize">{formatKey(key)}</p>
              <div className="flex flex-wrap gap-2">
                {value.map((v: any, i: number) => (
                  typeof v === "string" ? (
                    <span key={i} className="px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/30 text-sm text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-700/30">{v}</span>
                  ) : (
                    <RenderCard key={i} obj={v} />
                  )
                ))}
              </div>
            </div>
          )
        }
        if (typeof value === "object") {
          return (
            <div key={key}>
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2 capitalize">{formatKey(key)}</p>
              <div className="pr-4 border-r-2 border-purple-200 dark:border-purple-800 space-y-2">
                {Object.entries(value).map(([sk, sv]: [string, any]) => (
                  <p key={sk} className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-800 dark:text-gray-200">{formatKey(sk)}: </span>
                    {typeof sv === "object" ? JSON.stringify(sv) : String(sv || "")}
                  </p>
                ))}
              </div>
            </div>
          )
        }
        return (
          <p key={key} className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-gray-800 dark:text-gray-200">{formatKey(key)}: </span>
            {String(value)}
          </p>
        )
      })}
    </div>
  )
}

function RenderObjectInline({ obj }: { obj: Record<string, any> }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      {Object.entries(obj).map(([k, v]) => (
        <span key={k} className="text-xs">
          <span className="font-medium text-gray-700 dark:text-gray-300">{formatKey(k)}: </span>
          <span className="text-gray-500 dark:text-gray-400">{typeof v === "object" ? JSON.stringify(v) : String(v || "")}</span>
        </span>
      ))}
    </div>
  )
}

function RenderCard({ obj }: { obj: Record<string, any> }) {
  return (
    <div className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700/30">
      <RenderObjectInline obj={obj} />
    </div>
  )
}

function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .replace(/(\d+)/g, " $1")
    .trim()
}
