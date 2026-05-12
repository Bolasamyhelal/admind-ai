import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { askAI } from "@/lib/ai-helper"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    const id = searchParams.get("id")

    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

    if (id) {
      const brand = await prisma.brand.findFirst({ where: { id, userId } })
      if (!brand) return NextResponse.json({ error: "Brand not found" }, { status: 404 })

      const uploads = await prisma.upload.findMany({ where: { brandId: id }, orderBy: { createdAt: "desc" }, take: 10 })
      const analyses = await prisma.analysis.findMany({ where: { brandId: id }, orderBy: { createdAt: "desc" }, take: 10 })
      const creatives = await prisma.creative.findMany({ where: { brandId: id }, orderBy: { createdAt: "desc" }, take: 20 })
      const campaigns = await prisma.campaignExecution.findMany({ where: { brandId: id }, orderBy: { createdAt: "desc" } })

      return NextResponse.json({ brand, uploads, analyses, creatives, campaigns })
    }

    const brands = await prisma.brand.findMany({ where: { userId }, orderBy: { createdAt: "desc" } })
    return NextResponse.json({ brands })
  } catch (error) {
    console.error("Brands API error:", error)
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, name, step, answers } = body

    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })
    if (!name) return NextResponse.json({ error: "Brand name required" }, { status: 400 })

    // Step 1: AI onboarding - if questions are provided, answer them
    if (step === "onboard") {
      const prompt = `أنت مساعد ذكي لجمع معلومات عن براند إعلاني. المستخدم بدأ بإضافة براند اسمه "${name}".

الأسئلة السابقة وإجاباتها:
${Object.entries(answers || {}).map(([q, a]) => `- ${q}: ${a}`).join("\n")}

حسب الإجابات المتوفرة، قرر:
1. هل المعلومات كافية لإنشاء البراند؟ (نعم/لا)
2. إذا لا، ما هو السؤال التالي المناسب الذي تريد طرحه؟ (سؤال واحد فقط، مختصر)
3. قدم تحليل أولي سريع عما تعرفه عن هذا البراند

الرد بهذا التنسيق JSON:
{
  "complete": true/false,
  "nextQuestion": "السؤال التالي أو فارغ إذا اكتمل",
  "analysis": "تحليل أولي للبراند بناء على المعلومات المتاحة",
  "suggestedNiche": "التخصص المقترح",
  "suggestedPlatforms": "المنصات المقترحة"
}`

      const content = await askAI(prompt, true)
      const result = JSON.parse(content)

      return NextResponse.json({
        success: true,
        complete: result.complete,
        nextQuestion: result.nextQuestion || null,
        analysis: result.analysis,
        suggestedNiche: result.suggestedNiche,
        suggestedPlatforms: result.suggestedPlatforms,
      })
    }

    // Step 2: Actually create the brand
    const brand = await prisma.brand.create({
      data: {
        name,
        niche: body.niche || null,
        country: body.country || null,
        website: body.website || null,
        websiteAnalysis: body.websiteAnalysis || null,
        goals: body.goals || null,
        targetAudience: body.targetAudience || null,
        platforms: body.platforms || null,
        monthlyBudget: body.monthlyBudget ? parseFloat(body.monthlyBudget) : null,
        currency: body.currency || "USD",
        notes: body.notes || null,
        userId,
      },
    })

    // If there's a website, trigger site analysis (async)
    if (body.website && body.website.trim()) {
      fetch(`${req.nextUrl.origin}/api/analyze-site`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: body.website, brandId: brand.id, userId }),
      }).catch(() => {})
    }

    return NextResponse.json({ success: true, brand })
  } catch (error) {
    console.error("Brand create error:", error)
    return NextResponse.json({ error: "Failed to create brand" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const userId = searchParams.get("userId")

    if (!id || !userId) return NextResponse.json({ error: "id and userId required" }, { status: 400 })

    const brand = await prisma.brand.findFirst({ where: { id, userId } })
    if (!brand) return NextResponse.json({ error: "Brand not found" }, { status: 404 })

    await prisma.brand.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Brand delete error:", error)
    return NextResponse.json({ error: "Failed to delete brand" }, { status: 500 })
  }
}
