import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function getCurrency(a: any): string {
  if (a.marketData) {
    try { const md = JSON.parse(a.marketData); if (md.currency) return md.currency } catch {}
  }
  return "USD"
}

function calcMetrics(analyses: any[]) {
  const m = { spend: 0, revenue: 0, roas: 0, cpa: 0, ctr: 0, cpm: 0, cpc: 0, conversionRate: 0, frequency: 0, impressions: 0, clicks: 0, conversions: 0, profit: 0, count: 0 }
  for (const a of analyses) {
    if (!a.metrics) continue
    try {
      const p = JSON.parse(a.metrics)
      m.spend += p.spend || 0; m.revenue += p.revenue || 0
      m.impressions += p.impressions || 0; m.clicks += p.clicks || 0; m.conversions += p.conversions || 0
      m.cpa += p.cpa || 0; m.ctr += p.ctr || 0; m.cpm += p.cpm || 0; m.cpc += p.cpc || 0
      m.conversionRate += p.conversionRate || 0; m.frequency += p.frequency || 0; m.profit += p.profit || 0
      m.roas += p.roas || 0; m.count++
    } catch {}
  }
  if (m.count > 0) {
    m.cpa /= m.count; m.ctr /= m.count; m.cpm /= m.count; m.cpc /= m.count
    m.conversionRate /= m.count; m.frequency /= m.count; m.roas /= m.count
  }
  return m
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    const brandId = searchParams.get("brandId")

    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

    const analysisWhere: any = { userId, status: "completed" }
    if (brandId) analysisWhere.brandId = brandId

    const allAnalyses = await prisma.analysis.findMany({ where: analysisWhere, orderBy: { createdAt: "desc" } })
    // Only use campaign-level or legacy (aggregated/null level) analyses to avoid triple-counting
    const analyses = allAnalyses.filter((a: any) => {
      const lv = a.level
      // Old analyses (before multi-level feature): level = "aggregated" or null/undefined → include
      if (!lv || lv === "aggregated") return true
      // New campaign-level analyses → include
      if (lv === "campaign") return true
      // adset, ad → skip to avoid triple-counting
      return false
    })

    const uploadWhere: any = { userId }
    if (brandId) uploadWhere.brandId = brandId
    const uploads = await prisma.upload.findMany({ where: uploadWhere, orderBy: { createdAt: "desc" }, take: 10 })

    const alerts = await prisma.alert.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 10 })

    const brands = await prisma.brand.findMany({
      where: brandId ? { id: brandId, userId } : { userId },
      orderBy: { createdAt: "desc" },
    })

    // Group analyses by currency
    const byCurrency: Record<string, any[]> = {}
    for (const a of analyses) {
      const cur = getCurrency(a)
      if (!byCurrency[cur]) byCurrency[cur] = []
      byCurrency[cur].push(a)
    }

    const metricsByCurrency = Object.entries(byCurrency).map(([currency, items]) => ({
      currency,
      ...calcMetrics(items),
      analysisCount: items.length,
    }))

    // All-time combined monthly data (keep for chart, labeled by currency)
    const monthlyMap: Record<string, { spend: number; revenue: number; roas: number; count: number; currency: string }> = {}
    for (const a of analyses) {
      if (!a.metrics) continue
      try {
        const m = JSON.parse(a.metrics)
        const cur = getCurrency(a)
        const month = new Date(a.createdAt).toLocaleString("en-US", { month: "short", year: "numeric" })
        if (!monthlyMap[month]) monthlyMap[month] = { spend: 0, revenue: 0, roas: 0, count: 0, currency: cur }
        monthlyMap[month].spend += m.spend || 0
        monthlyMap[month].revenue += m.revenue || 0
        monthlyMap[month].roas += m.roas || 0
        monthlyMap[month].count++
      } catch {}
    }
    const monthlyData = Object.entries(monthlyMap)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([month, d]) => ({ month, spend: d.spend, revenue: d.revenue, roas: d.count > 0 ? +(d.roas / d.count).toFixed(2) : 0, currency: d.currency }))

    return NextResponse.json({
      metricsByCurrency,
      monthlyData,
      totalAnalyses: analyses.length,
      totalUploads: uploads.length,
      totalBrands: brands.length,
      brands,
      recentUploads: uploads.slice(0, 5),
      alerts,
    })
  } catch (error) {
    console.error("Dashboard API error:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
