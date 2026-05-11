import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { title, type, data, userId, clientId, analysisId } = await req.json()

    const report = await prisma.report.create({
      data: { title, type, data, userId, clientId, analysisId },
    })

    return NextResponse.json({ success: true, report })
  } catch (error) {
    console.error("Create report error:", error)
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    const reports = await prisma.report.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    })

    return NextResponse.json({ reports })
  } catch (error) {
    console.error("Fetch reports error:", error)
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
  }
}
