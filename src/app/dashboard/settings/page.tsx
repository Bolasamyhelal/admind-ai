"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/context/auth-context"
import { useLang } from "@/context/language-context"
import { Sun, Moon, Globe, Bell, Shield, Key, User, Palette, X, Save } from "lucide-react"

const defaultNotifications = {
  cpaAlerts: true,
  roasAlerts: true,
  budgetAlerts: true,
  frequencyAlerts: false,
  analysisComplete: true,
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const { lang, setLang } = useLang()
  const [notifications, setNotifications] = useState(defaultNotifications)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("admind-notifications")
    if (stored) {
      try { setNotifications({ ...defaultNotifications, ...JSON.parse(stored) }) } catch {}
    }
    setMounted(true)
  }, [])

  const toggleNotification = (key: keyof typeof defaultNotifications) => {
    const updated = { ...notifications, [key]: !notifications[key] }
    setNotifications(updated)
    localStorage.setItem("admind-notifications", JSON.stringify(updated))
  }

  const t = (ar: string, en: string) => lang === "ar" ? ar : en

  if (!mounted) return null

  const initials = user?.name
    ? user.name.split(" ").map(s => s[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() || "U"

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("الإعدادات", "Settings")}
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {t("إدارة حسابك وتفضيلاتك", "Manage your account and preferences")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Appearance */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
                <Palette className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t("المظهر", "Appearance")}
                </h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {theme === "dark" ? <Moon className="h-5 w-5 text-gray-500" /> : <Sun className="h-5 w-5 text-gray-500" />}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {t("السمة", "Theme")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t("اختر بين الوضع الفاتح والداكن", "Choose between light and dark mode")}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  >
                    {theme === "dark"
                      ? t("واقع فاتح", "Light Mode")
                      : t("واقع داكن", "Dark Mode")}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {t("اللغة", "Language")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t("English / العربية", "العربية / English")}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLang(lang === "ar" ? "en" : "ar")}
                  >
                    {lang === "ar" ? "English" : "العربية"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
                <Bell className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t("الإشعارات", "Notifications")}
                </h3>
              </div>
              <div className="p-5 space-y-4">
                {[
                  { key: "cpaAlerts" as const, label: t("تنبيهات CPA", "CPA Alerts"), desc: t("إشعار عند تجاوز CPA للحد المطلوب", "Alert when CPA exceeds the target") },
                  { key: "roasAlerts" as const, label: t("انخفاض ROAS", "Low ROAS"), desc: t("تنبيه عند انخفاض ROAS عن 2.0x", "Alert when ROAS drops below 2.0x") },
                  { key: "budgetAlerts" as const, label: t("استهلاك الميزانية", "Budget Spend"), desc: t("عند إنفاق 80% من الميزانية اليومية", "When 80% of daily budget is spent") },
                  { key: "frequencyAlerts" as const, label: t("تحذير التكرار", "Frequency Warning"), desc: t("عند تجاوز معدل التكرار 4.0", "When frequency exceeds 4.0") },
                  { key: "analysisComplete" as const, label: t("اكتمال التحليل", "Analysis Complete"), desc: t("عند اكتمال تحليل الذكاء الاصطناعي", "When AI analysis is complete") },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <Switch
                      checked={notifications[item.key]}
                      onCheckedChange={() => toggleNotification(item.key)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* API Keys */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
                <Key className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t("مفاتيح API", "API Keys")}
                </h3>
              </div>
              <div className="p-5 space-y-3">
                {[
                      { name: "OpenAI", status: t("مُعد", "Configured") },
                  { name: "Groq", status: t("مُعد", "Configured") },
                  { name: "Gemini", status: t("مُعد", "Configured") },
                ].map((api) => (
                  <div key={api.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{api.name} API Key</p>
                      <p className="text-xs text-gray-500">{api.status}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      {t("تحديث", "Update")}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Profile Sidebar */}
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <div className="flex items-center gap-3 mb-4">
                <User className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t("الملف الشخصي", "Profile")}
                </h3>
              </div>
              <div className="text-center mb-4">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-purple-600 text-white text-xl font-bold">
                  {initials}
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.name || t("مستخدم", "User")}
                </p>
                <p className="text-xs text-gray-500">{user?.email || ""}</p>
              </div>
              <Button variant="outline" className="w-full" onClick={() => setShowProfileModal(true)}>
                {t("تعديل الملف الشخصي", "Edit Profile")}
              </Button>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t("الحساب", "Account")}
                </h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">{t("الباقة", "Plan")}</span>
                  <span className="font-medium text-purple-600">{t("احترافي", "Pro")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t("التحليلات المستخدمة", "Analyses Used")}</span>
                  <span className="font-medium">12 / 50</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t("العملاء", "Clients")}</span>
                  <span className="font-medium">5</span>
                </div>
              </div>
              <Separator className="my-3" />
              <Button
                variant="outline"
                className="w-full text-red-600 hover:text-red-700"
                onClick={logout}
              >
                {t("تسجيل الخروج", "Log Out")}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <ProfileModal
            user={user}
            lang={lang}
            onClose={() => setShowProfileModal(false)}
            t={t}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}

function ProfileModal({ user, lang, onClose, t }: any) {
  const [name, setName] = useState(user?.name || "")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      if (res.ok) {
        window.location.reload()
      }
    } catch {}
    setSaving(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {t("تعديل الملف الشخصي", "Edit Profile")}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("الاسم", "Name")}
            </label>
            <input
              dir="auto"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-4 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("البريد الإلكتروني", "Email")}
            </label>
            <input
              dir="ltr"
              value={user?.email || ""}
              disabled
              className="flex h-11 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">
              {t("لا يمكن تغيير البريد الإلكتروني حالياً", "Email cannot be changed at this time")}
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={handleSave} disabled={saving || !name.trim()} className="flex-1">
            <Save className="h-4 w-4 ml-2" />
            {saving ? t("جاري الحفظ...", "Saving...") : t("حفظ", "Save")}
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1">
            {t("إلغاء", "Cancel")}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
