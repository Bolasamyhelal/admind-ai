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

export function parseGoogleReport(buffer: ArrayBuffer, fileName: string): GoogleRow[] {
  if (fileName.endsWith(".csv")) {
    const text = new TextDecoder().decode(buffer)
    const parsed = Papa.parse<any>(text, { header: true })
    return parsed.data.map(mapGoogleRow)
  }

  const workbook = XLSX.read(buffer, { type: "array" })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const jsonData = XLSX.utils.sheet_to_json<any>(sheet)
  return jsonData.map(mapGoogleRow)
}

function mapGoogleRow(row: any): GoogleRow {
  return {
    campaignName: row.Campaign || row.campaign || row.CampaignName || "",
    adGroupName: row["Ad group"] || row.AdGroup || row.ad_group || "",
    spend: parseFloat(row.Cost || row.cost || row.Spend || 0),
    impressions: parseInt(row.Impressions || row.impressions || 0),
    clicks: parseInt(row.Clicks || row.clicks || 0),
    conversions: parseInt(row.Conversions || row.conversions || 0),
    revenue: parseFloat(row.Revenue || row.revenue || row.ConversionValue || 0),
    ctr: parseFloat(row.CTR || row.ctr || 0),
    avgCpc: parseFloat(row.AvgCPC || row.avg_cpc || row.CPC || 0),
    qualityScore: parseInt(row.QualityScore || row.quality_score || 0),
    conversionRate: parseFloat(row.ConversionRate || row.conversion_rate || 0),
  }
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
