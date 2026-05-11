"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import {
  Globe, Search, Loader2, ExternalLink, CheckCircle2, XCircle,
  TrendingUp, AlertTriangle, Lightbulb, Target, Star, Code,
  ShoppingCart, BarChart3, Zap, RefreshCw, Link, FileText,
} from "lucide-react"

export default function SiteAnalyzerPage() {
  const [url, setUrl] = useState("")
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")

  const handleAnalyze = async () => {
    if (!url.trim()) return
    let fullUrl = url.trim()
    if (!fullUrl.startsWith("http")) fullUrl = "https://" + fullUrl

    setAnalyzing(true)
    setError("")
    setResult(null)

    try {
      const res = await fetch("/api/analyze-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: fullUrl }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "فشل التحليل")
      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">محلل المواقع</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">حلل أي موقع إلكتروني - اكتشف المنصة والتقنيات والأخطاء والتوصيات</p>
        </div>

        {/* Search Bar */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 mb-8">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Globe className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                dir="ltr"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                placeholder="https://example.com"
                className="flex h-12 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 pr-11 px-4 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400"
              />
            </div>
            <button
              onClick={handleAnalyze}
              disabled={analyzing || !url.trim()}
              className="flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-medium text-white hover:bg-purple-700 transition-colors disabled:opacity-50 shrink-0"
            >
              {analyzing ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> جاري التحليل...</>
              ) : (
                <><Search className="h-4 w-4" /> تحليل</>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 mb-8 flex items-center gap-3">
            <XCircle className="h-5 w-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {analyzing && (
          <div className="rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 p-8 text-center mb-8">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-purple-600 mb-4" />
            <p className="text-purple-700 dark:text-purple-300 font-medium">جاري تحليل الموقع...</p>
            <p className="text-sm text-purple-500 mt-1">الذكاء الاصطناعي يفحص المنصة والتقنيات والأداء</p>
          </div>
        )}

        <AnimatePresence>
          {result && result.analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Score + Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                  <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-center">
                    <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-4xl font-bold mb-3 ${
                      result.analysis.overallScore >= 7 ? "bg-green-50 dark:bg-green-900/20 text-green-600" :
                      result.analysis.overallScore >= 4 ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600" :
                      "bg-red-50 dark:bg-red-900/20 text-red-600"
                    }`}>
                      {result.analysis.overallScore}
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">التقييم العام</p>
                    <p className="text-xs text-gray-500">من 10</p>
                  </div>
                </div>

                <div className="lg:col-span-3">
                  <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 h-full flex flex-col justify-center">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{result.pageInfo.title}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{result.analysis.summary}</p>
                    <div className="flex items-center gap-4 mt-4">
                      <a href={result.pageInfo.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-purple-600 hover:underline">
                        <ExternalLink className="h-3 w-3" />
                        فتح الموقع
                      </a>
                      {result.analysis.platformConfidence && (
                        <span className="text-xs text-gray-400">دقة التحليل: {result.analysis.platformConfidence}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Platform + Type + Audience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <InfoCard icon={ShoppingCart} label="المنصة" value={result.pageInfo.platform.primary} sub={result.pageInfo.platform.details} />
                <InfoCard icon={Code} label="نوع الموقع" value={result.analysis.siteType || "-"} sub={result.analysis.ecommercePlatform || ""} />
                <InfoCard icon={Target} label="الجمهور المستهدف" value={result.analysis.targetAudience || "-"} sub={`حركة: ${result.analysis.trafficEstimate || "-"}`} />
                <InfoCard icon={BarChart3} label="التقنيات" value={`${result.pageInfo.techStack.length} تقنية`} sub={result.pageInfo.techStack.slice(0, 3).join(", ")} />
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {result.analysis.strengths && result.analysis.strengths.length > 0 && (
                  <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">نقاط القوة</h3>
                    </div>
                    <ul className="space-y-3">
                      {result.analysis.strengths.map((s: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.analysis.weaknesses && result.analysis.weaknesses.length > 0 && (
                  <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">نقاط الضعف</h3>
                    </div>
                    <ul className="space-y-3">
                      {result.analysis.weaknesses.map((w: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* SEO + Performance Issues */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {result.analysis.seoIssues && result.analysis.seoIssues.length > 0 && (
                  <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                        <Search className="h-5 w-5 text-yellow-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">مشاكل SEO</h3>
                    </div>
                    <ul className="space-y-3">
                      {result.analysis.seoIssues.map((s: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.analysis.performanceIssues && result.analysis.performanceIssues.length > 0 && (
                  <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                        <Zap className="h-5 w-5 text-orange-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">مشاكل الأداء</h3>
                    </div>
                    <ul className="space-y-3">
                      {result.analysis.performanceIssues.map((p: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Missing Features */}
              {result.analysis.missingFeatures && result.analysis.missingFeatures.length > 0 && (
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                      <FileText className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">الميزات المفقودة</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {result.analysis.missingFeatures.map((m: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 rounded-lg p-3">
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0" />
                        {m}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {result.analysis.recommendations && result.analysis.recommendations.length > 0 && (
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <Lightbulb className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">التوصيات</h3>
                  </div>
                  <div className="space-y-3">
                    {result.analysis.recommendations.map((r: string, i: number) => (
                      <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/20">
                        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-500 text-white text-xs font-bold shrink-0">{i + 1}</span>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{r}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Competitor Insight */}
              {result.analysis.competitorInsight && (
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
                      <BarChart3 className="h-5 w-5 text-indigo-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">تحليل المنافسة</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{result.analysis.competitorInsight}</p>
                </div>
              )}

              {/* Raw Info */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                    <Globe className="h-5 w-5 text-gray-500" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">معلومات الصفحة</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "حجم الصفحة", value: result.pageInfo.pageSize },
                    { label: "عدد الـ Scripts", value: result.pageInfo.scriptsCount },
                    { label: "Meta Description", value: result.pageInfo.metaDescription || "لا يوجد" },
                    { label: "Meta Keywords", value: result.pageInfo.metaKeywords || "لا يوجد" },
                  ].map((info) => (
                    <div key={info.label} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/30">
                      <p className="text-xs text-gray-400 mb-0.5">{info.label}</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{String(info.value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </DashboardLayout>
  )
}

function InfoCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
          <Icon className="h-5 w-5 text-purple-600" />
        </div>
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <p className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">{value}</p>
      {sub && <p className="text-xs text-gray-400 truncate">{sub}</p>}
    </div>
  )
}
