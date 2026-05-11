import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

async function getUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")?.value
  if (!token) return null
  const session = await prisma.session.findUnique({ where: { token }, include: { user: true } })
  return session?.user ?? null
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const brandId = searchParams.get("id")
    if (!brandId) return NextResponse.json({ error: "brandId required" }, { status: 400 })

    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: user.id },
      include: { analyses: { orderBy: { createdAt: "desc" }, take: 1 } },
    })
    if (!brand) return NextResponse.json({ error: "البراند غير موجود" }, { status: 404 })

    const latestAnalysis = brand.analyses[0]

    return NextResponse.json({
      brand: { id: brand.id, name: brand.name, niche: brand.niche, country: brand.country, createdAt: brand.createdAt },
      metrics: latestAnalysis?.metrics ? JSON.parse(latestAnalysis.metrics) : null,
      insights: latestAnalysis?.insights ? JSON.parse(latestAnalysis.insights) : [],
      recommendations: latestAnalysis?.recommendations ? JSON.parse(latestAnalysis.recommendations) : [],
      predictions: latestAnalysis?.predictions ? JSON.parse(latestAnalysis.predictions) : [],
      marketData: latestAnalysis?.marketData ? JSON.parse(latestAnalysis.marketData) : null,
      totalAnalyses: latestAnalysis ? 1 : 0,
    })
  } catch (error: any) {
    return NextResponse.json({ error: (error?.message || "").slice(0, 300) }, { status: 500 })
  }
}
