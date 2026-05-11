export interface MarketDetectionResult {
  market: string
  currency: string
  language: string
  confidence: number
  reasons: string[]
}

export function detectMarket(data: {
  currency?: string
  cpm: number
  cpc: number
  language?: string
  namingConvention?: string
  timezone?: string
  campaignNames?: string[]
}): MarketDetectionResult {
  const reasons: string[] = []
  let score = 0
  let market = "Other"
  let currency = "USD"
  let language = "English"

  const currencyMap: Record<string, { market: string; currency: string; language: string }> = {
    SAR: { market: "Saudi Arabia", currency: "SAR", language: "Arabic" },
    AED: { market: "UAE", currency: "AED", language: "Arabic" },
    EGP: { market: "Egypt", currency: "EGP", language: "Arabic" },
    USD: { market: "USA", currency: "USD", language: "English" },
    EUR: { market: "Europe", currency: "EUR", language: "Multi" },
    GBP: { market: "UK", currency: "GBP", language: "English" },
  }

  if (data.currency && currencyMap[data.currency.toUpperCase()]) {
    const detected = currencyMap[data.currency.toUpperCase()]
    market = detected.market
    currency = detected.currency
    language = detected.language
    score += 40
    reasons.push(`Currency detected: ${data.currency}`)
  }

  if (data.cpm > 15 && data.cpm < 30) {
    score += 20
    reasons.push(`CPM of $${data.cpm} indicates developed market`)
    if (market === "Other") {
      market = "USA / Europe"
      currency = "USD"
    }
  } else if (data.cpm > 5 && data.cpm <= 15) {
    score += 15
    reasons.push(`CPM of $${data.cpm} indicates MENA market`)
    if (market === "Other") {
      market = "MENA Region"
      currency = "SAR"
    }
  } else if (data.cpm <= 5) {
    score += 15
    reasons.push(`CPM of $${data.cpm} indicates low-cost market like Egypt`)
    if (market === "Other") {
      market = "Egypt"
      currency = "EGP"
    }
  }

  if (data.cpc > 1) {
    score += 10
    reasons.push(`CPC of $${data.cpc} suggests competitive market`)
  } else if (data.cpc > 0.3) {
    score += 5
    reasons.push(`CPC of $${data.cpc} suggests moderate competition`)
  }

  if (data.timezone?.includes("AST") || data.timezone?.includes("Riyadh") || data.timezone?.includes("+03")) {
    score += 15
    reasons.push("Timezone indicates Saudi/Gulf region")
    if (market === "Other" || market === "MENA Region") {
      market = "Saudi Arabia"
      currency = "SAR"
    }
  } else if (data.timezone?.includes("EST") || data.timezone?.includes("PST")) {
    score += 10
    reasons.push("Timezone indicates US market")
    market = "USA"
    currency = "USD"
  } else if (data.timezone?.includes("CET") || data.timezone?.includes("GMT")) {
    score += 10
    reasons.push("Timezone indicates European market")
    market = "Europe"
    currency = "EUR"
  }

  if (data.campaignNames) {
    const arabicPattern = /[\u0600-\u06FF]/
    const hasArabic = data.campaignNames.some((name) => arabicPattern.test(name))
    if (hasArabic) {
      score += 20
      reasons.push("Campaign names contain Arabic characters")
      language = "Arabic / English"
      if (market === "Other" || market === "USA / Europe") {
        market = "MENA Region"
        currency = "SAR"
      }
    }
  }

  const confidence = Math.min(100, score)

  if (market === "MENA Region") {
    if (data.cpm > 12) {
      market = "Saudi Arabia"
      currency = "SAR"
    } else if (data.cpm > 3) {
      market = "UAE"
      currency = "AED"
    } else {
      market = "Egypt"
      currency = "EGP"
    }
  }

  return { market, currency, language, confidence, reasons }
}
