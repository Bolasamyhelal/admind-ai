import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    const brandId = searchParams.get("brandId")

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    const analysisWhere: any = { userId, status: "completed" }
    if (brandId) analysisWhere.brandId = brandId

    const analyses = await prisma.analysis.findMany({
      where: analysisWhere,
      orderBy: { createdAt: "desc" },
    })

    const uploadWhere: any = { userId }
    if (brandId) uploadWhere.brandId = brandId

    const uploads = await prisma.upload.findMany({
      where: uploadWhere,
      orderBy: { createdAt: "desc" },
      take: 10,
    })

    const alerts = await prisma.alert.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    })

    const brands = await prisma.brand.findMany({
      where: brandId ? { id: brandId, userId } : { userId },
      orderBy: { createdAt: "desc" },
    })

    let metrics = {
      spend: 0, revenue: 0, roas: 0, cpa: 0, ctr: 0, cpm: 0, cpc: 0,
      conversionRate: 0, frequency: 0, impressions: 0, clicks: 0, conversions: 0, profit: 0,
    }

    let count = 0
    for (const a of analyses) {
      if (a.metrics) {
        try {
          const m = JSON.parse(a.metrics)
          metrics.spend += m.spend || 0
          metrics.revenue += m.revenue || 0
          metrics.impressions += m.impressions || 0
          metrics.clicks += m.clicks || 0
          metrics.conversions += m.conversions || 0
          metrics.cpa += m.cpa || 0
          metrics.ctr += m.ctr || 0
          metrics.cpm += m.cpm || 0
          metrics.cpc += m.cpc || 0
          metrics.conversionRate += m.conversionRate || 0
          metrics.frequency += m.frequency || 0
          metrics.profit += m.profit || 0
          metrics.roas += m.roas || 0
          count++
        } catch {}
      }
    }

    if (count > 0) {
      metrics.cpa = metrics.cpa / count
      metrics.ctr = metrics.ctr / count
      metrics.cpm = metrics.cpm / count
      metrics.cpc = metrics.cpc / count
      metrics.conversionRate = metrics.conversionRate / count
      metrics.frequency = metrics.frequency / count
      metrics.roas = metrics.roas / count
    }

    let currency = "USD"
    if (analyses.length > 0 && analyses[0].marketData) {
      try {
        const md = JSON.parse(analyses[0].marketData)
        if (md.currency) currency = md.currency
      } catch {}
    }

    const monthlyMap: Record<string, { spend: number; revenue: number; roas: number; count: number }> = {}
    for (const a of analyses) {
      if (!a.metrics) continue
      try {
        const m = JSON.parse(a.metrics)
        const month = new Date(a.createdAt).toLocaleString("en-US", { month: "short", year: "numeric" })
        if (!monthlyMap[month]) monthlyMap[month] = { spend: 0, revenue: 0, roas: 0, count: 0 }
        monthlyMap[month].spend += m.spend || 0
        monthlyMap[month].revenue += m.revenue || 0
        monthlyMap[month].roas += m.roas || 0
        monthlyMap[month].count++
      } catch {}
    }

    const monthlyData = Object.entries(monthlyMap)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([month, d]) => ({
        month,
        spend: d.spend,
        revenue: d.revenue,
        roas: d.count > 0 ? +(d.roas / d.count).toFixed(2) : 0,
      }))

    const safeMetrics = {
      spend: metrics.spend || 0,
      revenue: metrics.revenue || 0,
      roas: metrics.roas || 0,
      cpa: metrics.cpa || 0,
      ctr: metrics.ctr || 0,
      cpm: metrics.cpm || 0,
      cpc: metrics.cpc || 0,
      conversionRate: metrics.conversionRate || 0,
      frequency: metrics.frequency || 0,
      impressions: metrics.impressions || 0,
      clicks: metrics.clicks || 0,
      conversions: metrics.conversions || 0,
      profit: metrics.profit || 0,
    }

    return NextResponse.json({
      metrics: safeMetrics,
      monthlyData,
      currency,
      totalAnalyses: analyses.length,
      totalUploads: uploads.length,
      totalBrands: brands.length,
      brands,
      recentUploads: uploads.slice(0, 5),
      alerts: alerts,
    })
  } catch (error) {
    console.error("Dashboard API error:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
