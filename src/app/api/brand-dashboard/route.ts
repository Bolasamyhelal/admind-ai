import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const brandId = searchParams.get("id")
    const userId = searchParams.get("userId")
    if (!brandId) return NextResponse.json({ error: "brandId required" }, { status: 400 })
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 401 })

    const [brand, uploads] = await Promise.all([
      prisma.brand.findFirst({
        where: { id: brandId, userId },
        include: { analyses: { orderBy: { createdAt: "desc" }, take: 5 } },
      }),
      prisma.upload.findMany({
        where: { brandId, userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ])
    if (!brand) return NextResponse.json({ error: "البراند غير موجود" }, { status: 404 })

    const latestAnalysis = brand.analyses[0]

    return NextResponse.json({
      brand: {
        id: brand.id, name: brand.name, niche: brand.niche, country: brand.country,
        createdAt: brand.createdAt, uploads, analyses: brand.analyses,
      },
      metrics: latestAnalysis?.metrics ? JSON.parse(latestAnalysis.metrics) : null,
      insights: latestAnalysis?.insights ? JSON.parse(latestAnalysis.insights) : [],
      recommendations: latestAnalysis?.recommendations ? JSON.parse(latestAnalysis.recommendations) : [],
      predictions: latestAnalysis?.predictions ? JSON.parse(latestAnalysis.predictions) : [],
      marketData: latestAnalysis?.marketData ? JSON.parse(latestAnalysis.marketData) : null,
      totalAnalyses: brand.analyses.length,
      totalUploads: uploads.length,
    })
  } catch (error: any) {
    return NextResponse.json({ error: (error?.message || "").slice(0, 300) }, { status: 500 })
  }
}
