import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { currentMetrics, budgetIncrease } = await req.json()

    const { spend, revenue, roas, cpa, frequency, impressions, clicks, conversions } = currentMetrics

    const diminishingReturns = 1 - Math.pow(budgetIncrease / 100, 0.7) * 0.3
    const newSpend = spend * (1 + budgetIncrease / 100)
    const frequencyImpact = frequency * (1 + budgetIncrease / 150)
    const saturationFactor = Math.max(0.5, 1 - (budgetIncrease / 100) * 0.15)

    const predictedRoas = roas * saturationFactor * diminishingReturns
    const predictedRevenue = newSpend * predictedRoas
    const predictedCpa = cpa / (saturationFactor * diminishingReturns)
    const predictedConversions = Math.round(newSpend / predictedCpa)
    const predictedImpressions = Math.round(newSpend / (currentMetrics.cpm / 1000) * saturationFactor)
    const predictedClicks = Math.round(predictedImpressions * (currentMetrics.ctr / 100))

    const saturationPoint = Math.round(
      (1 - 2.0 / roas) * 100 / 0.15
    )

    return NextResponse.json({
      predictions: {
        budgetIncrease,
        spend: Math.round(newSpend),
        revenue: Math.round(predictedRevenue),
        roas: Number(predictedRoas.toFixed(2)),
        cpa: Number(predictedCpa.toFixed(2)),
        frequency: Number(frequencyImpact.toFixed(1)),
        impressions: predictedImpressions,
        clicks: predictedClicks,
        conversions: predictedConversions,
        saturationPoint: Math.min(100, Math.max(0, saturationPoint)),
      },
      insights: {
        efficiency: predictedRoas > 2 ? "healthy" : predictedRoas > 1 ? "moderate" : "poor",
        recommendation: predictedRoas > 2
          ? `Scaling up to ${budgetIncrease}% is viable with predicted ROAS of ${predictedRoas.toFixed(2)}x`
          : `Scaling to ${budgetIncrease}% may not be efficient. Consider optimizing before increasing budget.`,
        saturationWarning: saturationPoint <= budgetIncrease
          ? "WARNING: Approaching saturation point. Further scaling may significantly reduce efficiency."
          : "Within safe scaling range.",
      },
    })
  } catch (error) {
    console.error("Prediction error:", error)
    return NextResponse.json({ error: "Prediction failed" }, { status: 500 })
  }
}
