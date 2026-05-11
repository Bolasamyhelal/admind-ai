"use client"

import { useState } from "react"
import { Info, X } from "lucide-react"
import type { MetricExplanation } from "@/lib/metric-explanations"

interface MetricPopoverProps {
  explanation: MetricExplanation
}

export function MetricPopover({ explanation }: MetricPopoverProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(true) }}
        className="p-1 rounded-lg text-gray-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all"
        title="شرح المتركز"
      >
        <Info className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-md w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{explanation.label}</h3>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">الوصف</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{explanation.description}</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">المعادلة</p>
                <p className="text-sm font-mono bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 text-center" dir="ltr">
                  {explanation.formula}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-3 border border-green-200 dark:border-green-800/30">
                  <p className="text-xs font-medium text-green-600 mb-1">إذا كان مرتفعاً</p>
                  <p className="text-xs text-green-700 dark:text-green-300">{explanation.highMeans}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-950/20 rounded-xl p-3 border border-red-200 dark:border-red-800/30">
                  <p className="text-xs font-medium text-red-600 mb-1">إذا كان منخفضاً</p>
                  <p className="text-xs text-red-700 dark:text-red-300">{explanation.lowMeans}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
