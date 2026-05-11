"use client"

import { useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react"

export default function BrandDetailError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <DashboardLayout>
      <div className="text-center py-20">
        <AlertCircle className="mx-auto h-10 w-10 text-red-400 mb-3" />
        <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">تعذر تحميل صفحة البراند</p>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          حدث خطأ غير متوقع. قد يكون الخادم بطيئًا في أول استخدام (Cold Start).
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            إعادة المحاولة
          </button>
          <button
            onClick={() => window.location.href = "/dashboard/brands"}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            العودة للبراندات
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-6">
          إذا استمرت المشكلة، حاول تحديث الصفحة أو العودة لاحقًا
        </p>
      </div>
    </DashboardLayout>
  )
}
