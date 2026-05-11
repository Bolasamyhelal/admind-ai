"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useAuth } from "@/context/auth-context"
import { cn } from "@/lib/utils"
import {
  Plus, CheckCircle2, Circle, Loader2, Trash2, X, Clock,
  Calendar, Flag, Edit3, AlertCircle, ChevronDown, ChevronUp,
  ListChecks, Filter, Search, ChevronLeft, ChevronRight,
  BarChart3, LayoutList,
} from "lucide-react"

const priorities = [
  { value: "low", label: "منخفضة", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  { value: "medium", label: "متوسطة", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" },
  { value: "high", label: "عالية", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" },
  { value: "critical", label: "حرجة", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
]
const statuses = [
  { value: "all", label: "الكل" }, { value: "pending", label: "معلق" },
  { value: "in_progress", label: "قيد التنفيذ" }, { value: "completed", label: "مكتمل" },
]
const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]

function getWeekId(dateStr: string) {
  const d = new Date(dateStr)
  const start = new Date(d)
  start.setDate(d.getDate() - d.getDay())
  return start.toISOString().slice(0, 10)
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editTask, setEditTask] = useState<any>(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [expanded, setExpanded] = useState<string | null>(null)
  const [view, setView] = useState<"list" | "calendar">("list")
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth())
  const [calYear, setCalYear] = useState(() => new Date().getFullYear())
  const [selectedCalDate, setSelectedCalDate] = useState("")
  const { user } = useAuth()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("medium")
  const [date, setDate] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [checklistText, setChecklistText] = useState("")
  const [checklistItems, setChecklistItems] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const fetchTasks = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (dateFilter) params.set("date", dateFilter)
      const res = await fetch(`/api/tasks?${params}`)
      const data = await res.json()
      if (data.tasks) setTasks(data.tasks)
    } catch {} finally { setLoading(false) }
  }, [user, statusFilter, dateFilter])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const resetForm = () => {
    setTitle(""); setDescription(""); setPriority("medium")
    setDate(""); setDueDate(""); setChecklistText(""); setChecklistItems([])
    setError(""); setEditTask(null)
  }
  const openCreate = () => { resetForm(); setDate(new Date().toISOString().slice(0, 10)); setShowCreate(true) }
  const openEdit = (task: any) => {
    setEditTask(task); setTitle(task.title); setDescription(task.description || "")
    setPriority(task.priority); setDate(task.date || ""); setDueDate(task.dueDate || "")
    setChecklistItems(task.checklists?.map((c: any) => c.text) || []); setShowCreate(true)
  }

  const handleSave = async () => {
    if (!title.trim()) { setError("العنوان مطلوب"); return }
    setSaving(true); setError("")
    try {
      if (editTask) {
        await fetch("/api/tasks", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editTask.id, title: title.trim(), description, priority, date, dueDate }) })
      } else {
        await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: title.trim(), description, priority, date, dueDate, checklists: checklistItems }) })
      }
      setShowCreate(false); resetForm(); fetchTasks()
    } catch { setError("فشل الحفظ") } finally { setSaving(false) }
  }

  const toggleStatus = async (task: any) => {
    await fetch("/api/tasks", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: task.id, status: task.status === "completed" ? "pending" : "completed" }) })
    fetchTasks()
  }
  const toggleChecklist = async (item: any) => {
    await fetch("/api/tasks/checklist", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id, completed: !item.completed }) })
    fetchTasks()
  }
  const deleteTask = async (id: string) => {
    if (!window.confirm("حذف المهمة؟")) return
    await fetch(`/api/tasks?id=${id}`, { method: "DELETE" }); fetchTasks()
  }

  // Stats
  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    const todayTasks = tasks.filter((t) => t.date === today)
    const todayDone = todayTasks.filter((t) => t.status === "completed").length
    const todayTotal = todayTasks.length

    const weekId = getWeekId(today)
    const weekTasks = tasks.filter((t) => t.date && getWeekId(t.date) === weekId)
    const weekDone = weekTasks.filter((t) => t.status === "completed").length
    const weekTotal = weekTasks.length

    const total = tasks.length
    const done = tasks.filter((t) => t.status === "completed").length
    return {
      today: { done: todayDone, total: todayTotal, pct: todayTotal > 0 ? Math.round((todayDone / todayTotal) * 100) : 0 },
      week: { done: weekDone, total: weekTotal, pct: weekTotal > 0 ? Math.round((weekDone / weekTotal) * 100) : 0 },
      overall: { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 },
    }
  }, [tasks])

  // Calendar logic
  const calDays = useMemo(() => {
    const firstDay = new Date(calYear, calMonth, 1).getDay()
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
    const days: { day: number; date: string }[] = []
    for (let i = 0; i < firstDay; i++) days.push({ day: 0, date: "" })
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
      days.push({ day: d, date: dateStr })
    }
    return days
  }, [calMonth, calYear])

  const calTasks = useMemo(() => {
    const map: Record<string, any[]> = {}
    tasks.forEach((t) => {
      if (t.date) {
        if (!map[t.date]) map[t.date] = []
        map[t.date].push(t)
      }
    })
    return map
  }, [tasks])

  const today = new Date().toISOString().slice(0, 10)
  const filteredTasks = tasks.filter((t) => !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ListChecks className="h-6 w-6 text-purple-600" />
              المهام اليومية
            </h1>
            <p className="text-sm text-gray-500">{tasks.length} مهمة · {stats.overall.done} مكتملة</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors">
            <Plus className="h-4 w-4" /> مهمة جديدة
          </button>
        </div>

        {/* Progress Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "اليوم", ...stats.today, color: "bg-purple-600" },
            { label: "هذا الأسبوع", ...stats.week, color: "bg-blue-600" },
            { label: "الإجمالي", ...stats.overall, color: "bg-green-600" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">{s.label}</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {s.done}/{s.total} <span className="text-xs text-gray-400">{s.pct}%</span>
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div className={cn("h-full rounded-full transition-all duration-700", s.color)} style={{ width: `${s.pct}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Filters + View Toggle */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-0.5">
              {statuses.map((s) => (
                <button key={s.value} onClick={() => setStatusFilter(s.value)}
                  className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-all", statusFilter === s.value ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300")}>
                  {s.label}
                </button>
              ))}
            </div>
            <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
              className="h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-xs text-gray-700 dark:text-gray-300" />
            {dateFilter && <button onClick={() => setDateFilter("")} className="text-xs text-red-500 hover:underline">إلغاء</button>}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="بحث..." className="w-40 h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pr-9 pl-3 text-xs text-gray-900 dark:text-white placeholder:text-gray-400" />
            </div>
          </div>
          <div className="flex gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-0.5">
            <button onClick={() => setView("list")} className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1", view === "list" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500")}>
              <LayoutList className="h-3.5 w-3.5" /> قائمة
            </button>
            <button onClick={() => setView("calendar")} className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1", view === "calendar" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500")}>
              <Calendar className="h-3.5 w-3.5" /> تقويم
            </button>
          </div>
        </div>

        {/* ===== CALENDAR VIEW ===== */}
        {view === "calendar" ? (
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1) } else setCalMonth(calMonth - 1) }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800">
                <ChevronRight className="h-5 w-5" />
              </button>
              <h3 className="font-bold text-gray-900 dark:text-white">{months[calMonth]} {calYear}</h3>
              <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1) } else setCalMonth(calMonth + 1) }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800">
                <ChevronLeft className="h-5 w-5" />
              </button>
            </div>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-2">
              {["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"].map((d) => (
                <div key={d} className="text-center text-xs text-gray-400 py-1">{d}</div>
              ))}
            </div>
            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {calDays.map((d, i) => {
                if (!d.date) return <div key={`empty-${i}`} />
                const dayTasks = calTasks[d.date] || []
                const doneCount = dayTasks.filter((t: any) => t.status === "completed").length
                const isToday = d.date === today
                const isSelected = d.date === selectedCalDate
                return (
                  <button key={d.date}
                    onClick={() => setSelectedCalDate(selectedCalDate === d.date ? "" : d.date)}
                    className={cn(
                      "aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all relative",
                      isToday && "ring-2 ring-purple-500",
                      isSelected && "bg-purple-50 dark:bg-purple-900/20",
                      dayTasks.length > 0 && !isSelected && "hover:bg-gray-50 dark:hover:bg-gray-800/50",
                      !isSelected && !isToday && "hover:bg-gray-50 dark:hover:bg-gray-800/30"
                    )}
                  >
                    <span className={cn(
                      "text-sm font-medium",
                      isToday ? "text-purple-700 dark:text-purple-300" : "text-gray-700 dark:text-gray-300"
                    )}>
                      {d.day}
                    </span>
                    {dayTasks.length > 0 && (
                      <div className="flex gap-0.5 mt-1">
                        {dayTasks.slice(0, 3).map((t: any) => (
                          <span key={t.id} className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            t.status === "completed" ? "bg-green-500" :
                            t.priority === "critical" ? "bg-red-500" :
                            t.priority === "high" ? "bg-orange-500" : "bg-gray-300 dark:bg-gray-600"
                          )} />
                        ))}
                        {dayTasks.length > 3 && (
                          <span className="text-[8px] text-gray-400">+{dayTasks.length - 3}</span>
                        )}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Selected day tasks */}
            {selectedCalDate && calTasks[selectedCalDate] && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  مهام {selectedCalDate} ({calTasks[selectedCalDate].length})
                </h4>
                <div className="space-y-1.5">
                  {calTasks[selectedCalDate].map((task: any) => (
                    <div key={task.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/30">
                      <button onClick={() => toggleStatus(task)}>
                        {task.status === "completed" ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /> : <Circle className="h-4 w-4 text-gray-300 shrink-0" />}
                      </button>
                      <span className={cn("flex-1 text-xs", task.status === "completed" ? "text-gray-400 line-through" : "text-gray-700 dark:text-gray-300")}>
                        {task.title}
                      </span>
                      <span className={cn("text-[10px] px-1 py-0.5 rounded", priorities.find((p) => p.value === task.priority)?.color)}>
                        <Flag className="h-3 w-3 inline ml-0.5" />
                        {priorities.find((p) => p.value === task.priority)?.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ===== LIST VIEW ===== */
          loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-purple-600" /></div>
          ) : filteredTasks.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-16 text-center">
              <ListChecks className="mx-auto h-10 w-10 text-gray-400 mb-3" />
              <p className="text-gray-500 mb-1">لا توجد مهام</p>
              <p className="text-xs text-gray-400 mb-4">ابدأ بإضافة مهمة جديدة</p>
              <button onClick={openCreate} className="rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-purple-700">إضافة مهمة</button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTasks.map((task) => {
                const p = priorities.find((p) => p.value === task.priority)
                const isExpanded = expanded === task.id
                const checklistDone = task.checklists?.filter((c: any) => c.completed).length || 0
                const checklistTotal = task.checklists?.length || 0
                return (
                  <motion.div key={task.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={cn("rounded-xl border transition-all",
                      task.status === "completed" ? "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/10" : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900",
                      "hover:border-purple-200 dark:hover:border-purple-800")}
                  >
                    <div className="flex items-center gap-3 p-4">
                      <button onClick={() => toggleStatus(task)} className="shrink-0">
                        {task.status === "completed" ? <CheckCircle2 className="h-6 w-6 text-green-500" /> : <Circle className="h-6 w-6 text-gray-300 dark:text-gray-600 hover:text-purple-400 transition-colors" />}
                      </button>
                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleStatus(task)}>
                        <p className={cn("text-sm font-medium truncate", task.status === "completed" ? "text-gray-400 line-through" : "text-gray-900 dark:text-white")}>{task.title}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded flex items-center gap-0.5", p?.color)}>
                            <Flag className="h-3 w-3" />{p?.label}
                          </span>
                          {task.date && <span className="text-[10px] text-gray-400 flex items-center gap-0.5"><Calendar className="h-3 w-3" />{task.date}</span>}
                          {task.dueDate && <span className="text-[10px] text-gray-400 flex items-center gap-0.5"><Clock className="h-3 w-3" />{task.dueDate}</span>}
                          {checklistTotal > 0 && <span className="text-[10px] text-gray-400">{checklistDone}/{checklistTotal}</span>}
                          {task.description && <span className="text-[10px] text-gray-400 truncate max-w-[150px]">{task.description}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => openEdit(task)} className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all"><Edit3 className="h-4 w-4" /></button>
                        <button onClick={() => deleteTask(task.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"><Trash2 className="h-4 w-4" /></button>
                        {task.checklists?.length > 0 && (
                          <button onClick={() => setExpanded(isExpanded ? null : task.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition-all">
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                        )}
                      </div>
                    </div>
                    {isExpanded && task.checklists?.length > 0 && (
                      <div className="px-4 pb-4 pr-14 space-y-1.5">
                        {task.checklists.map((item: any) => (
                          <div key={item.id} className="flex items-center gap-2">
                            <button onClick={() => toggleChecklist(item)}>
                              {item.completed ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /> : <Circle className="h-4 w-4 text-gray-300 dark:text-gray-600 shrink-0" />}
                            </button>
                            <span className={cn("text-xs", item.completed ? "text-gray-400 line-through" : "text-gray-700 dark:text-gray-300")}>{item.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )
        )}
      </motion.div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => !saving && setShowCreate(false)}
          >
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{editTask ? "تعديل مهمة" : "مهمة جديدة"}</h2>
                <button onClick={() => { setShowCreate(false); resetForm() }} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                {error && <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-sm text-red-600"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">العنوان *</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثلاً: مراجعة حملة ميتا"
                    className="flex h-10 w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الوصف</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="تفاصيل المهمة..." rows={3}
                    className="flex w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الأولوية</label>
                    <select value={priority} onChange={(e) => setPriority(e.target.value)}
                      className="flex h-10 w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-white">
                      {priorities.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">التاريخ</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                      className="flex h-10 w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تاريخ التسليم</label>
                  <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-white" />
                </div>
                {!editTask && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">قائمة فرعية</label>
                    <div className="flex gap-2 mb-2">
                      <input value={checklistText} onChange={(e) => setChecklistText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (() => { if (!checklistText.trim()) return; setChecklistItems([...checklistItems, checklistText.trim()]); setChecklistText("") })()}
                        placeholder="أضف عنصر..."
                        className="flex-1 h-10 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400" />
                      <button onClick={() => { if (!checklistText.trim()) return; setChecklistItems([...checklistItems, checklistText.trim()]); setChecklistText("") }}
                        className="px-3 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors">+</button>
                    </div>
                    {checklistItems.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/30 mb-1">
                        <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{item}</span>
                        <button onClick={() => setChecklistItems(checklistItems.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-500"><X className="h-3.5 w-3.5" /></button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button onClick={handleSave} disabled={saving || !title.trim()}
                    className="flex-1 rounded-xl bg-purple-600 py-2.5 text-sm font-medium text-white hover:bg-purple-700 transition-colors disabled:opacity-50">
                    {saving ? "..." : editTask ? "حفظ التغييرات" : "إضافة المهمة"}
                  </button>
                  <button onClick={() => { setShowCreate(false); resetForm() }}
                    className="px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">إلغاء</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}
