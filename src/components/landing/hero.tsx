"use client"

import { motion } from "framer-motion"
import { ArrowRight, BarChart3, Sparkles, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 pt-32 pb-20 lg:pt-40 lg:pb-32">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-50/50 to-white dark:from-purple-950/20 dark:to-gray-950" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-purple-600/5 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/30 px-4 py-1.5 text-sm text-purple-700 dark:text-purple-300">
            <Sparkles className="h-4 w-4" />
            ذكاء اصطناعي لتحليل الإعلانات
          </div>

          <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl">
            قرارات إعلانية
            <br />
            <span className="gradient-text">أذكى</span> مع
            <br />
            الذكاء الاصطناعي
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            ارفع تقارير منصاتك الإعلانية ودع الذكاء الاصطناعي يحلل ويتنبأ ويوصي بأفضل الاستراتيجيات لتنمية حملاتك عبر ميتا وتيك توك وجوجل وسناب شات
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg" className="gap-2 text-base">
                ابدأ مجاناً
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="outline" size="lg" className="text-base">
                تسجيل الدخول
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-20"
        >
          <div className="relative mx-auto max-w-5xl">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-2 shadow-2xl">
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-6">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {[{ label: "إجمالي الإنفاق", value: "$124,500" }, { label: "ROAS", value: "3.8x" }, { label: "الحملات النشطة", value: "24" }].map((stat) => (
                    <div key={stat.label} className="rounded-lg bg-white dark:bg-gray-900 p-4 border border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-500">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                  ))}
                </div>
                <div className="h-48 rounded-lg bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/20 dark:to-purple-800/10 flex items-center justify-center">
                  <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                    <BarChart3 className="h-8 w-8" />
                    <Brain className="h-8 w-8" />
                    <Sparkles className="h-8 w-8" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
