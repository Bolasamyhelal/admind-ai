"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard, Upload, BarChart3, Settings,
  PanelLeftClose, PanelLeft, Brain, Store, Search,
  Compass, Lightbulb, Building2, Play, ListChecks,
  FolderOpen, BookOpen, Rocket, Sparkles, FileText, DollarSign,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

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
  { label: "أسعار العملات", href: "/dashboard/currency-rates", icon: DollarSign, badge: "جديد" },
  { label: "التقرير اليومي", href: "/dashboard/daily-report", icon: FileText, badge: "جديد" },
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
                  ? "bg-gradient-to-r from-purple-500/20 to-transparent text-purple-300 shadow-sm"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeBar"
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-gradient-to-b from-purple-400 to-purple-600"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className={cn(
                "flex items-center justify-center h-8 w-8 rounded-lg shrink-0 transition-all duration-200",
                isActive
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/30"
                  : "text-gray-400"
              )}>
                <Icon className="h-4 w-4" />
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
              {!collapsed && item.badge && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-purple-500/30 text-purple-300 font-bold">
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

function NavSection({ label, items, collapsed }: { label: string; items: NavItem[]; collapsed: boolean }) {
  return (
    <div>
      {!collapsed && (
        <div className="flex items-center gap-2 px-3 mb-1">
          <div className="h-px flex-1 bg-gradient-to-l from-purple-500/20 to-transparent" />
          <span className="text-[9px] font-bold text-gray-500 tracking-widest uppercase">{label}</span>
          <div className="h-px flex-1 bg-gradient-to-r from-purple-500/20 to-transparent" />
        </div>
      )}
      <div className="space-y-0.5">
        <NavGroup items={items} collapsed={collapsed} />
      </div>
    </div>
  )
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      className={cn(
        "fixed right-0 top-0 z-40 flex h-screen flex-col border-l border-white/10",
        "bg-gray-900 text-white shadow-2xl shadow-purple-500/10"
      )}
    >
      {/* Logo */}
      <div className={cn("flex h-[72px] items-center gap-3 px-4 border-b border-white/10", collapsed && "justify-center px-2")}>
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-500/30">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <motion.div
                  className="absolute -inset-1 rounded-xl bg-purple-500/20 blur-md"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
              <div>
                <h1 className="text-sm font-bold bg-gradient-to-l from-purple-400 to-pink-400 bg-clip-text text-transparent">AdMind AI</h1>
                <div className="flex items-center gap-1">
                  <Sparkles className="h-2.5 w-2.5 text-purple-400" />
                  <p className="text-[9px] text-gray-400 font-medium">منصة تحليلات ذكية</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <motion.div
                className="absolute -inset-1 rounded-xl bg-purple-500/20 blur-md"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-5">
        <NavSection label="الأدوات الرئيسية" items={mainTools} collapsed={collapsed} />
        <NavSection label="التحليلات" items={analytics} collapsed={collapsed} />
        <NavSection label="البراندات" items={brands} collapsed={collapsed} />
        <NavSection label="أدوات ذكية" items={research} collapsed={collapsed} />
      </nav>

      {/* Bottom */}
      <div className="border-t border-white/10 p-3 space-y-1">
        <NavGroup items={bottomItems} collapsed={collapsed} />
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full rounded-xl hover:bg-white/10 text-gray-400 hover:text-gray-200",
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
