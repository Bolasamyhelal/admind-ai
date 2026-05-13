"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { metricsGlossary, categoryLabels, type MetricCategory } from "@/lib/metrics-glossary"
import {
  Search,
  ChevronDown,
  ChevronUp,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  AlertTriangle,
  Target,
  BarChart3,
  DollarSign,
  Percent,
  Eye,
  MousePointerClick,
  Repeat,
  Wallet,
  ShoppingCart,
  Users,
  ExternalLink,
} from "lucide-react"

const categoryIcons: Record<MetricCategory, any> = {
  cost: DollarSign,
  performance: BarChart3,
  profitability: TrendingUp,
  efficiency: Target,
  engagement: MousePointerClick,
  reach: Eye,
}

const categoryColors: Record<MetricCategory, string> = {
  cost: "from-orange-500 to-red-500",
  performance: "from-blue-500 to-indigo-500",
  profitability: "from-emerald-500 to-teal-500",
  efficiency: "from-violet-500 to-purple-500",
  engagement: "from-pink-500 to-rose-500",
  reach: "from-cyan-500 to-sky-500",
}

const categories: MetricCategory[] = ["cost", "performance", "profitability", "efficiency", "engagement", "reach"]

export default function GlossaryPage() {
  const [selectedCategory, setSelectedCategory] = useState<MetricCategory | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null)

  const filteredGlossary = Object.entries(metricsGlossary).filter(([key, metric]) => {
    const matchesCategory = selectedCategory === "all" || metric.category === selectedCategory
    const matchesSearch = !searchQuery || 
      metric.arabicName.includes(searchQuery) ||
      metric.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.includes(searchQuery.toLowerCase()) ||
      metric.aliases.some(a => a.includes(searchQuery))
    return matchesCategory && matchesSearch
  })

  const toggleMetric = (key: string) => {
    setExpandedMetric(expandedMetric === key ? null : key)
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 p-8 mb-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-300/20 via-transparent to-transparent" />
          <div className="relative z-10 flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">قاموس الميتركس</h1>
              <p className="text-purple-200 text-sm leading-relaxed max-w-2xl">
                دليل شامل لكل المقاييس الإعلانية — شرح تفصيلي، معادلات، تفسير، ونصائح عملية للميديا باير.
                استخدم هذا القاموس كمرجع يومي لفهم وتحسين أداء حملاتك.
              </p>
            </div>
          </div>
        </div>

        {/* Search + Category Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث عن مقياس..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pr-10 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 text-sm text-gray-900 dark:text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                selectedCategory === "all"
                  ? "bg-purple-600 text-white border-purple-600 shadow-md"
                  : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:border-purple-300"
              }`}
            >
              الكل
            </button>
            {categories.map((cat) => {
              const Icon = categoryIcons[cat]
              const isActive = selectedCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                    isActive
                      ? "bg-purple-600 text-white border-purple-600 shadow-md"
                      : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:border-purple-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {categoryLabels[cat]}
                </button>
              )
            })}
          </div>
        </div>

        {/* Metrics List */}
        <div className="space-y-4" dir="rtl">
          <AnimatePresence mode="wait">
            {filteredGlossary.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">لا توجد نتائج للبحث</p>
              </motion.div>
            ) : (
              filteredGlossary.map(([key, metric]) => {
                const isExpanded = expandedMetric === key
                const CatIcon = categoryIcons[metric.category as MetricCategory]
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    layout
                    className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden transition-all duration-200 hover:shadow-md"
                  >
                    {/* Header */}
                    <button
                      onClick={() => toggleMetric(key)}
                      className="w-full flex items-center justify-between p-5 text-right hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${categoryColors[metric.category as MetricCategory]}`}>
                          <CatIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">{metric.arabicName}</h3>
                            <span className="text-xs text-gray-400 font-mono hidden sm:inline">{metric.englishName}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 font-mono">
                              {key}
                            </span>
                            {metric.aliases.length > 0 && (
                              <span className="text-[10px] text-gray-400">
                                {metric.aliases.slice(0, 3).join(", ")}
                                {metric.aliases.length > 3 && "..."}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hidden sm:inline">
                          {categoryLabels[metric.category as MetricCategory]}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </button>

                    {/* Expanded Content - Book Style */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-6 space-y-5 border-t border-gray-100 dark:border-gray-800 pt-5">
                            {/* Definition */}
                            <div>
                              <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <BookOpen className="h-3.5 w-3.5 text-purple-500" />
                                التعريف
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                {metric.definition}
                              </p>
                            </div>

                            {/* Formula */}
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                              <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-2">المعادلة</h4>
                              <p className="text-sm font-mono text-purple-600 dark:text-purple-400 text-left" dir="ltr">
                                {metric.formula}
                              </p>
                              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                                {metric.formulaExplanation}
                              </p>
                            </div>

                            {/* Why Important */}
                            <div>
                              <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                                لماذا هو مهم؟
                              </h4>
                              <ul className="space-y-1.5">
                                {metric.whyImportant.map((item, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Benchmarks */}
                            <div>
                              <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <BarChart3 className="h-3.5 w-3.5 text-blue-500" />
                                المعايير التقريبية (Benchmarks)
                              </h4>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {metric.benchmarks.map((b, i) => (
                                  <div key={i} className="rounded-lg bg-gray-50 dark:bg-gray-800/30 p-3 border border-gray-100 dark:border-gray-800">
                                    <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1">{b.platform}</p>
                                    <p className="text-xs text-gray-700 dark:text-gray-300">{b.range}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Interpretation - High/Low */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 p-4 border border-emerald-200 dark:border-emerald-800/30">
                                <div className="flex items-center gap-2 mb-2">
                                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                                  <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-300">إذا كانت القيمة مرتفعة</h4>
                                </div>
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 leading-relaxed">
                                  {metric.interpretation.high}
                                </p>
                              </div>
                              <div className="rounded-xl bg-red-50 dark:bg-red-950/20 p-4 border border-red-200 dark:border-red-800/30">
                                <div className="flex items-center gap-2 mb-2">
                                  <TrendingDown className="h-4 w-4 text-red-600" />
                                  <h4 className="text-xs font-bold text-red-700 dark:text-red-300">إذا كانت القيمة منخفضة</h4>
                                </div>
                                <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">
                                  {metric.interpretation.low}
                                </p>
                              </div>
                            </div>

                            {/* How to Improve */}
                            <div>
                              <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                                كيف تحسّن هذا المقياس؟
                              </h4>
                              <ul className="space-y-1.5">
                                {metric.howToImprove.map((item, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Common Mistakes */}
                            <div>
                              <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                                أخطاء شائعة
                              </h4>
                              <ul className="space-y-1.5">
                                {metric.commonMistakes.map((item, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Related Metrics */}
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs text-gray-400">مقاييس مرتبطة:</span>
                              {metric.relatedMetrics.map((rm) => {
                                const relatedMetric = metricsGlossary[rm]
                                if (!relatedMetric) return null
                                return (
                                  <button
                                    key={rm}
                                    onClick={() => {
                                      setExpandedMetric(rm)
                                      setSelectedCategory("all")
                                    }}
                                    className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                                  >
                                    {relatedMetric.arabicName}
                                  </button>
                                )
                              })}
                            </div>

                            {/* Pro Tip */}
                            <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-4 border border-amber-200 dark:border-amber-800/30">
                              <div className="flex items-start gap-3">
                                <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                  <h4 className="text-xs font-bold text-amber-700 dark:text-amber-300 mb-1">نصيحة خبير</h4>
                                  <p className="text-sm text-amber-600 dark:text-amber-400 leading-relaxed">
                                    {metric.proTip}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-400">
          <p>AdMind AI — قاموس الميتركس الشامل للميديا باير. آخر تحديث: مايو 2026</p>
        </div>
      </motion.div>
    </DashboardLayout>
  )
}
