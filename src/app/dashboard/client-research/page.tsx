"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import {
  Users, Loader2, Target, DollarSign, Building2, TrendingUp,
  Search, Star, AlertTriangle, CheckCircle2, XCircle, MessageSquare,
  Phone, Zap, Clock, Trash2, Globe, ShoppingBag, Lightbulb,
  ChevronDown, ChevronUp,
} from "lucide-react"

export default function ClientResearchPage() {
  const [market, setMarket] = useState("")
  const [service, setService] = useState("")
  const [budget, setBudget] = useState("متوسطة")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")
  const [history, setHistory] = useState<any[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

  const toggleSection = (key: string) => setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }))

  const sections = [
    { key: "potentialClients", icon: ShoppingBag, label: "العملاء المحتملين" },
    { key: "competitors", icon: Users, label: "تحليل المنافسين" },
    { key: "marketGap", icon: Lightbulb, label: "فجوة السوق" },
    { key: "pricingStrategy", icon: DollarSign, label: "استراتيجية التسعير" },
    { key: "outreachStrategy", icon: MessageSquare, label: "استراتيجية التواصل" },
    { key: "leadGeneration", icon: Target, label: "توليد العملاء المحتملين" },
    { key: "objectionHandling", icon: TrendingUp, label: "التعامل مع الاعتراضات" },
    { key: "recommendations", icon: Star, label: "التوصيات" },
  ]

  const handleSearch = async () => {
    if (!market.trim()) return
    setLoading(true)
    setError("")
    setResult(null)
    try {
      const res = await fetch("/api/client-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ market: market.trim(), service: service.trim(), budget }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "فشل البحث")
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
      const res = await fetch("/api/client-research")
      const data = await res.json()
      if (Array.isArray(data)) setHistory(data)
      setShowHistory(!showHistory)
    } catch {}
  }

  const loadFromHistory = (item: any) => {
    setResult(item.result); setMarket(item.market); setService(item.service)
    setBudget(item.budget); setShowHistory(false)
  }

  const deleteItem = async (id: string) => {
    try {
      await fetch("/api/client-research", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
      setHistory((prev) => prev.filter((h) => h.id !== id))
    } catch {}
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">أبحاث العملاء</h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">اكتشف العملاء المحتملين والمنافسين وازاي تخترق أي سوق</p>
          </div>
          <button onClick={loadHistory} className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Clock className="h-4 w-4" />
            السجل
          </button>
        </div>

        {showHistory && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 mb-6 overflow-hidden">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">الأبحاث السابقة</h3>
            {history.length === 0 ? <p className="text-sm text-gray-400">لا توجد أبحاث سابقة</p> : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {history.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 group">
                    <button onClick={() => loadFromHistory(item)} className="flex items-center gap-3 text-right flex-1">
                      <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20"><Users className="h-4 w-4 text-purple-600" /></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.market}</p>
                        <p className="text-xs text-gray-400">{item.service} · {new Date(item.createdAt).toLocaleDateString("ar-EG")}</p>
                      </div>
                    </button>
                    <button onClick={() => deleteItem(item.id)} className="p-2 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-4 w-4 text-red-400 hover:text-red-600" /></button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Form */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 relative">
              <Globe className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input value={market} onChange={(e) => setMarket(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="السوق أو النيتش (مثال: العناية بالبشرة في السعودية، المطاعم في دبي)"
                className="flex h-12 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 pr-11 px-4 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400" />
            </div>
            <div className="relative">
              <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select value={budget} onChange={(e) => setBudget(e.target.value)}
                className="flex h-12 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 pr-11 px-4 py-2 text-sm text-gray-900 dark:text-white appearance-none cursor-pointer">
                <option>صغيرة (أقل من 5000$)</option>
                <option>متوسطة (5000$-15000$)</option>
                <option>كبيرة (أكثر من 15000$)</option>
              </select>
            </div>
          </div>
          <div className="relative mt-3">
            <Target className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input value={service} onChange={(e) => setService(e.target.value)}
              placeholder="خدمتك (مثال: إدارة إعلانات فيسبوك، تصميم كريتف، تحسين متجر)"
              className="flex h-12 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 pr-11 px-4 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400" />
          </div>
          <button onClick={handleSearch} disabled={loading || !market.trim()}
            className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-medium text-white hover:bg-purple-700 transition-colors disabled:opacity-50">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> جاري البحث...</> : <><Search className="h-4 w-4" /> بحث العملاء والمنافسين</>}
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
            <p className="text-purple-700 dark:text-purple-300 font-medium">الذكاء الاصطناعي يبحث عن العملاء والمنافسين...</p>
            <p className="text-sm text-purple-500 mt-1">تحليل السوق، الفرص، استراتيجيات التواصل</p>
          </div>
        )}

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Summary */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20"><Users className="h-5 w-5 text-purple-600" /></div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">السوق: {market}</h2>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{result.summary}</p>
              </div>

              {/* Sections */}
              {sections.map((section) => {
                const data = result[section.key]
                if (!data || (Array.isArray(data) && data.length === 0)) return null
                const isOpen = expandedSections[section.key]
                return (
                  <div key={section.key} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
                    <button onClick={() => toggleSection(section.key)}
                      className="w-full flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20"><section.icon className="h-5 w-5 text-purple-600" /></div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{section.label}</h3>
                      </div>
                      {isOpen ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="px-5 pb-5 border-t border-gray-200 dark:border-gray-800 pt-4">
                            <RenderSection data={data} />
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

function RenderSection({ data }: { data: any }) {
  if (typeof data === "string") return <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{data}</p>
  if (Array.isArray(data)) {
    return (
      <div className="space-y-4">
        {data.map((item: any, i: number) => (
          typeof item === "string" ? (
            <div key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
              <CheckCircle2 className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
              <span>{item}</span>
            </div>
          ) : (
            <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-purple-500 text-white text-xs font-bold shrink-0">{i + 1}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{item.name || item.category || ""}</span>
                {item.type && <span className="px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-[10px] text-gray-500">{item.type}</span>}
              </div>
              {Object.entries(item).map(([k, v]) => {
                if (k === "name" || k === "category" || k === "type") return null
                if (Array.isArray(v)) return (
                  <div key={k} className="mb-2">
                    <p className="text-xs text-gray-400 mb-1">{formatKey(k)}</p>
                    <div className="flex flex-wrap gap-1">
                      {v.map((s: any, idx: number) => (
                        <span key={idx} className="px-2 py-1 rounded-lg bg-purple-50 dark:bg-purple-900/10 text-xs text-purple-700 dark:text-purple-300">{s}</span>
                      ))}
                    </div>
                  </div>
                )
                if (typeof v === "object" && v !== null) return (
                  <div key={k} className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-xs text-gray-400">{formatKey(k)}: </span>
                    {Object.entries(v).map(([sk, sv]) => (
                      <div key={sk} className="mr-3 text-xs text-gray-500">
                        <span className="font-medium">{formatKey(sk)}: </span>{String(sv || "")}
                      </div>
                    ))}
                  </div>
                )
                return (
                  <p key={k} className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span className="text-xs text-gray-400">{formatKey(k)}: </span>
                    {String(v || "")}
                  </p>
                )
              })}
            </div>
          )
        ))}
      </div>
    )
  }
  return (
    <div className="space-y-3">
      {Object.entries(data).map(([key, value]: [string, any]) => {
        if (!value) return null
        return (
          <div key={key}>
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{formatKey(key)}</p>
            {typeof value === "string" ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">{value}</p>
            ) : Array.isArray(value) ? (
              <div className="flex flex-wrap gap-2">
                {value.map((v: any, i: number) => (
                  <span key={i} className="px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/30 text-sm text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-700/30">{typeof v === "string" ? v : JSON.stringify(v)}</span>
                ))}
              </div>
            ) : (
              <RenderSection data={value} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function formatKey(key: string): string {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).replace(/(\d+)/g, " $1").trim()
}
