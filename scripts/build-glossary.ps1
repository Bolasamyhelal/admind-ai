$outputPath = "D:\Claude ai\Chats open code\DATA MB CLIENTS\admind-ai\src\lib\metrics-glossary.ts"
$content = @"
export interface GlossaryMetric {
  key: string
  category: string
  arabicName: string
  englishName: string
  aliases: string[]
  definition: string
  formula: string
  formulaExplanation: string
  whyImportant: string[]
  benchmarks: { platform: string; range: string }[]
  interpretation: { high: string; low: string }
  howToImprove: string[]
  relatedMetrics: string[]
  commonMistakes: string[]
  proTip: string
}

export type MetricCategory = "cost" | "performance" | "profitability" | "efficiency" | "engagement" | "reach"

export const categoryLabels: Record<MetricCategory, string> = {
  cost: "مقاييس التكلفة",
  performance: "مقاييس الأداء",
  profitability: "مقاييس الربحية",
  efficiency: "مقاييس الكفاءة",
  engagement: "مقاييس التفاعل",
  reach: "مقاييس الوصول",
}

export const metricsGlossary: Record<string, GlossaryMetric> = {
  spend: {
    key: "spend",
    category: "cost",
    arabicName: "إجمالي الإنفاق",
    englishName: "Total Spend",
    aliases: ["Cost", "Ad Spend", "Amount Spent", "الإنفاق", "المصاريف", "التكلفة"],
    definition: "المبلغ الإجمالي الذي تم إنفاقه على الحملات الإعلانية خلال فترة زمنية محددة. يشمل كل قرش تم دفعه للمنصة الإعلانية مقابل عرض الإعلانات. هو أساس كل حسابات الربحية والعائد على الاستثمار.",
    formula: "مجموع تكلفة جميع الإعلانات المنفذة = (سعر العطاء x عدد مرات الظهور أو النقرات) حسب نموذج التسعير",
    formulaExplanation: "يتم احتساب الإنفاق بناءً على نموذج التسعير: تكلفة لكل نقرة (CPC) أو تكلفة لكل ألف ظهور (CPM) أو تكلفة لكل اكتساب (CPA). تختلف التكلفة حسب المنافسة على الجمهور المستهدف والموسم والصناعة.",
    whyImportant: [
      "يمثل حجم الاستثمار في الإعلانات وأساس كل حسابات الربحية",
      "بدون تتبع الإنفاق لا يمكن حساب ROAS أو CPA أو أي مقياس كفاءة",
      "يساعد في تحديد الميزانية المثلى وتوزيعها على الحملات",
      "مؤشر رئيسي لقابلية التوسع (Scalability) - هل يمكننا إنفاق أكثر بنفس الكفاءة؟",
      "أساس لحساب معظم المقاييس الأخرى",
    ],
    benchmarks: [
      { platform: "Meta Ads", range: "500-50,000$ شهرياً حسب حجم النشاط" },
      { platform: "Google Ads", range: "1,000-100,000$ شهرياً حسب الكلمات المفتاحية" },
      { platform: "TikTok Ads", range: "200-20,000$ شهرياً" },
      { platform: "Snapchat Ads", range: "300-15,000$ شهرياً" },
    ],
    interpretation: {
      high: "إنفاق مرتفع = استثمار كبير. يحتاج مراقبة دقيقة للعائد. قد يكون مؤشراً على التوسع الناجح أو على حرق الميزانية بدون نتائج.",
      low: "إنفاق منخفض = قد يكون مرحلة اختبار أو ميزانية محدودة. ليس بالضرورة سيئاً إذا كان العائد جيداً.",
    },
    howToImprove: [
      "وزع الميزانية على أفضل الحملات أداءً وليس بالتساوي",
      "استخدم ميزانيات يومية (Daily Budget) بدلاً من Lifetime Budget",
      "راقب معدل حرق الميزانية - لا تستهلك الميزانية قبل نهاية اليوم",
      "حدد حد أقصى للعطاء (Bid Cap) للتحكم في التكلفة",
      "أوقف الحملات ذات الإنفاق العالي والعائد المنخفض فوراً",
    ],
    relatedMetrics: ["roas", "cpa", "cpm", "cpc", "profit"],
    commonMistakes: [
      "الخلط بين الإنفاق (Spend) والتكلفة لكل ألف ظهور (CPM) - الإنفاق هو الإجمالي وليس المعدل",
      "توزيع الميزانية بالتساوي على كل الحملات بدلاً من توجيهها للأفضل أداءً",
      "عدم تتبع الإنفاق على مستوى الكيان - لازم تعرف أي حملة تستهلك الفلوس",
    ],
    proTip: "استخدم قاعدة 80/20: 80% من ميزانيك للحملات المثبتة عالية الأداء و 20% لاختبار حملات جديدة. وراجع توزيع الميزانية أسبوعياً مش شهرياً.",
  },
}
"@
$content | Set-Content -Path $outputPath -Encoding UTF8
Write-Output "Done"
