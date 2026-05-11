import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    const brandId = searchParams.get("id")

    if (brandId) {
      const brand = await prisma.brand.findUnique({
        where: { id: brandId },
        include: {
          uploads: { orderBy: { createdAt: "desc" }, take: 20 },
          analyses: { orderBy: { createdAt: "desc" }, take: 10 },
        },
      })
      if (!brand) return NextResponse.json({ error: "Brand not found" }, { status: 404 })
      return NextResponse.json({ brand })
    }

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    const brands = await prisma.brand.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    })

    const brandsWithStats = await Promise.all(
      brands.map(async (brand) => {
        const uploads = await prisma.upload.count({ where: { brandId: brand.id } })
        const analyses = await prisma.analysis.count({ where: { brandId: brand.id } })
        return { ...brand, uploads, analyses }
      })
    )

    return NextResponse.json({ brands: brandsWithStats })
  } catch (error) {
    console.error("Brands error:", error)
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const brandId = searchParams.get("id")

    if (!brandId) {
      return NextResponse.json({ error: "Brand ID required" }, { status: 400 })
    }

    await prisma.brand.delete({ where: { id: brandId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete brand error:", error)
    return NextResponse.json({ error: "Failed to delete brand" }, { status: 500 })
  }
}
