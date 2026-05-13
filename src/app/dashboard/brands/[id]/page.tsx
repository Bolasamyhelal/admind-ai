"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useAuth } from "@/context/auth-context"
import { useRouter, useParams } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import {
  ArrowLeft, Store, Globe, Loader2, TrendingUp, DollarSign, Target,
  BarChart3, Image, Play, Download, ExternalLink, Sparkles,
  Users, Monitor, ShoppingBag, ListChecks, Plus, CheckCircle2, Circle,
  Layers, ChevronDown, FileText, Clock, Percent, Activity, X, Info,
  Lightbulb, AlertTriangle, CheckCircle, TrendingDown, Clock3, Brain,
} from "lucide-react"
import { AssignmentCard } from "@/components/brand/assignment-card"

const LEVELS = [
  { key: "campaign", label: "الحملات", icon: BarChart3 },
  { key: "adset", label: "المجموعات الإعلانية", icon: Layers },
  { key: "ad", label: "الإعلانات", icon: Image },
]

function calcHealthScore(metrics: any) {
  if (!metrics || !metrics.count) return null
  let score = 0
  if (metrics.roas >= 2) score += 40
  else if (metrics.roas >= 1) score += 20
  else score += 5
  if (metrics.profit > 0) score += 30
  else if (metrics.profit === 0) score += 15
  else score += 5
  if (metrics.ctr >= 1) score += 15
  else if (metrics.ctr >= 0.5) score += 8
  else score += 3
  if (metrics.cpa > 0) {
    if (metrics.cpa <= 50) score += 15
    else if (metrics.cpa <= 200) score += 10
    else score += 5
  }
  return Math.round(score)
}

function getHealthColor(score: number | null) {
  if (score === null) return "text-gray-400"
  if (score >= 70) return "text-green-500"
  if (score >= 40) return "text-yellow-500"
  return "text-red-500"
}

function getHealthBg(score: number | null) {
  if (score === null) return "border-gray-300"
  if (score >= 70) return "border-green-500"
  if (score >= 40) return "border-yellow-500"
  return "border-red-500"
}

function toAmPm(time24: string) {
  if (!time24) return ""
  const [h, m] = time24.split(":").map(Number)
  const ampm = h >= 12 ? "م" : "ص"
  const h12 = h % 12 || 12
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`
}

function getHealthLabel(score: number | null) {
  if (score === null) return "—"
  if (score >= 70) return "ممتاز"
  if (score >= 40) return "جيد"
  return "ضعيف"
}

function getMetricAnalysis(metricKey: string, value: number, formatter: any) {
  const analysis: { status: string; statusLabel: string; analysis: string; recommendations: string[]; color: string; bg: string } = {
    status: "neutral", statusLabel: "", analysis: "", recommendations: [], color: "", bg: "",
  }

  switch (metricKey) {
    case "spend":
      if (value > 10000) { analysis.status = "warning"; analysis.statusLabel = "إنفاق مرتفع"; analysis.color = "text-yellow-500"; analysis.bg = "bg-yellow-50 dark:bg-yellow-900/10"
        analysis.analysis = `إجمالي الإنفاق ${formatter(value)} —这是个 رقم كبير نسبياً. لازم تراقب ROAS عشان تتأكد إن العائد يستحق المصروف.`
        analysis.recommendations = ["راجع أداء الحملات الأقل في ROAS", "فكر في إعادة توزيع الميزانية على الحملات الأكثر ربحية", "حدد حد أقصى للإنفاق اليومي"] }
      else if (value < 100) { analysis.status = "info"; analysis.statusLabel = "إنفاق منخفض"; analysis.color = "text-blue-500"; analysis.bg = "bg-blue-50 dark:bg-blue-900/10"
        analysis.analysis = `إجمالي الإنفاق ${formatter(value)} —إنفاق منخفض. ممكن تحتاج تزود الميزانية عشان توصل لنتائج أفضل.`
        analysis.recommendations = ["جرب زيادة الميزانية تدريجياً", "اختبر حملات جديدة بميزانية صغيرة", "وسع الاستهداف وزد الجمهور"] }
      else { analysis.status = "good"; analysis.statusLabel = "إنفاق معتدل"; analysis.color = "text-green-500"; analysis.bg = "bg-green-50 dark:bg-green-900/10"
        analysis.analysis = `إجمالي الإنفاق ${formatter(value)} — مستوى إنفاق مناسب.`
        analysis.recommendations = ["تابع الأداء باستمرار", "ابحث عن فرص توسع"] }
      break

    case "revenue":
      if (value > 5000) { analysis.status = "excellent"; analysis.statusLabel = "إيرادات ممتازة"; analysis.color = "text-green-500"; analysis.bg = "bg-green-50 dark:bg-green-900/10"
        analysis.analysis = `الإيرادات ${formatter(value)} — أداء قوي! الحملات تحقق عائد ممتاز.`
        analysis.recommendations = ["زود الميزانية على الحملات الناجحة", "وسع نطاق الاستهداف", "جرب إعلانات مشابهة"] }
      else if (value <= 0) { analysis.status = "critical"; analysis.statusLabel = "بدون إيرادات"; analysis.color = "text-red-500"; analysis.bg = "bg-red-50 dark:bg-red-900/10"
        analysis.analysis = "الإيرادات صفر أو سلبية — الحملات مش بتحقق مبيعات."
        analysis.recommendations = ["راجع استهداف الحملات", "حسن الصفحات المقصودة", "اختبر إعلانات جديدة", "تأكد من تتبع التحويلات"] }
      else { analysis.status = "good"; analysis.statusLabel = "إيرادات جيدة"; analysis.color = "text-green-500"; analysis.bg = "bg-green-50 dark:bg-green-900/10"
        analysis.analysis = `الإيرادات ${formatter(value)} — أداء إيجابي، لكن في فرصة للتحسين.`
        analysis.recommendations = ["حاول ترفع ROAS", "حسن الاستهداف لزيادة التحويلات", "اختبر عروض جديدة"] }
      break

    case "roas":
      if (value >= 2) { analysis.status = "excellent"; analysis.statusLabel = "ممتاز"; analysis.color = "text-green-500"; analysis.bg = "bg-green-50 dark:bg-green-900/10"
        analysis.analysis = `ROAS ${value.toFixed(2)}x — كل 1 جنيه إنفاق بيرجع ${value.toFixed(2)} جنيه. أداء ممتاز!`
        analysis.recommendations = ["زود الميزانية على الحملات دي", "استخدم نفس الاستراتيجية في حملات جديدة", "وسع الجمهور المستهدف"] }
      else if (value >= 1) { analysis.status = "warning"; analysis.statusLabel = "محتاج تحسين"; analysis.color = "text-yellow-500"; analysis.bg = "bg-yellow-50 dark:bg-yellow-900/10"
        analysis.analysis = `ROAS ${value.toFixed(2)}x — العائد ضعيف، كل 1 جنيه بيرجع ${value.toFixed(2)} جنيه بس.`
        analysis.recommendations = ["حسن استهداف الإعلانات", "طور الصفحات المقصودة", "اختبر إعلانات جديدة", "قلل الإنفاق على الحملات الضعيفة"] }
      else { analysis.status = "critical"; analysis.statusLabel = "ضعيف"; analysis.color = "text-red-500"; analysis.bg = "bg-red-50 dark:bg-red-900/10"
        analysis.analysis = `ROAS ${value.toFixed(2)}x — بسمسم في فلوس. كل 1 جنيه إنفاق بيديك أقل من 1 جنيه.`
        analysis.recommendations = ["أوقف الحملات الخاسرة فوراً", "راجع استراتيجية الإعلانات بالكامل", "حسن الصفحات المقصودة", "جرب تغيير الجمهور المستهدف", "استشر brand mentor"] }
      break

    case "cpa":
      if (value <= 0) { analysis.status = "info"; analysis.statusLabel = "غير متوفر"; analysis.color = "text-blue-500"; analysis.bg = "bg-blue-50 dark:bg-blue-900/10"
        analysis.analysis = "CPA مش متاح — مفيش تحويلات مسجلة."
        analysis.recommendations = ["تأكد من تتبع التحويلات", "حط بكسل التحويل", "اختبر تحويلات جديدة"] }
      else if (value <= 100) { analysis.status = "excellent"; analysis.statusLabel = "ممتاز"; analysis.color = "text-green-500"; analysis.bg = "bg-green-50 dark:bg-green-900/10"
        analysis.analysis = `CPA ${formatter(value)} — تكلفة اكتساب العميل منخفضة. كفاءة عالية!`
        analysis.recommendations = ["استمر في نفس النهج", "زود الميزانية للاستفادة من الكفاءة"] }
      else if (value <= 500) { analysis.status = "warning"; analysis.statusLabel = "مقبول"; analysis.color = "text-yellow-500"; analysis.bg = "bg-yellow-50 dark:bg-yellow-900/10"
        analysis.analysis = `CPA ${formatter(value)} — التكلفة مقبولة لكن ممكن تحسن.`
        analysis.recommendations = ["حسن الاستهداف", "جرب إعلانات مختلفة", "طور الصفحات المقصودة"] }
      else { analysis.status = "critical"; analysis.statusLabel = "مرتفع"; analysis.color = "text-red-500"; analysis.bg = "bg-red-50 dark:bg-red-900/10"
        analysis.analysis = `CPA ${formatter(value)} — تكلفة اكتساب العميل عالية أوي.`
        analysis.recommendations = ["قلل الميزانية على الحملات دي", "حسن الجمهور المستهدف", "جرب إعلانات جديدة", "طور تجربة المستخدم"] }
      break

    case "ctr":
      if (value >= 3) { analysis.status = "excellent"; analysis.statusLabel = "ممتاز"; analysis.color = "text-green-500"; analysis.bg = "bg-green-50 dark:bg-green-900/10"
        analysis.analysis = `CTR ${value.toFixed(2)}% — الإعلانات بتجذب ناس كتير. أداء ممتاز!`
        analysis.recommendations = ["استخدم نفس الصيغة اللي شغالة", "اختبر أشكال إعلانات جديدة", "وسع الجمهور"] }
      else if (value >= 1) { analysis.status = "good"; analysis.statusLabel = "جيد"; analysis.color = "text-green-500"; analysis.bg = "bg-green-50 dark:bg-green-900/10"
        analysis.analysis = `CTR ${value.toFixed(2)}% — أداء جيد في جذب النقرات.`
        analysis.recommendations = ["جرب A/B testing للإعلانات", "حسن العناوين والصور"] }
      else if (value >= 0.5) { analysis.status = "warning"; analysis.statusLabel = "ضعيف"; analysis.color = "text-yellow-500"; analysis.bg = "bg-yellow-50 dark:bg-yellow-900/10"
        analysis.analysis = `CTR ${value.toFixed(2)}% — الإعلانات مش بتجذب نقرات كتير.`
        analysis.recommendations = ["جدد تصميم الإعلانات", "حسن العناوين", "جرب صور وفيديوهات جديدة", "غير الجمهور المستهدف"] }
      else { analysis.status = "critical"; analysis.statusLabel = "حرج"; analysis.color = "text-red-500"; analysis.bg = "bg-red-50 dark:bg-red-900/10"
        analysis.analysis = `CTR ${value.toFixed(2)}% — نسبة نقر ضعيفة جداً. الإعلانات مش بتجذب الانتباه.`
        analysis.recommendations = ["أعد تصميم الإعلانات بالكامل", "جرب صيغ إعلانات مختلفة", "حسن العناوين والصور", "فكر في تغيير المنصة"] }
      break

    case "cpm":
      if (value <= 20) { analysis.status = "good"; analysis.statusLabel = "منخفض"; analysis.color = "text-green-500"; analysis.bg = "bg-green-50 dark:bg-green-900/10"
        analysis.analysis = `CPM ${formatter(value)} — تكلفة الوصول منخفضة. السوق مش تنافسي.`
        analysis.recommendations = ["فرصة للتوسع", "زود الميزانية للاستفادة"] }
      else if (value <= 100) { analysis.status = "warning"; analysis.statusLabel = "متوسط"; analysis.color = "text-yellow-500"; analysis.bg = "bg-yellow-50 dark:bg-yellow-900/10"
        analysis.analysis = `CPM ${formatter(value)} — تكلفة الوصول متوسطة.`
        analysis.recommendations = ["راقب المنافسين", "ابحث عن استهداف أرخص"] }
      else { analysis.status = "critical"; analysis.statusLabel = "مرتفع"; analysis.color = "text-red-500"; analysis.bg = "bg-red-50 dark:bg-red-900/10"
        analysis.analysis = `CPM ${formatter(value)} — تكلفة وصول عالية. السوق تنافسي أو الجمهور ضيق.`
        analysis.recommendations = ["وسع الاستهداف", "جرب منصات إعلانية أخرى", "حسن جودة الإعلان"] }
      break

    case "conversions":
      if (value > 100) { analysis.status = "excellent"; analysis.statusLabel = "تحويلات ممتازة"; analysis.color = "text-green-500"; analysis.bg = "bg-green-50 dark:bg-green-900/10"
        analysis.analysis = `${value} تحويل — أرقام قوية. الحملات بتسلم!`
        analysis.recommendations = ["زود الميزانية", "وسع الجمهور", "جرب عروض جديدة"] }
      else if (value <= 0) { analysis.status = "critical"; analysis.statusLabel = "بدون تحويلات"; analysis.color = "text-red-500"; analysis.bg = "bg-red-50 dark:bg-red-900/10"
        analysis.analysis = "مفيش تحويلات خالص — الحملات مش بتحقق نتائج."
        analysis.recommendations = ["تأكد من تركيب بكسل التحويل", "راجع الصفحات المقصودة", "اختبر عروض جديدة", "حسن الاستهداف"] }
      else { analysis.status = "good"; analysis.statusLabel = "تحويلات جيدة"; analysis.color = "text-green-500"; analysis.bg = "bg-green-50 dark:bg-green-900/10"
        analysis.analysis = `${value} تحويل — بداية جيدة، ممكن تحسن.`
        analysis.recommendations = ["حسن معدل التحويل", "جرب A/B testing", "طور الصفحات المقصودة"] }
      break

    case "profit":
      if (value > 0) { analysis.status = "excellent"; analysis.statusLabel = "أرباح إيجابية"; analysis.color = "text-green-500"; analysis.bg = "bg-green-50 dark:bg-green-900/10"
        analysis.analysis = `الربح ${formatter(value)} — البراند مربح! استمر في التوسع.`
        analysis.recommendations = ["زود الميزانية على الحملات المربحة", "ابحث عن أسواق جديدة", "استثمر في توسيع النطاق"] }
      else if (value === 0) { analysis.status = "info"; analysis.statusLabel = "تعادل"; analysis.color = "text-yellow-500"; analysis.bg = "bg-yellow-50 dark:bg-yellow-900/10"
        analysis.analysis = "ربح صفر — بتكسر ولا بتكسب. محتاج تحسين."
        analysis.recommendations = ["قلل المصروفات غير الضرورية", "حسن ROAS", "جرب عروض بأسعار أعلى"] }
      else { analysis.status = "critical"; analysis.statusLabel = "خسارة"; analysis.color = "text-red-500"; analysis.bg = "bg-red-50 dark:bg-red-900/10"
        analysis.analysis = `الخسارة ${formatter(Math.abs(value))} — البراند بيخسر فلوس. لازم تتصرف بسرعة.`
        analysis.recommendations = ["أوقف الحملات الخاسرة", "قلل الميزانية بشكل عام", "حسن استراتيجية التسويق", "استشر brand mentor", "راجع الأسعار والتكاليف"] }
      break

    default:
      analysis.status = "info"; analysis.statusLabel = "معلومة"; analysis.color = "text-blue-500"; analysis.bg = "bg-blue-50 dark:bg-blue-900/10"
      analysis.analysis = "بيانات متاحة للمقارنة والتحليل."
      analysis.recommendations = ["تابع الأداء بانتظام"]
  }
  return analysis
}

function MetricAnalysisModal({ metric, onClose, brand }: { metric: any; onClose: () => void; brand?: any }) {
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState<any>(null)
  const [aiError, setAiError] = useState("")

  const runAiAnalysis = async () => {
    if (!metric) return
    setAiLoading(true)
    setAiError("")
    setAiResult(null)
    try {
      const res = await fetch("/api/analyze-metric", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metricKey: metric.key,
          metricLabel: metric.label,
          value: metric.rawValue,
          currency: metric._currency || "USD",
          brandName: brand?.name,
          brandNiche: brand?.niche,
          brandGoals: brand?.goals,
          brandPlatforms: brand?.platforms,
        }),
      })
      const data = await res.json()
      if (data.analysis) setAiResult(data)
      else setAiError("لم يتم الحصول على تحليل من AI")
    } catch {
      setAiError("فشل الاتصال بخدمة AI")
    }
    setAiLoading(false)
  }

  return (
    <AnimatePresence>
      {metric && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative bg-gradient-to-br from-purple-600 to-indigo-700 p-6 text-white">
              <button onClick={onClose} className="absolute top-4 left-4 p-1.5 rounded-xl bg-white/20 hover:bg-white/30 transition-all">
                <X className="h-4 w-4" />
              </button>
              <div className={`inline-flex p-2 rounded-lg ${metric.analysis.bg} mb-2`}>
                <metric.icon className={`h-5 w-5 ${metric.analysis.color}`} />
              </div>
              <p className="text-sm text-purple-200 mb-1">{metric.label}</p>
              <p className="text-3xl font-bold">{metric.value}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${metric.analysis.bg} ${metric.analysis.color} font-medium`}>
                  {metric.analysis.statusLabel}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Analysis */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-purple-500" />
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">تحليل المؤشر</p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{metric.analysis.analysis}</p>
              </div>

              {/* Recommendations */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">التوصيات</p>
                </div>
                <div className="space-y-2">
                  {metric.analysis.recommendations.map((rec: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
                      {metric.analysis.status === "excellent" || metric.analysis.status === "good"
                        ? <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        : <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      }
                      <span className="text-xs text-gray-700 dark:text-gray-300">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Analysis Section */}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">تحليل AI مخصص</p>
                  </div>
                  <button onClick={runAiAnalysis} disabled={aiLoading}
                    className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-xs font-medium text-white hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all"
                  >
                    {aiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    {aiLoading ? "جارٍ التحليل..." : "حلل بالذكاء الاصطناعي"}
                  </button>
                </div>

                {aiError && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30">
                    <p className="text-xs text-red-600 dark:text-red-400">{aiError}</p>
                  </div>
                )}

                {aiLoading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-2" />
                      <p className="text-xs text-gray-400">Gemini بيحلل بياناتك...</p>
                    </div>
                  </div>
                )}

                {aiResult && !aiLoading && (
                  <div className="space-y-3">
                    <div className={`p-3 rounded-lg border ${
                      aiResult.status === "excellent" || aiResult.status === "good"
                        ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/30"
                        : aiResult.status === "warning"
                        ? "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800/30"
                        : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30"
                    }`}>
                      <div className="flex items-center gap-1.5 mb-1">
                        {aiResult.status === "excellent" || aiResult.status === "good"
                          ? <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                          : <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                        }
                        <span className="text-xs font-medium text-gray-900 dark:text-white">
                          {aiResult.statusLabel}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{aiResult.analysis}</p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-900 dark:text-white mb-2">توصيات AI</p>
                      <div className="space-y-1.5">
                        {aiResult.recommendations?.map((rec: string, i: number) => (
                          <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/30">
                            <Lightbulb className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                            <span className="text-xs text-gray-700 dark:text-gray-300">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {aiResult.strategicTip && (
                      <div className="p-3 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border border-purple-100 dark:border-purple-800/30">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                          <p className="text-xs font-semibold text-gray-900 dark:text-white">نصيحة استراتيجية</p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{aiResult.strategicTip}</p>
                      </div>
                    )}
                  </div>
                )}

                {!aiResult && !aiLoading && !aiError && (
                  <p className="text-xs text-gray-400 text-center py-3">
                    اضغط على "حلل بالذكاء الاصطناعي" عشان تحليل أعمق باستخدام Gemini
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default function BrandDetailPage() {
  const [brand, setBrand] = useState<any>(null)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedCurrency, setSelectedCurrency] = useState("USD")
  const [selectedLevel, setSelectedLevel] = useState("campaign")
  const [assignments, setAssignments] = useState<any[]>([])
  const [assignmentsSummary, setAssignmentsSummary] = useState("")
  const [assignmentsLoading, setAssignmentsLoading] = useState(false)
  const [showAllUploads, setShowAllUploads] = useState(false)
  const [showAllCampaigns, setShowAllCampaigns] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState<any>(null)
  const [brandGoals, setBrandGoals] = useState<any[]>([])
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [goalForm, setGoalForm] = useState({ metricKey: "roas", metricLabel: "ROAS", targetValue: "", period: "monthly" })
  const [savingGoal, setSavingGoal] = useState(false)
  const [tzTime, setTzTime] = useState("")
  const [adTzTime, setAdTzTime] = useState("")
  const [postTime, setPostTime] = useState("12:00")
  const [convertedTime, setConvertedTime] = useState("")
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
    setAssignmentsLoading(true)
    fetch(`/api/brand-assignments?brandId=${brandId}`)
      .then((r) => r.json())
      .then((d) => { setAssignments(d.assignments || []); setAssignmentsSummary(d.summary || "") })
      .catch(() => {})
      .finally(() => setAssignmentsLoading(false))
  }, [brandId])

  useEffect(() => {
    if (!brandId) return
    fetch(`/api/brand-goals?brandId=${brandId}`)
      .then((r) => r.json())
      .then((d) => setBrandGoals(d.goals || []))
      .catch(() => {})
  }, [brandId])

  // Live clocks
  useEffect(() => {
    const fmt = (d: Date, tz: string) => d.toLocaleTimeString("ar-EG", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })
    const tick = () => {
      const now = new Date()
      if (brand?.timezone) setTzTime(fmt(now, brand.timezone))
      if (brand?.adTimezone) setAdTzTime(fmt(now, brand.adTimezone))
    }
    tick()
    const iv = setInterval(tick, 1000)
    return () => clearInterval(iv)
  }, [brand?.timezone, brand?.adTimezone])

  const updateBrandField = async (field: string, val: any) => {
    if (!brand || !user) return
    try {
      await fetch("/api/brands", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: brand.id, userId: user.id, [field]: val }),
      })
      setBrand({ ...brand, [field]: val })
    } catch {}
  }

  // Convert time between timezones
  useEffect(() => {
    if (!brand?.timezone || !brand?.adTimezone || !postTime) return
    try {
      const [h, m] = postTime.split(":").map(Number)
      const now = new Date()
      const brandOff = now.toLocaleString("en", { timeZone: brand.timezone, timeZoneName: "short" })
      const adOff = now.toLocaleString("en", { timeZone: brand.adTimezone, timeZoneName: "short" })
      const brandMatch = brandOff.match(/GMT[+-]\d+/)
      const adMatch = adOff.match(/GMT[+-]\d+/)
      if (!brandMatch || !adMatch) return
      const brandGmt = parseInt(brandMatch[0].replace("GMT", ""))
      const adGmt = parseInt(adMatch[0].replace("GMT", ""))
      const diff = brandGmt - adGmt
      let totalMin = h * 60 + m - diff * 60
      if (totalMin < 0) totalMin += 1440
      if (totalMin >= 1440) totalMin -= 1440
      const convH = Math.floor(totalMin / 60)
      const convM = totalMin % 60
      setConvertedTime(`${convH.toString().padStart(2, "0")}:${convM.toString().padStart(2, "0")}`)
    } catch { setConvertedTime("") }
  }, [postTime, brand?.timezone, brand?.adTimezone])

  // Calculate time difference
  const getTzDiff = () => {
    if (!brand?.timezone || !brand?.adTimezone) return null
    const now = new Date()
    const getOffset = (tz: string) => {
      const parts = now.toLocaleString("en", { timeZone: tz, timeZoneName: "short" }).split(" ")
      return parts[parts.length - 1]
    }
    return { brandOffset: getOffset(brand.timezone), adOffset: getOffset(brand.adTimezone) }
  }
  const tzDiff = getTzDiff()

  const addGoal = async () => {
    if (!goalForm.targetValue.trim() || !brandId) return
    setSavingGoal(true)
    try {
      await fetch("/api/brand-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId, ...goalForm, targetValue: parseFloat(goalForm.targetValue) }),
      })
      const res = await fetch(`/api/brand-goals?brandId=${brandId}`)
      const d = await res.json()
      setBrandGoals(d.goals || [])
      setGoalForm({ metricKey: "roas", metricLabel: "ROAS", targetValue: "", period: "monthly" })
      setShowGoalForm(false)
    } catch {} finally { setSavingGoal(false) }
  }

  const deleteGoal = async (id: string) => {
    await fetch(`/api/brand-goals?id=${id}`, { method: "DELETE" })
    setBrandGoals((prev) => prev.filter((g) => g.id !== id))
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
  const healthScore = calcHealthScore(metrics)

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

  const urgentAssignments = assignments.filter((a: any) => a.priority === "urgent").length
  const importantAssignments = assignments.filter((a: any) => a.priority === "important").length
  const totalTasks = assignments.length
  const completedTasks = assignments.filter((a: any) => a.status === "completed").length

  const uploads = data?.uploads || []
  const campaigns = data?.campaigns || []
  const displayUploads = showAllUploads ? uploads : uploads.slice(0, 4)
  const displayCampaigns = showAllCampaigns ? campaigns : campaigns.slice(0, 4)

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-700 p-1">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="relative rounded-2xl bg-white/10 backdrop-blur-sm p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {/* Brand Identity */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <button onClick={() => router.push("/dashboard/brands")} className="p-1.5 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all">
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <div className="p-2.5 rounded-xl bg-white/15">
                    <Store className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">{brand.name}</h1>
                    <div className="flex items-center gap-2 text-sm text-purple-200">
                      {brand.niche && <span>{brand.niche}</span>}
                      {brand.country && <><span>·</span><span>{brand.country}</span></>}
                      {brand.platforms && <><span>·</span><span>{brand.platforms}</span></>}
                    </div>
                  </div>
                </div>
                {/* Quick Stats */}
                <div className="flex flex-wrap gap-4 mt-4">
                  {metrics && (
                    <>
                      <div className="bg-white/10 rounded-lg px-3 py-1.5">
                        <p className="text-[10px] text-purple-200">ROAS</p>
                        <p className="text-sm font-bold text-white">{metrics.roas.toFixed(2)}x</p>
                      </div>
                      <div className="bg-white/10 rounded-lg px-3 py-1.5">
                        <p className="text-[10px] text-purple-200">إجمالي الإنفاق</p>
                        <p className="text-sm font-bold text-white">{formatCurrency(metrics.spend, currency)}</p>
                      </div>
                      <div className="bg-white/10 rounded-lg px-3 py-1.5">
                        <p className="text-[10px] text-purple-200">الأرباح</p>
                        <p className="text-sm font-bold text-white">{formatCurrency(metrics.profit, currency)}</p>
                      </div>
                      <div className="bg-white/10 rounded-lg px-3 py-1.5">
                        <p className="text-[10px] text-purple-200">التحليلات</p>
                        <p className="text-sm font-bold text-white">{filteredAnalyses.length}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Health Score */}
              <div className="flex flex-col items-center shrink-0">
                <div className={`relative w-20 h-20 rounded-full border-4 ${getHealthBg(healthScore)} flex items-center justify-center bg-white/10`}>
                  <div className="text-center">
                    <p className={`text-xl font-bold ${getHealthColor(healthScore)}`}>{healthScore ?? "—"}</p>
                  </div>
                </div>
                <p className={`text-xs mt-1 font-medium ${getHealthColor(healthScore)}`}>
                  {getHealthLabel(healthScore)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 shrink-0">
                {brand.website && (
                  <a href={brand.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg bg-white/15 hover:bg-white/25 px-3 py-2 text-xs font-medium text-white transition-all">
                    <ExternalLink className="h-3.5 w-3.5" /> الموقع
                  </a>
                )}
                <button onClick={handleExport} className="flex items-center gap-1.5 rounded-lg bg-white/15 hover:bg-white/25 px-3 py-2 text-xs font-medium text-white transition-all">
                  <Download className="h-3.5 w-3.5" /> تصدير
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left: Main Content (3/4) */}
          <div className="xl:col-span-3 space-y-6">

            {/* Level Tabs + Currency Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
                {LEVELS.map((lv) => {
                  const Icon = lv.icon
                  const count = analysesList.filter((a: any) => a.level === lv.key).length
                  return (
                    <button key={lv.key} onClick={() => setSelectedLevel(lv.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        selectedLevel === lv.key ? "bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {lv.label}
                      {count > 0 && <span className="text-[10px] opacity-60">({count})</span>}
                    </button>
                  )
                })}
              </div>

              {currencies.length > 1 && (
                <div className="flex gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
                  {currencies.map((cur) => (
                    <button key={cur} onClick={() => setSelectedCurrency(cur)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        activeCur === cur ? "bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                    >
                      {cur}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* KPI Cards */}
            {metrics ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { key: "spend", label: "إجمالي الإنفاق", value: formatCurrency(metrics.spend, currency), rawValue: metrics.spend, icon: DollarSign, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/10" },
                  { key: "revenue", label: "الإيرادات", value: formatCurrency(metrics.revenue, currency), rawValue: metrics.revenue, icon: TrendingUp, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/10" },
                  { key: "roas", label: "ROAS", value: `${metrics.roas.toFixed(2)}x`, rawValue: metrics.roas, icon: Target, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/10" },
                  { key: "cpa", label: "CPA", value: formatCurrency(metrics.cpa, currency), rawValue: metrics.cpa, icon: Target, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-900/10" },
                  { key: "ctr", label: "CTR", value: `${metrics.ctr.toFixed(2)}%`, rawValue: metrics.ctr, icon: Percent, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/10" },
                  { key: "cpm", label: "CPM", value: formatCurrency(metrics.cpm, currency), rawValue: metrics.cpm, icon: BarChart3, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/10" },
                  { key: "conversions", label: "التحويلات", value: metrics.conversions || 0, rawValue: metrics.conversions, icon: Activity, color: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-900/10" },
                  { key: "profit", label: "الأرباح", value: formatCurrency(metrics.profit, currency), rawValue: metrics.profit, icon: DollarSign, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/10" },
                ].map((s) => {
                  const analysis = getMetricAnalysis(s.key, s.rawValue, (v: number) => formatCurrency(v, currency))
                  const cardMetric = { ...s, analysis, _currency: currency }
                  return (
                    <motion.div key={s.label} whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedMetric(cardMetric)}
                      className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 transition-all hover:shadow-md hover:border-purple-200 dark:hover:border-purple-800 cursor-pointer"
                    >
                      <div className={`inline-flex p-2 rounded-lg ${s.bg} mb-2`}>
                        <s.icon className={`h-4 w-4 ${s.color}`} />
                      </div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{s.value}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{s.label}</p>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center">
                <BarChart3 className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">لا توجد بيانات لهذا المستوى</p>
                <p className="text-xs text-gray-400 mt-1">ارفع تقارير لعرض المؤشرات</p>
              </div>
            )}

            {/* Brand Goals Section */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-500" />
                  أهداف البراند
                  {brandGoals.length > 0 && <span className="text-xs text-gray-400 font-normal">({brandGoals.length})</span>}
                </h3>
                <button onClick={() => setShowGoalForm(true)} className="flex items-center gap-1 rounded-lg bg-green-500 hover:bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-all">
                  <Plus className="h-3.5 w-3.5" /> إضافة هدف
                </button>
              </div>
              <div className="p-4">
                {brandGoals.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {brandGoals.map((g) => {
                      const currentVal = metrics ? (metrics as Record<string, number>)[g.metricKey] ?? 0 : 0
                      const target = g.targetValue
                      const progress = target > 0 ? Math.min(Math.round((currentVal / target) * 100), 100) : 0
                      const achieved = g.metricKey === "cpa" || g.metricKey === "cpm" || g.metricKey === "cpc"
                        ? currentVal <= target && currentVal > 0
                        : currentVal >= target
                      const isNumerical = g.metricKey === "conversions" || g.metricKey === "impressions" || g.metricKey === "clicks"
                      return (
                        <div key={g.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-medium text-gray-900 dark:text-white">{g.metricLabel}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${achieved ? "bg-green-100 dark:bg-green-900/20 text-green-600" : "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600"}`}>
                                {achieved ? "تم" : "قيد التنفيذ"}
                              </span>
                            </div>
                            <button onClick={() => deleteGoal(g.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                            <span>الحالي: {isNumerical ? currentVal : g.metricKey === "roas" ? `${currentVal.toFixed(2)}x` : `${formatCurrency(currentVal, currency)}`}</span>
                            <span>الهدف: {isNumerical ? target : g.metricKey === "roas" ? `${target}x` : `${formatCurrency(target, currency)}`}</span>
                          </div>
                          <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-500 ${achieved ? "bg-green-500" : "bg-amber-500"}`} style={{ width: `${Math.min(progress, 100)}%` }} />
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1">{progress}%</p>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Target className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">ما حددتش أهداف للبراند</p>
                    <p className="text-xs text-gray-400 mt-1">حدد أهداف عشان تتابع تقدمك</p>
                  </div>
                )}
              </div>
            </div>

            {/* Goal Form Modal */}
            <AnimatePresence>
              {showGoalForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowGoalForm(false)}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-md w-full p-6"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Target className="h-4 w-4 text-green-500" /> إضافة هدف جديد
                      </h3>
                      <button onClick={() => setShowGoalForm(false)} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800">
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">المؤشر</label>
                        <select value={goalForm.metricKey} onChange={(e) => {
                          const labels: Record<string, string> = { roas: "ROAS", spend: "إجمالي الإنفاق", revenue: "الإيرادات", cpa: "CPA", ctr: "CTR", cpm: "CPM", conversions: "التحويلات", profit: "الأرباح" }
                          setGoalForm({ ...goalForm, metricKey: e.target.value, metricLabel: labels[e.target.value] || e.target.value })
                        }} className="flex h-10 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-white">
                          <option value="roas">ROAS</option>
                          <option value="spend">إجمالي الإنفاق</option>
                          <option value="revenue">الإيرادات</option>
                          <option value="cpa">CPA</option>
                          <option value="ctr">CTR</option>
                          <option value="cpm">CPM</option>
                          <option value="conversions">التحويلات</option>
                          <option value="profit">الأرباح</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">القيمة المستهدفة</label>
                        <input value={goalForm.targetValue} onChange={(e) => setGoalForm({ ...goalForm, targetValue: e.target.value })} type="number" step="any" placeholder="مثال: 3" className="flex h-10 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">الفترة</label>
                        <select value={goalForm.period} onChange={(e) => setGoalForm({ ...goalForm, period: e.target.value })} className="flex h-10 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-white">
                          <option value="weekly">أسبوعي</option>
                          <option value="monthly">شهري</option>
                          <option value="quarterly">ربع سنوي</option>
                        </select>
                      </div>
                      <button onClick={addGoal} disabled={savingGoal || !goalForm.targetValue.trim()}
                        className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transition-all"
                      >
                        {savingGoal ? "..." : "إضافة الهدف"}
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Breakdown Table */}
            {entities.length > 0 && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <ListChecks className="h-4 w-4 text-purple-500" />
                    تفاصيل {LEVELS.find(l => l.key === selectedLevel)?.label}
                    <span className="text-xs text-gray-400 font-normal">({entities.length})</span>
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                        <th className="text-right py-3 px-4 text-gray-500 font-medium text-xs">الاسم</th>
                        <th className="text-right py-3 px-4 text-gray-500 font-medium text-xs">الإنفاق</th>
                        <th className="text-right py-3 px-4 text-gray-500 font-medium text-xs">الإيرادات</th>
                        <th className="text-right py-3 px-4 text-gray-500 font-medium text-xs">ROAS</th>
                        <th className="text-right py-3 px-4 text-gray-500 font-medium text-xs">المشاهدات</th>
                        <th className="text-right py-3 px-4 text-gray-500 font-medium text-xs">نقرات</th>
                        <th className="text-right py-3 px-4 text-gray-500 font-medium text-xs">تحويلات</th>
                        <th className="text-right py-3 px-4 text-gray-500 font-medium text-xs">CPA</th>
                        <th className="text-right py-3 px-4 text-gray-500 font-medium text-xs">CTR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entities.map((e, i) => (
                        <tr key={i} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                          <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{e.name}</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{formatCurrency(e.spend, currency)}</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{formatCurrency(e.revenue, currency)}</td>
                          <td className={`py-3 px-4 font-medium ${e.roas >= 2 ? "text-green-600" : e.roas >= 1 ? "text-yellow-600" : "text-red-600"}`}>{e.roas?.toFixed(2)}x</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{(e.impressions || 0).toLocaleString()}</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{(e.clicks || 0).toLocaleString()}</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{e.conversions || 0}</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{formatCurrency(e.cpa, currency)}</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{e.ctr?.toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Uploads Section */}
            {uploads.length > 0 && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <FileText className="h-4 w-4 text-amber-500" />
                    التقارير المرفوعة
                    <span className="text-xs text-gray-400 font-normal">({uploads.length})</span>
                  </h3>
                  {uploads.length > 4 && (
                    <button onClick={() => setShowAllUploads(!showAllUploads)} className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1">
                      {showAllUploads ? "عرض أقل" : "عرض الكل"}
                      <ChevronDown className={`h-3 w-3 transition-transform ${showAllUploads ? "rotate-180" : ""}`} />
                    </button>
                  )}
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {displayUploads.map((u: any) => (
                      <div key={u.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                          <FileText className="h-4 w-4 text-amber-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{u.fileName}</p>
                          <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3" />
                            {new Date(u.createdAt).toLocaleDateString("ar-EG")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Campaigns Section */}
            {campaigns.length > 0 && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Play className="h-4 w-4 text-blue-500" />
                    الحملات
                    <span className="text-xs text-gray-400 font-normal">({campaigns.length})</span>
                  </h3>
                  {campaigns.length > 4 && (
                    <button onClick={() => setShowAllCampaigns(!showAllCampaigns)} className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1">
                      {showAllCampaigns ? "عرض أقل" : "عرض الكل"}
                      <ChevronDown className={`h-3 w-3 transition-transform ${showAllCampaigns ? "rotate-180" : ""}`} />
                    </button>
                  )}
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {displayCampaigns.map((c: any) => (
                      <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                          <Play className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{c.name}</p>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                            {c.platform && <span>{c.platform}</span>}
                            {c.goal && <><span>·</span><span>{c.goal}</span></>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Brand Info + Website Analysis */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  معلومات و تحليلات البراند
                </h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: "الأهداف", value: brand.goals, icon: Target },
                    { label: "الجمهور المستهدف", value: brand.targetAudience, icon: Users },
                    { label: "المنصات", value: brand.platforms, icon: Monitor },
                    { label: "الميزانية الشهرية", value: brand.monthlyBudget ? formatCurrency(brand.monthlyBudget, currency) : null, icon: DollarSign },
                    { label: "التخصص", value: brand.niche, icon: ShoppingBag },
                    { label: "البلد", value: brand.country, icon: Globe },
                  ].map((item) => item.value ? (
                    <div key={item.label} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-1.5 mb-1">
                        <item.icon className="h-3 w-3 text-purple-500" />
                        <span className="text-[10px] text-gray-400">{item.label}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</p>
                    </div>
                  ) : null)}
                  {/* Timezone - Dual */}
                  <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-100 dark:border-indigo-800/30 col-span-2 sm:col-span-1">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Clock3 className="h-3 w-3 text-indigo-500" />
                      <span className="text-[10px] text-gray-400">التوقيت</span>
                    </div>
                    {/* Brand Timezone */}
                    <div className="mb-2">
                      <p className="text-[9px] text-gray-400 mb-0.5">توقيت البراند</p>
                      <select value={brand.timezone || ""} onChange={(e) => updateBrandField("timezone", e.target.value)}
                        className="w-full text-xs rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-gray-900 dark:text-white mb-1"
                      >
                        <option value="">اختر</option>
                        <option value="Asia/Riyadh">GMT+3 (السعودية)</option>
                        <option value="Asia/Qatar">GMT+3 (قطر)</option>
                        <option value="Asia/Kuwait">GMT+3 (الكويت)</option>
                        <option value="Asia/Baghdad">GMT+3 (العراق)</option>
                        <option value="Asia/Dubai">GMT+4 (الإمارات)</option>
                        <option value="Asia/Cairo">GMT+2 (مصر)</option>
                        <option value="Africa/Cairo">GMT+2 (مصر)</option>
                        <option value="Asia/Amman">GMT+3 (الأردن)</option>
                        <option value="Asia/Beirut">GMT+2 (لبنان)</option>
                        <option value="Africa/Casablanca">GMT+1 (المغرب)</option>
                        <option value="Africa/Tunis">GMT+1 (تونس)</option>
                        <option value="Africa/Algiers">GMT+1 (الجزائر)</option>
                        <option value="Asia/Karachi">GMT+5 (باكستان)</option>
                        <option value="Asia/Kolkata">GMT+5:30 (الهند)</option>
                        <option value="Europe/London">GMT+0 (لندن)</option>
                        <option value="Europe/Istanbul">GMT+3 (اسطنبول)</option>
                        <option value="America/New_York">GMT-5 (نيويورك)</option>
                        <option value="America/Araguaina">GMT-3 (أمريكا)</option>
                        <option value="UTC">UTC+0</option>
                      </select>
                      {brand.timezone && tzTime && <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400" dir="ltr">{tzTime}</p>}
                      {!brand.timezone && <p className="text-[9px] text-gray-400">اختر توقيت البراند</p>}
                    </div>
                    {/* Ad Account Timezone */}
                    <div className="pt-2 border-t border-indigo-100 dark:border-indigo-800/30">
                      <p className="text-[9px] text-gray-400 mb-0.5">توقيت حساب الإعلانات</p>
                      <select value={brand.adTimezone || ""} onChange={(e) => updateBrandField("adTimezone", e.target.value)}
                        className="w-full text-xs rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-gray-900 dark:text-white mb-1"
                      >
                        <option value="">اختر</option>
                        <option value="America/Araguaina">GMT-3 (أمريكا - حسابك)</option>
                        <option value="America/New_York">GMT-5 (نيويورك)</option>
                        <option value="America/Chicago">GMT-6 (شيكاغو)</option>
                        <option value="America/Los_Angeles">GMT-8 (لوس أنجلوس)</option>
                        <option value="America/Sao_Paulo">GMT-3 (ساو باولو)</option>
                        <option value="Europe/London">GMT+0 (لندن)</option>
                        <option value="Europe/Paris">GMT+1 (باريس)</option>
                        <option value="Europe/Istanbul">GMT+3 (اسطنبول)</option>
                        <option value="Asia/Dubai">GMT+4 (دبي)</option>
                        <option value="Asia/Riyadh">GMT+3 (السعودية)</option>
                        <option value="Asia/Cairo">GMT+2 (مصر)</option>
                        <option value="Asia/Karachi">GMT+5 (باكستان)</option>
                        <option value="Asia/Kolkata">GMT+5:30 (الهند)</option>
                        <option value="Asia/Shanghai">GMT+8 (شنغهاي)</option>
                        <option value="Asia/Tokyo">GMT+9 (طوكيو)</option>
                        <option value="Australia/Sydney">GMT+11 (سيدني)</option>
                        <option value="UTC">UTC+0</option>
                      </select>
                      {brand.adTimezone && adTzTime && <p className="text-xs font-bold text-amber-600 dark:text-amber-400" dir="ltr">{adTzTime}</p>}
                      {!brand.adTimezone && <p className="text-[9px] text-gray-400">اختر توقيت حساب الإعلانات</p>}
                    </div>
                    {/* Time difference + posting tip */}
                    {brand.timezone && brand.adTimezone && tzDiff && (
                      <div className="mt-2 pt-2 border-t border-indigo-100 dark:border-indigo-800/30 space-y-2">
                        <p className="text-[9px] text-gray-400 mb-0.5">فرق التوقيت</p>
                        <p className="text-[10px] font-medium text-gray-700 dark:text-gray-300">
                          البراند {tzDiff.brandOffset} ← الحساب {tzDiff.adOffset}
                        </p>

                        {/* Timezone Converter */}
                        <div className="pt-2 border-t border-indigo-100 dark:border-indigo-800/30">
                          <p className="text-[9px] text-gray-400 mb-1.5">🕐 عايز تنزل إعلان في توقيت البراند؟</p>
                          <div className="flex items-center gap-2">
                            <input type="time" value={postTime} onChange={(e) => setPostTime(e.target.value)}
                              className="flex-1 text-xs rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1.5 text-gray-900 dark:text-white"
                            />
                          </div>
                          {convertedTime && (
                            <div className="mt-1.5 flex items-center gap-1.5 text-[10px]">
                              <span className="text-indigo-600 dark:text-indigo-400 font-medium">{toAmPm(postTime)}</span>
                              <span className="text-gray-400">⬅ بتوقيت الحساب</span>
                              <span className="text-amber-600 dark:text-amber-400 font-bold">{toAmPm(convertedTime)}</span>
                            </div>
                          )}
                        </div>

                        <p className="text-[9px] text-gray-400">
                          ⏰ اعرف إن وقت النشر في حساب الإعلانات غير توقيت البراند. نظم جدول النشر حسب توقيت حسابك عشان التحليلات تضبط.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                {brand.notes && (
                  <div className="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
                    <p className="text-[10px] text-gray-400 mb-1">ملاحظات</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{brand.notes}</p>
                  </div>
                )}
                {brand.websiteAnalysis && (() => {
                  let wa: any = {}
                  try { wa = JSON.parse(brand.websiteAnalysis) } catch {}
                  return wa.title ? (
                    <div className="mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Globe className="h-3.5 w-3.5 text-blue-500" />
                        <span className="text-xs font-medium text-gray-900 dark:text-white">تحليل الموقع</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{wa.title}</p>
                      {wa.description && <p className="text-xs text-gray-500 mb-2">{wa.description}</p>}
                      {wa.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {wa.tags.map((t: string, i: number) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null
                })()}
              </div>
            </div>
          </div>

          {/* Right: Sidebar (1/4) */}
          <div className="space-y-4">
            {/* Action Plan Card */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                  <Brain className="h-4 w-4 text-purple-500" />
                  خطة العمل الذكية
                </h3>
                <button onClick={() => { setAssignmentsLoading(true); fetch(`/api/brand-assignments?brandId=${brandId}`).then(r => r.json()).then(d => { setAssignments(d.assignments || []); setAssignmentsSummary(d.summary || "") }).catch(() => {}).finally(() => setAssignmentsLoading(false)) }}
                  className="text-purple-600 hover:text-purple-700 p-1 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all">
                  <Loader2 className={`h-4 w-4 ${assignmentsLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Summary */}
              {assignmentsSummary && (
                <div className="px-4 pt-3">
                  <p className="text-[10px] text-gray-500 leading-relaxed">{assignmentsSummary}</p>
                </div>
              )}

              {/* Priority Counts */}
              {assignments.length > 0 && (
                <div className="flex gap-2 px-4 pt-3">
                  {urgentAssignments > 0 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400">{urgentAssignments} عاجل</span>}
                  {importantAssignments > 0 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400">{importantAssignments} مهم</span>}
                </div>
              )}

              <div className="p-4 space-y-2">
                {assignmentsLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                  </div>
                ) : assignments.length > 0 ? (
                  assignments.slice(0, 5).map((a: any) => (
                    <AssignmentCard key={a.id} assignment={a} />
                  ))
                ) : (
                  <p className="text-xs text-gray-400 text-center py-6">
                    {assignments.length === 0 && !assignmentsLoading ? "ارفع تقارير لتحليل البراند" : "جارٍ التحميل..."}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Summary Card */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-500" />
                ملخص سريع
              </h3>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">إجمالي التحليلات</span>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">{analysesList.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">المهام المنجزة</span>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">{completedTasks}/{totalTasks}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">التقارير المرفوعة</span>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">{uploads.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">الحملات</span>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">{campaigns.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">العملات</span>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">{currencies.join(" / ") || "USD"}</span>
                </div>
                {metrics && (
                  <>
                    <div className="border-t border-gray-100 dark:border-gray-800 pt-2 mt-2" />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">ROAS</span>
                      <span className={`text-xs font-bold ${metrics.roas >= 2 ? "text-green-500" : metrics.roas >= 1 ? "text-yellow-500" : "text-red-500"}`}>
                        {metrics.roas.toFixed(2)}x
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">الصحة</span>
                      <span className={`text-xs font-bold ${getHealthColor(healthScore)}`}>{getHealthLabel(healthScore)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      <MetricAnalysisModal metric={selectedMetric} onClose={() => setSelectedMetric(null)} brand={brand} />
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
