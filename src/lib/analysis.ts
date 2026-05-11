import { prisma } from "@/lib/prisma"

export function buildAnalysisFromMetrics(m: any, platform: string, brandName: string, currency = "USD") {
  const roas = m.roas || (m.spend > 0 ? m.revenue / m.spend : 0)
  const cpa = m.cpa || (m.conversions > 0 ? m.spend / m.conversions : 0)
  const ctr = m.ctr || (m.impressions > 0 ? (m.clicks / m.impressions) * 100 : 0)
  const cpm = m.cpm || (m.impressions > 0 ? (m.spend / m.impressions) * 1000 : 0)
  const cpc = m.cpc || (m.clicks > 0 ? m.spend / m.clicks : 0)
  const profit = m.profit !== undefined ? m.profit : m.revenue - m.spend
  const convRate = m.conversionRate || (m.clicks > 0 ? (m.conversions / m.clicks) * 100 : 0)
  const freq = m.frequency || (m.impressions > 0 && m.reach > 0 ? m.impressions / m.reach : 1)

  const insights = []
  if (roas >= 3) insights.push({ type: "positive", metric: "ROAS", message: `${brandName} ROAS at ${roas.toFixed(2)}x is excellent`, recommendation: "Consider scaling top-performing campaigns.", severity: "excellent" })
  else if (roas >= 2) insights.push({ type: "positive", metric: "ROAS", message: `ROAS at ${roas.toFixed(2)}x is healthy`, severity: "good" })
  else insights.push({ type: "warning", metric: "ROAS", message: `ROAS at ${roas.toFixed(2)}x is below target`, severity: "warning" })

  if (cpa > 50) insights.push({ type: "warning", metric: "CPA", message: `CPA at $${cpa.toFixed(2)} is above threshold`, severity: "warning" })
  else insights.push({ type: "positive", metric: "CPA", message: `CPA at $${cpa.toFixed(2)} is within range`, severity: "good" })

  if (ctr > 2) insights.push({ type: "positive", metric: "CTR", message: `CTR at ${ctr.toFixed(2)}% is above average`, severity: "excellent" })
  else if (ctr > 1) insights.push({ type: "positive", metric: "CTR", message: `CTR at ${ctr.toFixed(2)}% is average`, severity: "good" })
  else insights.push({ type: "warning", metric: "CTR", message: `CTR at ${ctr.toFixed(2)}% needs improvement`, severity: "warning" })

  if (freq > 4) insights.push({ type: "warning", metric: "Frequency", message: `Frequency at ${freq.toFixed(1)} — risk of audience fatigue`, severity: "critical" })
  if (profit < 0) insights.push({ type: "critical", metric: "Profit", message: `Campaign at a loss of $${Math.abs(profit).toFixed(2)}`, severity: "critical" })

  return {
    summary: `${brandName || "Campaign"}: ${m.spend > 0 ? `$ ${m.spend.toLocaleString()} إنفاق، $ ${m.revenue?.toLocaleString() || 0} إيرادات، ROAS ${roas.toFixed(2)}x` : "لا توجد بيانات إنفاق كافية للتحليل"}`,
    metrics: {
      spend: m.spend || 0, revenue: m.revenue || 0, roas, cpa, ctr, cpm, cpc,
      conversionRate: convRate, frequency: freq,
      impressions: m.impressions || 0, clicks: m.clicks || 0, conversions: m.conversions || 0, profit,
    },
    insights,
    recommendations: [
      { type: roas >= 3 ? "scaling" : "optimize", title: roas >= 3 ? `توسيع حملات ${brandName} الناجحة` : `تحسين حملات ${brandName}`, description: roas >= 3 ? "الأداء القوي يستحق زيادة الميزانية" : "التركيز على تحسين CPA و CTR", priority: "high", impact: roas >= 3 ? `+$${Math.round(m.revenue * 0.25).toLocaleString()}` : "تحسين الكفاءة", action: roas >= 3 ? "زيادة الميزانية 25% ومراقبة 3 أيام" : "تجربة 5 إعلانات جديدة" },
      { type: "duplicate", title: "نسخ المجموعات الإعلانية الناجحة", description: "تطبيق الجماهير والإعلانات عالية الأداء على حملات جديدة", priority: "medium", impact: "توسيع الجماهير المثبتة", action: "إنشاء جماهير مشابهة من أفضل الإعلانات" },
      { type: "optimize", title: "تجديد الإعلانات", description: freq > 3 ? "معدل التكرار مرتفع — حان وقت إعلانات جديدة" : "اختبار الإعلانات بانتظام يحسن الأداء", priority: freq > 3 ? "high" : "medium", impact: freq > 3 ? "تحسين CTR" : "تحسن مستمر", action: "اختبار 3-5 إعلانات جديدة" },
    ],
    predictions: [
      { metric: "CPA", currentValue: cpa, predictedValue: +(cpa * 1.15).toFixed(2), confidence: 82, trend: "up", message: `عند زيادة الميزانية 30%، من المتوقع ارتفاع CPA إلى $${(cpa * 1.15).toFixed(2)}` },
      { metric: "ROAS", currentValue: roas, predictedValue: +(roas * 0.9).toFixed(2), confidence: 78, trend: "down", message: `ROAS قد ينخفض إلى ${(roas * 0.9).toFixed(2)}x مع التوسع القوي` },
    ],
    marketInfo: {
      market: "Saudi Arabia", currency, language: "Arabic / English", confidence: 90,
      benchmarks: { avgCpm: 15, avgCpc: 0.8, avgCtr: 1.5, avgCpa: 25, avgRoas: 3.5 },
    },
    topAdSets: [], worstAdSets: [],
  }
}

export async function createSmartAlerts(userId: string, analysis: any) {
  const alerts = []
  if (analysis.metrics?.cpa > 50) alerts.push({ type: "cpa_high", message: `CPA مرتفع: $${analysis.metrics.cpa}`, severity: "warning" })
  if (analysis.metrics?.roas < 1.5) alerts.push({ type: "roas_low", message: `ROAS منخفض: ${analysis.metrics.roas}x`, severity: "critical" })
  if (analysis.metrics?.frequency > 4) alerts.push({ type: "frequency_high", message: `معدل تكرار مرتفع: ${analysis.metrics.frequency}`, severity: "warning" })
  if (analysis.metrics?.ctr < 0.5) alerts.push({ type: "ctr_low", message: `CTR منخفض: ${analysis.metrics.ctr}%`, severity: "critical" })
  for (const alert of alerts) {
    await prisma.alert.create({ data: { ...alert, userId } })
  }
}
