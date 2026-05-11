"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, FileSpreadsheet, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FileUploaderProps {
  onUpload: (file: File, platform: string, brand: string, niche: string, country: string, currency: string) => void
  platform: string
  disabled?: boolean
}

const niches = [
  "e-commerce",
  "SaaS",
  "Education",
  "Healthcare",
  "Real Estate",
  "Finance",
  "Gaming",
  "Entertainment",
  "Travel",
  "Fashion",
  "Food & Beverage",
  "Automotive",
  "Other",
]

const countries = [
  "Saudi Arabia",
  "UAE",
  "Egypt",
  "Kuwait",
  "Qatar",
  "Bahrain",
  "Oman",
  "Jordan",
  "Lebanon",
  "Morocco",
  "Algeria",
  "Tunisia",
  "Iraq",
  "Yemen",
  "Libya",
  "Sudan",
  "Palestine",
  "Syria",
  "Other",
]

const currencies = ["USD", "EGP", "SAR", "AED", "EUR", "GBP"]

export function FileUploader({ onUpload, platform, disabled }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [brandName, setBrandName] = useState("")
  const [niche, setNiche] = useState("")
  const [country, setCountry] = useState("")
  const [currency, setCurrency] = useState("USD")

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === "dragenter" || e.type === "dragover")
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile && (droppedFile.name.endsWith(".xlsx") || droppedFile.name.endsWith(".csv") || droppedFile.name.endsWith(".xls"))) {
      setFile(droppedFile)
    }
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) setFile(selectedFile)
  }, [])

  const handleReset = () => {
    setFile(null)
    setBrandName("")
    setNiche("")
    setCountry("")
    setCurrency("USD")
  }

  return (
    <div>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "relative rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-200",
          dragActive
            ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30"
            : "border-gray-300 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600",
          file && "border-purple-500 bg-purple-50/50 dark:bg-purple-950/20"
        )}
      >
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileInput}
          className={cn(
            "absolute inset-0 cursor-pointer opacity-0",
            file && "pointer-events-none"
          )}
          disabled={!!file || disabled}
        />

        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 dark:bg-purple-900/30">
                <Upload className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">ارفع ملفك هنا</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                أو اضغط للتصفح · .xlsx, .xls, .csv (حد أقصى 50MB)
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                مدعوم: تقارير ميتا وتيك توك وجوجل وسناب شات
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="file"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 dark:bg-green-900/30">
                <FileSpreadsheet className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{file.name}</h3>
              <p className="text-sm text-gray-500 mb-6">{(file.size / 1024 / 1024).toFixed(2)} MB</p>

              <div className="w-full max-w-md space-y-4 text-right" dir="rtl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">اسم البراند</label>
                  <input
                    dir="rtl"
                    placeholder="مثال: نون, جرير, شي إن..."
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    disabled={disabled}
                    className="flex h-10 w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">التخصص (Niche)</label>
                  <select
                    dir="rtl"
                    className="flex h-10 w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    disabled={disabled}
                  >
                    <option value="">اختر التخصص...</option>
                    {niches.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">البلد</label>
                  <select
                    dir="rtl"
                    className="flex h-10 w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    disabled={disabled}
                  >
                    <option value="">اختر البلد...</option>
                    {countries.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">العملة</label>
                  <select
                    dir="rtl"
                    className="flex h-10 w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    disabled={disabled}
                  >
                    {currencies.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => onUpload(file, platform, brandName, niche, country, currency)}
                  disabled={disabled || !brandName || !niche || !country}
                >
                  {disabled ? "جاري الرفع والتحليل..." : "رفع وتحليل"}
                </Button>
                <Button variant="outline" onClick={handleReset} disabled={disabled}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
