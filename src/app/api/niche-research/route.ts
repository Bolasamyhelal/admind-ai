import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { askAI } from "@/lib/ai-helper"
import { cookies } from "next/headers"

async function getUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")?.value
  if (!token) return null
  const session = await prisma.session.findUnique({ where: { token }, include: { user: true } })
  return session?.user ?? null
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 })

    const { niche, market } = await req.json()
    if (!niche) return NextResponse.json({ error: "اسم النيتش مطلوب" }, { status: 400 })

    const marketLabel = market || "الوطن العربي"

    const prompt = `You are a top-tier market research analyst specializing in digital marketing and e-commerce in the MENA region. Conduct an exhaustive, data-driven niche research analysis in Arabic.

Niche: "${niche}"
Market: "${marketLabel}"

Return valid JSON ONLY (no markdown, no extra text) with this exact structure:
{
  "summary": "ملخص شامل عن النيتش في هذا السوق (3-4 جمل)",
  "marketSize": "تقدير حجم السوق (صغير/متوسط/كبير) مع شرح",
  "competitionLevel": "منخفض / متوسط / مرتفع / شديد",
  "competitors": ["أشهر 5 منافسين في السوق"],
  "targetAudience": {
    "ageRange": "الفئة العمرية المستهدفة",
    "gender": "الجنس المستهدف",
    "interests": ["اهتمامات الجمهور"],
    "painPoints": ["نقاط الألم والمشاكل"]
  },
  "cpc": "متوسط تكلفة النقرة المقدرة (تقدير بالدولار)",
  "cpa": "متوسط تكلفة الاكتساب المقدرة",
  "roas": "معدل العائد على الإنفاق المتوقع",
  "trends": ["3-5 توجهات حالية في النيتش"],
  "bestPlatforms": ["أفضل منصات إعلانية للنيتش"],
  "contentIdeas": ["3-5 أفكار محتوى فعّالة"],
  "seasonality": "موسمية الطلب (إن وجدت)",
  "opportunities": ["3-5 فرص غير مستغلة"],
  "threats": ["2-3 تهديدات أو مخاطر"],
  "profitMargin": "تقدير هامش الربح (منخفض/متوسط/مرتفع)",
  "entryBarrier": "سهل / متوسط / صعب",
  "recommendations": ["5-7 توصيات استراتيجية للدخول في النيتش"],
  "keywords": ["10-15 كلمة مفتاحية مقترحة للحملات"],
  "overallScore": 0-10
}`

    const aiContent = await askAI(prompt)

    let result: any
    try {
      result = JSON.parse(aiContent)
    } catch {
      return NextResponse.json({ success: false, _raw: aiContent.slice(0, 500), error: "AI returned invalid response" })
    }

    const research = await prisma.nicheResearch.create({
      data: { niche, market: marketLabel, result: JSON.stringify(result), userId: user.id },
    })

    return NextResponse.json({ success: true, id: research.id, result })
  } catch (error: any) {
    return NextResponse.json({ error: (error?.message || "").slice(0, 200) }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 })

    const researches = await prisma.nicheResearch.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    })

    return NextResponse.json(
      researches.map((r) => ({
        id: r.id,
        niche: r.niche,
        market: r.market,
        createdAt: r.createdAt,
        result: JSON.parse(r.result),
      }))
    )
  } catch (error: any) {
    return NextResponse.json({ error: (error?.message || "").slice(0, 200) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 })

    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: "المعرف مطلوب" }, { status: 400 })

    await prisma.nicheResearch.deleteMany({ where: { id, userId: user.id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: (error?.message || "").slice(0, 200) }, { status: 500 })
  }
}
