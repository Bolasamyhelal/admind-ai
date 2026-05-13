import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { analyzeAllEntities, summarizeDecisions } from "@/lib/decision-engine"

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

    const decisions = analyzeAllEntities(analyses, brands)
    const summary = summarizeDecisions(decisions)

    return NextResponse.json({
      decisions,
      summary,
      brandsAnalyzed: brands.length,
      campaignsAnalyzed: analyses.length,
    })
  } catch (error) {
    console.error("Decisions error:", error)
    return NextResponse.json({ error: "Failed to analyze decisions" }, { status: 500 })
  }
}
