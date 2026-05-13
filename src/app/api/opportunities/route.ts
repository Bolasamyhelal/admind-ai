import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { analyzeGrowthOpportunities } from "@/lib/growth-analyzer"
import { askGemini } from "@/lib/ai-helper"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    const [brands, analyses] = await Promise.all([
      prisma.brand.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
      prisma.analysis.findMany({
        where: { userId, status: "completed" },
        include: { upload: { select: { platform: true } } },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
    ])

    const result = analyzeGrowthOpportunities(brands, analyses)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Opportunities error:", error)
    return NextResponse.json({ error: "Failed to analyze opportunities" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { opportunity, brandName, metrics, currency } = body

    if (!opportunity || !metrics) {
      return NextResponse.json({ error: "opportunity and metrics required" }, { status: 400 })
    }

    const prompt = `أنت خبير نمو رقمي (Growth Marketer) محترف. حلل فرصة النمو التالية بشكل متعمق وقدم خطة عمل تنفيذية.

معلومات الحملة:
- اسم البراند: ${brandName || "غير محدد"}
- العملة: ${currency || "USD"}
- المقاييس الحالية:
${Object.entries(metrics).map(([k, v]) => `  - ${k}: ${v}`).join("\n")}

الفرصة:
- النوع: ${opportunity.type}
- العنوان: ${opportunity.title}
- الوصف: ${opportunity.description}
- المقياس: ${opportunity.metricKey}
- القيمة الحالية: ${opportunity.currentValue}

المطلوب باللغة العربية:
1. تحليل عميق للفرصة: لماذا ظهرت؟ ما سبب المشكلة أو الفرصة؟
2. الأسباب الجذرية (Root Causes): 3-5 أسباب محتملة
3. خطة عمل تفصيلية: خطوات محددة وقابلة للتنفيذ
4. التوقعات: كم نتوقع من تحسين؟ ما المخاطر؟
5. مؤشرات النجاح: كيف نعرف أن الخطة تعمل؟
6. جدول زمني مقترح: إجراءات فورية، قصيرة المدى، طويلة المدى

قدم الرد بصيغة JSON:
{
  "deepAnalysis": "...تحليل عميق...",
  "rootCauses": ["...", "..."],
  "actionPlan": ["...", "..."],
  "expectedImprovement": "...",
  "risks": ["...", "..."],
  "successIndicators": ["...", "..."],
  "timeline": { "immediate": ["..."], "shortTerm": ["..."], "longTerm": ["..."] }
}`

    const aiResponse = await askGemini(prompt, 0.4, 4096)
    
    try {
      const cleaned = aiResponse.replace(/```json\s*/g, "").replace(/```\s*$/g, "").trim()
      const parsed = JSON.parse(cleaned)
      return NextResponse.json(parsed)
    } catch {
      return NextResponse.json({
        deepAnalysis: aiResponse,
        rootCauses: ["تحليل يدوي مطلوب"],
        actionPlan: ["راجع البيانات وحلل الأسباب"],
        expectedImprovement: "يحتاج تحليل إضافي",
        risks: ["غير محدد"],
        successIndicators: ["غير محدد"],
        timeline: { immediate: ["حلل البيانات يدوياً"], shortTerm: [], longTerm: [] },
      })
    }
  } catch (error) {
    console.error("Opportunity AI error:", error)
    return NextResponse.json({ error: "AI analysis failed" }, { status: 500 })
  }
}
