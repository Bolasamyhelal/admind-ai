"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Lightbulb, Target, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Assignment {
  id: string
  title: string
  description?: string
  category?: string
  priority?: string
  reasoning?: string
  expectedImpact?: string
  actionSteps?: string[]
}

interface AssignmentCardProps {
  assignment: Assignment
  staysOpen?: boolean
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  urgent: { label: "عاجل", color: "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800" },
  important: { label: "مهم", color: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800" },
  optional: { label: "احتياطي", color: "bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700" },
}

const categoryLabels: Record<string, string> = {
  ads: "تحسين الإعلانات",
  website: "تحسين الموقع",
  strategy: "الاستراتيجية",
  creative: "الكريتيف",
  targeting: "الاستهداف",
  budget: "الميزانية",
}

const categoryIcons: Record<string, React.ElementType> = {
  ads: Target,
  website: Lightbulb,
  strategy: Lightbulb,
  creative: Lightbulb,
  targeting: Target,
  budget: AlertTriangle,
}

export function AssignmentCard({ assignment, staysOpen }: AssignmentCardProps) {
  const [expanded, setExpanded] = useState(staysOpen || false)
  const isExpanded = staysOpen || expanded
  const prio = priorityConfig[assignment.priority || ""] || priorityConfig.optional
  const CategoryIcon = categoryIcons[assignment.category || ""] || Lightbulb
  const catLabel = categoryLabels[assignment.category || ""] || assignment.category || ""

  return (
    <div
      className={cn(
        "rounded-lg border transition-all duration-200",
        "border-gray-100 dark:border-gray-800",
        "bg-white dark:bg-gray-900/50",
        isExpanded && "border-purple-200 dark:border-purple-800 shadow-sm"
      )}
    >
      <button
        onClick={() => !staysOpen && setExpanded(!expanded)}
        className="w-full flex items-start gap-2 p-3 text-right"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            {assignment.priority && (
              <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full border font-medium", prio.color)}>
                {prio.label}
              </span>
            )}
            {assignment.category && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                <CategoryIcon className="h-2.5 w-2.5" />
                {catLabel}
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-gray-900 dark:text-white leading-relaxed text-right">
            {assignment.title}
          </p>
        </div>
        {!staysOpen && (
          <ChevronDown className={cn(
            "h-3.5 w-3.5 text-gray-400 mt-1 shrink-0 transition-transform duration-200",
            isExpanded && "rotate-180"
          )} />
        )}
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2 border-t border-gray-100 dark:border-gray-800 pt-2">
              {assignment.description && (
                <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                  {assignment.description}
                </p>
              )}
              {assignment.reasoning && (
                <div className="flex items-start gap-1.5">
                  <AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-gray-500 leading-relaxed">{assignment.reasoning}</p>
                </div>
              )}
              {assignment.expectedImpact && (
                <div className="flex items-start gap-1.5">
                  <Target className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-green-600 dark:text-green-400 leading-relaxed">{assignment.expectedImpact}</p>
                </div>
              )}
              {assignment.actionSteps && assignment.actionSteps.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[10px] font-medium text-gray-500">خطوات التنفيذ:</p>
                  <ol className="space-y-0.5 pr-4" style={{ listStyleType: "arabic-indic" }}>
                    {assignment.actionSteps.map((step, i) => (
                      <li key={i} className="text-[10px] text-gray-600 dark:text-gray-400 leading-relaxed">{step}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
