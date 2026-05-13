"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { cn } from "@/lib/utils"
import {
  Loader2, FileText, Download, Sparkles, Plus, Trash2,
  Brain, Clock, ChevronRight, Lightbulb, CheckCircle2,
  Edit3, Wand2, MessageSquare,
} from "lucide-react"

interface Entry {
  id: string
  brand: string
  text: string
}

export default function DailyReportPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [brand, setBrand] = useState("")
  const [text, setText] = useState("")
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [formattedReport, setFormattedReport] = useState("")
  const [showResult, setShowResult] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  const addEntry = () => {
    if (!text.trim()) return
    setEntries([...entries, { id: Date.now().toString(), brand: brand || "عام", text: text.trim() }])
    setText("")
    setShowResult(false)
  }

  const deleteEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id))
    setShowResult(false)
  }

  const generateReport = async () => {
    if (entries.length === 0) return
    setGenerating(true)
    setShowResult(false)
    try {
      const res = await fetch("/api/format-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries }),
      })
      const data = await res.json()
      setFormattedReport(data.report || "عذراً، فشلت الصياغة")
      setShowResult(true)
    } catch {
      setFormattedReport("حدث خطأ في الاتصال")
      setShowResult(true)
    }
    setGenerating(false)
  }

  const todayName = new Date().toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
  const todayEn = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })

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
      const pw = pdf.internal.pageSize.getWidth()
      const ph = pdf.internal.pageSize.getHeight()
      const r = Math.min(pw / canvas.width, ph / canvas.height)
      pdf.addImage(imgData, "PNG", (pw - canvas.width * r) / 2, (ph - canvas.height * r) / 2, canvas.width * r, canvas.height * r)
      pdf.save(`AdMind_Report_${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (err) {
      console.error("PDF export failed:", err)
    }
    setExporting(false)
  }

  const brands = [...new Set(entries.filter(e => e.brand !== "عام").map(e => e.brand))]

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Edit3 className="h-5 w-5 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">التقرير اليومي</h1>
            </div>
            <p className="text-sm text-gray-500">{todayName}</p>
          </div>
        </div>

        {/* Input Form */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Plus className="h-4 w-4 text-purple-600" />
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">اكتب إيه اللي عملته النهارده</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="اسم البراند (مش إجباري)"
              className="flex-1 sm:max-w-[160px] rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              dir="rtl"
            />
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addEntry() }}
              placeholder="حسنت الكامبين بتاع البراند الفلاني ..."
              className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              dir="rtl"
            />
          </div>
          <button onClick={addEntry} disabled={!text.trim()}
            className="w-full rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2.5 transition-colors disabled:opacity-50"
          >
            إضافة
          </button>
        </div>

        {/* Entries list */}
        <AnimatePresence>
          {entries.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 mb-6">
              {entries.map((entry) => (
                <motion.div key={entry.id} layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 group"
                >
                  <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                    <CheckCircle2 className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      {entry.brand !== "عام" && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">{entry.brand}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{entry.text}</p>
                  </div>
                  <button onClick={() => deleteEntry(entry.id)}
                    className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              ))}

              {/* Generate Button */}
              <motion.button
                onClick={generateReport}
                disabled={generating}
                className="w-full rounded-xl bg-gradient-to-l from-purple-600 to-indigo-600 text-white py-3 text-sm font-bold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
              >
                {generating ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> جاري الصياغة...</>
                ) : (
                  <><Wand2 className="h-4 w-4" /> صياغة التقرير بالذكاء الاصطناعي</>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {showResult && formattedReport && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white">التقرير بعد الصياغة</h2>
                </div>
                <button onClick={downloadPDF} disabled={exporting}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 text-sm font-medium hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 shadow-lg"
                >
                  {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  {exporting ? "جارٍ..." : "تحميل PDF"}
                </button>
              </div>

              <div ref={reportRef} dir="rtl">
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900 via-gray-950 to-indigo-950/50 overflow-hidden shadow-2xl shadow-purple-500/10">
                  <div className="relative h-2 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-l from-purple-600 via-pink-500 via-indigo-500 to-purple-600 bg-[length:200%_100%] animate-gradientMove" />
                  </div>
                  <div className="p-6 md:p-10">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-500/30">
                            <Brain className="h-6 w-6 text-white" />
                          </div>
                          <motion.div className="absolute -inset-1.5 rounded-2xl bg-purple-500/20 blur-lg" animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
                        </div>
                        <div className="mr-3">
                          <h2 className="text-xl font-bold text-white">AdMind AI</h2>
                          <p className="text-[11px] text-gray-400">تقرير أداء — {todayEn}</p>
                        </div>
                      </div>
                      <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-2">
                        <p className="text-[9px] text-gray-500">تقرير</p>
                        <p className="text-sm font-bold text-white">يومي</p>
                      </div>
                    </div>

                    {/* Hero */}
                    <div className="text-center mb-8">
                      <p className="text-5xl md:text-6xl font-bold bg-gradient-to-l from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent mb-2">{entries.length}</p>
                      <p className="text-sm text-gray-400">إنجاز تم اليوم</p>
                    </div>

                    {/* Brands involved */}
                    {brands.length > 0 && (
                      <div className="flex flex-wrap gap-2 justify-center mb-6">
                        {brands.map(b => (
                          <span key={b} className="rounded-full bg-purple-500/10 border border-purple-500/20 px-3 py-1 text-xs text-purple-300">{b}</span>
                        ))}
                      </div>
                    )}

                    {/* AI Formatted Content */}
                    <div className="rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 p-6 mb-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="h-4 w-4 text-purple-400" />
                        <h3 className="text-sm font-bold text-white">تقرير الأداء اليومي</h3>
                      </div>
                      <div className="prose prose-invert prose-sm max-w-none">
                        {formattedReport.split("\n").map((line, i) => (
                          line.trim() ? (
                            <p key={i} className="text-sm text-gray-200 leading-relaxed mb-3">{line}</p>
                          ) : <br key={i} />
                        ))}
                      </div>
                    </div>

                    {/* Footer */}
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {entries.length === 0 && !showResult && (
          <div className="rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-16 text-center">
            <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500">اكتب إنجازاتك النهارده، بعد كده اضغط "صياغة التقرير" وهيتصاغ بشكل احترافي</p>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  )
}
