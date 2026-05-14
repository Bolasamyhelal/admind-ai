"use client"

import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { CurrencyRates } from "@/components/dashboard/currency-rates"

export default function CurrencyRatesPage() {
  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
            <svg className="h-6 w-6 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v12M8 10l4-4 4 4M8 14l4 4 4-4" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">أسعار العملات</h1>
            <p className="text-sm text-gray-500">متابعة يومية للدرهم والريال مقابل الجنيه المصري</p>
          </div>
        </div>

        <CurrencyRates />
      </motion.div>
    </DashboardLayout>
  )
}
