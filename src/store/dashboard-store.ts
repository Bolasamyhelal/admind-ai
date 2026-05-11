import { create } from "zustand"
import type { AnalysisResult, UploadFile, AlertData, CampaignMetrics } from "@/types"

interface DashboardState {
  metrics: CampaignMetrics | null
  analyses: AnalysisResult[]
  uploads: UploadFile[]
  alerts: AlertData[]
  selectedAnalysis: AnalysisResult | null
  isLoading: boolean
  error: string | null

  setMetrics: (metrics: CampaignMetrics) => void
  setAnalyses: (analyses: AnalysisResult[]) => void
  addAnalysis: (analysis: AnalysisResult) => void
  setUploads: (uploads: UploadFile[]) => void
  addUpload: (upload: UploadFile) => void
  setAlerts: (alerts: AlertData[]) => void
  addAlert: (alert: AlertData) => void
  markAlertRead: (id: string) => void
  setSelectedAnalysis: (analysis: AnalysisResult | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useDashboardStore = create<DashboardState>((set) => ({
  metrics: null,
  analyses: [],
  uploads: [],
  alerts: [],
  selectedAnalysis: null,
  isLoading: false,
  error: null,

  setMetrics: (metrics) => set({ metrics }),
  setAnalyses: (analyses) => set({ analyses }),
  addAnalysis: (analysis) => set((state) => ({ analyses: [analysis, ...state.analyses] })),
  setUploads: (uploads) => set({ uploads }),
  addUpload: (upload) => set((state) => ({ uploads: [upload, ...state.uploads] })),
  setAlerts: (alerts) => set({ alerts }),
  addAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts] })),
  markAlertRead: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, read: true } : a)),
    })),
  setSelectedAnalysis: (analysis) => set({ selectedAnalysis: analysis }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}))
