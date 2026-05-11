import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { parseMetaReport, aggregateMetaData } from "@/lib/parsers/meta-parser"
import { buildAnalysisFromMetrics, createSmartAlerts } from "@/lib/analysis"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const platform = formData.get("platform") as string
    const clientName = (formData.get("clientName") as string) || ""
    const campaignName = (formData.get("campaignName") as string) || ""
    const userId = formData.get("userId") as string
    const brandName = (formData.get("brandName") as string) || ""
    const niche = (formData.get("niche") as string) || ""
    const country = (formData.get("country") as string) || ""
    const currency = (formData.get("currency") as string) || "USD"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    let parsedMetrics = null
    try {
      if (platform === "meta") {
        const rows = parseMetaReport(buffer)
        if (rows.length > 0) {
          parsedMetrics = aggregateMetaData(rows)
        }
      }
    } catch (parseErr) {
      console.error("Parse error:", parseErr)
    }

    let brandId: string | null = null

    if (brandName) {
      const existing = await prisma.brand.findFirst({
        where: { name: brandName, userId },
      })
      if (existing) {
        brandId = existing.id
        await prisma.brand.update({
          where: { id: existing.id },
          data: { niche: niche || undefined, country: country || undefined },
        })
      } else {
        const brand = await prisma.brand.create({
          data: { name: brandName, niche, country, userId },
        })
        brandId = brand.id
      }
    }

    const upload = await prisma.upload.create({
      data: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.name.split(".").pop() || "unknown",
        platform,
        clientName,
        campaignName,
        status: "processing",
        userId,
        brandId,
        niche,
        country,
      },
    })

    let analysis: any = null

    if (parsedMetrics) {
      const result = buildAnalysisFromMetrics(parsedMetrics, platform, brandName, currency)

      analysis = await prisma.analysis.create({
        data: {
          title: `${brandName || "Analysis"} - ${new Date().toLocaleDateString("ar-EG")}`,
          summary: result.summary,
          insights: JSON.stringify(result.insights),
          recommendations: JSON.stringify(result.recommendations),
          metrics: JSON.stringify(result.metrics),
          predictions: JSON.stringify(result.predictions),
          marketData: JSON.stringify(result.marketInfo),
          status: "completed",
          userId,
          uploadId: upload.id,
          brandId,
          rawData: JSON.stringify({ fileName: file.name, platform }),
        },
      })

      await prisma.upload.update({
        where: { id: upload.id },
        data: { status: "completed" },
      })

      await createSmartAlerts(userId, result)
    }

    return NextResponse.json({
      success: true,
      uploadId: upload.id,
      brandId,
      analysisId: analysis?.id || null,
      parsedMetrics,
      message: "File uploaded and analyzed successfully",
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
    const brandId = searchParams.get("brandId")

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    const where: any = { userId }
    if (brandId) where.brandId = brandId

    const uploads = await prisma.upload.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { analyses: { take: 1, orderBy: { createdAt: "desc" } } },
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

    if (!id) {
      return NextResponse.json({ error: "Upload ID required" }, { status: 400 })
    }

    await prisma.analysis.deleteMany({ where: { uploadId: id } })
    await prisma.upload.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete upload error:", error)
    return NextResponse.json({ error: "Failed to delete upload" }, { status: 500 })
  }
}
