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
      const fields = ["التخصص (إيه مجال البراند؟)", "رابط الموقع الإلكتروني (إن وجد)", "مين الجمهور المستهدف؟", "إيه المنصات اللي بتعلن عليها؟", "إيه الميزانية الشهرية للإعلانات؟", "البلد", "إيه أهداف البراند؟"]
      const answered = Object.keys(answers || {})
      const remaining = fields.filter(f => !answered.some(a => f.includes(a)))
      const complete = remaining.length === 0 || answered.length >= 4

      let analysis = ""
      let suggestedNiche = ""
      let suggestedPlatforms = ""
      if (Object.keys(answers || {}).length > 0) {
        const prompt = `حلل هذه المعلومات عن براند اسمه "${name}":
${Object.entries(answers || {}).map(([q, a]) => `- ${q}: ${a}`).join("\n")}

رد JSON فقط:
{
  "analysis": "تحليل سريع من سطرين عن البراند بالعربي",
  "suggestedNiche": "التخصص المقترح حسب المعلومات",
  "suggestedPlatforms": "المنصات المقترحة"
}`
        try {
          const content = await askAI(prompt, true)
          const r = JSON.parse(content)
          analysis = r.analysis
          suggestedNiche = r.suggestedNiche
          suggestedPlatforms = r.suggestedPlatforms
        } catch {}
      }

      return NextResponse.json({
        success: true,
        complete,
        nextQuestion: complete ? null : remaining[0],
        analysis,
        suggestedNiche,
        suggestedPlatforms,
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
