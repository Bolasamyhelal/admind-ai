import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { askGemini } from "@/lib/ai-helper"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const brandId = searchParams.get("brandId")

    if (!brandId) {
      return NextResponse.json({ error: "brandId required" }, { status: 400 })
    }

    const [brand, analyses, uploads] = await Promise.all([
      prisma.brand.findUnique({ where: { id: brandId } }),
      prisma.analysis.findMany({
        where: { brandId, status: "completed" },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.upload.findMany({
        where: { brandId },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ])

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 })
    }

    // Aggregate metrics
    const totalMetrics = { spend: 0, revenue: 0, roas: 0, cpa: 0, ctr: 0, cpm: 0, cpc: 0, profit: 0, impressions: 0, clicks: 0, conversions: 0, conversionRate: 0, frequency: 0, count: 0 }
    for (const a of analyses) {
      if (!a.metrics) continue
      try {
        const p = JSON.parse(a.metrics)
        totalMetrics.spend += p.spend || 0
        totalMetrics.revenue += p.revenue || 0
        totalMetrics.impressions += p.impressions || 0
        totalMetrics.clicks += p.clicks || 0
        totalMetrics.conversions += p.conversions || 0
        totalMetrics.profit += p.profit || 0
        totalMetrics.roas += p.roas || 0
        totalMetrics.cpa += p.cpa || 0
        totalMetrics.ctr += p.ctr || 0
        totalMetrics.cpm += p.cpm || 0
        totalMetrics.cpc += p.cpc || 0
        totalMetrics.conversionRate += p.conversionRate || 0
        totalMetrics.frequency += p.frequency || 0
        totalMetrics.count++
      } catch {}
    }
    if (totalMetrics.count > 0) {
      totalMetrics.roas /= totalMetrics.count
      totalMetrics.cpa /= totalMetrics.count
      totalMetrics.ctr /= totalMetrics.count
      totalMetrics.cpm /= totalMetrics.count
      totalMetrics.cpc /= totalMetrics.count
      totalMetrics.conversionRate /= totalMetrics.count
      totalMetrics.frequency /= totalMetrics.count
    }

    // Generate AI assignments
    const platforms = [...new Set(uploads.map(u => u.platform))].join("، ")
    const prompt = `أنت خبير نمو رقمي (Growth Marketer) محترف. حلل بيانات البراند التالية وقدم خطة عمل تنفيذية.

اسم البراند: ${brand.name}
المجال: ${brand.niche || "غير محدد"}
الدولة: ${brand.country || "غير محدد"}
المنصات: ${platforms || "غير محدد"}
الموقع: ${brand.website || "غير محدد"}
الأهداف: ${brand.goals || "غير محدد"}
الجمهور المستهدف: ${brand.targetAudience || "غير محدد"}

المقاييس الإجمالية:
- إجمالي الإنفاق: ${totalMetrics.spend.toFixed(2)}
- إجمالي الإيرادات: ${totalMetrics.revenue.toFixed(2)}
- متوسط ROAS: ${totalMetrics.roas.toFixed(2)}x
- متوسط CPA: ${totalMetrics.cpa.toFixed(2)}
- متوسط CTR: ${totalMetrics.ctr.toFixed(2)}%
- متوسط CPM: ${totalMetrics.cpm.toFixed(2)}
- إجمالي الأرباح: ${totalMetrics.profit.toFixed(2)}
- إجمالي مرات الظهور: ${totalMetrics.impressions.toFixed(0)}
- إجمالي النقرات: ${totalMetrics.clicks.toFixed(0)}
- إجمالي التحويلات: ${totalMetrics.conversions.toFixed(0)}
- متوسط معدل التحويل: ${totalMetrics.conversionRate.toFixed(2)}%
- متوسط التكرار: ${totalMetrics.frequency.toFixed(2)}
- عدد التحليلات: ${totalMetrics.count}

المطلوب: قدم 6-8 مهام/واجبات (Assignments) محددة وقابلة للتنفيذ للبراند. كل مهمة يجب أن تكون:
1. إجراء محدد يمكن تطبيقه فوراً على الإعلانات أو الموقع أو الاستراتيجية
2. مرتبط ببيانات حقيقية من المقاييس
3. له أولوية واضحة (عاجل/مهم/احتياطي)
4. له سبب منطقي من التحليل

قدم الرد كـ JSON بالصيغة التالية (باللغة العربية فقط):
{
  "summary": "ملخص عام عن حالة البراند في جملتين",
  "assignments": [
    {
      "id": "1",
      "title": "عنوان المهمة",
      "description": "شرح المهمة بالتفصيل",
      "category": "ads | website | strategy | creative | targeting | budget",
      "priority": "urgent | important | optional",
      "reasoning": "سبب هذه المهمة بناءً على البيانات",
      "expectedImpact": "التأثير المتوقع عند تنفيذ المهمة",
      "actionSteps": ["خطوة 1", "خطوة 2", "خطوة 3"]
    }
  ]
}`

    const aiResponse = await askGemini(prompt)
    let result
    try {
      const cleaned = aiResponse.replace(/```json\s*/g, "").replace(/```\s*$/g, "").trim()
      result = JSON.parse(cleaned)
    } catch {
      // Fallback: generate rule-based assignments
      result = generateRuleBasedAssignments(totalMetrics, brand)
    }

    return NextResponse.json({
      brandId,
      brandName: brand.name,
      metrics: totalMetrics,
      summary: result.summary || "تم تحليل بيانات البراند",
      assignments: result.assignments || [],
    })
  } catch (error) {
    console.error("Brand assignments error:", error)
    return NextResponse.json({ error: "Failed to generate assignments" }, { status: 500 })
  }
}

function generateRuleBasedAssignments(m: any, brand: any) {
  const assignments: any[] = []
  const platformList = ["meta", "google", "tiktok", "snapchat"]

  if (m.roas < 1.5 && m.spend > 0) {
    assignments.push({
      id: "1", title: "تحسين ROAS — إيقاف الحملات الخاسرة",
      description: `ROAS الحالي ${m.roas.toFixed(1)}x أقل من نقطة التعادل. راجع الحملات وأوقف التي تحقق ROAS أقل من 1.`,
      category: "budget", priority: "urgent",
      reasoning: `ROAS ${m.roas.toFixed(1)}x يعني أن الحملات تخسر فلوس. يجب إيقاف النزيف فوراً.`,
      expectedImpact: "توفير الميزانية المهدرة وتوجيهها لحملات مربحة",
      actionSteps: ["أوقف الحملات ذات ROAS < 1", "حلل أسباب الخسارة", "أعد توزيع الميزانية"],
    })
  }

  if (m.roas >= 3 && m.spend > 0) {
    assignments.push({
      id: "2", title: "توسيع الحملات الناجحة",
      description: `ROAS ${m.roas.toFixed(1)}x ممتاز. الحملات مؤهلة للتوسع.`,
      category: "budget", priority: "urgent",
      reasoning: "الأداء الحالي يسمح بزيادة الميزانية دون مخاطرة كبيرة.",
      expectedImpact: "زيادة الإيرادات بنسبة 30-50%",
      actionSteps: ["زود ميزانية أفضل الحملات 30%", "راقب الأداء 3 أيام", "كرر التوسع إذا استقر الأداء"],
    })
  }

  if (m.ctr < 1 && m.impressions > 2000) {
    assignments.push({
      id: "3", title: "تحديث الإعلانات — تحسين CTR",
      description: `CTR ${m.ctr.toFixed(2)}% منخفض. الإعلانات لا تجذب الانتباه.`,
      category: "creative", priority: "urgent",
      reasoning: `${m.impressions.toFixed(0)} ظهور مع CTR ضعيف يعني ميزانية مهدرة على جمهور غير متفاعل.`,
      expectedImpact: "رفع CTR إلى 2% على الأقل",
      actionSteps: ["صمم 3 إعلانات جديدة بهوك مختلف", "اختبر Pattern Interrupts", "غير الصور والفيديوهات"],
    })
  }

  if (m.conversions > 0 && m.cpa > 100) {
    assignments.push({
      id: "4", title: "خفض تكلفة الاكتساب (CPA)",
      description: `CPA ${m.cpa.toFixed(2)} مرتفع. تحتاج تحسين مسار التحويل أو الاستهداف.`,
      category: "targeting", priority: "important",
      reasoning: `CPA مرتفع ${m.cpa.toFixed(2)} يقلل هامش الربحية.`,
      expectedImpact: "خفض CPA بنسبة 30-50%",
      actionSteps: ["حسن الصفحة المقصودة", "ضيق الاستهداف", "استخدم جماهير مخصصة"],
    })
  }

  if (m.frequency > 4 && m.impressions > 0) {
    assignments.push({
      id: "5", title: "معالجة الإرهاق الإعلاني",
      description: `Frequency ${m.frequency.toFixed(1)} مرتفع — الجمهور يشاهد الإعلان بكثرة.`,
      category: "creative", priority: "important",
      reasoning: "التكرار العالي يقلل الأداء ويزيد التكاليف.",
      expectedImpact: "تحسين CTR و CPA بنسبة 20-30%",
      actionSteps: ["جدد الكريتيف فوراً", "وسع الجمهور المستهدف", "استخدم Frequency Capping"],
    })
  }

  if (m.clicks > 200 && m.conversionRate < 1) {
    assignments.push({
      id: "6", title: "تحسين الصفحة المقصودة",
      description: `${m.clicks.toFixed(0)} نقرة لكن CVR ${m.conversionRate.toFixed(2)}% فقط. مشكلة في الصفحة.`,
      category: "website", priority: "urgent",
      reasoning: "نقرات كثيرة بدون تحويلات = مشكلة في مسار التحويل.",
      expectedImpact: "رفع CVR إلى 3% على الأقل",
      actionSteps: ["اختبر A/B للصفحة المقصودة", "بسط عملية الشراء", "أضف Social Proof"],
    })
  }

  if (assignments.length < 3) {
    assignments.push({
      id: "7", title: "مراجعة إعدادات التتبع",
      description: "تأكد من صحة تتبع التحويلات والبيكسل.",
      category: "website", priority: "important",
      reasoning: "التتبع الغير دقيق يؤدي لقرارات خاطئة.",
      expectedImpact: "بيانات دقيقة لاتخاذ قرارات صحيحة",
      actionSteps: ["اختبر البيكسل يدوياً", "راجع CAPI Events Manager", "تأكد من تطابق البيانات"],
    })
    assignments.push({
      id: "8", title: "إنشاء حملة اختبارية بجمهور جديد",
      description: "اختبر جمهوراً مختلفاً لتنويع مصادر التحويلات.",
      category: "targeting", priority: "optional",
      reasoning: "الاعتماد على جمهور واحد يحد من إمكانيات النمو.",
      expectedImpact: "اكتشاف شرائح جماهيرية جديدة مربحة",
      actionSteps: ["حدد جمهورين جديدين", "شغل حملة بميزانية صغيرة", "حلل النتائج بعد أسبوع"],
    })
  }

  const categories: Record<string, string> = {
    ads: "تحسين الإعلانات",
    website: "تحسين الموقع",
    strategy: "الاستراتيجية",
    creative: "الكريتيف والإعلانات",
    targeting: "الاستهداف",
    budget: "الميزانية والتوسع",
  }

  return {
    summary: `تم تحليل ${m.count} حملة للبراند ${brand.name}. ${m.roas >= 3 ? "الأداء العام جيد وفرص التوسع متاحة." : m.roas >= 1.5 ? "الأداء متوسط ويحتاج تحسينات مستهدفة." : "الأداء ضعيف ويحتاج تدخل عاجل."}`,
    assignments: assignments.map((a, i) => ({ ...a, id: String(i + 1) })),
  }
}
