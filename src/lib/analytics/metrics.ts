export interface MetricExplanation {
  label: string
  description: string
  formula: string
  normalRange: string
  whenCritical: string
  whenExcellent: string
  howToImprove: string[]
}

export const metricExplanations: Record<string, MetricExplanation> = {
  ctr: {
    label: "Click-Through Rate",
    description: "Percentage of people who clicked on your ad after seeing it. Measures how compelling your creative and hook are.",
    formula: "(Clicks / Impressions) × 100",
    normalRange: "0.5% - 3% depending on platform and industry",
    whenCritical: "Below 0.5%: Creative is not resonating. Hook is weak or audience targeting is off.",
    whenExcellent: "Above 3%: Highly relevant creative. Strong hook matching audience intent.",
    howToImprove: [
      "Test different hooks in the first 3 seconds",
      "Use pattern interrupts and bold statements",
      "Match ad copy to audience pain points",
      "Test video vs static formats",
      "Improve audience targeting precision",
    ],
  },
  cpm: {
    label: "Cost Per Mille (Thousand Impressions)",
    description: "Cost to reach 1,000 people. Indicates market competitiveness and audience quality.",
    formula: "(Spend / Impressions) × 1000",
    normalRange: "$3 - $25 depending on market and platform",
    whenCritical: "Above $50: Extremely competitive market or very broad audience. Budget burns fast.",
    whenExcellent: "Below $10: Efficient reach. Good for awareness campaigns.",
    howToImprove: [
      "Narrow audience to reduce competition",
      "Improve relevance score",
      "Test different placements",
      "Use lookalike audiences",
      "Optimize ad schedule",
    ],
  },
  cpa: {
    label: "Cost Per Acquisition",
    description: "Cost to get one desired action (purchase, lead, sign-up). The most important efficiency metric.",
    formula: "Total Spend / Total Conversions",
    normalRange: "Varies by industry and business model",
    whenCritical: "Above $100 (for most e-commerce): Campaign is not profitable unless AOV is very high.",
    whenExcellent: "Below $20: Highly efficient acquisition. Strong funnel performance.",
    howToImprove: [
      "Improve targeting to reach higher-intent audiences",
      "Optimize landing page conversion rate",
      "Test different ad formats",
      "Implement retargeting campaigns",
      "Refine audience exclusion lists",
    ],
  },
  roas: {
    label: "Return on Ad Spend",
    description: "Revenue generated for every dollar spent on ads. The ultimate profitability metric.",
    formula: "Revenue / Ad Spend",
    normalRange: "1.5x - 5x depending on industry and margins",
    whenCritical: "Below 1.0x: Losing money on every dollar spent. Campaign needs immediate optimization.",
    whenExcellent: "Above 4x: Highly profitable. Consider scaling if frequency allows.",
    howToImprove: [
      "Focus budget on highest-ROAS campaigns",
      "Improve conversion rate optimization",
      "Increase average order value",
      "Implement upsell strategies",
      "Test higher-value audiences",
    ],
  },
  frequency: {
    label: "Ad Frequency",
    description: "Average number of times each person saw your ad. High frequency means ad fatigue.",
    formula: "Impressions / Reach",
    normalRange: "1.0 - 3.0",
    whenCritical: "Above 5.0: Severe ad fatigue. Audience is annoyed, performance will degrade rapidly.",
    whenExcellent: "Below 1.5: Fresh audience. Good opportunity for frequency capping.",
    howToImprove: [
      "Expand audience size",
      "Refresh creatives regularly",
      "Set frequency caps in ad manager",
      "Rotate ad sets with different audiences",
      "Use dynamic creative optimization",
    ],
  },
}
