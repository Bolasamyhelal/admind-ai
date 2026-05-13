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
  Eye, MousePointerClick,
} from "lucide-react"

export default function DailyReportPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [manusLoading, setManusLoading] = useState(false)
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

  const generateWithManus = async () => {
    setManusLoading(true)
    try {
      const res = await fetch("/api/manus-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportData: data }),
      })
      const result = await res.json()
      if (result.url) window.open(result.url, "_blank")
      else alert("تم إرسال التقرير إلى Manus AI — هيصلك إشعار لما يجهز")
    } catch {
      alert("فشل الاتصال بـ Manus AI — تأكد من مفتاح API")
    }
    setManusLoading(false)
  }

  const s = data?.summary || {}
  const a = data?.allTime || {}
  const today = new Date().toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })

  const activityFeed = [
    ...(data?.todaysUploads || []).map((u: any) => ({ type: "upload", label: "رفع تقرير", desc: u.fileName, sub: u.platform, time: new Date(u.createdAt).toLocaleTimeString("ar-EG") })),
    ...(data?.todaysAnalyses || []).map((a: any) => ({ type: "analysis", label: "تحليل", desc: a.title, sub: a.level, time: new Date(a.createdAt).toLocaleTimeString("ar-EG") })),
    ...(data?.todaysCampaigns || []).map((c: any) => ({ type: "campaign", label: "إطلاق حملة", desc: c.name, sub: c.platform, time: new Date(c.createdAt).toLocaleTimeString("ar-EG") })),
    ...(data?.alerts || []).map((a: any) => ({ type: "alert", label: a.type === "critical" ? "تنبيه" : "ملاحظة", desc: a.message, sub: a.severity, time: new Date(a.createdAt).toLocaleTimeString("ar-EG") })),
  ].sort((a: any, b: any) => b.time.localeCompare(a.time))

  const iconMap: Record<string, any> = { upload: Upload, analysis: BarChart3, campaign: Rocket, alert: AlertTriangle }

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
          <div className="flex items-center gap-2">
            <button onClick={generateWithManus} disabled={manusLoading || !data}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2.5 text-sm font-medium hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-purple-500/20"
            >
              {manusLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Manus AI Report
            </button>
            <button onClick={downloadPDF} disabled={exporting || !data}
              className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50"
            >
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {exporting ? "جارٍ التحميل..." : "PDF"}
            </button>
          </div>
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
            {/* Premium Report Card */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900 via-gray-950 to-purple-950/50 overflow-hidden shadow-2xl shadow-purple-500/10">
              {/* Decorative header */}
              <div className="relative h-2 bg-gradient-to-l from-purple-600 via-pink-500 to-indigo-600" />
              <div className="p-6 md:p-8">
                {/* Top section */}
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="relative">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg">
                          <Brain className="h-5 w-5 text-white" />
                        </div>
                        <motion.div className="absolute -inset-1 rounded-xl bg-purple-500/20 blur-md" animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
                      </div>
                      <div className="mr-3">
                        <h2 className="text-lg font-bold text-white">AdMind AI</h2>
                        <p className="text-[10px] text-gray-400">Performance Report</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-gray-500">تقرير</p>
                    <p className="text-sm font-bold text-white">{new Date().toLocaleDateString("ar-EG")}</p>
                  </div>
                </div>

                {/* Summary Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                  {[
                    { label: "التقارير المرفوعة", value: s.uploadsToday, icon: Upload, color: "from-blue-500 to-cyan-500" },
                    { label: "التحليلات", value: s.analysesToday, icon: BarChart3, color: "from-purple-500 to-pink-500" },
                    { label: "الحملات المنطلقة", value: s.campaignsToday, icon: Rocket, color: "from-orange-500 to-red-500" },
                    { label: "التنبيهات", value: s.alertsToday, icon: AlertTriangle, color: "from-yellow-500 to-amber-500" },
                  ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="rounded-xl bg-white/5 border border-white/10 p-4"
                    >
                      <div className={cn("w-fit p-2 rounded-lg bg-gradient-to-br mb-2", stat.color)}>
                        <stat.icon className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-[10px] text-gray-400">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>

                {/* KPI Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: "الإنفاق", value: formatCurrency(s.spendToday || 0, "USD"), icon: DollarSign },
                    { label: "الإيرادات", value: formatCurrency(s.revenueToday || 0, "USD"), icon: TrendingUp },
                    { label: "ROAS", value: `${(s.roasToday || 0).toFixed(2)}x`, icon: Target },
                    { label: "الأرباح", value: formatCurrency(s.profitToday || 0, "USD"), icon: DollarSign },
                  ].map((kpi, i) => (
                    <div key={kpi.label} className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 p-3">
                      <div className="p-2 rounded-lg bg-purple-500/20">
                        <kpi.icon className="h-4 w-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{kpi.value}</p>
                        <p className="text-[10px] text-gray-400">{kpi.label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* All-time stats */}
                <div className="rounded-xl bg-white/5 border border-white/10 p-4 mb-8">
                  <h3 className="text-xs font-bold text-gray-300 mb-3 flex items-center gap-2">
                    <Sun className="h-3 w-3 text-purple-400" />
                    إحصائيات شاملة
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "إجمالي البراندات", value: a.totalBrands },
                      { label: "البراندات النشطة", value: a.activeBrands },
                      { label: "إجمالي الحملات", value: a.totalCampaigns },
                    ].map((stat, i) => (
                      <div key={stat.label}>
                        <p className="text-lg font-bold text-white">{stat.value}</p>
                        <p className="text-[10px] text-gray-400">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activity Timeline */}
                <div>
                  <h3 className="text-xs font-bold text-gray-300 mb-3 flex items-center gap-2">
                    <Clock className="h-3 w-3 text-purple-400" />
                    نشاط اليوم
                  </h3>
                  {activityFeed.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-6">لا يوجد نشاط اليوم</p>
                  ) : (
                    <div className="space-y-2">
                      {activityFeed.slice(0, 10).map((item: any, i: number) => {
                        const Icon = iconMap[item.type] || CheckCircle2
                        const colors: Record<string, string> = {
                          upload: "bg-blue-500/20 text-blue-400",
                          analysis: "bg-purple-500/20 text-purple-400",
                          campaign: "bg-orange-500/20 text-orange-400",
                          alert: item.sub === "critical" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400",
                        }
                        return (
                          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                            className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 border border-white/5"
                          >
                            <div className={cn("p-1.5 rounded-lg", colors[item.type] || "bg-gray-500/20 text-gray-400")}>
                              <Icon className="h-3 w-3" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-white truncate">{item.desc}</p>
                              <p className="text-[10px] text-gray-500">{item.sub}</p>
                            </div>
                            <span className="text-[9px] text-gray-500 shrink-0">{item.time}</span>
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
                  <p className="text-[9px] text-gray-500">تم إنشاؤه بواسطة AdMind AI · {new Date().toLocaleString("ar-EG")}</p>
                  <div className="flex items-center gap-1">
                    <Brain className="h-3 w-3 text-purple-400" />
                    <span className="text-[9px] text-gray-400">AdMind AI</span>
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
