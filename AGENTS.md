# Agent Memory - AdMind AI

## Project Overview
Next.js 16.2.6 (App Router) + React 19 + Tailwind CSS v4 + Prisma/SQLite + Progress
Meta Ads parser, dashboard, brand management, AI analysis (OpenAI GPT-4).

## Key Completed Features
- Meta Ads file upload + parsing (XLSX/CSV)
- Dashboard with real KPI cards (spend, revenue, roas, cpa, ctr, cpm, cpc, frequency, profit)
- Performance Overview chart with real monthly data (grouped by analysis date)
- Brand management: create, view detail, delete brands (cascade deletes uploads + analyses)
- Upload management: delete uploads/analyses from brand detail + upload history pages
- Currency selector during upload (USD/EGP/SAR/AED/EUR/GBP) stored in analysis marketData
- Dynamic currency display via formatCurrency() throughout dashboard + brand detail
- Metric explanation popups (click any KPI card → shows description, formula, high/low analysis)
- Arabic recommendations panel (hardcoded 6 recommendations in Arabic)
- Server-generated smart alerts (CPA high, ROAS low, frequency high, CTR low)
- Arabic RTL interface with dark/light mode
- Custom auth (email/password, scrypt, session cookies)

## Deferred / Not Yet Done
- Non-Meta parsers (TikTok, Google, Snapchat) exist but NOT wired up in upload API
- Recommendations panel uses hardcoded data (server generates dynamic ones but UI ignores them)
- MetricsTable and PredictionsPanel use mock/hardcoded data
- Reports page shows empty/skeleton state (no real data or export)
- Settings page has cosmetic-only language toggle
- No form validation library (Zod)
- OverviewChart mock data was replaced with real data

## Production Roadmap (Saved For Later)
### Hosting
- GitHub → Vercel (free tier, ~100+ users)
- Custom domain (Namecheap/GoDaddy, ~200-400 EGP/year)
- SSL: free from Vercel

### Database
- Currently: SQLite (`file:./dev.db`)
- Production: PostgreSQL (Neon/Supabase - free tier available)
- Run `npx prisma db push` after switching

### Payments (Egypt)
- **Paymob** (recommended for Egypt) - accepts Visa/Mastercard/Mobile Wallets/Fawry
- **Alternatives**: Kashier, PayTabs, Fawry
- Setup: business account → API keys → add to website
- Activation: 3-5 business days with company documents

### Authentication Enhancement
- Clerk (already in package.json, needs env vars setup)
- Or NextAuth for OAuth (Google, Facebook) + better session management

### File Storage
- Currently: in-memory buffer (lost on server restart)
- Production: AWS S3 or Cloudinary R2

### Subscription/Billing System
1. Add `Plan` and `Subscription` models to Prisma schema
2. Create Pricing page with tiered plans
3. Stripe (global) or Paymob (Egypt) API endpoints
4. Middleware to check subscription status
5. Webhooks for payment events

### Future Enhancements (User Wants)
- Unique features not in other tools
- Multi-platform parser wiring (TikTok, Google, Snapchat)
- Live recommendations from server data
- Metric explanations on click (DONE)
- Delete reports with data reset (DONE)

## Key Files
- `src/lib/parsers/meta-parser.ts` - Meta Ads parser (column matching)
- `src/components/upload/file-uploader.tsx` - Upload form with currency selector
- `src/app/api/upload/route.ts` - Upload API (parse + store)
- `src/app/api/analyze/route.ts` - Analysis API (generate insights/recommendations)
- `src/app/api/brands/route.ts` - Brands CRUD (GET + DELETE)
- `src/app/api/dashboard/route.ts` - Dashboard aggregation API (returns monthlyData)
- `src/app/dashboard/page.tsx` - Dashboard with KPI cards + OverviewChart
- `src/app/dashboard/brands/[id]/page.tsx` - Brand detail (metrics + uploads + analyses)
- `src/components/dashboard/kpi-card.tsx` - Clickable KPI card → MetricDetail modal
- `src/components/ui/metric-detail.tsx` - Professional metric explanation modal
- `src/components/ui/metric-popover.tsx` - (old) metric popover, replaced by metric-detail
- `src/lib/metric-explanations.ts` - All metric descriptions, formulas, high/low
- `src/components/analysis/recommendations.tsx` - Arabic recommendations (hardcoded)
- `src/lib/utils.ts` - `formatCurrency()`, `cn()`, helpers
- `prisma/schema.prisma` - Database schema

## Currency Flow
1. Upload form: user selects currency (default USD)
2. Upload API: passes currency in response
3. Analyze API: stores in `marketData.currency`
4. Dashboard API: reads from latest analysis's marketData
5. UI: `formatCurrency(value, currency)` everywhere
