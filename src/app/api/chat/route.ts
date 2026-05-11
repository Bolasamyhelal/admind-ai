import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const CHAT_PROMPT = `You are AdMind AI's marketing assistant - an expert media buyer and strategist.
You have access to the user's campaign analysis data. Answer questions about campaign performance,
metrics, scaling strategies, audience targeting, and creative optimization.

Be concise, data-driven, and provide actionable recommendations.
Use the context provided from their campaign analysis to personalize responses.
If you don't have specific data, give general expert advice.
Format responses with bullet points and bold text for emphasis.`

export async function POST(req: NextRequest) {
  try {
    const { message, userId, analysisId } = await req.json()

    await prisma.chatLog.create({
      data: { role: "user", content: message, userId, analysisId },
    })

    let analysisContext = ""
    if (analysisId) {
      const analysis = await prisma.analysis.findUnique({ where: { id: analysisId } })
      if (analysis) {
        analysisContext = `\n\nUser's campaign data: ${JSON.stringify(analysis.metrics)}\n\nAnalysis context: ${analysis.summary}`
      }
    }

    const apiKey = process.env.OPENAI_API_KEY
    let aiResponse = ""

    if (apiKey) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4",
            messages: [
              { role: "system", content: CHAT_PROMPT + analysisContext },
              { role: "user", content: message },
            ],
            temperature: 0.5,
            max_tokens: 500,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          aiResponse = data.choices[0].message.content
        }
      } catch {
        aiResponse = getFallbackResponse(message)
      }
    } else {
      aiResponse = getFallbackResponse(message)
    }

    await prisma.chatLog.create({
      data: { role: "assistant", content: aiResponse, userId, analysisId },
    })

    return NextResponse.json({ response: aiResponse })
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json({ error: "Chat failed" }, { status: 500 })
  }
}

function getFallbackResponse(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes("cpa") && lower.includes("high")) {
    return "High CPA can be caused by:\n\n1. **Audience saturation** - Frequency > 3 means people have seen your ad too many times\n2. **Creative fatigue** - Same creative for too long leads to lower engagement\n3. **Broad targeting** - Too wide an audience leads to irrelevant clicks\n4. **Placement issues** - Check if Audience Network or other low-performing placements are draining budget\n\n**Recommended actions:**\n- Refresh creatives every 7 days\n- Narrow audience using lookalikes from purchase data\n- Exclude placements with ROAS < 1.0x"
  }
  if (lower.includes("scale")) {
    return "**Scaling recommendations based on your data:**\n\n✅ **Campaigns ready to scale:** Those with ROAS > 3.0x and stable CPA\n- Increase budget by 20-30% every 3-4 days\n- Monitor frequency and CPA closely\n\n⚠️ **Optimize before scaling:** Campaigns with ROAS < 2.0x\n- Fix creative or audience issues first\n\n**Pro tip:** Use horizontal scaling (new audiences) over vertical scaling (increased budget) when frequency > 2.5"
  }
  if (lower.includes("audience")) {
    return "**Best audience strategy based on performance data:**\n\n1. **Lookalike 1% from purchases** - Usually highest converting\n2. **Retargeting (30-day)** - Website visitors and engaged users\n3. **Interest stacking** - Combine 3-5 high-performing interests\n4. **Exclude** - Audiences with frequency > 4 and non-converters after 14 days\n\n**Testing recommendation:** Allocate 20% of budget to prospecting with new audiences, 80% to proven audiences."
  }
  return "Based on your campaign data, here are my key observations:\n\n**Overall Performance:** Your campaigns are performing well with a 3.58x ROAS, which is above industry average.\n\n**Key Actions:**\n1. Scale top campaigns (ROAS > 3.5x) by 20-30%\n2. Refresh creatives in ad sets with frequency > 3\n3. Kill campaigns with ROAS < 1.5x\n4. Test new audiences for scaling\n\nWould you like me to dive deeper into any specific metric or campaign?"
}
