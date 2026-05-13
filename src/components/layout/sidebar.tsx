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
  PanelLeftClose,
  PanelLeft,
  Brain,
  Store,
  Search,
  Compass,
  Lightbulb,
  Building2,
  Play,
  ListChecks,
  FolderOpen,
  BookOpen,
  Rocket,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface NavItem {
  label: string
  href: string
  icon: any
  badge?: string
}

const mainTools: NavItem[] = [
  { label: "الرئيسية", href: "/dashboard", icon: LayoutDashboard },
  { label: "لوحة القرارات", href: "/dashboard/decisions", icon: Brain, badge: "AI" },
  { label: "فرص النمو", href: "/dashboard/opportunities", icon: Rocket },
]

const analytics: NavItem[] = [
  { label: "رفع تقارير", href: "/dashboard/upload", icon: Upload },
  { label: "التقارير", href: "/dashboard/reports", icon: BarChart3 },
  { label: "المهام اليومية", href: "/dashboard/tasks", icon: ListChecks },
  { label: "قاموس الميتركس", href: "/dashboard/glossary", icon: BookOpen },
]

const brands: NavItem[] = [
  { label: "البراندات", href: "/dashboard/brands", icon: Store },
  { label: "ملفات البراندات", href: "/dashboard/brand-media", icon: FolderOpen },
]

const research: NavItem[] = [
  { label: "محلل المواقع", href: "/dashboard/site-analyzer", icon: Search },
  { label: "أبحاث النيتش", href: "/dashboard/niche-research", icon: Compass },
  { label: "مستشار الحملات", href: "/dashboard/campaign-guide", icon: Lightbulb },
  { label: "أبحاث العملاء", href: "/dashboard/client-research", icon: Building2 },
  { label: "منفذ الحملات", href: "/dashboard/campaign-exec", icon: Play },
]

const bottomItems: NavItem[] = [
  { label: "الإعدادات", href: "/dashboard/settings", icon: Settings },
]

function NavGroup({ items, collapsed }: { items: NavItem[]; collapsed: boolean }) {
  const pathname = usePathname()
  return (
    <>
      {items.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
        return (
          <Link key={item.href} href={item.href}>
            <motion.div
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                collapsed && "justify-center px-2",
                isActive
                  ? "bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950/30 dark:to-transparent text-purple-700 dark:text-purple-300 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/30"
              )}
            >
              {/* Active indicator bar */}
              {isActive && (
                <motion.div
                  layoutId="activeBar"
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-gradient-to-b from-purple-500 to-purple-600"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              {/* Icon container */}
              <div className={cn(
                "flex items-center justify-center h-8 w-8 rounded-lg shrink-0 transition-all duration-200",
                isActive
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                  : "text-gray-400 dark:text-gray-500"
              )}>
                <Icon className="h-4 w-4" strokeWidth={1.5} />
              </div>

              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    className="flex-1 text-right"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Badge */}
              {!collapsed && item.badge && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 font-bold tracking-wider">
                  {item.badge}
                </span>
              )}
            </motion.div>
          </Link>
        )
      })}
    </>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      className={cn(
        "fixed right-0 top-0 z-40 flex h-screen flex-col border-l border-gray-100 dark:border-gray-800/50 bg-white dark:bg-gray-950 transition-colors",
        "shadow-[0_0_40px_-12px_rgba(0,0,0,0.08)] dark:shadow-none"
      )}
    >
      {/* Logo */}
      <div className={cn("flex h-[72px] items-center gap-3 px-4 border-b border-gray-100 dark:border-gray-800/50", collapsed && "justify-center px-2")}>
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/20">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold bg-gradient-to-l from-purple-600 to-indigo-600 bg-clip-text text-transparent">AdMind AI</h1>
                <p className="text-[9px] text-gray-400 font-medium tracking-wide">منصة تحليلات ذكية</p>
              </div>
            </motion.div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/20">
              <Brain className="h-5 w-5 text-white" />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-5">
        {/* Main Tools */}
        {!collapsed && (
          <div className="px-3">
            <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 tracking-widest uppercase">الأدوات الرئيسية</p>
          </div>
        )}
        <div className="space-y-0.5">
          <NavGroup items={mainTools} collapsed={collapsed} />
        </div>

        <Separator className="bg-gray-100 dark:bg-gray-800/50" />

        {/* Analytics */}
        {!collapsed && (
          <div className="px-3">
            <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 tracking-widest uppercase">التحليلات</p>
          </div>
        )}
        <div className="space-y-0.5">
          <NavGroup items={analytics} collapsed={collapsed} />
        </div>

        <Separator className="bg-gray-100 dark:bg-gray-800/50" />

        {/* Brands */}
        {!collapsed && (
          <div className="px-3">
            <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 tracking-widest uppercase">البراندات</p>
          </div>
        )}
        <div className="space-y-0.5">
          <NavGroup items={brands} collapsed={collapsed} />
        </div>

        <Separator className="bg-gray-100 dark:bg-gray-800/50" />

        {/* Research */}
        {!collapsed && (
          <div className="px-3">
            <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 tracking-widest uppercase">أدوات ذكية</p>
          </div>
        )}
        <div className="space-y-0.5">
          <NavGroup items={research} collapsed={collapsed} />
        </div>
      </nav>

      {/* Bottom: collapse toggle + settings */}
      <div className="border-t border-gray-100 dark:border-gray-800/50 p-3 space-y-1">
        <NavGroup items={bottomItems} collapsed={collapsed} />
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/30 text-gray-400",
            collapsed && "h-10 w-10 mx-auto"
          )}
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : (
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-gray-400">طي القائمة</span>
              <PanelLeftClose className="h-4 w-4" />
            </div>
          )}
        </Button>
      </div>
    </motion.aside>
  )
}
