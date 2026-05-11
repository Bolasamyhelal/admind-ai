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

    const { product, market, goal, budget, platform } = await req.json()
    if (!product) return NextResponse.json({ error: "المنتج/الخدمة مطلوب" }, { status: 400 })

    const prompt = `أنت خبير media buying استراتيجي من الطراز الأول في الشرق الأوسط. قدم خطة حملة إعلانية شاملة A-Z بالعربية.

المنتج: "${product}"
السوق: "${market || 'الوطن العربي'}"
الهدف: "${goal || 'تحويلات (مبيعات)'}"
الميزانية: "${budget || 'متوسطة'}"
المنصة: "${platform || 'فيسبوك/إنستغرام'}"

قدم JSON فقط (بدون markdown) بهذا الهيكل بالضبط:
{
  "summary": "ملخص الاستراتيجية (3-4 جمل)",
  "campaignStructure": {
    "overview": "نظرة عامة على هيكل الحملة",
    "campaigns": [
      { "name": "اسم الحملة", "objective": "الهدف", "budgetPercent": "نسبة الميزانية", "platform": "المنصة", "note": "ملاحظة" }
    ],
    "adSets": "وصف بنية المجموعات الإعلانية",
    "ads": "توصيات للإعلانات"
  },
  "targeting": {
    "demographics": "الفئة العمرية والجنس والدخل",
    "interests": ["5-7 اهتمامات استهداف"],
    "behaviors": ["3-5 سلوكيات"],
    "lookalike": "نصيحة عن Lookalike audiences",
    "retargeting": "استراتيجية إعادة الاستهداف",
    "exclusions": ["3-5 استثناءات مهمة"]
  },
  "budgetStrategy": {
    "dailyBudget": "تقدير الميزانية اليومية",
    "allocation": "توزيع الميزانية على الحملات",
    "bidStrategy": "استراتيجية التسعير (أقل تكلفة / حد تكلفة / target)",
    "testingBudget": "ميزانية اختبار الكريتف والإستهداف",
    "scalingPlan": "خطة التوسع (متى وكيف نزيد الميزانية)"
  },
  "adCreatives": {
    "formats": ["صيغ الإعلانات المناسبة"],
    "hooks": ["5-7 خطافات افتتاحية"],
    "angles": ["5-7 زوايا إعلانية"],
    "cta": "عبارات الحث على الشراء المقترحة",
    "visualTips": "نصائح للتصميم البصري"
  },
  "funnelStrategy": {
    "topOfFunnel": "استراتيجية الجزء العلوي من القمع (وعي + جذب)",
    "middleOfFunnel": "استراتيجية المنتصف (تفاعل + تفكير)",
    "bottomOfFunnel": "استراتيجية القاع (تحويل + بيع)",
    "customerJourney": "رحلة العميل المتوقعة"
  },
  "tracking": {
    "pixelSetup": "إعداد البكسل والتحويلات",
    "events": ["الأحداث المطلوب تتبعها"],
    "utmStrategy": "استراتيجية UTM parameters",
    "dashboardSetup": "إعداد لوحة التحكم والتقارير"
  },
  "testingStrategy": {
    "creativeTesting": "طريقة اختبار الكريتف",
    "audienceTesting": "طريقة اختبار الجماهير",
    "winningCriteria": "معايير الحكم على الفائز",
    "timeline": "الجدول الزمني للاختبار"
  },
  "scalingStrategy": {
    "phase1": "المرحلة الأولى: التأسيس والاختبار",
    "phase2": "المرحلة الثانية: التوسع",
    "phase3": "المرحلة الثالثة: التعزيز والتحسين",
    "kpis": ["5-7 مؤشرات أداء رئيسية للمتابعة"],
    "riskManagement": "إدارة المخاطر (متى نوقف أو نعدل)"
  },
  "marketInsights": {
    "competition": "تحليل المنافسة في هذا السوق",
    "seasonality": "الموسمية والتوقيت المناسب",
    "pricingStrategy": "استراتيجية التسعير المقترحة",
    "opportunities": ["3-5 فرص سوقية"],
    "threats": ["2-3 تهديدات"]
  },
  "weeklyPlan": {
    "week1": "خطة الأسبوع الأول",
    "week2": "خطة الأسبوع الثاني",
    "week3": "خطة الأسبوع الثالث",
    "week4": "خطة الأسبوع الرابع"
  },
  "expectedResults": {
    "cpc": "تقدير تكلفة النقرة",
    "cpm": "تقدير تكلفة الألف ظهور",
    "ctr": "نسبة النقر المتوقعة",
    "cpa": "تقدير تكلفة الاكتساب",
    "roas": "تقدير العائد على الإنفاق"
  }
}`

    const aiContent = await askAI(prompt)

    let result: any
    try {
      result = JSON.parse(aiContent)
    } catch {
      return NextResponse.json({ success: false, _raw: aiContent.slice(0, 500), error: "AI returned invalid response" })
    }

    const guide = await prisma.campaignGuide.create({
      data: {
        product, market: market || "الوطن العربي",
        goal: goal || "تحويلات",
        budget: budget || "متوسطة",
        platform: platform || "فيسبوك/إنستغرام",
        result: JSON.stringify(result), userId: user.id,
      },
    })

    return NextResponse.json({ success: true, id: guide.id, result })
  } catch (error: any) {
    return NextResponse.json({ error: (error?.message || "").slice(0, 200) }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 })

    const guides = await prisma.campaignGuide.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    })

    return NextResponse.json(
      guides.map((g) => ({
        id: g.id, product: g.product, market: g.market,
        goal: g.goal, budget: g.budget, platform: g.platform,
        createdAt: g.createdAt,
        result: JSON.parse(g.result),
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
    await prisma.campaignGuide.deleteMany({ where: { id, userId: user.id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: (error?.message || "").slice(0, 200) }, { status: 500 })
  }
}
