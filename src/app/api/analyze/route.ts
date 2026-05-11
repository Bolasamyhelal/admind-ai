import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { buildAnalysisFromMetrics, createSmartAlerts } from "@/lib/analysis"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { uploadId, userId, platform, rawData, brandId, parsedMetrics, brandName, currency } = body

    const analysis = await prisma.analysis.create({
      data: {
        title: `${brandName || "Analysis"} - ${new Date().toLocaleDateString("ar-EG")}`,
        summary: "Processing...",
        status: "processing",
        userId,
        uploadId,
        brandId: brandId || null,
        rawData: JSON.stringify(rawData || {}),
      },
    })

    if (!parsedMetrics) {
      await prisma.analysis.update({
        where: { id: analysis.id },
        data: {
          summary: "تعذر قراءة الملف. تأكد من أن الملف بصيغة Excel أو CSV صحيحة ومن عمود الإنفاق (Spend/Sales).",
          status: "failed",
        },
      })
      await prisma.upload.update({
        where: { id: uploadId },
        data: { status: "failed" },
      })
      return NextResponse.json({
        success: false,
        analysis: { id: analysis.id, status: "failed" },
        error: "تعذر قراءة الملف - تأكد من الصيغة",
      })
    }

    const result = buildAnalysisFromMetrics(parsedMetrics, platform, brandName || "", currency)

    const updated = await prisma.analysis.update({
      where: { id: analysis.id },
      data: {
        summary: result.summary,
        insights: JSON.stringify(result.insights),
        recommendations: JSON.stringify(result.recommendations),
        metrics: JSON.stringify(result.metrics),
        predictions: JSON.stringify(result.predictions),
        marketData: JSON.stringify(result.marketInfo),
        status: "completed",
      },
    })

    await prisma.upload.update({
      where: { id: uploadId },
      data: { status: "completed" },
    })

    await createSmartAlerts(userId, result)

    return NextResponse.json({ success: true, analysis: updated })
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    const analysisId = searchParams.get("id")

    if (analysisId) {
      const analysis = await prisma.analysis.findUnique({ where: { id: analysisId } })
      return NextResponse.json({ analysis })
    }

    const analyses = await prisma.analysis.findMany({
      where: userId ? { userId } : {},
      orderBy: { createdAt: "desc" },
      take: 20,
    })

    return NextResponse.json({ analyses })
  } catch (error) {
    console.error("Fetch analyses error:", error)
    return NextResponse.json({ error: "Failed to fetch analyses" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Analysis ID required" }, { status: 400 })
    }

    await prisma.analysis.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete analysis error:", error)
    return NextResponse.json({ error: "Failed to delete analysis" }, { status: 500 })
  }
}
