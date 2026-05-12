"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import {
  Store, BarChart3, Loader2, FolderOpen,
  FileText, ExternalLink,
} from "lucide-react"

export default function BrandMediaPage() {
  const [brands, setBrands] = useState<any[]>([])
  const [uploads, setUploads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) return
    Promise.all([
      fetch(`/api/brands?userId=${user.id}`).then((r) => r.json()),
      fetch(`/api/upload?userId=${user.id}`).then((r) => r.json()),
    ])
      .then(([b, u]) => {
        setBrands(b.brands || [])
        setUploads(u.uploads || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  const brandMap = new Map(brands.map((b) => [b.id, b.name]))

  const brandItems = brands.map((brand) => {
    const brandUploads = uploads.filter((u) => u.brandId === brand.id)
    return { ...brand, items: brandUploads, uploadCount: brandUploads.length }
  }).filter((b) => !selectedBrand || b.id === selectedBrand)

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
            <p className="text-sm text-gray-500">{brands.length} براند · {uploads.length} تقرير</p>
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
                  <p className="text-xs text-gray-400">لا توجد تقارير لهذا البراند</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {brand.items.map((item: any) => (
                    <div key={item.id}
                      className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 transition-all group"
                    >
                      <div className="aspect-[4/3] bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                        <FileText className="h-8 w-8 text-gray-300" />
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{item.fileName}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          📊 تقرير
                          {item.platform && ` · ${item.platform}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {noBrandUploads.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-5 w-5 text-gray-400" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">بدون براند</h2>
                <span className="text-xs text-gray-400">({noBrandUploads.length})</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {noBrandUploads.map((item: any) => (
                  <div key={item.id}
                    className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden hover:shadow-md transition-all group"
                  >
                    <div className="aspect-[4/3] bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                      <FileText className="h-8 w-8 text-gray-300" />
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{item.fileName}</p>
                      <p className="text-[10px] text-gray-400">📊 تقرير</p>
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
