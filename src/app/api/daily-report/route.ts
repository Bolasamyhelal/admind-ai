import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayEnd = new Date(today)
    todayEnd.setHours(23, 59, 59, 999)

    const [todaysUploads, todaysAnalyses, todaysCampaigns, todaysAssignments, todaysAlerts, brands] = await Promise.all([
      prisma.upload.findMany({ where: { userId, createdAt: { gte: today, lte: todayEnd } }, orderBy: { createdAt: "desc" } }),
      prisma.analysis.findMany({ where: { userId, createdAt: { gte: today, lte: todayEnd } }, orderBy: { createdAt: "desc" } }),
      prisma.campaignExecution.findMany({ where: { userId, createdAt: { gte: today, lte: todayEnd } }, orderBy: { createdAt: "desc" } }),
      prisma.task.findMany({ where: { userId, createdAt: { gte: today, lte: todayEnd } }, orderBy: { createdAt: "desc" } }),
      prisma.alert.findMany({ where: { userId, createdAt: { gte: today, lte: todayEnd } }, orderBy: { createdAt: "desc" } }),
      prisma.brand.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
    ])

    const totalMetrics = { spend: 0, revenue: 0, roas: 0, profit: 0, count: 0 }
    for (const a of todaysAnalyses) {
      if (!a.metrics) continue
      try {
        const p = JSON.parse(a.metrics)
        totalMetrics.spend += p.spend || 0
        totalMetrics.revenue += p.revenue || 0
        totalMetrics.roas += p.roas || 0
        totalMetrics.profit += p.profit || 0
        totalMetrics.count++
      } catch {}
    }
    if (totalMetrics.count > 0) totalMetrics.roas /= totalMetrics.count

    const activeBrands = brands.filter(b => b.status === "active").length
    const totalCampaignsAll = await prisma.campaignExecution.count({ where: { userId } })
    const totalUploadsAll = await prisma.upload.count({ where: { userId } })

    return NextResponse.json({
      date: today.toISOString(),
      summary: {
        uploadsToday: todaysUploads.length,
        analysesToday: todaysAnalyses.length,
        campaignsToday: todaysCampaigns.length,
        assignmentsToday: todaysAssignments.length,
        alertsToday: todaysAlerts.length,
        spendToday: totalMetrics.spend,
        revenueToday: totalMetrics.revenue,
        roasToday: +totalMetrics.roas.toFixed(2),
        profitToday: totalMetrics.profit,
      },
      allTime: {
        totalBrands: brands.length,
        activeBrands,
        totalCampaigns: totalCampaignsAll,
        totalUploads: totalUploadsAll,
      },
      todaysUploads: todaysUploads.map(u => ({
        id: u.id, fileName: u.fileName, platform: u.platform, status: u.status, createdAt: u.createdAt,
        brandId: u.brandId, campaignName: u.campaignName,
      })),
      todaysAnalyses: todaysAnalyses.map(a => ({
        id: a.id, title: a.title, level: a.level, createdAt: a.createdAt, brandId: a.brandId,
      })),
      todaysCampaigns: todaysCampaigns.map(c => ({
        id: c.id, name: c.name, platform: c.platform, status: c.status, goal: c.goal, createdAt: c.createdAt, brandId: c.brandId,
      })),
      alerts: todaysAlerts.map(a => ({
        id: a.id, type: a.type, message: a.message, severity: a.severity, createdAt: a.createdAt,
      })),
    })
  } catch (error) {
    console.error("Daily report error:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
