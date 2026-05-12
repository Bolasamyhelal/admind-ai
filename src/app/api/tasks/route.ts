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

export async function GET(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const date = searchParams.get("date")
    const status = searchParams.get("status")
    const brandId = searchParams.get("brandId")
    const taskType = searchParams.get("taskType")

    const where: any = { userId: user.id }
    if (date) where.date = date
    if (status) where.status = status
    if (brandId) where.brandId = brandId
    if (taskType) where.taskType = taskType

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [{ date: "asc" }, { order: "asc" }, { createdAt: "desc" }],
      include: { checklists: { orderBy: { createdAt: "asc" } }, brand: { select: { id: true, name: true } } },
    })

    return NextResponse.json({ tasks })
  } catch (error: any) {
    return NextResponse.json({ error: (error?.message || "").slice(0, 200) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 })

    const body = await req.json()
    const { title, description, priority, date, dueDate, checklists, brandId, taskType } = body

    if (!title?.trim()) {
      return NextResponse.json({ error: "عنوان المهمة مطلوب" }, { status: 400 })
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        priority: priority || "medium",
        taskType: taskType || null,
        date: date || null,
        dueDate: dueDate || null,
        brandId: brandId || null,
        userId: user.id,
        checklists: checklists?.length
          ? { create: checklists.map((c: string) => ({ text: c, userId: user.id })) }
          : undefined,
      },
      include: { checklists: true, brand: { select: { id: true, name: true } } },
    })

    return NextResponse.json({ task })
  } catch (error: any) {
    return NextResponse.json({ error: (error?.message || "").slice(0, 200) }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 })

    const body = await req.json()
    const { id, title, description, status, priority, date, dueDate, brandId, taskType } = body

    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

    const existing = await prisma.task.findFirst({ where: { id, userId: user.id } })
    if (!existing) return NextResponse.json({ error: "المهمة غير موجودة" }, { status: 404 })

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title: title.trim() } : {}),
        ...(description !== undefined ? { description: description?.trim() || null } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(priority !== undefined ? { priority } : {}),
        ...(date !== undefined ? { date: date || null } : {}),
        ...(dueDate !== undefined ? { dueDate: dueDate || null } : {}),
        ...(brandId !== undefined ? { brandId: brandId || null } : {}),
        ...(taskType !== undefined ? { taskType: taskType || null } : {}),
      },
      include: { checklists: true, brand: { select: { id: true, name: true } } },
    })

    return NextResponse.json({ task })
  } catch (error: any) {
    return NextResponse.json({ error: (error?.message || "").slice(0, 200) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

    const existing = await prisma.task.findFirst({ where: { id, userId: user.id } })
    if (!existing) return NextResponse.json({ error: "المهمة غير موجودة" }, { status: 404 })

    await prisma.taskChecklist.deleteMany({ where: { taskId: id } })
    await prisma.task.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: (error?.message || "").slice(0, 200) }, { status: 500 })
  }
}
