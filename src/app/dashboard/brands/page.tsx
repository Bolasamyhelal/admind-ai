"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { Store, TrendingUp, Upload, FileSearch, Plus, Trash2 } from "lucide-react"

export default function BrandsPage() {
  const [brands, setBrands] = useState<any[]>([])
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      fetch(`/api/brands?userId=${user.id}`)
        .then((r) => r.json())
        .then((d) => { if (d.brands) setBrands(d.brands) })
        .catch(() => {})
    }
  }, [user])

  const handleDelete = async (e: React.MouseEvent, brandId: string) => {
    e.stopPropagation()
    if (!window.confirm("هل أنت متأكد من حذف هذا البراند؟ لا يمكن التراجع عن هذا الإجراء.")) return
    try {
      const res = await fetch(`/api/brands?id=${brandId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("فشل الحذف")
      setBrands((prev) => prev.filter((b) => b.id !== brandId))
    } catch (err: any) {
      alert("فشل حذف البراند")
    }
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">البراندات</h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">إدارة وتحليلات البراندات الخاصة بك</p>
          </div>
          <button
            onClick={() => router.push("/dashboard/upload")}
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            إضافة براند جديد
          </button>
        </div>

        {brands.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-16 text-center">
            <Store className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">لا يوجد براندات بعد</h3>
            <p className="text-sm text-gray-500 mb-6">ارفع أول تقرير لبراندك لبدء التحليل</p>
            <button
              onClick={() => router.push("/dashboard/upload")}
              className="rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
            >
              ارفع تقرير الآن
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brands.map((brand, i) => (
              <motion.div
                key={brand.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => router.push(`/dashboard/brands/${brand.id}`)}
                  className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-700 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/30">
                        <Store className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{brand.name}</h3>
                        {brand.niche && (
                          <p className="text-xs text-gray-500">{brand.niche}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, brand.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                {brand.country && (
                  <p className="text-sm text-gray-500 mb-4">📍 {brand.country}</p>
                )}
                <div className="grid grid-cols-3 gap-3 border-t border-gray-100 dark:border-gray-800 pt-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
                      <Upload className="h-3.5 w-3.5" />
                      <span>{brand.uploads || 0}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">تقارير</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
                      <FileSearch className="h-3.5 w-3.5" />
                      <span>{brand.analyses || 0}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">تحليلات</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span>-</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">أداء</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  )
}
