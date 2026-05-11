export const PLATFORMS = [
  { id: "meta", label: "Meta Ads", icon: "facebook", color: "#1877F2" },
  { id: "tiktok", label: "TikTok Ads", icon: "music", color: "#000000" },
  { id: "google", label: "Google Ads", icon: "search", color: "#4285F4" },
  { id: "snapchat", label: "Snapchat Ads", icon: "ghost", color: "#FFFC00" },
] as const

export const METRICS_CONFIG = {
  spend: { label: "Spend", format: "currency", icon: "DollarSign" },
  revenue: { label: "Revenue", format: "currency", icon: "TrendingUp" },
  roas: { label: "ROAS", format: "roas", icon: "Target" },
  cpa: { label: "CPA", format: "currency", icon: "CreditCard" },
  ctr: { label: "CTR", format: "percentage", icon: "MousePointerClick" },
  cpm: { label: "CPM", format: "currency", icon: "Eye" },
  cpc: { label: "CPC", format: "currency", icon: "MousePointer2" },
  conversionRate: { label: "Conversion Rate", format: "percentage", icon: "Percent" },
  frequency: { label: "Frequency", format: "number", icon: "Repeat" },
  profit: { label: "Profit", format: "currency", icon: "Wallet" },
  impressions: { label: "Impressions", format: "number", icon: "Eye" },
  clicks: { label: "Clicks", format: "number", icon: "MousePointer2" },
  conversions: { label: "Conversions", format: "number", icon: "CheckCheck" },
} as const

export const MARKET_BENCHMARKS = {
  saudi: { avgCpm: 15, avgCpc: 0.8, avgCtr: 1.5, avgCpa: 25, avgRoas: 3.5 },
  egypt: { avgCpm: 3, avgCpc: 0.15, avgCtr: 2.5, avgCpa: 5, avgRoas: 5 },
  uae: { avgCpm: 18, avgCpc: 1, avgCtr: 1.2, avgCpa: 30, avgRoas: 3 },
  usa: { avgCpm: 25, avgCpc: 1.5, avgCtr: 0.9, avgCpa: 50, avgRoas: 2.5 },
  europe: { avgCpm: 20, avgCpc: 1.2, avgCtr: 1, avgCpa: 40, avgRoas: 2.8 },
  other: { avgCpm: 10, avgCpc: 0.5, avgCtr: 1.8, avgCpa: 15, avgRoas: 4 },
} as const

export const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Upload", href: "/dashboard/upload", icon: "Upload" },
  { label: "Reports", href: "/dashboard/reports", icon: "FileBarChart" },
  { label: "Settings", href: "/dashboard/settings", icon: "Settings" },
] as const

export const COLORS = {
  primary: "#7C3AED",
  primaryLight: "#A78BFA",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
} as const
