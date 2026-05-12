"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import {
  Store, Image, BarChart3, Loader2, FolderOpen, Film,
  FileText, ExternalLink,
} from "lucide-react"

export default function BrandMediaPage() {
  const [brands, setBrands] = useState<any[]>([])
  const [creatives, setCreatives] = useState<any[]>([])
  const [uploads, setUploads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [tab, setTab] = useState<"all" | "images" | "reports">("all")
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) return
    Promise.all([
      fetch(`/api/brands?userId=${user.id}`).then((r) => r.json()),
      fetch(`/api/creatives?userId=${user.id}`).then((r) => r.json()),
      fetch(`/api/upload?userId=${user.id}`).then((r) => r.json()),
    ])
      .then(([b, c, u]) => {
        setBrands(b.brands || [])
        setCreatives(c.creatives || [])
        setUploads(u.uploads || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  const brandMap = new Map(brands.map((b) => [b.id, b.name]))

  const brandItems = brands.map((brand) => {
    const brandCreatives = creatives.filter((c) => c.brandId === brand.id)
    const brandUploads = uploads.filter((u) => u.brandId === brand.id)
    let items = [...brandCreatives.map((c) => ({ ...c, _type: "creative" as const })), ...brandUploads.map((u) => ({ ...u, _type: "upload" as const }))]
    if (tab === "images") items = items.filter((i) => i._type === "creative")
    if (tab === "reports") items = items.filter((i) => i._type === "upload")
    return { ...brand, items, creativeCount: brandCreatives.length, uploadCount: brandUploads.length }
  }).filter((b) => !selectedBrand || b.id === selectedBrand)

  const noBrandCreatives = creatives.filter((c) => !c.brandId)
  const noBrandUploads = uploads.filter((u) => !u.brandId)

  if (loading) return (<DashboardLayout><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-purple-600" /></div></DashboardLayout>)

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FolderOpen className="h-6 w-6 text-purple-600" />
              ملفات البراندات
            </h1>
            <p className="text-sm text-gray-500">{brands.length} براند · {creatives.length} كريتف · {uploads.length} تقرير</p>
          </div>
          <div className="flex gap-2">
            <select value={selectedBrand || ""} onChange={(e) => setSelectedBrand(e.target.value || null)}
              className="h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm text-gray-900 dark:text-white"
            >
              <option value="">كل البراندات</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-1 w-fit">
          {[
            { value: "all" as const, label: "الكل", icon: FolderOpen },
            { value: "images" as const, label: "صور وفيديو", icon: Image },
            { value: "reports" as const, label: "تقارير", icon: BarChart3 },
          ].map((t) => (
            <button key={t.value} onClick={() => setTab(t.value)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                tab === t.value ? "bg-white dark:bg-gray-700 text-purple-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <t.icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          ))}
        </div>

        {/* Brand sections */}
        <div className="space-y-8">
          {brandItems.map((brand) => (
            <div key={brand.id}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-purple-500" />
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{brand.name}</h2>
                  <span className="text-xs text-gray-400">({brand.items.length})</span>
                </div>
                <button onClick={() => router.push(`/dashboard/brands/${brand.id}`)}
                  className="flex items-center gap-1 text-xs text-purple-600 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" /> عرض البراند
                </button>
              </div>

              {brand.items.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 p-8 text-center">
                  <FolderOpen className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                  <p className="text-xs text-gray-400">لا توجد ملفات لهذا البراند</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {brand.items.map((item: any) => (
                    <div key={item.id}
                      className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 transition-all group"
                    >
                      {item._type === "creative" && item.fileData?.startsWith("data:image/") ? (
                        <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                          <img src={item.fileData} alt={item.name} className="w-full h-full object-cover" />
                          {item.aiScore && (
                            <span className="absolute top-1.5 right-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-500 text-white">
                              {item.aiScore}/10
                            </span>
                          )}
                        </div>
                      ) : item._type === "creative" ? (
                        <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <Film className="h-8 w-8 text-gray-300" />
                        </div>
                      ) : (
                        <div className="aspect-[4/3] bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                          <FileText className="h-8 w-8 text-gray-300" />
                        </div>
                      )}
                      <div className="p-2.5">
                        <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{item.name || item.fileName}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {item._type === "creative" ? "🖼 كريتف" : "📊 تقرير"}
                          {item.platform && ` · ${item.platform}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Items without brand */}
          {(noBrandCreatives.length > 0 || noBrandUploads.length > 0) && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-5 w-5 text-gray-400" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">بدون براند</h2>
                <span className="text-xs text-gray-400">({noBrandCreatives.length + noBrandUploads.length})</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {[...noBrandCreatives.map((c) => ({ ...c, _type: "creative" as const })), ...noBrandUploads.map((u) => ({ ...u, _type: "upload" as const }))].map((item: any) => (
                  <div key={item.id}
                    className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden hover:shadow-md transition-all group"
                  >
                    {item._type === "creative" && item.fileData?.startsWith("data:image/") ? (
                      <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                        <img src={item.fileData} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="aspect-[4/3] bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                        <FileText className="h-8 w-8 text-gray-300" />
                      </div>
                    )}
                    <div className="p-2.5">
                      <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{item.name || item.fileName}</p>
                      <p className="text-[10px] text-gray-400">{item._type === "creative" ? "🖼 كريتف" : "📊 تقرير"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {brands.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-16 text-center">
              <Store className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p className="text-gray-500">لا توجد براندات بعد</p>
              <p className="text-xs text-gray-400 mt-1">أنشئ براند أولاً لترى ملفاته هنا</p>
            </div>
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  )
}