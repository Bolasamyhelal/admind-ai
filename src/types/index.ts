export type Platform = "meta" | "tiktok" | "google" | "snapchat"

export type MetricStatus = "critical" | "warning" | "good" | "excellent"

export interface MetricInfo {
  label: string
  value: number
  previousValue?: number
  change?: number
  status: MetricStatus
  explanation: string
  normalRange: string
}

export interface CampaignMetrics {
  spend: number
  revenue: number
  roas: number
  cpa: number
  ctr: number
  cpm: number
  cpc: number
  conversionRate: number
  frequency: number
  impressions: number
  clicks: number
  conversions: number
  profit: number
  reach?: number
  relevanceScore?: number
  qualityScore?: number
}

export interface AdSetData {
  name: string
  campaignName: string
  spend: number
  revenue: number
  impressions: number
  clicks: number
  conversions: number
  ctr: number
  cpm: number
  cpc: number
  cpa: number
  roas: number
  frequency: number
  reach: number
}

export interface Insight {
  type: "positive" | "negative" | "info" | "warning"
  metric: string
  message: string
  recommendation: string
  severity: MetricStatus
}

export interface Recommendation {
  type: "scaling" | "kill" | "duplicate" | "optimize" | "test" | "pause"
  title: string
  description: string
  priority: "high" | "medium" | "low"
  impact: string
  action: string
}

export interface Prediction {
  metric: string
  currentValue: number
  predictedValue: number
  confidence: number
  trend: "up" | "down" | "stable"
  message: string
}

export interface MarketInfo {
  market: string
  currency: string
  language: string
  confidence: number
  benchmarks: MarketBenchmarks
}

export interface MarketBenchmarks {
  avgCpm: number
  avgCpc: number
  avgCtr: number
  avgCpa: number
  avgRoas: number
}

export interface AnalysisResult {
  id: string
  title: string
  summary: string
  metrics: CampaignMetrics
  insights: Insight[]
  recommendations: Recommendation[]
  predictions: Prediction[]
  marketInfo: MarketInfo
  topAdSets: AdSetData[]
  worstAdSets: AdSetData[]
  platform: Platform
  createdAt: string
}

export interface UploadFile {
  id: string
  fileName: string
  fileSize: number
  fileType: string
  platform: Platform
  clientName: string
  campaignName: string
  status: "pending" | "processing" | "completed" | "failed"
  createdAt: string
}

export interface AlertData {
  id: string
  type: "cpa_high" | "roas_low" | "frequency_high" | "budget_burn" | "ctr_low" | "cpm_high"
  message: string
  severity: "critical" | "warning" | "info"
  read: boolean
  createdAt: string
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: string
}
