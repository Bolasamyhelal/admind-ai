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

    const { market, service, budget } = await req.json()
    if (!market) return NextResponse.json({ error: "السوق/النيتش مطلوب" }, { status: 400 })

    const prompt = `أنت خبير مبيعات وتسويق B2B متخصص في الشرق الأوسط. قدم تحليل شامل للعملاء المحتملين والمنافسين بالعربية.

السوق/النيتش: "${market}"
الخدمة المقدمة: "${service || 'إدارة الإعلانات وتحسين الحملات'}"
الميزانية التقريبية: "${budget || 'متوسطة'}"

أرجع JSON فقط (بدون markdown) بهذا الهيكل بالضبط:
{
  "summary": "ملخص الفرص التجارية في هذا السوق",
  "potentialClients": [
    {
      "category": "فئة العملاء (مثال: متاجر تجزئة، شركات عقارات، مطاعم)",
      "examples": ["اسم شركة 1", "اسم شركة 2", "اسم شركة 3"],
      "size": "حجم الشركات (صغيرة/متوسطة/كبيرة)",
      "estimatedBudget": "تقدير ميزانية التسويق الشهرية",
      "painPoints": ["نقطة ألم 1", "نقطة ألم 2", "نقطة ألم 3"],
      "needs": ["احتياج إعلاني 1", "احتياج إعلاني 2"],
      "decisionMakers": ["المسؤول عن التسويق", "المدير التنفيذي", "صاحب الشركة"],
      "approachStrategy": "كيف تقنعهم؟ استراتيجية التواصل"
    }
  ],
  "competitors": [
    {
      "name": "اسم المنافس",
      "type": "وكالة / فريلانسر / منصة",
      "strengths": ["نقطة قوة"],
      "weaknesses": ["نقطة ضعف"],
      "pricing": "تقدير الأسعار",
      "marketShare": "الحصة السوقية"
    }
  ],
  "marketGap": "فجوة السوق — إيه اللي بيطلبه العملاء ومش لاقيينه",
  "pricingStrategy": {
    "monthlyRetainer": "تقدير الريتينر الشهري المناسب",
    "commissionRate": "نسبة العمولة",
    "projectBased": "أسعار المشاريع"
  },
  "outreachStrategy": {
    "coldEmail": "نموذج رسالة بريد إلكتروني قصير وفعّال",
    "coldCall": "نموذج مكالمة هاتفية",
    "linkedin": "استراتيجية LinkedIn",
    "referral": "برنامج الإحالة"
  },
  "leadGeneration": {
    "sources": ["مصادر جلب العملاء المحتملين"],
    "qualification": "كيف تؤهل العميل المحتمل",
    "conversionTips": "نصائح لزيادة نسبة التحويل"
  },
  "objectionHandling": [
    {"objection": "اعتراض العميل", "response": "الرد المناسب"}
  ],
  "recommendations": ["5-7 توصيات لاختراق السوق وجلب العملاء"]
}`

    const aiContent = await askAI(prompt)

    let result: any
    try {
      result = JSON.parse(aiContent)
    } catch {
      return NextResponse.json({ success: false, _raw: aiContent.slice(0, 500), error: "AI returned invalid response" })
    }

    const research = await prisma.clientResearch.create({
      data: { market, service: service || "إدارة الإعلانات", budget: budget || "متوسطة", result: JSON.stringify(result), userId: user.id },
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
    const list = await prisma.clientResearch.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 20 })
    return NextResponse.json(list.map((r) => ({ id: r.id, market: r.market, service: r.service, budget: r.budget, createdAt: r.createdAt, result: JSON.parse(r.result) })))
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
    await prisma.clientResearch.deleteMany({ where: { id, userId: user.id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: (error?.message || "").slice(0, 200) }, { status: 500 })
  }
}
