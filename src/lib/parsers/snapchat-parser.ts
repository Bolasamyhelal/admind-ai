import * as XLSX from "xlsx"
import Papa from "papaparse"

export interface SnapchatRow {
  campaignName: string
  adSquadName: string
  spend: number
  impressions: number
  clicks: number
  conversions: number
  revenue: number
  swipeUpRate: number
  cpm: number
  cpc: number
}

export function parseSnapchatReport(buffer: ArrayBuffer, fileName: string): SnapchatRow[] {
  if (fileName.endsWith(".csv")) {
    const text = new TextDecoder().decode(buffer)
    const parsed = Papa.parse<any>(text, { header: true })
    return parsed.data.map(mapSnapchatRow)
  }

  const workbook = XLSX.read(buffer, { type: "array" })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const jsonData = XLSX.utils.sheet_to_json<any>(sheet)
  return jsonData.map(mapSnapchatRow)
}

function mapSnapchatRow(row: any): SnapchatRow {
  return {
    campaignName: row.Campaign || row.campaign || row.CampaignName || "",
    adSquadName: row.AdSquad || row["Ad Squad"] || row.ad_squad || "",
    spend: parseFloat(row.Spend || row.spend || row.Cost || 0),
    impressions: parseInt(row.Impressions || row.impressions || 0),
    clicks: parseInt(row.Clicks || row.clicks || 0),
    conversions: parseInt(row.Conversions || row.conversions || 0),
    revenue: parseFloat(row.Revenue || row.revenue || 0),
    swipeUpRate: parseFloat(row.SwipeUpRate || row.swipe_up_rate || 0),
    cpm: parseFloat(row.CPM || row.cpm || 0),
    cpc: parseFloat(row.CPC || row.cpc || 0),
  }
}
