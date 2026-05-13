export type Verdict = "scale_high" | "scale_medium" | "scale_low" | "optimize_creative" | "optimize_targeting" | "optimize_landing" | "optimize_bid" | "pause" | "kill" | "monitor" | "test" | "review_attribution"
export type ConfidenceLevel = "high" | "medium" | "low"
export type RiskLevel = "low" | "medium" | "high"

export interface Decision {
  entityId: string
  entityName: string
  entityType: "campaign" | "adset" | "ad"
  brandId?: string
  brandName?: string
  platform?: string
  level?: string
  currency: string

  // Metrics that drove the decision
  metrics: {
    spend: number
    revenue: number
    roas: number
    cpa: number
    ctr: number
    cpm: number
    cpc: number
    profit: number
    impressions: number
    clicks: number
    conversions: number
    conversionRate: number
    frequency: number
  }

  // The decision
  verdict: Verdict
  verdictLabel: string
  verdictDescription: string
  confidence: number // 0-100
  confidenceLevel: ConfidenceLevel
  riskLevel: RiskLevel

  // Action
  actionTitle: string
  actionSteps: string[]

  // Reasoning
  keyMetric: string
  keyMetricValue: number
  reasoning: string
  targetAfterAction?: string

  // Context
  analysisId?: string
  uploadId?: string
  createdAt?: string
}

export interface DecisionSummary {
  total: number
  scaleHigh: number
  scaleMedium: number
  scaleLow: number
  optimize: number
  pauseKill: number
  monitor: number
  monthlyBudgetOptimization: string
  potentialRevenueIncrease: string
}

const verdictMeta: Record<Verdict, { label: string; description: string; actionTitle: string }> = {
  scale_high: {
    label: "Scale Up 50%",
    description: "أداء ممتاز — حملة جاهزة لزيادة الميزانية بنسبة كبيرة",
    actionTitle: "زود الميزانية 50% خلال 3 أيام",
  },
  scale_medium: {
    label: "Scale Up 30%",
    description: "أداء جيد — حملة قابلة للتوسع بشكل معتدل",
    actionTitle: "زود الميزانية 30% وراقب الأداء",
  },
  scale_low: {
    label: "Scale Up 15%",
    description: "أداء مستقر — توسع بسيط مع مراقبة",
    actionTitle: "زود الميزانية 15% كاختبار",
  },
  optimize_creative: {
    label: "تغيير الكريتيف",
    description: "الإعلان لا يجذب التفاعل — يحتاج كريتيف جديد",
    actionTitle: "صمم إعلاناً جديداً واختبره",
  },
  optimize_targeting: {
    label: "تحسين الاستهداف",
    description: "الجمهور غير مناسب — ضيق أو وسع الاستهداف",
    actionTitle: "عدّل الجمهور المستهدف",
  },
  optimize_landing: {
    label: "تحسين الصفحة المقصودة",
    description: "نقرات كثيرة بدون تحويلات — مشكلة في الصفحة",
    actionTitle: "حسّن الصفحة المقصودة (A/B Test)",
  },
  optimize_bid: {
    label: "تحسين إستراتيجية العطاء",
    description: "التكلفة مرتفعة — تحتاج تعديل Bid Strategy",
    actionTitle: "غيير Bid Strategy إلى Cost Cap",
  },
  pause: {
    label: "إيقاف مؤقت",
    description: "أداء ضعيف — أوقف الحملة مؤقتاً للتعديل",
    actionTitle: "أوقف الحملة وحللها",
  },
  kill: {
    label: "إيقاف نهائي",
    description: "حملة خاسرة — أوقفها نهائياً وأعد توزيع الميزانية",
    actionTitle: "أوقف الحملة ووزع الميزانية على حملات أخرى",
  },
  monitor: {
    label: "مراقبة",
    description: "أداء مقبول — استمر في المراقبة دون تغيير",
    actionTitle: "تابع الأداء يومياً بدون تغيير",
  },
  test: {
    label: "اختبار",
    description: "بيانات غير كافية — اختبر بميزانية صغيرة",
    actionTitle: "شغل الحملة بميزانية اختبارية",
  },
  review_attribution: {
    label: "مراجعة التتبع",
    description: "بيانات غير منطقية — قد يكون التتبع معطلاً",
    actionTitle: "راجع بكسل التحويل وإعدادات CAPI",
  },
}

const verdictColors: Record<Verdict, { bg: string; text: string; badge: string }> = {
  scale_high: { bg: "bg-emerald-50 dark:bg-emerald-950/20", text: "text-emerald-700 dark:text-emerald-300", badge: "bg-emerald-500" },
  scale_medium: { bg: "bg-teal-50 dark:bg-teal-950/20", text: "text-teal-700 dark:text-teal-300", badge: "bg-teal-500" },
  scale_low: { bg: "bg-green-50 dark:bg-green-950/20", text: "text-green-700 dark:text-green-300", badge: "bg-green-500" },
  optimize_creative: { bg: "bg-amber-50 dark:bg-amber-950/20", text: "text-amber-700 dark:text-amber-300", badge: "bg-amber-500" },
  optimize_targeting: { bg: "bg-orange-50 dark:bg-orange-950/20", text: "text-orange-700 dark:text-orange-300", badge: "bg-orange-500" },
  optimize_landing: { bg: "bg-yellow-50 dark:bg-yellow-950/20", text: "text-yellow-700 dark:text-yellow-300", badge: "bg-yellow-500" },
  optimize_bid: { bg: "bg-amber-50 dark:bg-amber-950/20", text: "text-amber-700 dark:text-amber-300", badge: "bg-amber-500" },
  pause: { bg: "bg-red-50 dark:bg-red-950/20", text: "text-red-700 dark:text-red-300", badge: "bg-red-500" },
  kill: { bg: "bg-rose-50 dark:bg-rose-950/20", text: "text-rose-700 dark:text-rose-300", badge: "bg-rose-500" },
  monitor: { bg: "bg-blue-50 dark:bg-blue-950/20", text: "text-blue-700 dark:text-blue-300", badge: "bg-blue-500" },
  test: { bg: "bg-purple-50 dark:bg-purple-950/20", text: "text-purple-700 dark:text-purple-300", badge: "bg-purple-500" },
  review_attribution: { bg: "bg-gray-50 dark:bg-gray-800/30", text: "text-gray-700 dark:text-gray-300", badge: "bg-gray-500" },
}

interface RawMetrics {
  spend: number
  revenue: number
  roas: number
  cpa: number
  ctr: number
  cpm: number
  cpc: number
  profit: number
  impressions: number
  clicks: number
  conversions: number
  conversionRate: number
  frequency: number
  [key: string]: number
}

function parseMetrics(raw: string | null): RawMetrics | null {
  if (!raw) return null
  try {
    const p = JSON.parse(raw)
    return {
      spend: p.spend || 0, revenue: p.revenue || 0, roas: p.roas || 0,
      cpa: p.cpa || 0, ctr: p.ctr || 0, cpm: p.cpm || 0, cpc: p.cpc || 0,
      profit: p.profit || 0, impressions: p.impressions || 0, clicks: p.clicks || 0,
      conversions: p.conversions || 0, conversionRate: p.conversionRate || 0,
      frequency: p.frequency || 0,
    }
  } catch { return null }
}

function getCurrency(a: any): string {
  try { return JSON.parse(a.marketData || "{}").currency || "USD" } catch { return "USD" }
}

function getPlatform(a: any): string {
  try { return JSON.parse(a.rawData || "{}").platform || a.upload?.platform || "unknown" } catch { return "unknown" }
}

function decide(m: RawMetrics): { verdict: Verdict; confidence: number; keyMetric: string; reasoning: string } {
  // === KILL: Losing money with significant spend ===
  if (m.profit < -50 && m.spend > 100 && m.roas < 0.8) {
    return {
      verdict: "kill", confidence: 95,
      keyMetric: "profit",
      reasoning: `خسارة ${Math.abs(m.profit).toFixed(0)} — ROAS ${m.roas.toFixed(1)}x أقل من 1. الحملة بتخسر فلوس بشكل واضح.`,
    }
  }

  // === KILL: Zero conversions with significant spend + clicks ===
  if (m.conversions === 0 && m.spend >= 100 && m.clicks >= 100) {
    return {
      verdict: "kill", confidence: 90,
      keyMetric: "conversions",
      reasoning: `${m.spend.toFixed(0)} إنفاق بدون أي تحويل — مشكلة في التتبع أو الصفحة المقصودة.`,
    }
  }

  // === REVIEW ATTRIBUTION: High spend, decent clicks, zero conversions ===
  if (m.conversions === 0 && m.clicks >= 50 && m.spend >= 50) {
    return {
      verdict: "review_attribution", confidence: 80,
      keyMetric: "conversions",
      reasoning: "نقرات موجودة لكن ولا تحويل. راجع بكسل التحويل وإعدادات CAPI.",
    }
  }

  // === PAUSE: Negative profit ===
  if (m.profit < 0 && m.roas < 1.5) {
    return {
      verdict: "pause", confidence: 85,
      keyMetric: "profit",
      reasoning: `ROAS ${m.roas.toFixed(1)}x أقل من نقطة التعادل. أوقف الحملة وعدّل الاستهداف أو الكريتيف.`,
    }
  }

  // === PAUSE: High frequency ===
  if (m.frequency >= 5 && m.impressions > 0) {
    return {
      verdict: "pause", confidence: 80,
      keyMetric: "frequency",
      reasoning: `Frequency ${m.frequency.toFixed(1)} — إرهاق إعلاني شديد. جدد الكريتيف أو وسع الجمهور قبل إعادة التشغيل.`,
    }
  }

  // === OPTIMIZE CREATIVE: Low CTR with enough impressions ===
  if (m.ctr < 0.8 && m.impressions >= 2000) {
    return {
      verdict: "optimize_creative", confidence: 75,
      keyMetric: "ctr",
      reasoning: `CTR ${m.ctr.toFixed(2)}% — الإعلان لا يجذب الانتباه. غير الهوك في أول 3 ثواني وجرب Images جديدة.`,
    }
  }

  // === OPTIMIZE LANDING: Good CTR but low CVR ===
  if (m.ctr >= 1.5 && m.conversionRate < 1 && m.clicks >= 200) {
    return {
      verdict: "optimize_landing", confidence: 80,
      keyMetric: "conversionRate",
      reasoning: `CTR ${m.ctr.toFixed(1)}% ممتاز لكن CVR ${m.conversionRate.toFixed(1)}% ضعيف. الصفحة المقصودة هي المشكلة.`,
    }
  }

  // === OPTIMIZE TARGETING: High impressions, very low CTR ===
  if (m.impressions >= 10000 && m.ctr < 0.5) {
    return {
      verdict: "optimize_targeting", confidence: 85,
      keyMetric: "ctr",
      reasoning: `${m.impressions.toLocaleString()} ظهور و CTR ${m.ctr.toFixed(2)}% — الجمهور مش مناسب للإعلان. ضيق الاستهداف.`,
    }
  }

  // === OPTIMIZE BID: High CPM/CPC with reasonable CTR ===
  if (m.cpm >= 25 && m.ctr >= 1 && m.impressions > 0) {
    return {
      verdict: "optimize_bid", confidence: 65,
      keyMetric: "cpm",
      reasoning: `CPM ${m.cpm.toFixed(2)} — مكلف مقارنة بـ CTR ${m.ctr.toFixed(1)}%. جرب Cost Cap Bid بدلاً من Highest Volume.`,
    }
  }

  // === OPTIMIZE TARGETING: High CPA > 100 ===
  if (m.cpa > 100 && m.conversions > 0) {
    return {
      verdict: "optimize_targeting", confidence: 70,
      keyMetric: "cpa",
      reasoning: `CPA ${m.cpa.toFixed(2)} — مرتفع جداً. ضيق الاستهداف أو جرب Lookalike Audience.`,
    }
  }

  // === MONITOR: Decent performance, mid-range ===
  if (m.roas >= 1.5 && m.roas < 3 && m.frequency < 4) {
    return {
      verdict: "monitor", confidence: 70,
      keyMetric: "roas",
      reasoning: `ROAS ${m.roas.toFixed(1)}x — أداء مقبول. استمر في المراقبة دون تغيير.`,
    }
  }

  // === MONITOR: Low spend, not enough data ===
  if (m.spend < 50) {
    return {
      verdict: "monitor", confidence: 60,
      keyMetric: "spend",
      reasoning: `الإنفاق ${m.spend.toFixed(2)} فقط — البيانات غير كافية لاتخاذ قرار. انتظر المزيد من البيانات.`,
    }
  }

  // === SCALE HIGH: Excellent ROAS + good CPA + enough conversions ===
  if (m.roas >= 4 && m.cpa < 50 && m.conversions >= 10) {
    return {
      verdict: "scale_high", confidence: 92,
      keyMetric: "roas",
      reasoning: `ROAS ${m.roas.toFixed(1)}x — أداء استثنائي. الحملة مؤهلة لتوسع كبير.`,
    }
  }

  // === SCALE MEDIUM: Good ROAS ===
  if (m.roas >= 3 && m.conversions >= 5) {
    return {
      verdict: "scale_medium", confidence: 85,
      keyMetric: "roas",
      reasoning: `ROAS ${m.roas.toFixed(1)}x — أداء قوي. توسع معتدل مع مراقبة.`,
    }
  }

  // === SCALE LOW: Low CPA + enough conversions ===
  if (m.cpa > 0 && m.cpa < 30 && m.conversions >= 5) {
    return {
      verdict: "scale_low", confidence: 80,
      keyMetric: "cpa",
      reasoning: `CPA ${m.cpa.toFixed(2)} — تكلفة اكتساب ممتازة. توسع بسيط لاختبار السعة.`,
    }
  }

  // === TEST: Low spend, some data ===
  if (m.spend > 0 && m.conversions > 0 && m.roas >= 1) {
    return {
      verdict: "test", confidence: 50,
      keyMetric: "spend",
      reasoning: `بيانات أولية إيجابية (ROAS ${m.roas.toFixed(1)}x). زد الميزانية 15-20% لاختبار الجدوى.`,
    }
  }

  // Default: monitor
  return {
    verdict: "monitor", confidence: 40,
    keyMetric: "roas",
    reasoning: "لا توجد إشارة واضحة. استمر في المراقبة.",
  }
}

export function analyzeEntityDecision(
  metrics: RawMetrics,
  currency: string,
  entityName: string,
  entityType: "campaign" | "adset" | "ad",
  brandName?: string,
  platform?: string,
  brandId?: string,
  analysisId?: string
): Decision {
  const result = decide(metrics)
  const vm = verdictMeta[result.verdict]
  const targetValue = result.verdict.startsWith("scale")
    ? `زيادة الإنفاق إلى ${(metrics.spend * (result.verdict === "scale_high" ? 1.5 : result.verdict === "scale_medium" ? 1.3 : 1.15)).toFixed(0)}`
    : result.verdict === "optimize_landing"
    ? `CVR > 3%`
    : result.verdict === "optimize_creative"
    ? `CTR > 1.5%`
    : result.verdict === "kill" || result.verdict === "pause"
    ? `إيقاف الخسائر`
    : undefined

  return {
    entityId: `${entityName}-${entityType}-${Date.now()}`,
    entityName,
    entityType,
    brandId,
    brandName,
    platform,
    currency,
    metrics: { ...metrics },
    verdict: result.verdict,
    verdictLabel: vm.label,
    verdictDescription: vm.description,
    confidence: result.confidence,
    confidenceLevel: result.confidence >= 80 ? "high" : result.confidence >= 60 ? "medium" : "low",
    riskLevel: result.verdict === "scale_high" || result.verdict === "scale_medium" ? "medium" : result.verdict === "kill" || result.verdict === "pause" ? "low" : "high",
    actionTitle: vm.actionTitle,
    actionSteps: getActionSteps(result.verdict, metrics),
    keyMetric: result.keyMetric,
    keyMetricValue: metrics[result.keyMetric] || 0,
    reasoning: result.reasoning,
    targetAfterAction: targetValue,
    analysisId,
  }
}

function getActionSteps(verdict: Verdict, m: RawMetrics): string[] {
  const steps: Record<Verdict, string[]> = {
    scale_high: [
      `زود الميزانية اليومية بنسبة 30% اليوم`,
      `بعد 3 أيام، زد 20% إضافية إذا استقر ROAS`,
      `أنشئ Lookalike Audience من تحويلات هذه الحملة`,
      `وسع الاستهداف بدول أو ديموغرافيات جديدة`,
      `احتفظ بنفس الكريتيف — الإعلان يعمل`,
    ],
    scale_medium: [
      `زود الميزانية 20% وراقب الأداء 3 أيام`,
      `إذا استقر ROAS > 2.5x، زد 10% إضافية`,
      `اختبر نفس الكريتيف على جمهور جديد`,
      `راقب Frequency لا يتجاوز 3`,
    ],
    scale_low: [
      `زود الميزانية 15% كاختبار`,
      `راقب CPA و ROAS يومياً`,
      `إذا تحسنت النتائج، زد 10% إضافية`,
      `لا تغير الكريتيف أو الاستهداف حالياً`,
    ],
    optimize_creative: [
      `صمم 3-5 إعلانات جديدة بهوك مختلف`,
      `اختبر Pattern Interrupts في أول 3 ثواني`,
      `جرب صيغ مختلفة: سؤال، عرض، نتيجة مفاجئة`,
      `اختبر A/B Testing بين الإعلان القديم والجديد`,
    ],
    optimize_targeting: [
      `حلل أي الشرائح تحقق أفضل أداء`,
      `ضيق الاستهداف بإضافة اهتمامات محددة`,
      `جرب Lookalike Audience 1% من أفضل العملاء`,
      `استبعد الجماهير غير المتفاعلة`,
    ],
    optimize_landing: [
      `اختبر A/B Testing للصفحة المقصودة`,
      `بسط عملية الدفع — أقل خطوات ممكنة`,
      `أضف Social Proof: تقييمات وشهادات عملاء`,
      `حسن سرعة الصفحة — كل ثانية تأخير تفقد 7%`,
    ],
    optimize_bid: [
      `حول Bid Strategy إلى Cost Cap`,
      `حدد Cost Cap بـ ${m.cpa > 0 ? Math.round(m.cpa * 0.8) : '…'} كحد أقصى للـ CPA`,
      `راقب لمدة 3 أيام — إذا تحسن، استمر`,
    ],
    pause: [
      `أوقف الحملة فوراً`,
      `حلل الأسباب: استهداف، إعلان، صفحة، تتبع`,
      `عدّل المشكلة وأعد التشغيل بميزانية صغيرة`,
      `إذا تكررت المشكلة، أوقف الحملة نهائياً`,
    ],
    kill: [
      `أوقف الحملة فوراً ووزع الميزانية`,
      `حلل سبب الخسارة لتجنبها مستقبلاً`,
      `وجه الميزانية للحملات ذات ROAS > 3x`,
      `لا تعيد تشغيل نفس الحملة بدون تغيير جذري`,
    ],
    monitor: [
      `استمر في المراقبة اليومية`,
      `لا تغير أي شيء في الوقت الحالي`,
      `إذا انخفض الأداء 20%، تدخل فوراً`,
      `سجل ملاحظات الأداء لمرجع مستقبلي`,
    ],
    test: [
      `زود الميزانية 15-20% كاختبار`,
      `راقب ROAS و CPA بعناية`,
      `إذا تحسن الأداء، طبق verdict أعلى`,
      `إذا ساء الأداء، عد إلى الميزانية الأصلية`,
    ],
    review_attribution: [
      `تأكد من تثبيت بكسل التحويل بشكل صحيح`,
      `افتح الموقع واختبر البكسل يدوياً`,
      `راجع إعدادات CAPI (Conversions API)`,
      `اختبر إرسال حدث Test Event من Meta Events Manager`,
    ],
  }
  return steps[verdict] || ["تابع المراقبة"]
}

export function getVerdictMeta(v: Verdict) { return verdictMeta[v] }
export function getVerdictColors(v: Verdict) { return verdictColors[v] }

export function getVerdictScore(v: Verdict): number {
  const order = ["kill", "pause", "optimize_landing", "optimize_creative", "optimize_targeting", "optimize_bid", "review_attribution", "monitor", "test", "scale_low", "scale_medium", "scale_high"]
  return order.indexOf(v)
}

export function analyzeAllEntities(analyses: any[], brands: any[]): Decision[] {
  const brandMap = new Map(brands.map(b => [b.id, b]))
  const decisions: Decision[] = []

  for (const a of analyses) {
    const m = parseMetrics(a.metrics)
    if (!m || m.spend <= 0) continue
    const brand = brandMap.get(a.brandId)
    const currency = getCurrency(a)
    const platform = getPlatform(a)
    const entityType = (a.level === "adset" ? "adset" : a.level === "ad" ? "ad" : "campaign") as "campaign" | "adset" | "ad"

    let entityName = a.title || ""
    // Try to get individual entity names from breakdown
    try {
      const rd = JSON.parse(a.rawData || "{}")
      const breakdown = rd.breakdown
      if (breakdown && typeof breakdown === "object" && !Array.isArray(breakdown)) {
        const entityNames = Object.keys(breakdown)
        if (entityNames.length > 0) {
          for (const ename of entityNames) {
            const em = breakdown[ename]
            if (em && typeof em === "object") {
              const entityMetrics: RawMetrics = {
                spend: em.spend || 0, revenue: em.revenue || 0, roas: em.roas || 0,
                cpa: em.cpa || 0, ctr: em.ctr || 0, cpm: em.cpm || 0, cpc: em.cpc || 0,
                profit: em.profit || 0, impressions: em.impressions || 0, clicks: em.clicks || 0,
                conversions: em.conversions || 0, conversionRate: em.conversionRate || 0,
                frequency: em.frequency || 0,
              }
              if (entityMetrics.spend > 0) {
                decisions.push(analyzeEntityDecision(entityMetrics, currency, ename, entityType, brand?.name, platform, a.brandId, a.id))
              }
            }
          }
          continue // skip the aggregate
        }
      }
    } catch {}

    // Fallback: use aggregate metrics
    decisions.push(analyzeEntityDecision(m, currency, entityName, entityType, brand?.name, platform, a.brandId, a.id))
  }

  // Sort by verdict priority (worst first)
  decisions.sort((a, b) => getVerdictScore(a.verdict) - getVerdictScore(b.verdict))
  return decisions
}

export function summarizeDecisions(decisions: Decision[]): DecisionSummary {
  const scaleHigh = decisions.filter(d => d.verdict === "scale_high").length
  const scaleMedium = decisions.filter(d => d.verdict === "scale_medium").length
  const scaleLow = decisions.filter(d => d.verdict === "scale_low").length
  const optimize = decisions.filter(d => d.verdict.startsWith("optimize_") || d.verdict === "review_attribution").length
  const pauseKill = decisions.filter(d => d.verdict === "pause" || d.verdict === "kill").length
  const monitor = decisions.filter(d => d.verdict === "monitor" || d.verdict === "test").length

  const totalScaleBudget = decisions
    .filter(d => d.verdict.startsWith("scale_"))
    .reduce((s, d) => s + d.metrics.spend, 0)

  const wastedBudget = decisions
    .filter(d => d.verdict === "kill" || d.verdict === "pause")
    .reduce((s, d) => s + d.metrics.spend, 0)

  const potentialRevenue = totalScaleBudget * 3 // conservative estimate

  return {
    total: decisions.length,
    scaleHigh,
    scaleMedium,
    scaleLow,
    optimize,
    pauseKill,
    monitor,
    monthlyBudgetOptimization: `${(wastedBudget).toFixed(0)}`,
    potentialRevenueIncrease: `${(potentialRevenue).toFixed(0)}`,
  }
}
