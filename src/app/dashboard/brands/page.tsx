"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import {
  Store, Plus, Loader2, Trash2, Globe, Target, DollarSign, TrendingUp,
  BarChart3, Image, Play, Sparkles, Send, X,
} from "lucide-react"

export default function BrandsPage() {
  const [brands, setBrands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showOnboard, setShowOnboard] = useState(false)
  const [brandName, setBrandName] = useState("")
  const [onboarding, setOnboarding] = useState<any>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [busy, setBusy] = useState(false)
  const [newBrandId, setNewBrandId] = useState("")
  const { user } = useAuth()
  const router = useRouter()

  const fetchBrands = () => {
    if (!user) return
    fetch(`/api/brands?userId=${user.id}`)
      .then((r) => r.json())
      .then((d) => { setBrands(d.brands || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchBrands() }, [user])

  const startOnboarding = async () => {
    if (!brandName.trim() || !user) return
    setBusy(true)
    const res = await fetch("/api/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, name: brandName.trim(), step: "onboard", answers: {} }),
    })
    const data = await res.json()
    setOnboarding({ ...data, name: brandName.trim() })
    setBusy(false)
  }

  const sendAnswer = async () => {
    if (!onboarding || !user) return

    const hasAnswer = currentAnswer.trim().length > 0
    const newAnswers = hasAnswer
      ? { ...answers, [onboarding.nextQuestion || "name"]: currentAnswer }
      : answers
    if (hasAnswer) {
      setAnswers(newAnswers)
      setCurrentAnswer("")
    }
    setBusy(true)

    if (onboarding.complete) {
      // Create the brand
      const res = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          name: onboarding.name,
          ...parseAnswers(newAnswers),
          step: "create",
        }),
      })
      const data = await res.json()
      setBusy(false)
      if (data.brand) {
        setNewBrandId(data.brand.id)
        fetchBrands()
      }
      return
    }

    const res = await fetch("/api/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, name: onboarding.name, step: "onboard", answers: newAnswers }),
    })
    const data = await res.json()
    setOnboarding({ ...onboarding, ...data })
    setBusy(false)
  }

  const deleteBrand = async (id: string) => {
    if (!window.confirm("حذف البراند؟")) return
    await fetch(`/api/brands?id=${id}&userId=${user?.id}`, { method: "DELETE" })
    fetchBrands()
  }

  function parseAnswers(answers: Record<string, string>) {
    const result: any = {}
    for (const [q, a] of Object.entries(answers)) {
      const lower = q.toLowerCase()
      if (lower.includes("تخصص") || lower.includes("نيتش") || lower.includes("مجال") || lower.includes("niche")) result.niche = a
      else if (lower.includes("موقع") || lower.includes("ويب") || lower.includes("website") || lower.includes("url")) result.website = a
      else if (lower.includes("هدف") || lower.includes("هدف") || lower.includes("goal")) result.goals = a
      else if (lower.includes("جمهور") || lower.includes("audience") || lower.includes("عميل")) result.targetAudience = a
      else if (lower.includes("منصة") || lower.includes("platform") || lower.includes("بلاتفورم")) result.platforms = a
      else if (lower.includes("ميزانية") || lower.includes("budget") || lower.includes("ميزانيه")) result.monthlyBudget = a
      else if (lower.includes("بلد") || lower.includes("دولة") || lower.includes("country") || lower.includes("دوله")) result.country = a
      else result.notes = (result.notes || "") + `${q}: ${a}\n`
    }
    return result
  }

  const resetOnboarding = () => {
    setShowOnboard(false)
    setBrandName("")
    setOnboarding(null)
    setAnswers({})
    setCurrentAnswer("")
    setNewBrandId("")
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">البراندات</h1>
            <p className="text-sm text-gray-500 mt-1">إدارة البراندات التي تعمل معها</p>
          </div>
          <button onClick={() => setShowOnboard(true)}
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-4 w-4" /> إضافة براند
          </button>
        </div>

        {/* AI Onboarding Modal */}
        <AnimatePresence>
          {showOnboard && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
              onClick={resetOnboarding}
            >
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">إضافة براند جديد</h2>
                  </div>
                  <button onClick={resetOnboarding} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {newBrandId ? (
                  <div className="text-center py-8">
                    <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                      <Store className="h-8 w-8 text-green-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">تم إضافة البراند بنجاح!</h3>
                    <p className="text-sm text-gray-500 mb-6">{onboarding?.name}</p>
                    <div className="flex gap-3 justify-center">
                      <button onClick={() => router.push(`/dashboard/brands/${newBrandId}`)}
                        className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-700"
                      >
                        عرض البراند
                      </button>
                      <button onClick={resetOnboarding}
                        className="rounded-xl border border-gray-200 dark:border-gray-700 px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300"
                      >
                        إضافة براند آخر
                      </button>
                    </div>
                  </div>
                ) : !onboarding ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">اسم البراند</label>
                    <input autoFocus value={brandName} onChange={(e) => setBrandName(e.target.value)}
                      placeholder="مثال: نون, جرير, شي إن..."
                      className="flex h-12 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:border-purple-500"
                    />
                    <button onClick={startOnboarding} disabled={busy || !brandName.trim()}
                      className="mt-4 w-full rounded-xl bg-purple-600 py-3 text-sm font-medium text-white hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      {busy ? "..." : "ابدأ — هنسألك شوية أسئلة عن البراند"}
                    </button>
                  </div>
                ) : (
                  <div>
                    {onboarding.analysis && (
                      <div className="mb-4 p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                        <p className="text-sm text-purple-700 dark:text-purple-300">{onboarding.analysis}</p>
                      </div>
                    )}

                    {onboarding.suggestedNiche && (
                      <div className="mb-4 flex flex-wrap gap-2">
                        <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600">التخصص: {onboarding.suggestedNiche}</span>
                        {onboarding.suggestedPlatforms && <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600">المنصات: {onboarding.suggestedPlatforms}</span>}
                      </div>
                    )}

                    {onboarding.nextQuestion && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{onboarding.nextQuestion}</label>
                        <div className="flex gap-2">
                          <input autoFocus value={currentAnswer} onChange={(e) => setCurrentAnswer(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendAnswer()}
                            placeholder="إجابتك..."
                            className="flex h-12 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:border-purple-500"
                          />
                          <button onClick={sendAnswer} disabled={busy || !currentAnswer.trim()}
                            className="shrink-0 rounded-xl bg-purple-600 px-4 text-white hover:bg-purple-700 disabled:opacity-50"
                          >
                            <Send className="h-5 w-5" />
                          </button>
                        </div>
                        <button onClick={() => { setOnboarding({ ...onboarding, complete: true, nextQuestion: null }); setCurrentAnswer(""); }}
                          className="mt-2 text-xs text-purple-600 hover:text-purple-700"
                        >
                          تخطي → إنشاء البراند
                        </button>
                      </div>
                    )}

                    {!onboarding.nextQuestion && (
                      <div className="text-center py-4">
                        <button onClick={sendAnswer} disabled={busy}
                          className="rounded-xl bg-purple-600 px-6 py-3 text-sm font-medium text-white hover:bg-purple-700"
                        >
                          {busy ? "..." : "إنشاء البراند"}
                        </button>
                      </div>
                    )}

                    {busy && (
                      <div className="flex items-center gap-2 text-sm text-gray-400 mt-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        الذكاء الاصطناعي يعمل...
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Brands Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-purple-600" /></div>
        ) : brands.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-16 text-center">
            <Store className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p className="text-lg font-medium text-gray-500 mb-1">لا توجد براندات بعد</p>
            <p className="text-sm text-gray-400 mb-6">أضف براندك الأول لبدء متابعة أدائه</p>
            <button onClick={() => setShowOnboard(true)}
              className="rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-purple-700"
            >
              إضافة براند
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {brands.map((brand) => (
              <motion.div key={brand.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="group relative rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => router.push(`/dashboard/brands/${brand.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/30">
                    <Store className="h-5 w-5 text-purple-600" />
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); deleteBrand(brand.id) }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">{brand.name}</h3>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {brand.niche && <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">{brand.niche}</span>}
                  {brand.country && <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">{brand.country}</span>}
                  {brand.platforms && <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">{brand.platforms}</span>}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  {brand.monthlyBudget && (
                    <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{formatCurrency(brand.monthlyBudget, brand.currency)}</span>
                  )}
                  {brand.website && <span className="flex items-center gap-1"><Globe className="h-3 w-3" />موقع</span>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  )
}
