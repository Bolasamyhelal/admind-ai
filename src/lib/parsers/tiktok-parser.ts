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

export function parseTikTokReport(buffer: ArrayBuffer, fileName: string): TikTokRow[] {
  if (fileName.endsWith(".csv")) {
    const text = new TextDecoder().decode(buffer)
    const parsed = Papa.parse<any>(text, { header: true })
    return parsed.data.map(mapTikTokRow)
  }

  const workbook = XLSX.read(buffer, { type: "array" })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const jsonData = XLSX.utils.sheet_to_json<any>(sheet)
  return jsonData.map(mapTikTokRow)
}

function mapTikTokRow(row: any): TikTokRow {
  return {
    campaignName: row.CampaignName || row.Campaign || row.campaign_name || "",
    adGroupName: row.AdGroupName || row["Ad Group"] || row.adgroup_name || "",
    adName: row.AdName || row.Ad || row.ad_name || "",
    spend: parseFloat(row.Spend || row.spend || row.Cost || 0),
    impressions: parseInt(row.Impressions || row.impressions || row.Showtimes || 0),
    clicks: parseInt(row.Clicks || row.clicks || 0),
    conversions: parseInt(row.Conversions || row.conversions || 0),
    revenue: parseFloat(row.Revenue || row.revenue || 0),
    cpm: parseFloat(row.CPM || row.cpm || 0),
    cpc: parseFloat(row.CPC || row.cpc || 0),
    ctr: parseFloat(row.CTR || row.ctr || 0),
  }
}
