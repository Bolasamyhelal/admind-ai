import * as XLSX from "xlsx"

export interface MetaRow {
  campaignName: string
  adSetName: string
  adName: string
  spend: number
  impressions: number
  clicks: number
  conversions: number
  revenue: number
  frequency: number
  cpm: number
  cpc: number
  ctr: number
  reach: number
  dateStart?: string
  dateEnd?: string
}

function getKeyVariants(key: string): string[] {
  const lower = key.toLowerCase().trim()
  const results: string[] = [lower]

  // Remove all spaces, dashes, underscores
  results.push(lower.replace(/[\s\-_]+/g, ""))

  // Remove parenthetical content: "Clicks (All)" -> "clicks"
  const noParen = lower.replace(/\(.*?\)/g, "").trim()
  if (noParen !== lower) {
    results.push(noParen)
    results.push(noParen.replace(/[\s\-_]+/g, ""))
  }

  // Remove non-alpha except numbers
  results.push(lower.replace(/[^a-z0-9]/g, ""))
  results.push(noParen.replace(/[^a-z0-9]/g, ""))

  // Take first word only: "amount spent" -> "amount"
  const firstWord = lower.split(/[\s\-_\(\)]+/)[0]
  if (firstWord && firstWord !== lower) results.push(firstWord)

  return [...new Set(results.filter(Boolean))]
}

const COLUMN_MAP: Record<string, string> = {}
function buildColumnMap(headers: string[]) {
  for (const header of headers) {
    const variants = getKeyVariants(header)
    for (const v of variants) {
      if (!COLUMN_MAP[v]) COLUMN_MAP[v] = header
    }
  }
}

function matchHeader(variants: string[], targetKeys: string[]): string | undefined {
  for (const v of variants) {
    for (const tk of targetKeys) {
      if (v === tk || v.startsWith(tk)) return COLUMN_MAP[v] || v
    }
  }
  const first = variants[0]
  for (const tk of targetKeys) {
    if (first.includes(tk) || tk.includes(first)) return first
  }
  return undefined
}

const TARGET_KEYS = {
  campaign: ["campaignname", "campaign", "campaign name"],
  adset: ["adsetname", "adset", "ad set name", "ad set"],
  ad: ["adname", "ad", "ad name"],
  spend: ["spend", "amountspent", "amount spent", "cost", "spent"],
  impressions: ["impressions", "impression"],
  clicks: ["clicks", "click"],
  conversions: ["conversions", "conversion", "purchase", "results", "result"],
  revenue: ["revenue", "purchasevalue", "purchase value", "sales", "sale"],
  frequency: ["frequency", "freq"],
  cpm: ["cpm"],
  cpc: ["cpc", "costperclick", "cost per click"],
  ctr: ["ctr", "clickthroughrate", "click through rate"],
  reach: ["reach", "uniqueclicks", "unique clicks"],
  datestart: ["datestart", "startdate", "date start", "start date"],
  dateend: ["dateend", "enddate", "date end", "end date"],
}

export function parseMetaReport(buffer: ArrayBuffer | Buffer): MetaRow[] {
  const workbook = XLSX.read(buffer, { type: "buffer" })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(sheet)

  if (jsonData.length === 0) return []

  const headers = Object.keys(jsonData[0])
  console.log("Raw headers:", headers.join(" | "))
  buildColumnMap(headers)

  // Print matched columns for debugging
  for (const [category, keys] of Object.entries(TARGET_KEYS)) {
    for (const h of headers) {
      const variants = getKeyVariants(h)
      const match = matchHeader(variants, keys)
      if (match) {
        console.log(`  ${category} ← "${h}" (via "${match}")`)
        break
      }
    }
  }

  const parsed = jsonData.map((row) => {
    // Build a lookup: for each original header, generate variants and try to match
    const getVal = (...variants: string[]) => {
      for (const v of variants) {
        for (const h of headers) {
          const hVariants = getKeyVariants(h)
          if (hVariants.includes(v)) {
            return row[h]
          }
        }
      }
      return undefined
    }

    const campaignName = getVal("campaignname", "campaign", "campaign name") || ""
    const adSetName = getVal("adsetname", "adset", "ad set name", "ad set") || ""
    const adName = getVal("adname", "ad", "ad name") || ""

    const spend = parseFloat(getVal("spend", "amountspent", "amount spent", "cost") || "0")
    const impressions = parseInt(getVal("impressions", "impression") || "0")
    const clicks = parseInt(getVal("clicks", "click") || "0")
    const conversions = parseInt(getVal("conversions", "conversion", "purchase", "results", "result") || "0")
    const revenue = parseFloat(getVal("revenue", "purchasevalue", "purchase value", "sales") || "0")
    const frequency = parseFloat(getVal("frequency", "freq") || "0")
    const cpm = parseFloat(getVal("cpm") || "0")
    const cpc = parseFloat(getVal("cpc", "costperclick", "cost per click") || "0")
    const ctr = parseFloat(getVal("ctr", "clickthroughrate", "click through rate") || "0")
    const reach = parseFloat(getVal("reach", "uniqueclicks", "unique clicks") || "0")

    return { campaignName, adSetName, adName, spend, impressions, clicks, conversions, revenue, frequency, cpm, cpc, ctr, reach }
  }).filter((r) => r.campaignName || r.spend > 0 || r.impressions > 0)

  console.log(`Parsed ${parsed.length} rows, total spend: ${parsed.reduce((s, r) => s + r.spend, 0)}`)
  return parsed
}

export function aggregateMetaData(rows: MetaRow[]) {
  const total = { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0, reach: 0 }
  for (const row of rows) {
    total.spend += row.spend
    total.impressions += row.impressions
    total.clicks += row.clicks
    total.conversions += row.conversions
    total.revenue += row.revenue
    total.reach += row.reach
  }
  return {
    spend: total.spend,
    revenue: total.revenue,
    roas: total.spend > 0 ? total.revenue / total.spend : 0,
    cpa: total.conversions > 0 ? total.spend / total.conversions : 0,
    ctr: total.impressions > 0 ? (total.clicks / total.impressions) * 100 : 0,
    cpm: total.impressions > 0 ? (total.spend / total.impressions) * 1000 : 0,
    cpc: total.clicks > 0 ? total.spend / total.clicks : 0,
    conversionRate: total.clicks > 0 ? (total.conversions / total.clicks) * 100 : 0,
    frequency: total.reach > 0 ? total.impressions / total.reach : 0,
    impressions: total.impressions,
    clicks: total.clicks,
    conversions: total.conversions,
    profit: total.revenue - total.spend,
  }
}
