import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const token = req.headers.get("cookie")?.split("session=")?.[1]?.split(";")?.[0]

    if (token) {
      await prisma.session.deleteMany({ where: { token } })
    }

    const response = NextResponse.json({ success: true })
    response.cookies.set("session", "", { httpOnly: true, path: "/", maxAge: 0 })
    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
