"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, DollarSign, Loader2 } from "lucide-react"

interface RateData {
  id: string
  date: string
  aedToEgp: number
  sarToEgp: number
}

export function CurrencyRates() {
  const [today, setToday] = useState<RateData | null>(null)
  const [history, setHistory] = useState<RateData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/currency-rates")
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); return }
        setToday(d.today)
        setHistory(d.history || [])
      })
      .catch(() => setError("فشل الاتصال"))
      .finally(() => setLoading(false))
  }, [])

  const prev = history.length > 1 ? history[history.length - 2] : null
  const aedChange = prev && today ? ((today.aedToEgp - prev.aedToEgp) / prev.aedToEgp * 100).toFixed(2) : null
  const sarChange = prev && today ? ((today.sarToEgp - prev.sarToEgp) / prev.sarToEgp * 100).toFixed(2) : null

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <DollarSign className="h-4 w-4 text-emerald-500" />
        <h2 className="text-sm font-bold text-gray-900 dark:text-white">أسعار العملات</h2>
        {loading && <Loader2 className="h-3 w-3 animate-spin text-gray-400" />}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {!loading && today && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 p-3">
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mb-1">AED → EGP</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white" dir="ltr">{today.aedToEgp.toFixed(2)}</p>
            {aedChange && (
              <p className={`text-[10px] flex items-center gap-0.5 mt-0.5 ${parseFloat(aedChange) >= 0 ? "text-red-500" : "text-green-500"}`}>
                {parseFloat(aedChange) >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {aedChange}%
              </p>
            )}
          </div>
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 p-3">
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mb-1">SAR → EGP</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white" dir="ltr">{today.sarToEgp.toFixed(2)}</p>
            {sarChange && (
              <p className={`text-[10px] flex items-center gap-0.5 mt-0.5 ${parseFloat(sarChange) >= 0 ? "text-red-500" : "text-green-500"}`}>
                {parseFloat(sarChange) >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {sarChange}%
              </p>
            )}
          </div>
        </div>
      )}

      {!loading && !today && !error && (
        <p className="text-xs text-gray-400">برجاء المحاولة لاحقاً</p>
      )}

      {history.length > 1 && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-end justify-between gap-px h-12">
            {history.slice(-14).map((r) => {
              const vals = history.slice(-14).map(h => h.aedToEgp)
              const maxAed = Math.max(...vals)
              const minAed = Math.min(...vals)
              const range = maxAed - minAed || 1
              const hPct = ((r.aedToEgp - minAed) / range) * 100
              return (
                <div key={r.id} className="flex-1 flex flex-col justify-end" style={{ height: "100%" }}>
                  <div className="w-full rounded-sm bg-emerald-500/60 dark:bg-emerald-400/60" style={{ height: `${Math.max(hPct, 4)}%` }} title={`${r.date}: ${r.aedToEgp.toFixed(2)}`} />
                </div>
              )
            })}
          </div>
          <p className="text-[9px] text-gray-400 mt-1 text-center">آخر 14 يوم — AED/EGP</p>
        </div>
      )}
    </div>
  )
}
