import * as XLSX from "xlsx"
import Papa from "papaparse"

export interface TikTokRow {
  campaignName: string
  adGroupName: string
  adName: string
  spend: number
  impressions: number
  clicks: number
  conversions: number
  revenue: number
  cpm: number
  cpc: number
  ctr: number
}

function toStr(v: any): string {
  if (v === null || v === undefined) return ""
  return String(v).trim()
}

function cleanNum(v: any): number {
  const s = toStr(v).replace(/,/g, "").replace(/[^0-9.\-]/g, "")
  if (!s) return 0
  const n = parseFloat(s)
  return isNaN(n) ? 0 : n
}

function getKeyVariants(key: string): string[] {
  const lower = key.toLowerCase().trim()
  const results: string[] = [lower]
  results.push(lower.replace(/[\s\-_]+/g, ""))
  const noParen = lower.replace(/\(.*?\)/g, "").trim()
  if (noParen !== lower) {
    results.push(noParen)
    results.push(noParen.replace(/[\s\-_]+/g, ""))
  }
  results.push(lower.replace(/[^a-z0-9\u0600-\u06FF]/g, ""))
  results.push(noParen.replace(/[^a-z0-9\u0600-\u06FF]/g, ""))
  const firstWord = lower.split(/[\s\-_\(\)]+/)[0]
  if (firstWord && firstWord !== lower) results.push(firstWord)
  return [...new Set(results.filter(Boolean))]
}

// TikTok target keys + Arabic equivalents
const TARGETS: Record<string, string[]> = {
  campaignName: ["campaignname", "campaign", "campaign_name", "campaign name", "اسم الحملة", "الحملة"],
  adGroupName: ["adgroupname", "adgroup", "ad group", "ad_group_name", "ad group name", "اسم المجموعة", "المجموعة الإعلانية"],
  adName: ["adname", "ad", "ad_name", "ad name", "اسم الإعلان", "الإعلان"],
  spend: ["spend", "cost", "amountspent", "amount spent", "المصاريف", "الإنفاق", "صرف", "التكلفة", "costperresult"],
  impressions: ["impressions", "showtimes", "ظهور", "مرات الظهور", "impression"],
  clicks: ["clicks", "النقرات", "نقرات", "click"],
  conversions: ["conversions", "results", "totalconversions", "total conversions", "التحويلات", "تحويلات", "result"],
  revenue: ["revenue", "purchasevalue", "totalpurchasevalue", "purchase value", "total purchase value", "الإيرادات", "إيرادات"],
  cpm: ["cpm", "cost per mille"],
  cpc: ["cpc", "cost per click"],
  ctr: ["ctr", "clickthroughrate", "click through rate"],
}

function matchHeader(headers: string[], targetKey: string): string {
  const targetVariants = TARGETS[targetKey] || []
  for (const header of headers) {
    const hVariants = getKeyVariants(header)
    for (const hv of hVariants) {
      if (targetVariants.includes(hv)) return header
    }
  }
  return ""
}

export function parseTikTokReport(buffer: ArrayBuffer | Buffer, fileName: string): TikTokRow[] {
  let rawRows: any[] = []
  if (fileName.endsWith(".csv")) {
    const text = new TextDecoder().decode(buffer)
    const parsed = Papa.parse<any>(text, { header: true })
    rawRows = parsed.data
  } else {
    const workbook = XLSX.read(buffer, { type: "array" })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    rawRows = XLSX.utils.sheet_to_json<any>(sheet)
  }
  if (rawRows.length === 0) return []

  const headers = Object.keys(rawRows[0])
  const col = (key: string) => matchHeader(headers, key)
  const get = (row: any, key: string) => {
    const c = col(key)
    return c ? row[c] : undefined
  }

  return rawRows.map((row) => ({
    campaignName: toStr(get(row, "campaignName")),
    adGroupName: toStr(get(row, "adGroupName")),
    adName: toStr(get(row, "adName")),
    spend: cleanNum(get(row, "spend")),
    impressions: cleanNum(get(row, "impressions")),
    clicks: cleanNum(get(row, "clicks")),
    conversions: cleanNum(get(row, "conversions")),
    revenue: cleanNum(get(row, "revenue")),
    cpm: cleanNum(get(row, "cpm")),
    cpc: cleanNum(get(row, "cpc")),
    ctr: cleanNum(get(row, "ctr")),
  }))
}

export function aggregateTikTokData(rows: TikTokRow[]) {
  const total = { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 }
  for (const row of rows) {
    total.spend += row.spend
    total.impressions += row.impressions
    total.clicks += row.clicks
    total.conversions += row.conversions
    total.revenue += row.revenue
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
    frequency: 0,
    impressions: total.impressions,
    clicks: total.clicks,
    conversions: total.conversions,
    profit: total.revenue - total.spend,
  }
}
