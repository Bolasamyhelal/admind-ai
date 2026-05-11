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

export async function PUT(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 })

    const { id, completed, text } = await req.json()

    if (id) {
      const item = await prisma.taskChecklist.findFirst({ where: { id, userId: user.id } })
      if (!item) return NextResponse.json({ error: "غير موجود" }, { status: 404 })
      const updated = await prisma.taskChecklist.update({
        where: { id },
        data: { completed: completed !== undefined ? completed : item.completed },
      })
      return NextResponse.json({ checklist: updated })
    }

    if (text && !id) {
      const { taskId } = await req.json()
      if (!taskId) return NextResponse.json({ error: "taskId required" }, { status: 400 })
      const created = await prisma.taskChecklist.create({
        data: { text, taskId, userId: user.id },
      })
      return NextResponse.json({ checklist: created })
    }

    return NextResponse.json({ error: "id or text+taskId required" }, { status: 400 })
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

    const item = await prisma.taskChecklist.findFirst({ where: { id, userId: user.id } })
    if (!item) return NextResponse.json({ error: "غير موجود" }, { status: 404 })

    await prisma.taskChecklist.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: (error?.message || "").slice(0, 200) }, { status: 500 })
  }
}
