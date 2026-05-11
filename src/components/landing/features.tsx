"use client"

import { motion } from "framer-motion"
import { 
  Upload, Brain, BarChart3, TrendingUp, Target, 
  AlertTriangle, MessageSquare, Globe, Zap, 
  Shield, PieChart, Download 
} from "lucide-react"

const features = [
  { icon: Upload, title: "رفع متعدد المنصات", description: "ارفع تقارير من ميتا وتيك توك وجوجل وسناب شات — نقوم بتحليل جميع الصيغ تلقائياً" },
  { icon: Brain, title: "تحليل بالذكاء الاصطناعي", description: "تحليل عميق لكل مؤشر مع شروحات سياقية ورؤى قابلة للتنفيذ" },
  { icon: TrendingUp, title: "تحليلات تنبؤية", description: "توقع CPA و ROAS ونقاط التشبع عند زيادة الميزانيات" },
  { icon: Target, title: "توصيات ذكية", description: "احصل على قرارات إيقاف/نسخ/توسيع مدعومة بالذكاء الاصطناعي" },
  { icon: AlertTriangle, title: "تنبيهات فورية", description: "تنبيهات ذكية عندما تتجاوز المؤشرات الحدود الحرجة مثل ارتفاع CPA أو انخفاض CTR" },
  { icon: MessageSquare, title: "مساعد ذكي", description: "اسأل عن بياناتك بلغة طبيعية واحصل على إجابات فورية" },
  { icon: Globe, title: "كشف السوق", description: "كشف تلقائي لسوقك المستهدف من بيانات الحملة ومقارنتها بالمؤشرات القياسية" },
  { icon: PieChart, title: "تحليلات بصرية", description: "رسوم بيانية ومخططات متدفقة وخرائط حرارية لتصور أداء الحملات" },
  { icon: Shield, title: "تقارير تاريخية", description: "احفظ وقارن التحليلات عبر الفترات الزمنية لتتبع اتجاهات الأداء" },
  { icon: Zap, title: "استراتيجيات التوسع", description: "يوصي الذكاء الاصطناعي بأساليب التوسع الأفقي والرأسي وزيادة الميزانية" },
  { icon: BarChart3, title: "مقارنات السوق", description: "قارن مؤشراتك بمتوسطات الصناعة لسوقك" },
  { icon: Download, title: "تصدير ومشاركة", description: "صدّر التقارير كـ PDF وشارك عبر واتساب أو أرسل تنبيهات تلغرام" },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export function FeaturesSection() {
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
            كل ما يحتاجه مشتري الإعلانات
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            من رفع البيانات إلى القرارات الاستراتيجية — أسرع من أي وقت مضى
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 transition-all duration-300 hover:border-purple-200 dark:hover:border-purple-800 hover:shadow-lg hover:shadow-purple-500/5"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
