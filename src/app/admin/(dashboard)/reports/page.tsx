import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getStatDistributionsByCategory, getStatDonationsByCategory } from "@/lib/data/public";
import { ReportsView } from "./reports-view";

export const metadata: Metadata = { title: "التقارير والإحصائيات والتصدير", robots: { index: false } };

export default async function AdminReportsPage() {
  let donationsByCategory: any[] = [];
  let distributionsByCategory: any[] = [];
  let requests: any[] = [];

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    if (supabaseUrl && !supabaseUrl.includes("your-project-ref")) {
      const supabase = await createClient();
      const [donationsRes, distributionsRes, requestsRes] = await Promise.all([
        getStatDonationsByCategory(),
        getStatDistributionsByCategory(),
        supabase.from("beneficiary_requests").select("status, commune"),
      ]);
      donationsByCategory = donationsRes;
      distributionsByCategory = distributionsRes;
      requests = requestsRes.data ?? [];
    }
  } catch {
    // Keep demo data
  }

  if (donationsByCategory.length === 0) {
    donationsByCategory = [
      { slug: "food_baskets", name_ar: "طرود غذائية", total_quantity: 850, unit: "basket" },
      { slug: "water", name_ar: "مياه شرب", total_quantity: 3400, unit: "box" },
      { slug: "blankets_mattresses", name_ar: "أفرشة وأغطية", total_quantity: 420, unit: "piece" },
      { slug: "baby_supplies", name_ar: "مستلزمات أطفال", total_quantity: 190, unit: "pack" },
      { slug: "medicines_first_aid", name_ar: "أدوية ومستلزمات طبية", total_quantity: 260, unit: "piece" },
    ];

    distributionsByCategory = [
      { slug: "food_baskets", name_ar: "طرود غذائية", total_quantity: 620, unit: "basket" },
      { slug: "water", name_ar: "مياه شرب", total_quantity: 2800, unit: "box" },
      { slug: "blankets_mattresses", name_ar: "أفرشة وأغطية", total_quantity: 310, unit: "piece" },
      { slug: "baby_supplies", name_ar: "مستلزمات أطفال", total_quantity: 145, unit: "pack" },
      { slug: "medicines_first_aid", name_ar: "أدوية ومستلزمات طبية", total_quantity: 210, unit: "piece" },
    ];

    requests = [
      { status: "pending", commune: "زيامة المنصورية" },
      { status: "pending", commune: "زيامة المنصورية" },
      { status: "under_review", commune: "الشقفة" },
      { status: "helped", commune: "جيجل" },
      { status: "helped", commune: "جيجل" },
      { status: "helped", commune: "الطاهير" },
      { status: "pending", commune: "سلمى بن زيادة" },
      { status: "under_review", commune: "الميلية" },
      { status: "helped", commune: "العنصر" },
    ];
  }

  const byStatusMap = new Map<string, number>();
  const byCommuneMap = new Map<string, number>();
  const total = requests.length;

  for (const r of requests) {
    if (r.status) byStatusMap.set(r.status, (byStatusMap.get(r.status) ?? 0) + 1);
    if (r.commune) byCommuneMap.set(r.commune, (byCommuneMap.get(r.commune) ?? 0) + 1);
  }

  const requestsByStatus = Array.from(byStatusMap.entries()).map(([status, count]) => ({
    status,
    count,
  }));

  const requestsByCommune = Array.from(byCommuneMap.entries())
    .map(([commune, count]) => ({
      commune,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">التقارير والإحصائيات الميدانية</h1>
        <p className="text-xs text-muted">
          تحليل شامل لتدفقات المساعدات، نسب التوزيع الفعلي، والكثافة الجغرافية لطلبات الإغاثة لفرق التنسيق والجهات الرسمية.
        </p>
      </div>

      <ReportsView
        donationsByCategory={donationsByCategory}
        distributionsByCategory={distributionsByCategory}
        requestsByStatus={requestsByStatus}
        requestsByCommune={requestsByCommune}
        totalRequests={total}
      />
    </div>
  );
}
