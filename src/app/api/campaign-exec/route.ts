import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

async function getUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")?.value
  if (!token) return null
  const session = await prisma.session.findUnique({ where: { token }, include: { user: true } })
  return session?.user ?? null
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    const body = await req.json()
    if (body.type === "daily") {
      const log = await prisma.campaignDailyLog.create({
        data: {
          date: body.date, spend: body.spend || 0,
          impressions: body.impressions || 0, clicks: body.clicks || 0,
          conversions: body.conversions || 0, platform: body.platform || "",
          actions: body.actions || "", notes: body.notes || "",
          campaignId: body.campaignId, userId: user.id,
        },
      })
      return NextResponse.json({ success: true, log })
    }
    const exec = await prisma.campaignExecution.create({
      data: {
        name: body.name, clientName: body.clientName, brand: body.brand || "",
        platform: body.platform, goal: body.goal,
        currency: body.currency || "USD",
        totalBudget: parseFloat(body.totalBudget) || 0,
        dailyBudget: parseFloat(body.dailyBudget) || 0,
        startDate: body.startDate, endDate: body.endDate,
        notes: body.notes || "", userId: user.id,
      },
    })
    return NextResponse.json({ success: true, id: exec.id })
  } catch (error: any) {
    return NextResponse.json({ error: (error?.message || "").slice(0, 800) }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (id) {
      const exec = await prisma.campaignExecution.findFirst({ where: { id, userId: user.id }, include: { dailyLogs: { orderBy: { date: "asc" } } } })
      if (!exec) return NextResponse.json({ error: "غير موجود" }, { status: 404 })
      const totalSpend = exec.dailyLogs.reduce((s, l) => s + l.spend, 0)
      const totalImpressions = exec.dailyLogs.reduce((s, l) => s + l.impressions, 0)
      const totalClicks = exec.dailyLogs.reduce((s, l) => s + l.clicks, 0)
      const totalConversions = exec.dailyLogs.reduce((s, l) => s + l.conversions, 0)
      const daysRunning = Math.max(1, Math.ceil((new Date(exec.endDate).getTime() - new Date(exec.startDate).getTime()) / 86400000))
      return NextResponse.json({ ...exec, totalSpend, totalImpressions, totalClicks, totalConversions, daysRunning, budgetLeft: exec.totalBudget - totalSpend, dailyAvgSpend: totalSpend / exec.dailyLogs.length || 0 })
    }
    const list = await prisma.campaignExecution.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, include: { dailyLogs: true }, take: 50 })
    return NextResponse.json(list.map((c) => ({
      ...c, totalSpend: c.dailyLogs.reduce((s, l) => s + l.spend, 0),
      logCount: c.dailyLogs.length, dailyLogs: undefined,
    })))
  } catch (error: any) {
    return NextResponse.json({ error: (error?.message || "").slice(0, 200) }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    const body = await req.json()
    if (body.type === "daily") {
      await prisma.campaignDailyLog.updateMany({ where: { id: body.id, userId: user.id }, data: { spend: body.spend, impressions: body.impressions, clicks: body.clicks, conversions: body.conversions, actions: body.actions, notes: body.notes } })
      return NextResponse.json({ success: true })
    }
    await prisma.campaignExecution.updateMany({ where: { id: body.id, userId: user.id }, data: { status: body.status, notes: body.notes } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: (error?.message || "").slice(0, 200) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    const { id, logId } = await req.json()
    if (logId) { await prisma.campaignDailyLog.deleteMany({ where: { id: logId, userId: user.id } }); return NextResponse.json({ success: true }) }
    if (id) { await prisma.campaignExecution.deleteMany({ where: { id, userId: user.id } }); return NextResponse.json({ success: true }) }
    return NextResponse.json({ error: "المعرف مطلوب" }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: (error?.message || "").slice(0, 200) }, { status: 500 })
  }
}
