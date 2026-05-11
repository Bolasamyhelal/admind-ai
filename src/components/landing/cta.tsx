"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="relative px-6 py-24 lg:py-32">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-800" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15),transparent_50%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative mx-auto max-w-4xl text-center"
      >
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white">
          <Sparkles className="h-4 w-4" />
          انضم إلى أكثر من 500 مشتري إعلانات
        </div>

        <h2 className="text-4xl font-bold text-white sm:text-5xl">
          مستعد لتطوير أداء
          <br />
          حملاتك الإعلانية؟
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-purple-100">
          توقف عن التخمين. ابدأ في التوسع برؤى مدعومة بالذكاء الاصطناعي. ارفع تقريرك الأول واحصل على توصيات قابلة للتنفيذ في ثوانٍ
        </p>

        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/sign-up">
            <Button
              size="lg"
              className="gap-2 bg-white text-purple-700 hover:bg-purple-50 text-base"
            >
              ابدأ النسخة التجريبية
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button
              variant="outline"
              size="lg"
              className="border-white/20 text-white hover:bg-white/10 text-base"
            >
              تسجيل الدخول
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  )
}
