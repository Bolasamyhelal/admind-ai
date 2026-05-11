"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  TrendingUp,
  XCircle,
  Copy,
  RefreshCw,
  Lightbulb,
  PauseCircle,
  ArrowRight,
  Zap,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const recommendations = [
  {
    type: "scaling",
    title: "توسعة أفضل حملة (#3) بنسبة 30%",
    description: "هذه الحملة تحقق ROAS 4.2x مع CPA مستقر. زيادة الميزانية 30% قد تولد إيرادات إضافية.",
    priority: "high" as const,
    impact: "إيرادات إضافية متوقعة",
    icon: TrendingUp,
  },
  {
    type: "kill",
    title: "إيقاف الحملة #7 - أداء ضعيف",
    description: "ROAS 0.8x و CPA مرتفع. الحملة تتجاوز الهدف بثلاث أضعاف. يُوصى بإيقاف الحملة.",
    priority: "high" as const,
    impact: "توفير المصروف",
    icon: XCircle,
  },
  {
    type: "duplicate",
    title: "نسخ المجموعة الإعلانية #4 لجماهير مشابهة",
    description: "المجموعة #4 لديها أفضل CPA ومعدل تحويل. إنشاء جماهير مشابهة قد يوسع النتائج.",
    priority: "medium" as const,
    impact: "توسيع الجمهور الفائز",
    icon: Copy,
  },
  {
    type: "optimize",
    title: "تحديث الإعلانات - معدل التكرار 4.8",
    description: "العديد من المجموعات لديها تكرار أعلى من 4.0. إعلانات جديدة قد تعيد جذب الانتباه وتخفض CPA.",
    priority: "medium" as const,
    impact: "خفض التكرار + CPA",
    icon: RefreshCw,
  },
  {
    type: "test",
    title: "اختبار زاوية إعلانية جديدة للحملة #2",
    description: "CTR انخفض 23% الأسبوع الماضي. قد يكون الإعلان الحالي يعاني من الإرهاق الإعلاني.",
    priority: "medium" as const,
    impact: "تحسين CTR بنسبة 15-25%",
    icon: Lightbulb,
  },
  {
    type: "pause",
    title: "إيقاف المواقع الضعيفة",
    description: "مواضع Audience Network لديها ROAS 0.3x مقابل 3.8x للفييد. يُوصى بإيقافها.",
    priority: "low" as const,
    impact: "تقليل الهدر 8%",
    icon: PauseCircle,
  },
]

const priorityColors = {
  high: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
  medium: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
  low: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
}

export function RecommendationsPanel() {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">توصيات الذكاء الاصطناعي</h3>
          <p className="text-sm text-gray-500 mt-0.5">6 توصيات بناءً على بيانات حملاتك</p>
        </div>
        <Badge variant="default" className="gap-1">
          <Zap className="h-3 w-3" />
          ذكاء اصطناعي
        </Badge>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {recommendations.map((rec, i) => {
          const Icon = rec.icon
          return (
            <motion.div
              key={rec.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "p-2 rounded-lg shrink-0",
                  rec.type === "scaling" && "bg-green-50 dark:bg-green-900/20 text-green-600",
                  rec.type === "kill" && "bg-red-50 dark:bg-red-900/20 text-red-600",
                  rec.type === "duplicate" && "bg-blue-50 dark:bg-blue-900/20 text-blue-600",
                  rec.type === "optimize" && "bg-purple-50 dark:bg-purple-900/20 text-purple-600",
                  rec.type === "test" && "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600",
                  rec.type === "pause" && "bg-orange-50 dark:bg-orange-900/20 text-orange-600",
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{rec.title}</h4>
                    <span className={cn(
                      "text-[10px] font-medium px-1.5 py-0.5 rounded border",
                      priorityColors[rec.priority]
                    )}>
                      {rec.priority === "high" ? "عالية" : rec.priority === "medium" ? "متوسطة" : "منخفضة"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{rec.description}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                      الأثر: {rec.impact}
                    </span>
                    <Button variant="ghost" size="sm" className="text-xs gap-1 h-7">
                      تطبيق <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
