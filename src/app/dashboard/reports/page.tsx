"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { Loader2, FileText, Eye, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function ReportsPage() {
  const [analyses, setAnalyses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      fetch(`/api/analyze?userId=${user.id}`)
        .then((r) => r.json())
        .then((d) => { if (d.analyses) setAnalyses(d.analyses) })
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [user])

  const thisMonth = analyses.filter(
    (a) => new Date(a.createdAt).getMonth() === new Date().getMonth()
  ).length

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">التقارير</h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">جميع تحليلاتك</p>
          </div>
          <button
            onClick={() => router.push("/dashboard/upload")}
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            رفع تقرير جديد
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {[
            { label: "إجمالي التحليلات", value: analyses.length },
            { label: "هذا الشهر", value: thisMonth },
            { label: "مكتمل", value: analyses.filter((a) => a.status === "completed").length },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="p-5 border-b border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white">جميع التقارير</h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
            </div>
          ) : analyses.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-10 w-10 text-gray-400 mb-3" />
              <p className="text-sm text-gray-500">لا توجد تحليلات بعد</p>
              <button
                onClick={() => router.push("/dashboard/upload")}
                className="mt-3 text-sm text-purple-600 hover:underline"
              >
                ارفع تقريرك الأول
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {analyses.map((item: any) => (
                <div key={item.id}
                  className="flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer"
                  onClick={() => router.push(`/dashboard/analysis/${item.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-900/30">
                      <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span>{new Date(item.createdAt).toLocaleDateString("ar-EG")}</span>
                        {item.metrics && (
                          <>
                            <span>·</span>
                            <span>{JSON.parse(item.metrics).roas?.toFixed(2)}x ROAS</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={item.status === "completed" ? "success" : item.status === "processing" ? "warning" : "default"}>
                      {item.status === "completed" ? "مكتمل" : item.status === "processing" ? "قيد المعالجة" : item.status}
                    </Badge>
                    <button
                      onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/analysis/${item.id}`) }}
                      className="rounded-lg p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  )
}
