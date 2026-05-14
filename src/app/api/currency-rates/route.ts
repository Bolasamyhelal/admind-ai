import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0]

    // Try fetching from DB first
    let cached = await prisma.exchangeRate.findUnique({ where: { date: today } })

    if (!cached) {
      // Fetch from free jsdelivr currency API (no key needed, very reliable)
      const res = await fetch("https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/egp.json", {
        next: { revalidate: 21600 },
      })
      const data = await res.json()
      const rates = data?.egp || {}

      // rates.AED = how many AED for 1 EGP → invert to get EGP per AED
      const aedRate = rates.aed || 0.12
      const sarRate = rates.sar || 0.13
      const egpPerAed = aedRate > 0 ? 1 / aedRate : 8.5
      const egpPerSar = sarRate > 0 ? 1 / sarRate : 8.0

      cached = await prisma.exchangeRate.create({
        data: { date: today, aedToEgp: parseFloat(egpPerAed.toFixed(4)), sarToEgp: parseFloat(egpPerSar.toFixed(4)) },
      })
    }

    // Get last 30 days for chart
    const history = await prisma.exchangeRate.findMany({
      orderBy: { date: "asc" },
      take: 30,
    })

    return NextResponse.json({ today: cached, history })
  } catch (error) {
    console.error("Currency rates error:", error)
    return NextResponse.json({ error: "Failed to fetch rates" }, { status: 500 })
  }
}
