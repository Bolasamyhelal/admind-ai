"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Upload,
  BarChart3,
  Settings,
  ChevronLeft,
  PanelLeftClose,
  PanelLeft,
  Brain,
  Store,
  Image,
  Search,
  Compass,
  Lightbulb,
  Building2,
  Play,
  ListChecks,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const navItems = [
  { label: "الرئيسية", href: "/dashboard", icon: LayoutDashboard },
  { label: "المهام اليومية", href: "/dashboard/tasks", icon: ListChecks },
  { label: "البراندات", href: "/dashboard/brands", icon: Store },
  { label: "الكريتيف", href: "/dashboard/creatives", icon: Image },
  { label: "محلل المواقع", href: "/dashboard/site-analyzer", icon: Search },
  { label: "أبحاث النيتش", href: "/dashboard/niche-research", icon: Compass },
  { label: "مستشار الحملات", href: "/dashboard/campaign-guide", icon: Lightbulb },
  { label: "أبحاث العملاء", href: "/dashboard/client-research", icon: Building2 },
  { label: "منفذ الحملات", href: "/dashboard/campaign-exec", icon: Play },
  { label: "رفع تقارير", href: "/dashboard/upload", icon: Upload },
  { label: "التقارير", href: "/dashboard/reports", icon: BarChart3 },
  { label: "الإعدادات", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      className={cn(
        "fixed right-0 top-0 z-40 flex h-screen flex-col border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 transition-colors"
      )}
    >
      <div className={cn("flex h-16 items-center gap-3 px-4", collapsed && "justify-center px-2")}>
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-900 dark:text-white">AdMind AI</h1>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">منصة تحليلات ذكية</p>
              </div>
            </motion.div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600">
              <Brain className="h-5 w-5 text-white" />
            </div>
          )}
        </AnimatePresence>
      </div>

      <Separator />

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  collapsed && "justify-center px-2",
                  isActive
                    ? "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800/50"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          )
        })}
      </nav>

      <div className="p-3">
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          onClick={() => setCollapsed(!collapsed)}
          className="w-full"
        >
          {collapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5 ml-2" />}
          {!collapsed && "طي القائمة"}
        </Button>
      </div>
    </motion.aside>
  )
}
