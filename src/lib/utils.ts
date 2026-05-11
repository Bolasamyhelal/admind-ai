import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatNumber(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return value.toFixed(2)
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`
}

export function formatROAS(value: number): string {
  return `${value.toFixed(2)}x`
}

export function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

export function getMetricStatus(value: number, metric: string): "critical" | "warning" | "good" | "excellent" {
  const thresholds: Record<string, { critical: number; warning: number; good: number }> = {
    ctr: { critical: 0.5, warning: 1, good: 2 },
    cpm: { critical: 50, warning: 30, good: 15 },
    cpc: { critical: 2, warning: 1.5, good: 0.8 },
    cpa: { critical: 100, warning: 50, good: 20 },
    roas: { critical: 0.5, warning: 1, good: 2 },
    frequency: { critical: 5, warning: 3, good: 1.5 },
    conversionRate: { critical: 1, warning: 2, good: 5 },
  }
  const t = thresholds[metric]
  if (!t) return "good"
  if (metric === "roas" || metric === "ctr" || metric === "conversionRate") {
    if (value >= t.good) return "excellent"
    if (value >= t.warning) return "good"
    if (value >= t.critical) return "warning"
    return "critical"
  }
  if (value <= t.good) return "excellent"
  if (value <= t.warning) return "good"
  if (value <= t.critical) return "warning"
  return "critical"
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + "..."
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
