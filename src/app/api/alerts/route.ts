import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    const alerts = await prisma.alert.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json({ alerts })
  } catch (error) {
    console.error("Fetch alerts error:", error)
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { alertId, read } = await req.json()

    const alert = await prisma.alert.update({
      where: { id: alertId },
      data: { read },
    })

    return NextResponse.json({ success: true, alert })
  } catch (error) {
    console.error("Update alert error:", error)
    return NextResponse.json({ error: "Failed to update alert" }, { status: 500 })
  }
}
