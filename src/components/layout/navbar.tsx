"use client"

import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { Sun, Moon, Bell, Search, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { useDashboardStore } from "@/store/dashboard-store"
import { useAuth } from "@/context/auth-context"
import { useState, useRef, useEffect } from "react"

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const { alerts } = useDashboardStore()
  const [showSearch, setShowSearch] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const unreadAlerts = alerts.filter((a) => !a.read).length
  const menuRef = useRef<HTMLDivElement>(null)
  const initial = (user?.name || user?.email || "U")[0].toUpperCase()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl px-6">
      <div className="flex items-center gap-4">
        {showSearch ? (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="relative"
          >
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              autoFocus
              onBlur={() => setShowSearch(false)}
              placeholder="ابحث عن حملات، براندات..."
              className="h-9 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 pr-9 pl-4 text-sm outline-none focus:border-purple-500"
            />
          </motion.div>
        ) : (
          <Button variant="ghost" size="icon" onClick={() => setShowSearch(true)}>
            <Search className="h-5 w-5" />
          </Button>
        )}
        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 hidden md:block">
          {new Date().toLocaleDateString("ar-EG", { weekday: "long", month: "long", day: "numeric" })}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="relative"
        >
          <motion.div
            key={theme}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </motion.div>
        </Button>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadAlerts > 0 && (
            <span className="absolute -left-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadAlerts}
            </span>
          )}
        </Button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Avatar className="h-8 w-8 bg-purple-600 flex items-center justify-center text-white text-sm font-medium rounded-full">
              {initial}
            </Avatar>
          </button>

          {showUserMenu && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute left-0 top-full mt-2 w-56 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 shadow-xl"
            >
              <div className="flex items-center gap-3 px-3 py-2">
                <Avatar className="h-9 w-9 bg-purple-600 flex items-center justify-center text-white text-sm font-medium rounded-full">
                  {initial}
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{user?.name || "مستخدم"}</p>
                  <p className="text-xs text-gray-500">{user?.email || "user@example.com"}</p>
                </div>
              </div>
              <div className="mt-2 border-t border-gray-200 dark:border-gray-700 pt-2">
                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
                  <User className="h-4 w-4" />
                  الملف الشخصي
                </button>
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <LogOut className="h-4 w-4" />
                  تسجيل الخروج
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  )
}
