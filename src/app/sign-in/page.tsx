"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Brain, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import Link from "next/link"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    const err = await login(email, password)
    if (err) setError(err)
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-950">
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600">
              <Brain className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">مرحباً بعودتك</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              سجل الدخول إلى حسابك في AdMind AI
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                required
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "تسجيل الدخول"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            ليس لديك حساب؟{" "}
            <Link href="/sign-up" className="font-medium text-purple-600 hover:text-purple-500">
              إنشاء حساب
            </Link>
          </p>
        </motion.div>
      </div>
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-purple-600 to-purple-800 items-center justify-center p-12">
        <div className="max-w-md text-white">
          <h2 className="text-3xl font-bold mb-4">ذكاء اصطناعي لتحليل الإعلانات</h2>
          <p className="text-purple-100 leading-relaxed">
            ارفع بيانات حملاتك الإعلانية واحصل على تحليل فوري بالذكاء الاصطناعي وتوقعات وتوصيات قابلة للتنفيذ لتحسين أدائك الإعلاني
          </p>
        </div>
      </div>
    </div>
  )
}
