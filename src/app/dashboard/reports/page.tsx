"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useAuth } from "@/context/auth-context"
import { formatCurrency } from "@/lib/utils"
import {
  FileText, Download, Store, TrendingUp, DollarSign, Target,
  BarChart3, Image, Play, Globe, Sparkles, Loader2, Calendar,
} from "lucide-react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

export default function ReportsPage() {
  const [brands, setBrands] = useState<any[]>([])
  const [selectedBrandId, setSelectedBrandId] = useState("")
  const [period, setPeriod] = useState<"weekly" | "monthly">("monthly")
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [brandsLoading, setBrandsLoading] = useState(true)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const { user } = useAuth()
  const reportRef = useRef<HTMLDivElement>(null)

  // Load brands on mount
  useState(() => {
    if (user) {
      fetch(`/api/brands?userId=${user.id}`)
        .then((r) => r.json())
        .then((d) => { setBrands(d.brands || []) })
        .catch(() => {})
        .finally(() => setBrandsLoading(false))
    }
  })

  const selectedBrand = brands.find((b) => b.id === selectedBrandId)

  const generateReport = async () => {
    if (!selectedBrandId || !user) return
    setLoading(true)
    try {
      const res = await fetch(`/api/brands?id=${selectedBrandId}&userId=${user.id}`)
      const data = await res.json()
      if (!data.brand) throw new Error("Brand not found")

      const now = new Date()
      const daysAgo = period === "weekly" ? 7 : 30
      const cutoff = new Date(now.getTime() - daysAgo * 86400000).toISOString()

      // Filter analyses within period
      const periodAnalyses = (data.analyses || []).filter(
        (a: any) => new Date(a.createdAt).getTime() >= new Date(cutoff).getTime()
      )
      const periodUploads = (data.uploads || []).filter(
        (u: any) => new Date(u.createdAt).getTime() >= new Date(cutoff).getTime()
      )

      // Aggregate metrics
      const metrics = { spend: 0, revenue: 0, roas: 0, cpa: 0, ctr: 0, cpm: 0, cpc: 0, conversions: 0, impressions: 0, clicks: 0, profit: 0, count: 0 }
      for (const a of periodAnalyses) {
        if (!a.metrics) continue
        try {
          const m = JSON.parse(a.metrics)
          metrics.spend += m.spend || 0
          metrics.revenue += m.revenue || 0
          metrics.conversions += m.conversions || 0
          metrics.impressions += m.impressions || 0
          metrics.clicks += m.clicks || 0
          metrics.profit += m.profit || 0
          metrics.roas += m.roas || 0
          metrics.cpa += m.cpa || 0
          metrics.ctr += m.ctr || 0
          metrics.cpm += m.cpm || 0
          metrics.cpc += m.cpc || 0
          metrics.count++
        } catch {}
      }
      if (metrics.count > 0) {
        metrics.roas /= metrics.count
        metrics.cpa /= metrics.count
        metrics.ctr /= metrics.count
        metrics.cpm /= metrics.count
        metrics.cpc /= metrics.count
      }

      setReport({
        brand: data.brand,
        period,
        startDate: cutoff,
        endDate: now.toISOString(),
        analyses: periodAnalyses,
        uploads: periodUploads,
        campaigns: data.campaigns || [],
        creatives: data.creatives || [],
        metrics,
        currency: data.brand.currency || "USD",
        generatedAt: now.toISOString(),
      })
    } catch (err: any) {
      alert(err.message || "فشل إنشاء التقرير")
    }
    setLoading(false)
  }

  const downloadPdf = async () => {
    if (!reportRef.current) return
    setGeneratingPdf(true)
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      })
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")
      const imgWidth = 210.7
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pdf.internal.pageSize.getHeight()

      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= pdf.internal.pageSize.getHeight()
      }

      pdf.save(`تقرير-${report?.brand?.name || "براند"}-${period === "weekly" ? "أسبوعي" : "شهري"}.pdf`)
    } catch (err) {
      alert("فشل تحميل PDF")
    }
    setGeneratingPdf(false)
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">التقارير</h1>
            <p className="text-sm text-gray-500 mt-1">إنشاء تقارير دورية للبراندات</p>
          </div>
        </div>

        {/* Controls */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">البراند</label>
              <select value={selectedBrandId} onChange={(e) => setSelectedBrandId(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-white outline-none focus:border-purple-500"
              >
                <option value="">{brandsLoading ? "جارٍ التحميل..." : "اختر براند..."}</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="min-w-[150px]">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">الفترة</label>
              <div className="flex gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
                {(["weekly", "monthly"] as const).map((p) => (
                  <button key={p} onClick={() => setPeriod(p)}
                    className={`flex-1 px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                      period === p ? "bg-white dark:bg-gray-700 text-purple-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {p === "weekly" ? "أسبوعي" : "شهري"}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={generateReport} disabled={loading || !selectedBrandId}
              className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              {loading ? "..." : "إنشاء التقرير"}
            </button>
          </div>
        </div>

        {/* Report Preview */}
        {report && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">معاينة التقرير</h2>
              <button onClick={downloadPdf} disabled={generatingPdf}
                className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
              >
                {generatingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {generatingPdf ? "..." : "تحميل PDF"}
              </button>
            </div>

            <div ref={reportRef}
              className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden"
              dir="rtl"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              {/* Report Header */}
              <div className="bg-gradient-to-l from-purple-600 to-purple-800 p-8 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-white/20">
                    <Store className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{report.brand.name}</h2>
                    <p className="text-purple-200 text-sm">
                      تقرير {period === "weekly" ? "أسبوعي" : "شهري"}
                      {" · "}{new Date(report.generatedAt).toLocaleDateString("ar-EG")}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-purple-200">
                  {report.brand.niche && <span>التخصص: {report.brand.niche}</span>}
                  {report.brand.platforms && <span>المنصات: {report.brand.platforms}</span>}
                  {report.brand.country && <span>البلد: {report.brand.country}</span>}
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Period Info */}
                <div className="flex items-center gap-2 text-sm text-gray-500 pb-4 border-b border-gray-200">
                  <Calendar className="h-4 w-4" />
                  الفترة: {new Date(report.startDate).toLocaleDateString("ar-EG")} → {new Date(report.endDate).toLocaleDateString("ar-EG")}
                </div>

                {/* Metrics Grid */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-600" /> المؤشرات
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "إجمالي الإنفاق", value: formatCurrency(report.metrics.spend, report.currency), icon: DollarSign, color: "text-red-500" },
                      { label: "الإيرادات", value: formatCurrency(report.metrics.revenue, report.currency), icon: TrendingUp, color: "text-green-500" },
                      { label: "ROAS", value: `${report.metrics.roas.toFixed(2)}x`, icon: Target, color: "text-purple-500" },
                      { label: "CPA", value: formatCurrency(report.metrics.cpa, report.currency), icon: Target, color: "text-yellow-500" },
                      { label: "CTR", value: `${report.metrics.ctr.toFixed(2)}%`, icon: BarChart3, color: "text-blue-500" },
                      { label: "CPM", value: formatCurrency(report.metrics.cpm, report.currency), icon: BarChart3, color: "text-orange-500" },
                      { label: "التحويلات", value: report.metrics.conversions || 0, icon: Target, color: "text-green-500" },
                      { label: "الأرباح", value: formatCurrency(report.metrics.profit, report.currency), icon: DollarSign, color: "text-blue-500" },
                    ].map((s) => (
                      <div key={s.label} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                        <div className="flex items-center gap-1.5 mb-1">
                          <s.icon className={`h-3.5 w-3.5 ${s.color}`} />
                          <span className="text-[10px] text-gray-400">{s.label}</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900">{s.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Campaigns */}
                {report.campaigns.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Play className="h-4 w-4 text-blue-500" /> الحملات ({report.campaigns.length})
                    </h3>
                    <div className="space-y-2">
                      {report.campaigns.map((c: any) => (
                        <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{c.name}</p>
                            <p className="text-xs text-gray-400">{c.platform} · {c.goal}</p>
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatCurrency(c.totalSpend, c.currency)} / {formatCurrency(c.totalBudget, c.currency)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Creatives */}
                {report.creatives.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Image className="h-4 w-4 text-pink-500" /> الكريتفز ({report.creatives.length})
                    </h3>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {report.creatives.slice(0, 6).map((c: any) => (
                        <div key={c.id} className="aspect-square rounded-lg bg-gray-100 overflow-hidden">
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

                {/* Uploads Summary */}
                {report.uploads.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-amber-500" /> التقارير المرفوعة ({report.uploads.length})
                    </h3>
                    <div className="space-y-1">
                      {report.uploads.map((u: any) => (
                        <div key={u.id} className="flex items-center justify-between text-xs text-gray-500 p-2 rounded-lg bg-gray-50">
                          <span>{u.fileName}</span>
                          <span>{new Date(u.createdAt).toLocaleDateString("ar-EG")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Brand Info */}
                {report.brand.goals && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-500" /> أهداف البراند
                    </h3>
                    <p className="text-sm text-gray-600 p-3 rounded-lg bg-gray-50">{report.brand.goals}</p>
                  </div>
                )}

                {/* Footer */}
                <div className="pt-4 border-t border-gray-200 text-center">
                  <p className="text-xs text-gray-400">
                    تم إنشاء هذا التقرير بواسطة AdMind AI · {new Date(report.generatedAt).toLocaleDateString("ar-EG")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!report && !loading && (
          <div className="rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-16 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-500 mb-1">اختر براند والفترة ثم اضغط "إنشاء التقرير"</p>
            <p className="text-xs text-gray-400">التقارير تشمل المؤشرات والحملات والكريتفز والتقارير المرفوعة</p>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  )
}
