"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useAuth } from "@/context/auth-context"
import { formatCurrency } from "@/lib/utils"
import {
  Store, Send, Loader2, Sparkles, TrendingUp, DollarSign,
  Target, BarChart3, Lightbulb, MessageSquare, Bot,
  User, ChevronDown, RefreshCw, AlertCircle,
} from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
}

export default function BrandMentorPage() {
  const [brands, setBrands] = useState<any[]>([])
  const [selectedBrandId, setSelectedBrandId] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [brandsLoading, setBrandsLoading] = useState(true)
  const [brandContext, setBrandContext] = useState<any>(null)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()

  // Load brands
  useEffect(() => {
    if (!user) return
    fetch(`/api/brands?userId=${user.id}`)
      .then((r) => r.json())
      .then((d) => setBrands(d.brands || []))
      .catch(() => {})
      .finally(() => setBrandsLoading(false))
  }, [user])

  const selectedBrand = brands.find((b) => b.id === selectedBrandId)

  // Load brand context when brand changes
  useEffect(() => {
    if (!selectedBrandId || !user) return
    fetch(`/api/brands?id=${selectedBrandId}&userId=${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        setBrandContext(data)
        setMessages([
          {
            role: "assistant",
            content: `مرحباً! أنا مرشد ${data.brand?.name || "البراند"} 👋\n\nعندي قدامي كل داتا البراند — التحليلات، الحملات، الكريتفز، وحتى مهامك المعلقة.\n\nأنا هنا عشان أساعدك:\n• ت scale صح من غير ما تخسر فلوس\n• تاخد توقعات دقيقة بناءً على أداء البراند\n• تخطط لفانل التسويق المظبوط\n• تحدد أهدافك وأرقامك الفعلية\n\nاقوللي إيه اللي عايز تعمله دلوقتي؟`
          },
        ])
        setShowSuggestions(true)
      })
      .catch(() => {})
  }, [selectedBrandId, user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim()
    if (!msg || loading || !selectedBrandId || !user) return
    setInput("")
    setShowSuggestions(false)

    const userMsg: Message = { role: "user", content: msg }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    try {
      const history = messages.slice(-20).map((m) => ({ role: m.role, content: m.content.length > 500 ? m.content.slice(0, 500) + "..." : m.content }))
      const res = await fetch("/api/brand-mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, brandId: selectedBrandId, userId: user.id, history }),
      })
      const data = await res.json()
      const assistantMsg: Message = { role: "assistant", content: data.response || data.error || "عذراً، حصل خطأ" }
      setMessages((prev) => [...prev, assistantMsg])
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "عذراً، حصل خطأ في الاتصال. حاول تاني." }])
    }
    setLoading(false)
  }

  const suggestions = [
    { icon: TrendingUp, text: "عايز أسكل البراند — إيه الطريقة الصح؟" },
    { icon: Target, text: "أديلي توقعات للشهر الجاي بناءً على أدائنا" },
    { icon: Lightbulb, text: "إيه مشاكل الفانل اللي عندي وإيه الحل؟" },
    { icon: DollarSign, text: "عايز أحدد أهداف KPI واقعية للفترة الجاية" },
  ]

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 h-[calc(100vh-7rem)] flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">مرشد البراند</h1>
              <p className="text-xs text-gray-500">خبيرك الشخصي لل scaling و الماركتنج — فاهم كل حاجة عن براندك</p>
            </div>
          </div>
          <select value={selectedBrandId} onChange={(e) => setSelectedBrandId(e.target.value)}
            className="h-10 min-w-[200px] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm text-gray-900 dark:text-white outline-none focus:border-purple-500"
          >
            <option value="">{brandsLoading ? "جارٍ التحميل..." : "اختار براند..."}</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>

        {!selectedBrandId ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Bot className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">مرحباً بيك في مرشد البراند 🚀</h2>
              <p className="text-gray-500 mb-6 text-sm leading-relaxed">
                اختار براند من فوق عشان تبدأ — هكون معاك خطوة بخطوة:  
                هساعدك ت scale صح، تفهم الفانل بتاعك، تاخد توقعات حقيقية،  
                وتحدد أهدافك بناءً على داتا براندك الفعلية
              </p>
              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                {[
                  { label: "توسعة آمنة", desc: "من غير ما تخسر", color: "from-blue-500 to-cyan-500" },
                  { label: "توقعات دقيقة", desc: "بناءً على أدائك", color: "from-purple-500 to-pink-500" },
                  { label: "فانل متكامل", desc: "Top → Middle → Bottom", color: "from-orange-500 to-red-500" },
                  { label: "أهداف واقعية", desc: "KPI targets مظبوطة", color: "from-green-500 to-emerald-500" },
                ].map((f) => (
                  <div key={f.label} className={`rounded-xl bg-gradient-to-br ${f.color} p-3 text-white text-center`}>
                    <p className="text-sm font-bold">{f.label}</p>
                    <p className="text-[10px] opacity-80">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Brand Context Bar */}
            {brandContext?.brand && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-l from-purple-50 to-white dark:from-purple-950/20 dark:to-gray-900 border border-purple-200 dark:border-purple-800 overflow-x-auto">
                <Store className="h-5 w-5 text-purple-600 shrink-0" />
                <span className="text-sm font-bold text-gray-900 dark:text-white shrink-0">{brandContext.brand.name}</span>
                {brandContext.brand.niche && <span className="text-xs text-gray-500 shrink-0">· {brandContext.brand.niche}</span>}
                {brandContext.brand.platforms && <span className="text-xs text-gray-500 shrink-0">· {brandContext.brand.platforms}</span>}
                {brandContext.analyses?.length > 0 && (
                  <span className="text-xs text-purple-600 bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded-full shrink-0">
                    {brandContext.analyses.length} تحليل
                  </span>
                )}
                {brandContext.campaigns?.length > 0 && (
                  <span className="text-xs text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-full shrink-0">
                    {brandContext.campaigns.length} حملة
                  </span>
                )}
              </div>
            )}

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto space-y-3 px-1">
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${
                    msg.role === "user" ? "bg-purple-100 dark:bg-purple-900/30" : "bg-gradient-to-br from-purple-500 to-pink-500"
                  }`}>
                    {msg.role === "user" ? <User className="h-4 w-4 text-purple-600" /> : <Bot className="h-4 w-4 text-white" />}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-purple-600 text-white rounded-tr-sm"
                      : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 rounded-tr-sm"
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl rounded-tr-sm p-4">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {showSuggestions && messages.length <= 2 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => sendMessage(s.text)}
                    className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-sm transition-all text-right"
                  >
                    <s.icon className="h-5 w-5 text-purple-500 shrink-0" />
                    <span className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{s.text}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="flex gap-2">
              <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="اسأل مرشد البراند..."
                className="flex-1 h-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:border-purple-500"
                disabled={loading}
              />
              <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
                className="h-12 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </DashboardLayout>
  )
}