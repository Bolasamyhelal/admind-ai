export type OpportunityType = "scale" | "optimize" | "kill" | "explore"
export type OpportunityPriority = "high" | "medium" | "low"
export type OpportunityCategory = "budget" | "audience" | "creative" | "placement" | "conversion" | "strategy"

export interface GrowthOpportunity {
  id: string
  type: OpportunityType
  priority: OpportunityPriority
  category: OpportunityCategory
  title: string
  description: string
  metricKey: string
  currentValue: number
  targetValue?: number
  potentialImpact: string
  actionItems: string[]
  brandId?: string
  brandName?: string
  analysisId?: string
  platform?: string
  level?: string
  currency?: string
  entityName?: string
}

export interface GrowthSummary {
  totalOpportunities: number
  scalingOpportunities: number
  optimizeOpportunities: number
  killOpportunities: number
  exploreOpportunities: number
  totalPotentialGrowth: string
  totalAtRisk: string
  brandsAnalyzed: number
  campaignsAnalyzed: number
}

export interface GrowthAnalysisResult {
  summary: GrowthSummary
  opportunities: GrowthOpportunity[]
  brandBreakdown: {
    brandId: string
    brandName: string
    opportunities: number
    topMetric: string
    health: "good" | "warning" | "critical"
  }[]
}

interface ParsedMetrics {
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

function parseMetrics(raw: string | null): ParsedMetrics | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    return {
      spend: parsed.spend || 0,
      revenue: parsed.revenue || 0,
      roas: parsed.roas || 0,
      cpa: parsed.cpa || 0,
      ctr: parsed.ctr || 0,
      cpm: parsed.cpm || 0,
      cpc: parsed.cpc || 0,
      profit: parsed.profit || 0,
      impressions: parsed.impressions || 0,
      clicks: parsed.clicks || 0,
      conversions: parsed.conversions || 0,
      conversionRate: parsed.conversionRate || 0,
      frequency: parsed.frequency || 0,
    }
  } catch {
    return null
  }
}

function getCurrency(analysis: any): string {
  try {
    const md = JSON.parse(analysis.marketData || "{}")
    return md.currency || "USD"
  } catch {
    return "USD"
  }
}

function getPlatform(analysis: any): string {
  try {
    const rd = JSON.parse(analysis.rawData || "{}")
    return rd.platform || analysis.upload?.platform || "unknown"
  } catch {
    return analysis.upload?.platform || "unknown"
  }
}

let oppCounter = 0
function nextId(): string {
  oppCounter++
  return `opp_${oppCounter}`
}

export function analyzeGrowthOpportunities(
  brands: any[],
  analyses: any[]
): GrowthAnalysisResult {
  oppCounter = 0
  const opportunities: GrowthOpportunity[] = []
  const brandMap = new Map<string, any>()
  for (const b of brands) brandMap.set(b.id, b)

  // Group analyses by brand
  const brandAnalyses = new Map<string, any[]>()
  const allAnalyses: any[] = []

  for (const a of analyses) {
    allAnalyses.push(a)
    const bid = a.brandId || "no-brand"
    if (!brandAnalyses.has(bid)) brandAnalyses.set(bid, [])
    brandAnalyses.get(bid)!.push(a)
  }

  // Analyze each brand's campaigns
  for (const [bid, brandAnals] of brandAnalyses) {
    const brand = brandMap.get(bid)
    const brandName = brand?.name || "بدون براند"

    for (const a of brandAnals) {
      const m = parseMetrics(a.metrics)
      if (!m) continue
      const currency = getCurrency(a)
      const platform = getPlatform(a)
      const level = a.level || "campaign"

      // Get entity name from rawData
      let entityName = a.title || ""
      try {
        const rd = JSON.parse(a.rawData || "{}")
        const breakdown = rd.breakdown
        if (breakdown && typeof breakdown === "object") {
          entityName = Object.keys(breakdown).join(", ")
        }
      } catch {}

      // ===== SCALE Opportunities =====
      // 1. High ROAS - Ready to scale
      if (m.roas >= 3 && m.spend > 0 && m.conversions >= 5) {
        const scaleBudget = m.spend * 0.5
        opportunities.push({
          id: nextId(),
          type: "scale",
          priority: m.roas >= 5 ? "high" : "medium",
          category: "budget",
          title: `فرصة توسع — ${brandName}`,
          description: `ROAS ${m.roas.toFixed(1)}x — أداء ممتاز، مؤهل للتوسع. الحملة تحقق عائداً قوياً ومن المستحسن زيادة الميزانية.`,
          metricKey: "roas",
          currentValue: m.roas,
          targetValue: m.roas * 0.85,
          potentialImpact: `زيادة الميزانية بنسبة 50% (${formatNum(scaleBudget, currency)}) قد يحقق ${formatNum(m.revenue * 0.4, currency)} إيرادات إضافية`,
          actionItems: [
            `زود الميزانية اليومية بنسبة 20-30% كاختبار`,
            `راقب ROAS و CPA بعد التوسع — من المتوقع انخفاض 10-15%`,
            `إذا استقر الأداء بعد 3 أيام، زد 20% إضافية`,
            `أنشئ حملة Lookalike Audience بناءً على تحويلات هذه الحملة`,
            `وسع الاستهداف بديموغرافيات مشابهة`,
          ],
          brandId: bid, brandName, analysisId: a.id, platform, level, currency, entityName,
        })
      }

      // 2. Low CPA - Efficient acquisition
      if (m.cpa > 0 && m.cpa < 30 && m.conversions >= 10) {
        opportunities.push({
          id: nextId(),
          type: "scale",
          priority: "high",
          category: "budget",
          title: `تكلفة اكتساب منخفضة — ${brandName}`,
          description: `CPA ${m.cpa.toFixed(2)} — تكلفة اكتساب منخفضة جداً. فرصة ممتازة لزيادة الميزانية وجذب المزيد من العملاء بنفس الكفاءة.`,
          metricKey: "cpa",
          currentValue: m.cpa,
          targetValue: m.cpa * 1.3,
          potentialImpact: `الميزانية الحالية ${formatNum(m.spend, currency)} يمكن زيادتها إلى ${formatNum(m.spend * 2, currency)} مع استهداف مضاعفة التحويلات`,
          actionItems: [
            `ضاعف الميزانية بشكل تدريجي (20-30% كل 3 أيام)`,
            `أنشئ حملة Retargeting للزوار السابقين`,
            `اختبر جماهير جديدة مشابهة (Lookalike)`,
            `وسع الحملة لدول أو مناطق جديدة في الاستهداف`,
            `احتفظ بنفس الكريتيف — الإعلانات تعمل بكفاءة`,
          ],
          brandId: bid, brandName, analysisId: a.id, platform, level, currency, entityName,
        })
      }

      // 3. High CTR with low spend - Good creative, needs more budget
      if (m.ctr >= 2 && m.spend < 100 && m.impressions > 0) {
        opportunities.push({
          id: nextId(),
          type: "scale",
          priority: "medium",
          category: "creative",
          title: `إعلان جذاب بميزانية محدودة — ${brandName}`,
          description: `CTR ${m.ctr.toFixed(1)}% — الإعلان يحقق تفاعل ممتاز لكن الميزانية ${formatNum(m.spend, currency)} منخفضة. زيادة الميزانية ستضاعف النتائج.`,
          metricKey: "ctr",
          currentValue: m.ctr,
          targetValue: m.ctr * 0.8,
          potentialImpact: `زيادة الميزانية 3 أضعاف قد تحقق ${formatNum(m.revenue * 2, currency)} إيرادات إضافية`,
          actionItems: [
            `زود الميزانية اليومية إلى 3 أضعاف`,
            `حافظ على نفس الإعلان — الكريتيف ناجح`,
            `راقب Frequency — لا يتجاوز 3`,
            `وسع الجمهور مع الحفاظ على نفس الاستهداف`,
            `اختبر نسخ مشابهة من الإعلان في حملات منفصلة`,
          ],
          brandId: bid, brandName, analysisId: a.id, platform, level, currency, entityName,
        })
      }

      // ===== OPTIMIZE Opportunities =====
      // 4. Medium ROAS - Needs optimization
      if (m.roas >= 1.5 && m.roas < 3 && m.spend > 0) {
        opportunities.push({
          id: nextId(),
          type: "optimize",
          priority: m.roas < 2 ? "high" : "medium",
          category: "strategy",
          title: `تحسين ROAS — ${brandName}`,
          description: `ROAS ${m.roas.toFixed(1)}x — أداء متوسط يحتاج تحسين. الحملة غير خاسرة لكنها دون المستوى المطلوب للتوسع.`,
          metricKey: "roas",
          currentValue: m.roas,
          targetValue: 3,
          potentialImpact: `تحسين ROAS إلى 3x يعني ${formatNum(m.revenue * (3 / m.roas - 1), currency)} إيرادات إضافية`,
          actionItems: [
            `حلل الجمهور المستهدف — قد تحتاج تضييقه`,
            `اختبر كريتيف جديد — الهوك الحالي قد لا يكون الأفضل`,
            `حسن الصفحة المقصودة — اختبر A/B Testing`,
            `راجع إعدادات العطاء (Bid Strategy)`,
            `أوقف الكلمات المفتاحية أو الجماهير غير المربحة`,
          ],
          brandId: bid, brandName, analysisId: a.id, platform, level, currency, entityName,
        })
      }

      // 5. High frequency - Ad fatigue
      if (m.frequency >= 4 && m.impressions > 0) {
        opportunities.push({
          id: nextId(),
          type: "optimize",
          priority: m.frequency >= 5 ? "high" : "medium",
          category: "audience",
          title: `إرهاق إعلاني — ${brandName}`,
          description: `Frequency ${m.frequency.toFixed(1)} — الجمهور يشاهد الإعلان بكثرة. الأداء سينخفض والتكاليف سترتفع قريباً.`,
          metricKey: "frequency",
          currentValue: m.frequency,
          targetValue: 3,
          potentialImpact: `تجديد الكريتيف وتوسيع الجمهور قد يحسن CTR و CPA بنسبة 20-40%`,
          actionItems: [
            `جدد الكريتيف فوراً — غير الصورة والفيديو والنص`,
            `وسع الجمهور المستهدف إلى شرائح جديدة`,
            `استخدم Frequency Capping (حد أقصى 2 ظهور لكل شخص يومياً)`,
            `أنشئ حملة جديدة بجمهور مختلف بدلاً من التوسع على نفس الجمهور`,
            `حول الميزانية إلى حملات أخرى ذات Frequency أقل`,
          ],
          brandId: bid, brandName, analysisId: a.id, platform, level, currency, entityName,
        })
      }

      // 6. Low CTR - Creative problem
      if (m.ctr < 1 && m.impressions >= 1000) {
        opportunities.push({
          id: nextId(),
          type: "optimize",
          priority: m.ctr < 0.5 ? "high" : "medium",
          category: "creative",
          title: `تحسين الإعلان — ${brandName}`,
          description: `CTR ${m.ctr.toFixed(2)}% — نسبة نقر منخفضة. الإعلان لا يجذب انتباه الجمهور المستهدف.`,
          metricKey: "ctr",
          currentValue: m.ctr,
          targetValue: 2,
          potentialImpact: `رفع CTR من ${m.ctr.toFixed(1)}% إلى 2% قد يضاعف النقرات والتحويلات`,
          actionItems: [
            `أعد تصميم الهوك — أول 3 ثواني هي الأهم في الفيديو`,
            `اختبر 3-5 إعلانات جديدة بنصوص وصور مختلفة`,
            `حسن الاستهداف — الجمهور غير المناسب يخفض CTR`,
            `استخدم Pattern Interrupts: حركة، سؤال، أو عرض مفاجئ`,
            `اختبر Call-to-Action مختلف — "اشتر الآن" vs "اعرف المزيد"`,
          ],
          brandId: bid, brandName, analysisId: a.id, platform, level, currency, entityName,
        })
      }

      // 7. High CPA - Inefficient acquisition
      if (m.cpa > 80 && m.conversions > 0) {
        opportunities.push({
          id: nextId(),
          type: "optimize",
          priority: m.cpa > 150 ? "high" : "medium",
          category: "conversion",
          title: `تكلفة اكتساب مرتفعة — ${brandName}`,
          description: `CPA ${m.cpa.toFixed(2)} — تكلفة اكتساب عالية. تحتاج تحسين مسار التحويل والاستهداف.`,
          metricKey: "cpa",
          currentValue: m.cpa,
          targetValue: Math.max(m.cpa * 0.5, 30),
          potentialImpact: `خفض CPA للنصف = ضعف عدد التحويلات بنفس الميزانية (${formatNum(m.spend, currency)})`,
          actionItems: [
            `حلل مسار التحويل بالكامل — أين يفقد العملاء؟`,
            `حسن الصفحة المقصودة — اختبر A/B Testing`,
            `حسن الاستهداف — جمهور أضيق وأكثر نية`,
            `جرب نوع إعلان مختلف (فيديو مقابل صورة)`,
            `حسن سرعة الموقع — كل ثانية تأخير تفقد 7% تحويلات`,
          ],
          brandId: bid, brandName, analysisId: a.id, platform, level, currency, entityName,
        })
      }

      // ===== KILL Opportunities =====
      // 8. Negative profit - Losing money
      if (m.profit < 0 && m.spend > 0) {
        opportunities.push({
          id: nextId(),
          type: "kill",
          priority: "high",
          category: "budget",
          title: `حملة خاسرة — ${brandName}`,
          description: `خسارة ${formatNum(Math.abs(m.profit), currency)} — الحملة بتخسر فلوس. ROAS ${m.roas.toFixed(1)}x أقل من نقطة التعادل.`,
          metricKey: "profit",
          currentValue: m.profit,
          targetValue: 0,
          potentialImpact: `إيقاف الحملة يوفر ${formatNum(m.spend, currency)} شهرياً يمكن توجيهه لحملات مربحة`,
          actionItems: [
            `أوقف الحملة فوراً أو علّقها مؤقتاً`,
            `حلل سبب الخسارة: استهداف خطأ؟ إعلان ضعيف؟ صفحة سيئة؟`,
            `راجع التسعير — قد يكون المنتج أغلى من السوق`,
            `اختبر حملة جديدة بنفس الكريتيف وجمهور مختلف`,
            `إذا لم يتحسن الأداء بعد التعديلات، أوقف الحملة نهائياً`,
          ],
          brandId: bid, brandName, analysisId: a.id, platform, level, currency, entityName,
        })
      }

      // 9. Zero conversions - Wasted spend
      if (m.conversions === 0 && m.spend >= 50 && m.clicks >= 50) {
        opportunities.push({
          id: nextId(),
          type: "kill",
          priority: "high",
          category: "conversion",
          title: `بدون تحويلات — ${brandName}`,
          description: `${formatNum(m.spend, currency)} إنفاق بدون أي تحويل. المشكلة على الأرجح في الصفحة المقصودة أو مسار التحويل.`,
          metricKey: "conversions",
          currentValue: 0,
          targetValue: 1,
          potentialImpact: `إيقاف الحملة يوفر ${formatNum(m.spend, currency)}. إصلاح الصفحة المقصودة قد يحول الزوار الحاليين`,
          actionItems: [
            `أوقف الحملة فوراً لحين إصلاح المشكلة`,
            `اختبر الصفحة المقصودة يدوياً — هل تعمل؟ هل البيكسل مثبت؟`,
            `تأكد من تتبع التحويل — قد يكون البيكسل معطلاً`,
            `حسن الصفحة المقصودة وأعد تشغيل الحملة بميزانية صغيرة`,
            `إذا استمرت المشكلة، غيّر العرض أو الجمهور`,
          ],
          brandId: bid, brandName, analysisId: a.id, platform, level, currency, entityName,
        })
      }

      // ===== EXPLORE Opportunities =====
      // 10. High impressions, low CTR - Audience mismatch
      if (m.impressions >= 10000 && m.ctr < 0.8) {
        opportunities.push({
          id: nextId(),
          type: "explore",
          priority: "medium",
          category: "audience",
          title: `جمهور غير مناسب — ${brandName}`,
          description: `${m.impressions.toLocaleString()} ظهور و CTR ${m.ctr.toFixed(1)}% فقط — الإعلان يصل لناس غير مهتمين.`,
          metricKey: "ctr",
          currentValue: m.ctr,
          targetValue: 2,
          potentialImpact: `تحسين الاستهداف لتضييق الجمهور قد يرفع CTR 3 أضعاف ويخفض CPM`,
          actionItems: [
            `ضيق الاستهداف — أضف معايير أكثر تحديداً`,
            `استخدم جماهير مخصصة (Custom Audiences) بناءً على زوار الموقع`,
            `حلل أي الشرائح تحقق أعلى تفاعل وركز عليها`,
            `اختبر استهداف مختلف تماماً — الجمهور الحالي غير مناسب`,
            `استخدم Exclusion Lists لاستبعاد الزوار غير المهتمين`,
          ],
          brandId: bid, brandName, analysisId: a.id, platform, level, currency, entityName,
        })
      }

      // 11. High CPM - Expensive market
      if (m.cpm >= 20 && m.impressions > 0) {
        opportunities.push({
          id: nextId(),
          type: "explore",
          priority: "low",
          category: "placement",
          title: `CPM مرتفع — ${brandName}`,
          description: `CPM ${m.cpm.toFixed(2)} — سوق مكلف. المنافسة عالية على الجمهور المستهدف.`,
          metricKey: "cpm",
          currentValue: m.cpm,
          targetValue: Math.max(m.cpm * 0.6, 10),
          potentialImpact: `خفض CPM إلى ${(m.cpm * 0.6).toFixed(1)} يوفر 40% من تكلفة الوصول`,
          actionItems: [
            `اختبر Placements مختلفة — Stories قد يكون أرخص من Feed`,
            `حسن Relevance Score — الإعلانات عالية الجودة تحصل على CPM أقل`,
            `جرب منصة إعلانية أخرى — تيك توك غالباً أرخص`,
            `حسن توقيت الإعلانات — بعض الأوقات أقل تكلفة`,
            `وسع الجمهور — الجمهور الأكبر عادة أقل CPM`,
          ],
          brandId: bid, brandName, analysisId: a.id, platform, level, currency, entityName,
        })
      }
    }
  }

  // Sort: high priority first, then by type order
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  const typeOrder = { kill: 0, optimize: 1, scale: 2, explore: 3 }
  opportunities.sort((a, b) => {
    const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
    if (pDiff !== 0) return pDiff
    return typeOrder[a.type] - typeOrder[b.type]
  })

  // Brand breakdown
  const brandBreakdown = Array.from(brandAnalyses.entries()).map(([bid, anals]) => {
    const brand = brandMap.get(bid)
    const brandOpps = opportunities.filter(o => o.brandId === bid)
    const metrics = anals.map(a => parseMetrics(a.metrics)).filter(Boolean) as ParsedMetrics[]
    const avgROAS = metrics.reduce((s, m) => s + m.roas, 0) / (metrics.length || 1)
    const health: "good" | "warning" | "critical" = avgROAS >= 3 ? "good" : avgROAS >= 1.5 ? "warning" : "critical"
    const topMetric = avgROAS >= 3 ? `ROAS ${avgROAS.toFixed(1)}x` : avgROAS >= 1.5 ? `ROAS ${avgROAS.toFixed(1)}x` : `خسارة`
    return {
      brandId: bid,
      brandName: brand?.name || "بدون براند",
      opportunities: brandOpps.length,
      topMetric,
      health,
    }
  })

  const scaleOpps = opportunities.filter(o => o.type === "scale")
  const optimizeOpps = opportunities.filter(o => o.type === "optimize")
  const killOpps = opportunities.filter(o => o.type === "kill")
  const exploreOpps = opportunities.filter(o => o.type === "explore")

  const totalPotentialGrowth = opportunities
    .filter(o => o.type === "scale")
    .reduce((s, o) => {
      const match = o.potentialImpact.match(/[\d,.]+/)
      return s + (match ? parseFloat(match[0].replace(/,/g, "")) : 0)
    }, 0)

  const totalAtRisk = opportunities
    .filter(o => o.type === "kill" || o.type === "optimize")
    .reduce((s, o) => s + Math.abs(o.currentValue), 0)

  return {
    summary: {
      totalOpportunities: opportunities.length,
      scalingOpportunities: scaleOpps.length,
      optimizeOpportunities: optimizeOpps.length,
      killOpportunities: killOpps.length,
      exploreOpportunities: exploreOpps.length,
      totalPotentialGrowth: formatNum(totalPotentialGrowth, "USD"),
      totalAtRisk: formatNum(totalAtRisk, "USD"),
      brandsAnalyzed: brandAnalyses.size,
      campaignsAnalyzed: allAnalyses.length,
    },
    opportunities,
    brandBreakdown,
  }
}

function formatNum(n: number, currency?: string): string {
  const abs = Math.abs(n)
  let formatted: string
  if (abs >= 1_000_000) formatted = (n / 1_000_000).toFixed(1) + "M"
  else if (abs >= 1_000) formatted = (n / 1_000).toFixed(1) + "K"
  else formatted = n.toFixed(2)

  if (!currency) return formatted
  const symbols: Record<string, string> = { USD: "$", EGP: "E£", SAR: "﷼", AED: "د.إ", EUR: "€", GBP: "£" }
  return `${symbols[currency] || currency} ${formatted}`
}
