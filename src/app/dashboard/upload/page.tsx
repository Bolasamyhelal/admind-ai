"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { FileUploader } from "@/components/upload/file-uploader"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import {
  Globe, Music2, Search, Ghost,
  FileSpreadsheet, CheckCircle2, XCircle, Loader2, Trash2,
} from "lucide-react"

const platforms = [
  { id: "meta", label: "Meta Ads", icon: Globe },
  { id: "tiktok", label: "TikTok Ads", icon: Music2 },
  { id: "google", label: "Google Ads", icon: Search },
  { id: "snapchat", label: "Snapchat Ads", icon: Ghost },
]

export default function UploadPage() {
  const [selectedPlatform, setSelectedPlatform] = useState("meta")
  const [uploading, setUploading] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [error, setError] = useState("")
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      fetch(`/api/upload?userId=${user.id}`).then(r => r.json()).then(d => {
        if (d.uploads) setHistory(d.uploads)
      }).catch(() => {})
    }
  }, [user])

  const handleDeleteUpload = async (e: React.MouseEvent, uploadId: string) => {
    e.stopPropagation()
    if (!window.confirm("هل أنت متأكد من حذف هذا التقرير؟")) return
    try {
      await fetch(`/api/upload?id=${uploadId}`, { method: "DELETE" })
      setHistory((prev) => prev.filter((h: any) => h.id !== uploadId))
    } catch {}
  }

  const handleUpload = async (file: File, platform: string, brandName: string, niche: string, country: string, currency: string = "USD") => {
    if (!user) { setError("Please sign in first"); return }
    setError("")
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("platform", platform)
      formData.append("userId", user.id)
      formData.append("brandName", brandName)
      formData.append("niche", niche)
      formData.append("country", country)
      formData.append("currency", currency)
      formData.append("clientName", "")
      formData.append("campaignName", "")

      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
      const uploadData = await uploadRes.json()
      if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed")

      const realMetrics = uploadData.parsedMetrics

      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uploadId: uploadData.uploadId,
          userId: user.id,
          platform,
          brandId: uploadData.brandId,
          brandName,
          niche,
          country,
          currency,
          rawData: { fileName: file.name, platform },
          parsedMetrics: realMetrics,
        }),
      })
      const analyzeData = await analyzeRes.json()
      if (!analyzeRes.ok || analyzeData.success === false) {
        throw new Error(analyzeData.error || "تعذر تحليل الملف")
      }

      router.push(`/dashboard/brands/${uploadData.brandId}`)
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setUploading(false)
    }
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">رفع التقارير</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">ارفع تقارير منصاتك الإعلانية لتحليلها بالذكاء الاصطناعي</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {platforms.map((p) => {
                const Icon = p.icon
                const isSelected = selectedPlatform === p.id
                return (
                  <button key={p.id} onClick={() => setSelectedPlatform(p.id)}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                      isSelected
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30"
                        : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-900"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isSelected ? "bg-purple-100 dark:bg-purple-900/30" : "bg-gray-100 dark:bg-gray-800"}`}>
                      <Icon className={`h-6 w-6 ${isSelected ? "text-purple-600" : "text-gray-500"}`} />
                    </div>
                    <span className={`text-sm font-medium ${isSelected ? "text-purple-700 dark:text-purple-300" : "text-gray-600 dark:text-gray-400"}`}>
                      {p.label}
                    </span>
                  </button>
                )
              })}
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {uploading && (
              <div className="rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 p-3 mb-4 text-sm text-purple-700 dark:text-purple-300 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري الرفع والتحليل... الذكاء الاصطناعي يعالج بيانات حملتك
              </div>
            )}
            <FileUploader onUpload={handleUpload} platform={selectedPlatform} disabled={uploading} />

            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">سجل الرفع</h3>
              <div className="space-y-3">
                {history.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">لا توجد تقارير مرفوعة بعد</p>
                )}
                {history.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
                    onClick={() => {
                      const analysisId = item.analyses?.[0]?.id
                      if (analysisId) router.push(`/dashboard/analysis/${analysisId}`)
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="h-8 w-8 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.fileName}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                          <span className="capitalize">{item.platform}</span>
                          <span>·</span>
                          <span>{item.fileType}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                      {item.status === "completed" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                      {item.status === "processing" && <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />}
                      {item.status === "failed" && <XCircle className="h-4 w-4 text-red-500" />}
                      <button
                        onClick={(e) => handleDeleteUpload(e, item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">نصائح سريعة</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0" />
                  صدّر التقارير مباشرة من منصتك الإعلانية
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0" />
                  تأكد من احتواء الملف على أسماء الحملات والإنفاق والتحويلات
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0" />
                  الحد الأقصى لحجم الملف: 50MB
                </li>
              </ul>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">الصيغ المدعومة</h3>
              <div className="space-y-2">
                {[{ format: ".xlsx", desc: "ملفات إكسل" }, { format: ".xls", desc: "إكسل قديم" }, { format: ".csv", desc: "تصدير CSV" }].map((f) => (
                  <div key={f.format} className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="font-mono">{f.format}</Badge>
                    <span className="text-gray-500">{f.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  )
}
