"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { MetricDetail } from "@/components/ui/metric-detail"
import { metricExplanations } from "@/lib/metric-explanations"
import { ImageEditor } from "@/components/creative/image-editor"
import {
  Image, Upload, X, Loader2, TrendingUp, AlertCircle, Edit3,
  CheckCircle2, Star, Lightbulb, Target, Smartphone,
  BarChart3, Zap, Sparkles, RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CreativesPage() {
  const [creatives, setCreatives] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedCreative, setSelectedCreative] = useState<any>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [creativeName, setCreativeName] = useState("")
  const [creativePlatform, setCreativePlatform] = useState("")
  const [creativeNotes, setCreativeNotes] = useState("")
  const [analyzingId, setAnalyzingId] = useState<string | null>(null)
  const [editingCreative, setEditingCreative] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const router = useRouter()

  const fetchCreatives = async () => {
    if (!user) return
    try {
      const res = await fetch(`/api/creatives?userId=${user.id}`)
      const data = await res.json()
      if (data.creatives) setCreatives(data.creatives)
    } catch {} finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (user) fetchCreatives() }, [user])

  const handleUpload = async () => {
    if (!user || !uploadFile) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", uploadFile)
      formData.append("userId", user.id)
      formData.append("name", creativeName || uploadFile.name)
      formData.append("platform", creativePlatform)
      formData.append("notes", creativeNotes)

      const res = await fetch("/api/creatives", { method: "POST", body: formData })
      const data = await res.json()
      if (data.creative) {
        setCreatives((prev) => [data.creative, ...prev])
        setShowUpload(false)
        resetUpload()
      }
    } catch {} finally {
      setUploading(false)
    }
  }

  const resetUpload = () => {
    setUploadFile(null)
    setCreativeName("")
    setCreativePlatform("")
    setCreativeNotes("")
  }

  const reanalyze = async (creative: any) => {
    setAnalyzingId(creative.id)
    try {
      const formData = new FormData()
      formData.append("userId", user!.id)
      formData.append("retryId", creative.id)
      const blob = new Blob([""], { type: "text/plain" })
      formData.append("file", blob, "reat.txt")

      const res = await fetch("/api/creatives", { method: "POST", body: formData })
      const data = await res.json()
      if (data.creative) {
        setCreatives((prev) => prev.map((c) => c.id === creative.id ? { ...c, ...data.creative } : c))
      }
    } catch {} finally {
      setAnalyzingId(null)
    }
  }

  const analysisModal = selectedCreative?.aiAnalysis ? (
    <CreativeAnalysisModal creative={selectedCreative} onClose={() => setSelectedCreative(null)} />
  ) : null

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">محلل الكريتيف</h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">ارفع إعلانك وخلي الذكاء الاصطناعي يحلله ويقولك هينجح ولا لأ</p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
          >
            <Upload className="h-4 w-4" />
            رفع إعلان جديد
          </button>
        </div>

        {/* Upload Modal */}
        <AnimatePresence>
          {showUpload && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
              onClick={() => !uploading && setShowUpload(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 10 }}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-lg w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">رفع إعلان جديد</h2>
                  <button onClick={() => { setShowUpload(false); resetUpload() }} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-purple-400 dark:hover:border-purple-600 transition-all"
                  >
                    {uploadFile ? (
                      <div>
                        {uploadFile.type.startsWith("image/") ? (
                          <img src={URL.createObjectURL(uploadFile)} alt="Preview" className="max-h-40 mx-auto rounded-lg mb-3" />
                        ) : (
                          <div className="h-20 flex items-center justify-center mb-3">
                            <Image className="h-10 w-10 text-purple-500" />
                          </div>
                        )}
                        <p className="text-sm text-gray-700 dark:text-gray-300">{uploadFile.name}</p>
                        <p className="text-xs text-gray-400">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    ) : (
                      <div>
                        <div className="mx-auto mb-3 h-14 w-14 flex items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-900/30">
                          <Upload className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <p className="text-sm text-gray-500">اضغط لرفع صورة الإعلان</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF, MP4</p>
                      </div>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">اسم الإعلان</label>
                    <input value={creativeName} onChange={(e) => setCreativeName(e.target.value)} placeholder="مثلاً: إعلان منتج X - سببه كذا" className="flex h-10 w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">المنصة</label>
                    <select value={creativePlatform} onChange={(e) => setCreativePlatform(e.target.value)} className="flex h-10 w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-white">
                      <option value="">اختر المنصة</option>
                      <option value="meta">ميتا (فيسبوك/انستجرام)</option>
                      <option value="tiktok">تيك توك</option>
                      <option value="google">جوجل</option>
                      <option value="snapchat">سناب شات</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">ملاحظات</label>
                    <textarea value={creativeNotes} onChange={(e) => setCreativeNotes(e.target.value)} placeholder="أي معلومات إضافية عن الإعلان..." rows={3} className="flex w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 resize-none" />
                  </div>

                  <Button onClick={handleUpload} disabled={uploading || !uploadFile} className="w-full">
                    {uploading ? (
                      <><Loader2 className="h-4 w-4 animate-spin ml-2" /> جاري الرفع والتحليل...</>
                    ) : (
                      <><Sparkles className="h-4 w-4 ml-2" /> رفع وتحليل بالذكاء الاصطناعي</>
                    )}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analysis Modal */}
        {analysisModal}

        {/* Creatives Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : creatives.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-20 text-center">
            <Image className="mx-auto h-14 w-14 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">لا توجد إعلانات مرفوعة</h3>
            <p className="text-sm text-gray-500 mb-6">ارفع أول إعلان عشان نحلله ونقولك هينجح ولا لأ</p>
            <button
              onClick={() => setShowUpload(true)}
              className="rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
            >
              ارفع إعلانك الأول
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {creatives.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-700 transition-all group"
              >
                <div
                  className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 relative overflow-hidden cursor-pointer"
                  onClick={() => setSelectedCreative(c)}
                >
                  {c.fileData && c.fileData.startsWith("data:image/") ? (
                    <>
                      <img src={c.fileData} alt={c.name} className="w-full h-full object-cover" />
                      <button onClick={(e) => { e.stopPropagation(); setEditingCreative(c) }}
                        className="absolute top-2 left-2 p-1.5 rounded-lg bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-purple-600"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Image className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                    </div>
                  )}
                  {c.status === "analyzed" && c.aiScore && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                      {c.aiScore}/10
                    </div>
                  )}
                  {c.status === "pending" && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-2" />
                        <p className="text-xs text-white">جاري التحليل...</p>
                      </div>
                    </div>
                  )}
                  {c.status === "failed" && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="text-center">
                        <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                        <p className="text-xs text-white">فشل التحليل</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{c.name}</p>
                      {c.platform && (
                        <p className="text-xs text-gray-500">{c.platform === "meta" ? "ميتا" : c.platform === "tiktok" ? "تيك توك" : c.platform}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {c.status === "analyzed" ? (
                      <>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          c.aiScore && c.aiScore >= 7 ? "bg-green-50 dark:bg-green-900/20 text-green-600" :
                          c.aiScore && c.aiScore >= 4 ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600" :
                          "bg-red-50 dark:bg-red-900/20 text-red-600"
                        }`}>
                          {c.aiScore && c.aiScore >= 7 ? "🔥 واعد" : c.aiScore && c.aiScore >= 4 ? "متوسط" : "ضعيف"}
                        </span>
                        <button onClick={() => setSelectedCreative(c)} className="text-xs text-purple-600 hover:underline mr-auto">
                          التفاصيل
                        </button>
                      </>
                    ) : c.status === "pending" ? (
                      <span className="text-xs text-yellow-500">قيد التحليل...</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-500">فشل</span>
                        <button onClick={() => reanalyze(c)} className="text-xs text-purple-600 hover:underline" disabled={analyzingId === c.id}>
                          {analyzingId === c.id ? "..." : "إعادة تحليل"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        {/* Image Editor */}
        {editingCreative && editingCreative.fileData?.startsWith("data:image/") && (
          <ImageEditor
            imageData={editingCreative.fileData}
            onSave={async (newData) => {
              await fetch("/api/creatives", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: editingCreative.id, fileData: newData, userId: user?.id }),
              })
              setCreatives((prev) => prev.map((c) => c.id === editingCreative.id ? { ...c, fileData: newData } : c))
              setEditingCreative(null)
            }}
            onClose={() => setEditingCreative(null)}
          />
        )}
      </motion.div>
    </DashboardLayout>
  )
}

function CreativeAnalysisModal({ creative, onClose }: { creative: any; onClose: () => void }) {
  let analysis: any = null
  let score = 0
  try {
    analysis = JSON.parse(creative.aiAnalysis)
    score = analysis.score || 0
  } catch {}

  if (!analysis) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border max-w-lg w-full p-8 text-center" onClick={(e) => e.stopPropagation()}>
          <AlertCircle className="mx-auto h-10 w-10 text-gray-400 mb-3" />
          <p className="text-gray-500">لا يوجد تحليل لهذا الإعلان</p>
          <button onClick={onClose} className="mt-4 text-sm text-purple-600 hover:underline">إغلاق</button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95 }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 text-white ${
          score >= 7 ? "bg-gradient-to-br from-green-500 to-emerald-700" :
          score >= 4 ? "bg-gradient-to-br from-yellow-500 to-orange-600" :
          "bg-gradient-to-br from-red-500 to-rose-700"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">تحليل الإعلان</h2>
            <button onClick={onClose} className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 transition-all">
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm opacity-90">{creative.name}</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Score */}
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-3xl font-bold mb-2 ${
              score >= 7 ? "bg-green-50 dark:bg-green-900/20 text-green-600" :
              score >= 4 ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600" :
              "bg-red-50 dark:bg-red-900/20 text-red-600"
            }`}>
              {score}
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">التقييم العام</p>
            <p className="text-xs text-gray-500">من 10</p>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{analysis.summary || "لا يوجد ملخص"}</p>
          </div>

          {/* Success Probability */}
          {analysis.successProbability && (
            <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-800">
              <span className="text-sm text-gray-600 dark:text-gray-400">احتمالية النجاح</span>
              <span className={`text-sm font-bold ${
                analysis.successProbability === "عالية" ? "text-green-600" :
                analysis.successProbability === "متوسطة" ? "text-yellow-600" : "text-red-600"
              }`}>
                {analysis.successProbability === "عالية" ? "🔥 عالية" :
                 analysis.successProbability === "متوسطة" ? "⚠️ متوسطة" : "❌ منخفضة"}
              </span>
            </div>
          )}

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-2 gap-4">
            {analysis.strengths && analysis.strengths.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-green-600 mb-2 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> نقاط القوة
                </p>
                <ul className="space-y-1.5">
                  {analysis.strengths.map((s: string, i: number) => (
                    <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
                      <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {analysis.weaknesses && analysis.weaknesses.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-red-600 mb-2 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> نقاط الضعف
                </p>
                <ul className="space-y-1.5">
                  {analysis.weaknesses.map((w: string, i: number) => (
                    <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
                      <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Recommendations */}
          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-purple-600 mb-2 flex items-center gap-1">
                <Lightbulb className="h-3 w-3" /> التوصيات
              </p>
              <ul className="space-y-2">
                {analysis.recommendations.map((r: string, i: number) => (
                  <li key={i} className="text-xs text-gray-600 dark:text-gray-400 bg-purple-50 dark:bg-purple-900/10 rounded-lg p-3 border border-purple-100 dark:border-purple-800/20">
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Target & Platform */}
          <div className="grid grid-cols-2 gap-4">
            {analysis.targetAudience && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <Target className="h-4 w-4 text-purple-500 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400">الجمهور المستهدف</p>
                  <p className="text-xs font-medium text-gray-900 dark:text-white">{analysis.targetAudience}</p>
                </div>
              </div>
            )}
            {analysis.bestPlatform && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <Smartphone className="h-4 w-4 text-purple-500 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400">أفضل منصة</p>
                  <p className="text-xs font-medium text-gray-900 dark:text-white">{analysis.bestPlatform}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
