import * as XLSX from "xlsx"
import Papa from "papaparse"

export interface GoogleRow {
  campaignName: string
  adGroupName: string
  spend: number
  impressions: number
  clicks: number
  conversions: number
  revenue: number
  ctr: number
  avgCpc: number
  qualityScore: number
  conversionRate: number
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

const TARGETS: Record<string, string[]> = {
  campaignName: ["campaign", "campaignname", "campaign_name", "campaign name", "اسم الحملة", "الحملة"],
  adGroupName: ["adgroup", "ad group", "adgroupname", "ad group name", "ad_group_name", "اسم المجموعة", "المجموعة الإعلانية"],
  spend: ["cost", "spend", "amountspent", "amount spent", "المصاريف", "الإنفاق", "صرف", "التكلفة"],
  impressions: ["impressions", "ظهور", "مرات الظهور", "impression"],
  clicks: ["clicks", "النقرات", "نقرات", "click"],
  conversions: ["conversions", "results", "تحويلات", "التحويلات", "conversion"],
  revenue: ["revenue", "conversionvalue", "conversion value", "الإيرادات", "إيرادات"],
  ctr: ["ctr", "clickthroughrate", "click through rate"],
  avgCpc: ["avgcpc", "cpc", "avg cpc", "average cpc", "averagecpc"],
  qualityScore: ["qualityscore", "quality score", "qs"],
  conversionRate: ["conversionrate", "conversion rate", "convrate"],
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

export function parseGoogleReport(buffer: ArrayBuffer | Buffer, fileName: string): GoogleRow[] {
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
    spend: cleanNum(get(row, "spend")),
    impressions: cleanNum(get(row, "impressions")),
    clicks: cleanNum(get(row, "clicks")),
    conversions: cleanNum(get(row, "conversions")),
    revenue: cleanNum(get(row, "revenue")),
    ctr: cleanNum(get(row, "ctr")),
    avgCpc: cleanNum(get(row, "avgCpc")),
    qualityScore: cleanNum(get(row, "qualityScore")),
    conversionRate: cleanNum(get(row, "conversionRate")),
  }))
}

export function aggregateGoogleData(rows: GoogleRow[]) {
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
