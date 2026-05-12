import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const brandId = searchParams.get("brandId")

    if (!brandId) {
      return NextResponse.json({ error: "brandId is required" }, { status: 400 })
    }

    const goals = await prisma.brandGoal.findMany({
      where: { brandId },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ goals })
  } catch (error) {
    console.error("Fetch goals error:", error)
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { brandId, metricKey, metricLabel, targetValue, period, startDate, endDate } = body

    if (!brandId || !metricKey || targetValue === undefined) {
      return NextResponse.json({ error: "brandId, metricKey, targetValue are required" }, { status: 400 })
    }

    const goal = await prisma.brandGoal.create({
      data: {
        brandId,
        metricKey,
        metricLabel: metricLabel || metricKey,
        targetValue: parseFloat(targetValue),
        period: period || "monthly",
        startDate: startDate || null,
        endDate: endDate || null,
      },
    })

    return NextResponse.json({ success: true, goal })
  } catch (error) {
    console.error("Create goal error:", error)
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, targetValue, period, startDate, endDate } = body

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    const goal = await prisma.brandGoal.update({
      where: { id },
      data: {
        ...(targetValue !== undefined && { targetValue: parseFloat(targetValue) }),
        ...(period && { period }),
        ...(startDate !== undefined && { startDate }),
        ...(endDate !== undefined && { endDate }),
      },
    })

    return NextResponse.json({ success: true, goal })
  } catch (error) {
    console.error("Update goal error:", error)
    return NextResponse.json({ error: "Failed to update goal" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    await prisma.brandGoal.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete goal error:", error)
    return NextResponse.json({ error: "Failed to delete goal" }, { status: 500 })
  }
}
