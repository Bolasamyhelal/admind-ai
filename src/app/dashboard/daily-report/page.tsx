"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useAuth } from "@/context/auth-context"
import { formatCurrency, cn } from "@/lib/utils"
import {
  Loader2, FileText, Download, Sparkles, Upload, BarChart3,
  Rocket, AlertTriangle, CheckCircle2, Clock, TrendingUp,
  DollarSign, Target, Store, Brain, ChevronRight, Sun,
  Eye, MousePointerClick, Lightbulb, TrendingDown,
} from "lucide-react"

export default function DailyReportPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return
    fetch(`/api/daily-report?userId=${user.id}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [user])

  const downloadPDF = async () => {
    if (!reportRef.current) return
    setExporting(true)
    try {
      const html2canvas = (await import("html2canvas")).default
      const jsPDF = (await import("jspdf")).default
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: "#0a0a0a",
        logging: false,
        useCORS: true,
      })
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: "a4" })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height)
      const w = canvas.width * ratio
      const h = canvas.height * ratio
      const x = (pageWidth - w) / 2
      const y = (pageHeight - h) / 2
      pdf.addImage(imgData, "PNG", x, y, w, h)
      pdf.save(`AdMind_AI_Report_${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (err) {
      console.error("PDF export failed:", err)
    }
    setExporting(false)
  }

  const s = data?.summary || {}
  const a = data?.allTime || {}
  const today = new Date().toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
  const todayArr = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })

  const campaigns = data?.todaysCampaigns || []
  const uploads = data?.todaysUploads || []
  const alerts = data?.alerts || []

  // Smart insights based on data
  const insights: string[] = []
  if (campaigns.length > 0) insights.push(`تم إطلاق ${campaigns.length} حملة${campaigns.length > 1 ? "ات" : ""} جديدة اليوم`)
  if (uploads.length > 0) insights.push(`تم رفع ${uploads.length} تقرير${uploads.length > 1 ? "" : ""} لتحليل الأداء`)
  if (s.roasToday >= 2) insights.push(`ROAS ${s.roasToday.toFixed(2)}x — أداء ممتاز، حملاتك تحقق عائد قوي`)
  else if (s.roasToday >= 1) insights.push(`ROAS ${s.roasToday.toFixed(2)}x — أداء جيد، في فرصة للتحسين`)
  if (s.profitToday > 0) insights.push(`حققت أرباح ${formatCurrency(s.profitToday, "USD")} اليوم`)
  if (alerts.filter((a: any) => a.severity === "critical").length > 0) insights.push(`في ${alerts.filter((a: any) => a.severity === "critical").length} تنبيه حرج يحتاج متابعة`)

  const uploadsByPlatform = uploads.reduce((acc: Record<string, number>, u: any) => {
    acc[u.platform] = (acc[u.platform] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-5 w-5 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">التقرير اليومي</h1>
            </div>
            <p className="text-sm text-gray-500">{today}</p>
          </div>
          <button onClick={downloadPDF} disabled={exporting || !data}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2.5 text-sm font-medium hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-purple-500/20"
          >
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {exporting ? "جارٍ التحميل..." : "تحميل التقرير PDF"}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-purple-600" /></div>
        ) : !data ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-16 text-center">
            <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500">لا توجد بيانات اليوم</p>
          </div>
        ) : (
          <div ref={reportRef} className="space-y-6" dir="rtl">
            {/* ====== PREMIUM CLIENT REPORT CARD ====== */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900 via-gray-950 to-indigo-950/50 overflow-hidden shadow-2xl shadow-purple-500/10">
              {/* Animated gradient top bar */}
              <div className="relative h-2 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-l from-purple-600 via-pink-500 via-indigo-500 to-purple-600 bg-[length:200%_100%] animate-[gradientMove_3s_linear_infinite]" />
              </div>

              <div className="p-6 md:p-10">
                {/* ===== HEADER ===== */}
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-500/30">
                        <Brain className="h-6 w-6 text-white" />
                      </div>
                      <motion.div
                        className="absolute -inset-1.5 rounded-2xl bg-purple-500/20 blur-lg"
                        animate={{ opacity: [0.2, 0.5, 0.2] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </div>
                    <div className="mr-3">
                      <h2 className="text-xl font-bold text-white">AdMind AI</h2>
                      <p className="text-[11px] text-gray-400">تقرير أداء — {todayArr}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-2">
                      <p className="text-[9px] text-gray-500">تقرير</p>
                      <p className="text-sm font-bold text-white">يومي</p>
                    </div>
                  </div>
                </div>

                {/* ===== HERO: Big numbers ===== */}
                <div className="text-center mb-10">
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
                    <p className="text-5xl md:text-6xl font-bold bg-gradient-to-l from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent mb-2">
                      {s.uploadsToday + s.analysesToday + s.campaignsToday}
                    </p>
                    <p className="text-sm text-gray-400">إجراء تم اليوم لتحسين أدائك</p>
                  </motion.div>
                </div>

                {/* ===== INSIGHTS ===== */}
                {insights.length > 0 && (
                  <div className="rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 p-5 mb-8">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="h-4 w-4 text-purple-400" />
                      <h3 className="text-sm font-bold text-white">أبرز ما تم اليوم</h3>
                    </div>
                    <div className="space-y-2">
                      {insights.map((insight, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />
                          <p className="text-sm text-gray-300">{insight}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ===== STATS GRID ===== */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: "حملات منطلقة", value: s.campaignsToday, icon: Rocket, color: "from-orange-500 to-red-500", desc: "حملات إعلانية جديدة" },
                    { label: "تقارير مرفوعة", value: s.uploadsToday, icon: Upload, color: "from-blue-500 to-cyan-500", desc: "تحليل أداء وبيانات" },
                    { label: "تحليلات", value: s.analysesToday, icon: BarChart3, color: "from-purple-500 to-pink-500", desc: "تحليل متقدم للبيانات" },
                    { label: "ROAS", value: `${(s.roasToday || 0).toFixed(2)}x`, icon: TrendingUp, color: s.roasToday >= 2 ? "from-green-500 to-emerald-500" : "from-yellow-500 to-amber-500", desc: "العائد على الإنفاق" },
                  ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                      className="rounded-xl bg-white/5 border border-white/10 p-5 hover:bg-white/[0.07] transition-colors"
                    >
                      <div className={cn("w-fit p-2.5 rounded-xl bg-gradient-to-br mb-3 shadow-lg", stat.color)}>
                        <stat.icon className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-2xl font-bold text-white mb-0.5">{stat.value}</p>
                      <p className="text-xs font-medium text-gray-300">{stat.label}</p>
                      <p className="text-[9px] text-gray-500 mt-0.5">{stat.desc}</p>
                    </motion.div>
                  ))}
                </div>

                {/* ===== KPI ROW ===== */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                  {[
                    { label: "إجمالي الإنفاق", value: formatCurrency(s.spendToday || 0, "USD"), icon: DollarSign, change: null },
                    { label: "الإيرادات", value: formatCurrency(s.revenueToday || 0, "USD"), icon: TrendingUp, change: "up" },
                    { label: "الأرباح", value: formatCurrency(s.profitToday || 0, "USD"), icon: TrendingUp, change: s.profitToday > 0 ? "up" : "down" },
                    { label: "البراندات النشطة", value: a.activeBrands, icon: Store, change: null },
                  ].map((kpi, i) => (
                    <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }}
                      className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 p-3"
                    >
                      <div className="p-2 rounded-lg bg-purple-500/20">
                        <kpi.icon className="h-4 w-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{kpi.value}</p>
                        <p className="text-[10px] text-gray-400">{kpi.label}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* ===== CAMPAIGNS SECTION ===== */}
                {campaigns.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <Rocket className="h-4 w-4 text-orange-400" />
                      الحملات المنطلقة اليوم
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {campaigns.map((c: any, i: number) => (
                        <motion.div key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                          className="rounded-xl bg-white/5 border border-white/10 p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-bold text-white">{c.name}</p>
                            <span className={cn(
                              "text-[9px] px-2 py-0.5 rounded-full",
                              c.status === "active" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
                            )}>{c.status === "active" ? "نشطة" : c.status}</span>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-gray-400">
                            <span>{c.platform}</span>
                            {c.goal && <><span>·</span><span>{c.goal}</span></>}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ===== UPLOADS BY PLATFORM ===== */}
                {Object.keys(uploadsByPlatform).length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-blue-400" />
                      التقارير المرفوعة
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(uploadsByPlatform).map(([platform, count]) => (
                        <div key={platform} className="rounded-xl bg-white/5 border border-white/10 px-4 py-2 flex items-center gap-2">
                          <span className="text-lg font-bold text-white">{count}</span>
                          <span className="text-xs text-gray-400">{platform}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ===== NEXT STEPS ===== */}
                <div className="rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-5 mb-8">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4 text-indigo-400" />
                    الخطوات القادمة
                  </h3>
                  <div className="space-y-2">
                    {s.roasToday < 2 && (
                      <div className="flex items-start gap-2">
                        <ChevronRight className="h-3.5 w-3.5 text-purple-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-gray-300">تحسين ROAS — مراجعة الحملات الحالية وتحسين الاستهداف</p>
                      </div>
                    )}
                    {campaigns.length === 0 && (
                      <div className="flex items-start gap-2">
                        <ChevronRight className="h-3.5 w-3.5 text-purple-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-gray-300">إطلاق حملات جديدة — استغلال الفرص المتاحة في السوق</p>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <ChevronRight className="h-3.5 w-3.5 text-purple-400 mt-0.5 shrink-0" />
                      <p className="text-xs text-gray-300">متابعة أداء الحملات الحالية وتحسين الكريتيف</p>
                    </div>
                  </div>
                </div>

                {/* ===== FOOTER ===== */}
                <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                  <p className="text-[9px] text-gray-500">تم إنشاؤه بواسطة AdMind AI · {new Date().toLocaleString("ar-EG")}</p>
                  <div className="flex items-center gap-1.5">
                    <Brain className="h-3 w-3 text-purple-400" />
                    <span className="text-[10px] text-gray-400 font-medium">AdMind AI</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  )
}
