import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    const id = searchParams.get("id")

    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

    if (id) {
      const report = await prisma.report.findFirst({ where: { id, userId } })
      if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 })
      return NextResponse.json({ report: JSON.parse(report.data || "{}") })
    }

    const reports = await prisma.report.findMany({
      where: { userId, type: "daily" },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, createdAt: true },
    })

    return NextResponse.json({
      reports: reports.map(r => ({
        id: r.id,
        title: r.title,
        date: r.createdAt.toISOString().split("T")[0],
        createdAt: r.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error("Daily report fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const body = await req.json()
    const userId = searchParams.get("userId") || body.userId

    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })
    if (!body.title || !body.entries || !body.report) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if a report for this date already exists
    const existing = await prisma.report.findFirst({
      where: { userId, type: "daily", title: body.title },
    })

    const data = JSON.stringify({ entries: body.entries, formattedReport: body.report, date: body.date })

    if (existing) {
      await prisma.report.update({ where: { id: existing.id }, data: { data } })
    } else {
      await prisma.report.create({
        data: {
          title: body.title,
          type: "daily",
          data,
          format: "html",
          userId,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Daily report save error:", error)
    return NextResponse.json({ error: "Failed to save report" }, { status: 500 })
  }
}
