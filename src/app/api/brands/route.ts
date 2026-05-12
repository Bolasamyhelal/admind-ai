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
      const fields = [
        "إيه تخصص البراند بالظبط وإيه الخدمة أو المنتج اللي بتبيعه؟",
        "مين العميل المثالي بتاعك بالضبط (عمره، اهتماماته، بيشتري إزاي)؟",
        "إيه أكبر مشكلة أو تحدي بوجهك دلوقتي في الماركتنج أو المبيعات؟",
        "كم ميزانية الإعلانات الشهرية حاليًا وإيه هي المنصات اللي شغال عليها؟",
        "إيه أهدافك الرقمية اللي عايز توصلها خلال 3 شهور (مبيعات، تحويلات، وعي)؟",
        "مين أكبر منافسيك في السوق وإيه اللي بيميزك عنهم؟",
        "جربت إيه قبل كدا في الإعلانات والماركتنج وإيه اللي نجح أو فشل؟",
      ]
      const answered = Object.keys(answers || {})
      const remaining = fields.filter(f => !answered.some(a => f.includes(a)))
      const complete = remaining.length === 0 || answered.length >= 4

      let analysis = ""
      let suggestedNiche = ""
      let suggestedPlatforms = ""
      let suggestedMarket = ""
      if (Object.keys(answers || {}).length > 0) {
        const prompt = `أنت خبير استراتيجي في الماركتنج والمبيعات. حلل المعلومات دي لبراند اسمه "${name}":
${Object.entries(answers || {}).map(([q, a]) => `- ${q}: ${a}`).join("\n")}

رد JSON فقط:
{
  "analysis": "تحليل سريع ومحترف (جملتين) عن وضع البراند وفرصه في السوق بالعربي",
  "suggestedNiche": "التخصص المقترح حسب معلوماته",
  "suggestedPlatforms": "المنصات الإعلانية المقترحة (فيسبوك، تيك توك، جوجل، سناب)",
  "suggestedMarket": "تحليل سريع للسوق والمنافسين واقتراح استراتيجي"
}`
        try {
          const content = await askAI(prompt, true)
          const r = JSON.parse(content)
          analysis = r.analysis
          suggestedNiche = r.suggestedNiche
          suggestedPlatforms = r.suggestedPlatforms
          suggestedMarket = r.suggestedMarket
        } catch {}
      }

      return NextResponse.json({
        success: true,
        complete,
        nextQuestion: complete ? null : remaining[0],
        analysis,
        suggestedNiche,
        suggestedPlatforms,
        suggestedMarket,
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
