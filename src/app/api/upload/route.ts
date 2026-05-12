import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { parseMetaReport, aggregateMetaData } from "@/lib/parsers/meta-parser"
import { parseTikTokReport, aggregateTikTokData } from "@/lib/parsers/tiktok-parser"
import { parseGoogleReport, aggregateGoogleData } from "@/lib/parsers/google-parser"
import { parseSnapchatReport, aggregateSnapchatData } from "@/lib/parsers/snapchat-parser"
import { buildAnalysisFromMetrics, createSmartAlerts } from "@/lib/analysis"

function entityKey(row: any, level: string, platform: string): string {
  if (level === "campaign") return row.campaignName || "Unknown"
  if (level === "adset") {
    if (platform === "tiktok" || platform === "google") return row.adGroupName || "Unknown"
    if (platform === "snapchat") return row.adSquadName || "Unknown"
    return row.adSetName || row.adGroupName || "Unknown"
  }
  if (level === "ad") {
    if (platform === "google" || platform === "snapchat") return row.adGroupName || row.adSquadName || "Unknown"
    const c = row.campaignName || ""
    const n = row.adName || "Unknown"
    return c ? `${c} > ${n}` : n
  }
  return "Unknown"
}

function aggregateRows(rows: any[]) {
  const total = { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 }
  for (const r of rows) {
    total.spend += r.spend || 0
    total.impressions += r.impressions || 0
    total.clicks += r.clicks || 0
    total.conversions += r.conversions || 0
    total.revenue += r.revenue || 0
  }
  return {
    spend: total.spend,
    revenue: total.revenue,
    roas: total.spend > 0 ? total.revenue / total.spend : 0,
    cpa: total.conversions > 0 ? total.spend / total.conversions : 0,
    ctr: total.impressions > 0 ? (total.clicks / total.impressions) * 100 : 0,
    cpm: total.impressions > 0 ? (total.spend / total.impressions) * 1000 : 0,
    cpc: total.clicks > 0 ? total.spend / total.clicks : 0,
    conversionRate: total.clicks > 0 ? (total.conversions / total.clicks) * 100 : 0,
    frequency: 0,
    impressions: total.impressions,
    clicks: total.clicks,
    conversions: total.conversions,
    profit: total.revenue - total.spend,
  }
}

async function createLevelAnalysis(rows: any[], level: string, platform: string, currency: string, userId: string, uploadId: string, brandId: string | null, fileName: string) {
  if (!rows.length) return null
  const groups: Record<string, any[]> = {}
  for (const row of rows) {
    const key = entityKey(row, level, platform)
    if (!groups[key]) groups[key] = []
    groups[key].push(row)
  }
  const total = { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 }
  const breakdown: Record<string, any> = {}
  for (const [key, entityRows] of Object.entries(groups)) {
    const em = aggregateRows(entityRows)
    breakdown[key] = { ...em, rowCount: entityRows.length }
    total.spend += em.spend; total.impressions += em.impressions
    total.clicks += em.clicks; total.conversions += em.conversions; total.revenue += em.revenue
  }
  const metrics = {
    spend: total.spend, revenue: total.revenue,
    roas: total.spend > 0 ? total.revenue / total.spend : 0,
    cpa: total.conversions > 0 ? total.spend / total.conversions : 0,
    ctr: total.impressions > 0 ? (total.clicks / total.impressions) * 100 : 0,
    cpm: total.impressions > 0 ? (total.spend / total.impressions) * 1000 : 0,
    cpc: total.clicks > 0 ? total.spend / total.clicks : 0,
    conversionRate: total.clicks > 0 ? (total.conversions / total.clicks) * 100 : 0,
    frequency: 0, impressions: total.impressions, clicks: total.clicks,
    conversions: total.conversions, profit: total.revenue - total.spend,
  }
  const result = buildAnalysisFromMetrics(metrics, platform, currency)
  const labels: Record<string, string> = { campaign: "الحملات", adset: "المجموعات الإعلانية", ad: "الإعلانات" }
  return prisma.analysis.create({
    data: {
      title: `تحليل ${labels[level] || level} - ${new Date().toLocaleDateString("ar-EG")}`,
      summary: result.summary, insights: JSON.stringify(result.insights),
      recommendations: JSON.stringify(result.recommendations), metrics: JSON.stringify(metrics),
      predictions: JSON.stringify(result.predictions), marketData: JSON.stringify(result.marketInfo),
      level, status: "completed", userId, uploadId, brandId,
      rawData: JSON.stringify({ fileName, platform, level, entityCount: Object.keys(groups).length, breakdown }),
    },
  })
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const platform = formData.get("platform") as string
    const clientName = (formData.get("clientName") as string) || ""
    const campaignName = (formData.get("campaignName") as string) || ""
    const userId = formData.get("userId") as string
    const niche = (formData.get("niche") as string) || ""
    const country = (formData.get("country") as string) || ""
    const currency = (formData.get("currency") as string) || "USD"
    const brandId = (formData.get("brandId") as string) || null

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    let rows: any[] = []
    let parsedMetrics: any = null

    try {
      if (platform === "meta") {
        rows = parseMetaReport(buffer)
        if (rows.length > 0) parsedMetrics = aggregateMetaData(rows)
      } else if (platform === "tiktok") {
        rows = parseTikTokReport(buffer, file.name)
        if (rows.length > 0) parsedMetrics = aggregateTikTokData(rows)
      } else if (platform === "google") {
        rows = parseGoogleReport(buffer, file.name)
        if (rows.length > 0) parsedMetrics = aggregateGoogleData(rows)
      } else if (platform === "snapchat") {
        rows = parseSnapchatReport(buffer, file.name)
        if (rows.length > 0) parsedMetrics = aggregateSnapchatData(rows)
      }
    } catch (parseErr) {
      console.error("Parse error:", parseErr)
    }

    const upload = await prisma.upload.create({
      data: {
        fileName: file.name, fileSize: file.size,
        fileType: file.name.split(".").pop() || "unknown",
        platform, clientName, campaignName,
        status: rows.length > 0 ? "processing" : "completed",
        userId, brandId, niche, country,
      },
    })

    const analyses: any[] = []

    if (rows.length > 0 && parsedMetrics) {
      // Create 3 levels of analysis
      const campaignAnalysis = await createLevelAnalysis(rows, "campaign", platform, currency, userId, upload.id, brandId, file.name)
      if (campaignAnalysis) analyses.push(campaignAnalysis)

      const adsetAnalysis = await createLevelAnalysis(rows, "adset", platform, currency, userId, upload.id, brandId, file.name)
      if (adsetAnalysis) analyses.push(adsetAnalysis)

      const adAnalysis = await createLevelAnalysis(rows, "ad", platform, currency, userId, upload.id, brandId, file.name)
      if (adAnalysis) analyses.push(adAnalysis)

      await prisma.upload.update({
        where: { id: upload.id },
        data: { status: "completed" },
      })

      await createSmartAlerts(userId, buildAnalysisFromMetrics(parsedMetrics, platform, currency))
    }

    return NextResponse.json({
      success: true,
      uploadId: upload.id,
      analyses: analyses.map(a => ({ id: a.id, level: a.level, title: a.title })),
      parsedMetrics,
      message: analyses.length > 0 ? `تم إنشاء ${analyses.length} تحليل` : "File uploaded (no parseable data)",
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

    const uploads = await prisma.upload.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { analyses: { orderBy: { createdAt: "asc" } } },
    })

    return NextResponse.json({ uploads })
  } catch (error) {
    console.error("Fetch uploads error:", error)
    return NextResponse.json({ error: "Failed to fetch uploads" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) return NextResponse.json({ error: "Upload ID required" }, { status: 400 })

    await prisma.analysis.deleteMany({ where: { uploadId: id } })
    await prisma.upload.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete upload error:", error)
    return NextResponse.json({ error: "Failed to delete upload" }, { status: 500 })
  }
}
