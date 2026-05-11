"use client"

import { motion } from "framer-motion"
import { Check, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const plans = [
  {
    name: "مبتدئ",
    price: "$29",
    description: "مثالي للمستقلين ومشتري الإعلانات المنفردين",
    features: ["5 تحليلات شهرياً", "دعم منصة واحدة", "رؤى أساسية بالذكاء الاصطناعي", "دعم عبر البريد الإلكتروني"],
  },
  {
    name: "احترافي",
    price: "$79",
    popular: true,
    description: "للوكالات والفرق المتنامية",
    features: [
      "تحليلات غير محدودة",
      "دعم جميع المنصات",
      "توصيات متقدمة بالذكاء الاصطناعي",
      "تحليلات تنبؤية",
      "دعم ذو أولوية",
      "تصدير PDF",
    ],
  },
  {
    name: "مؤسسات",
    price: "$199",
    description: "للوكالات والبراندات الكبيرة",
    features: [
      "كل مزايا الاحترافي",
      "إدارة عملاء متعددين",
      "تعاون جماعي",
      "نماذج ذكاء اصطناعي مخصصة",
      "API",
      "مدير حساب مخصص",
      "تكاملات مخصصة",
    ],
  },
]

export function PricingSection() {
  return (
    <section className="relative px-6 py-24 lg:py-32">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            أسعار بسيطة وشفافة
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            اختر الخطة التي تناسب احتياجاتك. بدون رسوم خفية
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className={`relative rounded-2xl border p-8 transition-all duration-300 ${
                plan.popular
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30 shadow-xl shadow-purple-500/10"
                  : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-purple-600 px-4 py-1 text-xs font-medium text-white">
                  الأكثر طلباً
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{plan.name}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                <span className="text-gray-500">/شهرياً</span>
              </div>

              <ul className="mb-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-purple-600" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link href="/sign-up">
                <Button
                  variant={plan.popular ? "default" : "outline"}
                  className="w-full gap-2"
                >
                  ابدأ الآن
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
