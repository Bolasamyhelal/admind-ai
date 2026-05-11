"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Bot, User, Loader2, MessageSquare, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ChatMessage } from "@/types"

const initialMessages: ChatMessage[] = [
  {
    id: "1",
    role: "assistant",
    content: "Hello! I'm your AI marketing assistant. I can help you analyze your campaign data, suggest optimizations, or answer any questions about your metrics. What would you like to know?",
    createdAt: new Date().toISOString(),
  },
]

const suggestions = [
  "Why is my CPA high?",
  "Should I scale this campaign?",
  "What's the best audience?",
  "Analyze my funnel",
  "How to improve CTR?",
]

export function AIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      createdAt: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    setTimeout(() => {
      const responses: Record<string, string> = {
        "why is my cpa high": "High CPA can be caused by several factors:\n\n1. **Audience saturation** - Your audience has seen the ad too many times (frequency > 3)\n2. **Weak creative** - Low CTR means you're paying for impressions that don't convert\n3. **Broad targeting** - Too wide an audience leads to irrelevant clicks\n4. **Placement issues** - Some placements (like Audience Network) may have lower quality traffic\n5. **Conversion tracking** - Check if your pixel is firing correctly\n\nRecommended actions:\n- Refresh creatives every 7-10 days\n- Narrow your audience using lookalikes\n- Exclude low-performing placements",
        "should i scale this campaign": "Based on your data analysis:\n\n✅ **Campaign #3 is ready to scale** (ROAS: 4.2x, CPA: $18, Frequency: 1.8)\n- Recommended increase: 20-30% every 3-4 days\n- Watch CPA and frequency closely\n\n⚠️ **Campaign #7 needs optimization first** (ROAS: 0.8x)\n- Fix creative/audience issues before scaling\n- Consider pausing until improvements are made\n\nGeneral rule: Only scale campaigns with ROAS > 2.5x and CPA under target.",
        "what's the best audience": "Based on your campaign data:\n\n🏆 **Top Performing Audience**: Lookalike 1% from purchases\n- CPA: $18.50 (35% better than average)\n- ROAS: 4.8x\n- CTR: 3.2%\n\n**Recommended audience strategy:**\n1. Scale Lookalike 1% (increase budget 20%)\n2. Create Lookalike 1% from ViewContent\n3. Test interest stacking with top 3 converting interests\n4. Exclude audiences with frequency > 4\n5. Retarget website visitors (30-day window)",
        "analyze my funnel": "**Marketing Funnel Analysis**\n\n🟢 **TOF (Top of Funnel)** - IMPRESSIONS: 2.1M\n- CPM: $18.20 (healthy)\n- CTR: 2.15% (above average)\n- ✅ Good reach, efficient awareness\n\n🟡 **MOF (Middle of Funnel)** - CLICKS: 45K\n- CPC: $0.85 (excellent)\n- Frequency: 2.1 (approaching limit)\n- ⚠️ Consider refreshing creatives\n\n🔴 **BOF (Bottom of Funnel)** - CONVERSIONS: 1,540\n- CVR: 3.42% (strong)\n- CPA: $24.50 (on target)\n- ✅ Solid conversion performance\n\n**Recommendation:** Strengthen MOF with retargeting campaigns",
        "how to improve ctr": "Here are 5 proven ways to improve CTR:\n\n1. **Hook in first 3 seconds** - Use pattern interrupts, bold claims, or questions\n2. **Test different formats** - Video often outperforms static images\n3. **Improve relevance** - Match ad copy to audience pain points\n4. **Use social proof** - Testimonials, reviews, user count\n5. **Clear CTA** - Make the next step obvious and urgent\n\nYour current CTR is 2.15%, which is already above average. For best results, test 5 new creative variations this week.",
      }

      const lowerInput = userMessage.content.toLowerCase().trim()
      let response = "I've analyzed your data and here are my insights:\n\nBased on current campaign performance, I recommend focusing on scaling Campaign #3 while optimizing Campaign #7. Your overall account health is strong with a 3.58x ROAS. Would you like me to dive deeper into any specific metric?"

      for (const [key, value] of Object.entries(responses)) {
        if (lowerInput.includes(key)) {
          response = value
          break
        }
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        createdAt: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg shadow-purple-500/30 hover:bg-purple-700 transition-all hover:scale-105"
      >
        <MessageSquare className="h-6 w-6" />
      </button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 100, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 100, scale: 0.9 }}
      className="fixed bottom-6 right-6 z-50 w-[400px] h-[600px] rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl flex flex-col"
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-600">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">AI Assistant</h3>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Online
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "")}
          >
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full shrink-0",
              msg.role === "assistant" ? "bg-purple-100 dark:bg-purple-900/30" : "bg-gray-100 dark:bg-gray-800"
            )}>
              {msg.role === "assistant" ? <Bot className="h-4 w-4 text-purple-600" /> : <User className="h-4 w-4 text-gray-600" />}
            </div>
            <div className={cn(
              "max-w-[85%] rounded-xl p-3 text-sm",
              msg.role === "user"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            )}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
              <Bot className="h-4 w-4 text-purple-600" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-3">
              <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length <= 1 && (
        <div className="px-4 pb-3">
          <p className="text-xs text-gray-500 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => { setInput(s); inputRef.current?.focus() }}
                className="rounded-full border border-gray-200 dark:border-gray-700 px-3 py-1 text-xs text-gray-500 hover:border-purple-300 dark:hover:border-purple-600 hover:text-purple-600 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about your campaigns..."
            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          />
          <Button size="icon" onClick={handleSend} disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
