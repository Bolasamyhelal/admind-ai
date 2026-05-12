"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import {
  Plus, Play, Pause, CheckCircle2, X, TrendingUp, DollarSign,
  MousePointerClick, Eye, CalendarDays, Target, Smartphone,
  Loader2, Trash2, BarChart3, Clock, ArrowLeft, ChevronDown, ChevronUp,
  Building2,
} from "lucide-react"

interface Campaign {
  id: string; name: string; clientName: string; brandName: string
  platform: string; goal: string; totalBudget: number; dailyBudget: number
  startDate: string; endDate: string; status: string; notes: string
  totalSpend: number; logCount: number; createdAt: string
}

interface DailyLog {
  id: string; date: string; spend: number; impressions: number
  clicks: number; conversions: number; platform: string
  actions: string; notes: string; campaignId: string
}

export default function CampaignExecPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  const today = new Date().toISOString().split("T")[0]

  const loadList = async () => {
    setLoading(true)
    try { const r = await fetch("/api/campaign-exec"); setCampaigns(await r.json()) } catch {}
    setLoading(false)
  }

  const loadDetail = async (id: string) => {
    try {
      const r = await fetch(`/api/campaign-exec?id=${id}`)
      const data = await r.json()
      setSelected(data)
      setDailyLogs(data.dailyLogs || [])
    } catch {}
  }

  const deleteCampaign = async (id: string) => {
    if (!confirm("تأكيد حذف الحملة؟")) return
    try { await fetch("/api/campaign-exec", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }); loadList(); if (selected?.id === id) setSelected(null) } catch {}
  }

  useEffect(() => { loadList() }, [])

  const totalSpendAll = campaigns.reduce((s, c) => s + c.totalSpend, 0)
  const totalBudgetAll = campaigns.reduce((s, c) => s + c.totalBudget, 0)

  const statusIcon = (s: string) => s === "active" ? <Play className="h-3 w-3 text-green-500" /> : s === "paused" ? <Pause className="h-3 w-3 text-yellow-500" /> : <CheckCircle2 className="h-3 w-3 text-gray-400" />

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">منفذ الحملات</h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">إدارة وتنفيذ وتتبع الحملات الإعلانية يوم بيوم</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> حملة جديدة
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <SummaryCard icon={BarChart3} label="إجمالي الحملات" value={String(campaigns.length)} />
          <SummaryCard icon={DollarSign} label="إجمالي الميزانية" value={`$${totalBudgetAll.toLocaleString()}`} />
          <SummaryCard icon={TrendingUp} label="إجمالي الصرف" value={`$${totalSpendAll.toLocaleString()}`} />
          <SummaryCard icon={Target} label="المتبقي" value={`$${(totalBudgetAll - totalSpendAll).toLocaleString()}`} />
        </div>

        {selected ? (
          /* Detail View */
          <div>
            <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 mb-4">
              <ArrowLeft className="h-4 w-4" /> العودة للقائمة
            </button>
            <CampaignDetail
              campaign={selected}
              dailyLogs={dailyLogs}
              onLogAdded={() => loadDetail(selected.id)}
              onStatusChange={() => loadDetail(selected.id)}
              onDelete={deleteCampaign}
            />
          </div>
        ) : (
          /* List View */
          loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-purple-600" /></div>
          ) : (
            (() => {
              const groups: Record<string, Campaign[]> = {}
              campaigns.forEach((c) => {
                const key = c.brandName || c.clientName || "أخرى"
                if (!groups[key]) groups[key] = []
                groups[key].push(c)
              })
              return Object.entries(groups).map(([brand, items]) => (
                <div key={brand} className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                      {items[0].brandName ? <Target className="h-4 w-4 text-purple-600" /> : <Building2 className="h-4 w-4 text-purple-600" />}
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{brand}</h2>
                    <span className="text-xs text-gray-400">({items.length} {items.length === 1 ? "حملة" : "حملات"})</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {items.map((c) => (
                      <motion.div key={c.id} whileHover={{ y: -2 }} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 cursor-pointer hover:shadow-md transition-shadow relative group" onClick={() => loadDetail(c.id)}>
                        <button onClick={(e) => { e.stopPropagation(); deleteCampaign(c.id) }} className="absolute top-3 left-3 p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 dark:hover:bg-red-900/40">
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </button>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {statusIcon(c.status)}
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${c.status === "active" ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" : c.status === "paused" ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>{c.status === "active" ? "نشط" : c.status === "paused" ? "موقف" : "منتهي"}</span>
                          </div>
                          <span className="text-[10px] text-gray-400">{c.platform}</span>
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">{c.name}</h3>
                        <p className="text-xs text-gray-500 mb-3">{c.clientName}{c.brandName ? ` · ${c.brandName}` : ""}</p>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>💰 {c.currency || "USD"} {c.totalSpend.toLocaleString()} / {c.totalBudget.toLocaleString()}</span>
                          <span>📅 {c.logCount} يوم</span>
                        </div>
                        <div className="mt-2 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                          <div className="h-full rounded-full bg-purple-600 transition-all" style={{ width: `${Math.min(100, (c.totalSpend / (c.totalBudget || 1)) * 100)}%` }} />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))
            })()
          )
        )}
      </motion.div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && <CreateCampaignModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); loadList() }} />}
      </AnimatePresence>
    </DashboardLayout>
  )
}

function SummaryCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/20"><Icon className="h-4 w-4 text-purple-600" /></div>
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  )
}

function CreateCampaignModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: "", clientName: "", brandName: "", currency: "USD", platform: "فيسبوك/إنستغرام", goal: "تحويلات", totalBudget: "1000", dailyBudget: "50", startDate: new Date().toISOString().split("T")[0], endDate: "", notes: "" })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")

  const handleSave = async () => {
    if (!form.name || !form.clientName) return
    setSaving(true)
    setSaveError("")
    try {
      const r = await fetch("/api/campaign-exec", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      if (r.ok) onCreated()
      else { const d = await r.json(); setSaveError(d.error || "فشل الحفظ") }
    } catch { setSaveError("خطأ في الاتصال") }
    setSaving(false)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">حملة جديدة</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><X className="h-5 w-5 text-gray-500" /></button>
        </div>
        <div className="space-y-3">
          <InputField label="اسم الحملة" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <div className="grid grid-cols-2 gap-3">
            <InputField label="اسم العميل" value={form.clientName} onChange={(v) => setForm({ ...form, clientName: v })} />
            <InputField label="البراند" value={form.brandName} onChange={(v) => setForm({ ...form, brandName: v })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="المنصة" value={form.platform} onChange={(v) => setForm({ ...form, platform: v })} options={["فيسبوك/إنستغرام", "تيك توك", "جوجل إعلانات", "سناب شات", "تويتر/X", "جميع المنصات"]} />
            <SelectField label="الهدف" value={form.goal} onChange={(v) => setForm({ ...form, goal: v })} options={["تحويلات", "وعي", "تفاعل", "Traffic", "ليدز"]} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <SelectField label="العملة" value={form.currency} onChange={(v) => setForm({ ...form, currency: v })} options={["USD", "EGP", "SAR", "AED", "EUR", "GBP"]} />
            <InputField label="الميزانية الإجمالية" value={form.totalBudget} onChange={(v) => setForm({ ...form, totalBudget: v })} type="number" />
            <InputField label="الميزانية اليومية" value={form.dailyBudget} onChange={(v) => setForm({ ...form, dailyBudget: v })} type="number" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InputField label="تاريخ البداية" value={form.startDate} onChange={(v) => setForm({ ...form, startDate: v })} type="date" />
            <InputField label="تاريخ النهاية" value={form.endDate} onChange={(v) => setForm({ ...form, endDate: v })} type="date" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ملاحظات</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="flex w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-4 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400" />
          </div>
        </div>
        {saveError && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">{saveError}</div>
        )}
        <div className="flex gap-3 mt-6">
          <Button onClick={handleSave} disabled={saving || !form.name || !form.clientName} className="flex-1">{saving ? <><Loader2 className="h-4 w-4 animate-spin ml-2" /> حفظ...</> : "حفظ الحملة"}</Button>
          <Button variant="outline" onClick={onClose} className="flex-1">إلغاء</Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function InputField({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="flex h-11 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-4 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400" />
    </div>
  )
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="flex h-11 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-4 py-2 text-sm text-gray-900 dark:text-white appearance-none cursor-pointer">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  )
}

function CampaignDetail({ campaign, dailyLogs, onLogAdded, onStatusChange, onDelete }: { campaign: any; dailyLogs: DailyLog[]; onLogAdded: () => void; onStatusChange: () => void; onDelete: (id: string) => void }) {
  const [newLog, setNewLog] = useState({ date: new Date().toISOString().split("T")[0], spend: "0", impressions: "0", clicks: "0", conversions: "0", platform: campaign.platform || "", actions: "", notes: "" })
  const [savingLog, setSavingLog] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [analyzing, setAnalyzing] = useState(false)

  const cur = campaign.currency || "USD"

  const addLog = async () => {
    setSavingLog(true)
    setAnalysis(null)
    try {
      const r = await fetch("/api/campaign-exec", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "daily", ...newLog, campaignId: campaign.id, spend: parseFloat(newLog.spend), impressions: parseInt(newLog.impressions), clicks: parseInt(newLog.clicks), conversions: parseInt(newLog.conversions) }),
      })
      setNewLog({ date: new Date().toISOString().split("T")[0], spend: "0", impressions: "0", clicks: "0", conversions: "0", platform: campaign.platform, actions: "", notes: "" })
      setShowForm(false)
      onLogAdded()
      // AI analysis
      if (r.ok) {
        setAnalyzing(true)
        try {
          const ar = await fetch("/api/campaign-exec/analyze", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              date: newLog.date, spend: parseFloat(newLog.spend),
              impressions: parseInt(newLog.impressions), clicks: parseInt(newLog.clicks),
              conversions: parseInt(newLog.conversions), platform: newLog.platform || campaign.platform,
              dailyBudget: campaign.dailyBudget, totalBudget: campaign.totalBudget,
              totalSpend: campaign.totalSpend + parseFloat(newLog.spend), campaignName: campaign.name,
            }),
          })
          const ad = await ar.json()
          if (ad.success) setAnalysis(ad.analysis)
        } catch {}
        setAnalyzing(false)
      }
    } catch {}
    setSavingLog(false)
  }

  const deleteLog = async (logId: string) => {
    try { await fetch("/api/campaign-exec", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ logId }) }); onLogAdded() } catch {}
  }

  const endCampaign = async () => {
    try { await fetch("/api/campaign-exec", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: campaign.id, status: "ended" }) }); onStatusChange() } catch {}
  }

  const spentPercent = campaign.totalBudget > 0 ? Math.min(100, (campaign.totalSpend / campaign.totalBudget) * 100) : 0
  const daysLeft = Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / 86400000))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{campaign.name}</h2>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${campaign.status === "active" ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" : campaign.status === "paused" ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>{campaign.status === "active" ? "نشط" : campaign.status === "paused" ? "موقف" : "منتهي"}</span>
            </div>
            <p className="text-sm text-gray-500">{campaign.clientName}{campaign.brandName ? ` · ${campaign.brandName}` : ""} · {campaign.platform} · {campaign.goal} · {cur}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={endCampaign} className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">{campaign.status === "active" ? "إنهاء الحملة" : "إعادة فتح"}</button>
            <button onClick={() => onDelete(campaign.id)} className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-1"><Trash2 className="h-3 w-3" /> حذف</button>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-500">الميزانية: <strong className="text-gray-900 dark:text-white">{cur} {campaign.totalSpend.toLocaleString()}</strong> / {cur} {campaign.totalBudget.toLocaleString()}</span>
            <span className="text-gray-500">{(spentPercent).toFixed(0)}%</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div className="h-full rounded-full bg-purple-600 transition-all" style={{ width: `${spentPercent}%` }} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/30">
            <p className="text-xs text-gray-400">المتبقي</p>
            <p className="text-sm font-bold text-green-600">{cur} {(campaign.totalBudget - campaign.totalSpend).toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/30">
            <p className="text-xs text-gray-400">أيام متبقية</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{daysLeft}</p>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/30">
            <p className="text-xs text-gray-400">متوسط الصرف/يوم</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{cur} {campaign.dailyAvgSpend?.toFixed(0) || "0"}</p>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/30">
            <p className="text-xs text-gray-400">التحويلات</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{campaign.totalConversions || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-3 text-center">
          <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/30">
            <p className="text-[10px] text-gray-400">Impressions</p>
            <p className="text-xs font-bold text-gray-900 dark:text-white">{(campaign.totalImpressions || 0).toLocaleString()}</p>
          </div>
          <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/30">
            <p className="text-[10px] text-gray-400">Clicks</p>
            <p className="text-xs font-bold text-gray-900 dark:text-white">{(campaign.totalClicks || 0).toLocaleString()}</p>
          </div>
          <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/30">
            <p className="text-[10px] text-gray-400">CTR</p>
            <p className="text-xs font-bold text-gray-900 dark:text-white">{campaign.totalImpressions > 0 ? ((campaign.totalClicks / campaign.totalImpressions) * 100).toFixed(2) : "0"}%</p>
          </div>
        </div>
      </div>

      {/* AI Analysis */}
      {analyzing && (
        <div className="rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 p-4 flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
          <p className="text-sm text-purple-700 dark:text-purple-300">جاري تحليل الأرقام...</p>
        </div>
      )}
      {analysis && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/20"><TrendingUp className="h-4 w-4 text-purple-600" /></div>
            <h3 className="font-semibold text-gray-900 dark:text-white">تحليل الأداء</h3>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${analysis.verdict === "ممتاز" ? "bg-green-50 text-green-700" : analysis.verdict === "جيد" ? "bg-blue-50 text-blue-700" : analysis.verdict === "متوسط" ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"}`}>{analysis.verdict}</span>
          </div>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p><span className="font-medium text-gray-800 dark:text-gray-200">الصرف:</span> {analysis.spendAnalysis}</p>
            <p><span className="font-medium text-gray-800 dark:text-gray-200">الأداء:</span> {analysis.performanceAnalysis}</p>
            {analysis.comparisonToBudget && <p><span className="font-medium text-gray-800 dark:text-gray-200">الميزانية:</span> {analysis.comparisonToBudget}</p>}
            {analysis.concerns?.length > 0 && (
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">ملاحظات:</p>
                <ul className="space-y-1">{[...analysis.concerns].map((c: string, i: number) => <li key={i} className="flex items-start gap-2"><XCircle className="h-3.5 w-3.5 text-red-400 mt-0.5 shrink-0" />{c}</li>)}</ul>
              </div>
            )}
            {analysis.recommendations?.length > 0 && (
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">توصيات:</p>
                <ul className="space-y-1">{[...analysis.recommendations].map((r: string, i: number) => <li key={i} className="flex items-start gap-2"><TrendingUp className="h-3.5 w-3.5 text-purple-500 mt-0.5 shrink-0" />{r}</li>)}</ul>
              </div>
            )}
            {analysis.nextAction && <p className="mt-2 p-2 rounded-lg bg-purple-50 dark:bg-purple-900/10 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/20"><span className="font-medium">الخطوة التالية:</span> {analysis.nextAction}</p>}
          </div>
        </div>
      )}

      {/* Daily Log Form */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
        <button onClick={() => setShowForm(!showForm)} className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20"><Plus className="h-4 w-4 text-purple-600" /></div>
            <h3 className="font-semibold text-gray-900 dark:text-white">تسجيل يومي</h3>
          </div>
          {showForm ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </button>
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                <InputField label="التاريخ" value={newLog.date} onChange={(v) => setNewLog({ ...newLog, date: v })} type="date" />
                <InputField label="الصرف ($)" value={newLog.spend} onChange={(v) => setNewLog({ ...newLog, spend: v })} type="number" />
                <InputField label="Impressions" value={newLog.impressions} onChange={(v) => setNewLog({ ...newLog, impressions: v })} type="number" />
                <InputField label="Clicks" value={newLog.clicks} onChange={(v) => setNewLog({ ...newLog, clicks: v })} type="number" />
                <InputField label="Conversions" value={newLog.conversions} onChange={(v) => setNewLog({ ...newLog, conversions: v })} type="number" />
                <InputField label="المنصة" value={newLog.platform} onChange={(v) => setNewLog({ ...newLog, platform: v })} />
              </div>
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الإجراءات اللي عملتها</label>
                <input value={newLog.actions} onChange={(e) => setNewLog({ ...newLog, actions: e.target.value })} placeholder="مثال: غيرت الكريتف، زودت الميزانية، أضفت استهداف جديد" className="flex h-11 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-4 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400" />
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ملاحظات</label>
                <input value={newLog.notes} onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })} placeholder="ملاحظات إضافية" className="flex h-11 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-4 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400" />
              </div>
              <Button onClick={addLog} disabled={savingLog} className="w-full mt-4">{savingLog ? "جاري الحفظ..." : "حفظ التسجيل اليومي"}</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Daily Logs Table */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white">التسجيلات اليومية ({dailyLogs.length})</h3>
        </div>
        {dailyLogs.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">مافيش تسجيلات يومية. أضف أول تسجيل من فوق</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/30 text-xs text-gray-500">
                <tr>
                  <th className="text-right p-3">التاريخ</th>
                  <th className="text-right p-3">الصرف</th>
                  <th className="text-right p-3">Impressions</th>
                  <th className="text-right p-3">Clicks</th>
                  <th className="text-right p-3">Conversions</th>
                  <th className="text-right p-3">الإجراءات</th>
                  <th className="text-right p-3"></th>
                </tr>
              </thead>
              <tbody>
                {dailyLogs.map((log) => (
                  <tr key={log.id} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/20">
                    <td className="p-3 text-gray-900 dark:text-white">{log.date}</td>
                    <td className="p-3 text-gray-900 dark:text-white">${log.spend}</td>
                    <td className="p-3 text-gray-600">{log.impressions.toLocaleString()}</td>
                    <td className="p-3 text-gray-600">{log.clicks.toLocaleString()}</td>
                    <td className="p-3 text-gray-600">{log.conversions}</td>
                    <td className="p-3 text-gray-400 max-w-[150px] truncate">{log.actions || "-"}</td>
                    <td className="p-3">
                      <button onClick={() => deleteLog(log.id)} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="h-3.5 w-3.5 text-red-400" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
