import { NextRequest, NextResponse } from "next/server"
import { askAI } from "@/lib/ai-helper"

export async function POST(req: NextRequest) {
  try {
    const { date, spend, impressions, clicks, conversions, platform, dailyBudget, totalBudget, totalSpend, campaignName } = await req.json()

    const prompt = `أنت خبير media buying ومحلل أداء. حلل هذه الأرقام اليومية وقدم تقييم ونصائح.

اليوم: ${date}
المنصة: ${platform}
${dailyBudget ? `الميزانية اليومية: $${dailyBudget}` : ""}
${totalBudget ? `الميزانية الإجمالية: $${totalBudget}` : ""}
${totalSpend ? `إجمالي الصرف حتى الآن: $${totalSpend}` : ""}

بيانات اليوم:
- الصرف: $${spend || 0}
- Impressions: ${impressions || 0}
- Clicks: ${clicks || 0}
- Conversions: ${conversions || 0}
${clicks > 0 && impressions > 0 ? `- CTR: ${((clicks / impressions) * 100).toFixed(2)}%` : ""}
${conversions > 0 && spend > 0 ? `- CPA: $${(spend / conversions).toFixed(2)}` : ""}
${conversions > 0 && clicks > 0 ? `- CVR: ${((conversions / clicks) * 100).toFixed(2)}%` : ""}

أرجع JSON فقط بهذا الهيكل:
{
  "verdict": "ممتاز / جيد / متوسط / ضعيف / سيء",
  "spendAnalysis": "تحليل الصرف (هل هو مناسب، قليل، كثير؟)",
  "performanceAnalysis": "تحليل الأداء (CTR, CVR, CPA)",
  "comparisonToBudget": "مقارنة بالميزانية",
  "concerns": ["أي ملاحظات أو مشاكل"],
  "recommendations": ["توصيات فورية لتحسين الأداء"],
  "nextAction": "أول خطوة المفروض تعملها دلوقتي"
}`

    const aiContent = await askAI(prompt)
    let result: any
    try { result = JSON.parse(aiContent) } catch { result = { verdict: "تحليل", recommendations: ["حاول تاني"] } }

    return NextResponse.json({ success: true, analysis: result })
  } catch (error: any) {
    return NextResponse.json({ error: (error?.message || "").slice(0, 200) }, { status: 500 })
  }
}
