"use client"

import { X, TrendingUp, TrendingDown, Minus, Info } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { MetricExplanation } from "@/lib/metric-explanations"

interface MetricDetailProps {
  label: string
  value: string
  explanation?: MetricExplanation
  open: boolean
  onClose: () => void
}

export function MetricDetail({ label, value, explanation, open, onClose }: MetricDetailProps) {
  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-lg w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-gradient-to-br from-purple-500 to-purple-700 p-6 text-white">
              <button
                onClick={onClose}
                className="absolute top-4 left-4 p-1.5 rounded-xl bg-white/20 hover:bg-white/30 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
              <p className="text-sm text-purple-200 mb-1">{label}</p>
              <p className="text-4xl font-bold">{value}</p>
            </div>

            <div className="p-6 space-y-5">
              {explanation ? (
                <>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="h-4 w-4 text-purple-500" />
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">عن المتركز</p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {explanation.description}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-gray-400 mb-2">المعادلة</p>
                    <p className="text-sm font-mono text-gray-900 dark:text-white text-center" dir="ltr">
                      {explanation.formula}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-4 border border-green-200 dark:border-green-800/30">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <p className="text-xs font-semibold text-green-700 dark:text-green-300">مرتفع</p>
                      </div>
                      <p className="text-xs text-green-600 dark:text-green-400 leading-relaxed">
                        {explanation.highMeans}
                      </p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-950/20 rounded-xl p-4 border border-red-200 dark:border-red-800/30">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        <p className="text-xs font-semibold text-red-700 dark:text-red-300">منخفض</p>
                      </div>
                      <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">
                        {explanation.lowMeans}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">لا يوجد شرح متاح لهذا المتركز</p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
