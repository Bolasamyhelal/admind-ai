import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { askGemini } from "@/lib/ai-helper"

export async function POST(req: NextRequest) {
  try {
    const { message, brandId, userId, history } = await req.json()
    if (!brandId || !userId) {
      return NextResponse.json({ error: "brandId and userId required" }, { status: 400 })
    }

    // Load full brand context
    const brand = await prisma.brand.findFirst({ where: { id: brandId, userId } })
    if (!brand) return NextResponse.json({ error: "Brand not found" }, { status: 404 })

    const analyses = await prisma.analysis.findMany({
      where: { brandId, userId, status: "completed" },
      orderBy: { createdAt: "desc" },
      take: 20,
    })
    const campaigns = await prisma.campaignExecution.findMany({
      where: { brandId, userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    })
    // Build brand context
    let metricsSummary = "لا يوجد"
    if (analyses.length > 0) {
      const all: any = { spend: 0, revenue: 0, roas: 0, cpa: 0, ctr: 0, conversions: 0, impressions: 0, clicks: 0, profit: 0, count: 0 }
      for (const a of analyses) {
        if (!a.metrics) continue
        try {
          const m = JSON.parse(a.metrics)
          all.spend += m.spend || 0; all.revenue += m.revenue || 0
          all.impressions += m.impressions || 0; all.clicks += m.clicks || 0
          all.conversions += m.conversions || 0; all.profit += m.profit || 0
          all.roas += m.roas || 0; all.cpa += m.cpa || 0; all.ctr += m.ctr || 0
          all.count++
        } catch {}
      }
      if (all.count > 0) {
        all.roas /= all.count; all.cpa /= all.count; all.ctr /= all.count
      }
      metricsSummary = `إجمالي الإنفاق: $${all.spend.toFixed(0)} · الإيرادات: $${all.revenue.toFixed(0)} · ROAS: ${all.roas.toFixed(2)}x · CPA: $${all.cpa.toFixed(2)} · CTR: ${all.ctr.toFixed(2)}% · التحويلات: ${all.conversions} · الأرباح: $${all.profit.toFixed(0)} (من ${all.count} تحليل)`
    }

    let campaignsSummary = "لا يوجد"
    if (campaigns.length > 0) {
      campaignsSummary = campaigns.slice(0, 5).map((c) =>
        `${c.name} (${c.platform}) - ${c.goal} - $${c.totalBudget} ميزانية - ${c.status}`
      ).join(" | ")
    }

    let websiteInfo = "لا يوجد"
    if (brand.websiteAnalysis) {
      try {
        const wa = JSON.parse(brand.websiteAnalysis)
        websiteInfo = wa.title || brand.website || "تم التحليل"
      } catch { websiteInfo = brand.website || "لا يوجد" }
    }

    // Load brand tasks
    const tasks = await prisma.task.findMany({
      where: { brandId, userId, status: { not: "completed" } },
      orderBy: { createdAt: "desc" },
      take: 10,
    })
    const tasksSummary = tasks.length > 0
      ? tasks.map((t) => `□ ${t.title}${t.taskType ? ` (${t.taskType})` : ""}`).join("\n")
      : "لا توجد مهام معلقة"

    const brandContext = `معلومات البراند:
- الاسم: ${brand.name}
- التخصص: ${brand.niche || "غير محدد"}
- الجمهور المستهدف: ${brand.targetAudience || "غير محدد"}
- المنصات: ${brand.platforms || "غير محدد"}
- الميزانية الشهرية: ${brand.monthlyBudget ? `$${brand.monthlyBudget}` : "غير محدد"}
- البلد: ${brand.country || "غير محدد"}
- الأهداف: ${brand.goals || "غير محدد"}
- الموقع: ${websiteInfo}

آخر التحليلات (${analyses.length} تحليل):
${metricsSummary}

الحملات (${campaigns.length}):
${campaignsSummary}

المهام المعلقة:
${tasksSummary}`

    const systemPrompt = `أنت "مرشد البراند" — صديق وخبير media buying واستراتيجي تسويق رقمي من الطراز الأول. مش بتفلسف وبتدي نصائح واقعية عملية جداً.

شخصيتك:
- صديق قديم بيساعد صاحبه ينجح مش مجرد روبوت بيكلمك
- خبير media buying فاهم السوق المصري والعربي كويس
- بتكلم بالعامية المصرية أو العربية الفصحى الخفيفة على حسب الموقف
- مش بتدخل في فلسفة ولا كلام عام — بتدي خطوات محددة قابلة للتنفيذ
- لو معندكش معلومة كافية بتسأل الأول وبعدين تدي نصيحة

البراند اللي بنتكلم عنه (كل البيانات دي حقيقية ومتجوبة من الداتا بتاعتك):
${brandContext}

إرشادات الرد:
1. استخدم البيانات اللي فوق عشان تدي نصائح مخصصة — متجيبش كلام عام
2. لو سأل عن scaling: قوله الزيادة كام في المية، إمتى، وإيه المخاطر
3. لو سأل عن predictions: استخدم الداتا الفعلية وادي توقعات رقمية حقيقية
4. لو سأل عن funnel: اشرحله خطوة بخطوة ينفذها
5. لو سأل عن أرقام (KPI targets): ادي أرقام واقعية بناءً على أدائه الحالي
6. لو عايز يعمل حاجة جديدة: قوله إيه الأولوية وإيه اللي يستنى
7. لو مدخلش حاجة كافية: اسأله عشان تفهم أكتر

مهم جداً: لو فيه recommendation من التحليلات أو أنالرتس اشرحها له بطريقة عملية (إيه يعمل بالضبط).`

    const messages = []
    if (history && Array.isArray(history)) {
      for (const h of history.slice(-10)) {
        messages.push({ role: h.role, content: h.content })
      }
    }
    messages.push({ role: "user", content: message })

    // Use askAI but with text format (not json) for natural conversation
    const fullPrompt = `${systemPrompt}\n\n${messages.map((m) => `${m.role === "user" ? "المستخدم" : "المرشد"}: ${m.content}`).join("\n")}\n\nالمرشد:`
    const aiResponse = await askGemini(fullPrompt)

    return NextResponse.json({ response: aiResponse })
  } catch (error: any) {
    console.error("Brand mentor error:", error)
    return NextResponse.json({ error: (error?.message || "").slice(0, 200) }, { status: 500 })
  }
}