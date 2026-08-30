import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getAllCollectionPoints, getAllReliefHubs } from "@/lib/data/admin";
import { VerificationWorkbench } from "./verification-workbench";

export const metadata: Metadata = { title: "طابور التحقق والمراجعة", robots: { index: false } };

export default async function AdminVerificationPage() {
  let points: any[] = [];
  let hubs: any[] = [];
  let requests: any[] = [];

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    if (supabaseUrl && !supabaseUrl.includes("your-project-ref")) {
      const supabase = await createClient();
      const pendingLevels = ["unverified", "pending"] as const;

      const [pRes, hRes, rRes] = await Promise.all([
        supabase.from("collection_points").select("*").in("verification_level", pendingLevels).order("created_at", { ascending: false }),
        supabase.from("relief_hubs").select("*").in("verification_level", pendingLevels).order("created_at", { ascending: false }),
        supabase.from("beneficiary_requests").select("*").in("verification_level", pendingLevels).order("created_at", { ascending: false }),
      ]);
      points = pRes.data ?? [];
      hubs = hRes.data ?? [];
      requests = rRes.data ?? [];
    }
  } catch {
    // Keep demo data
  }

  if (requests.length === 0 && points.length === 0 && hubs.length === 0) {
    requests = [
      {
        id: "v-req-1",
        campaign_id: "demo",
        full_name: "عائلة كمال بن ناصر",
        phone: "0662334455",
        wilaya: "جيجل",
        commune: "زيامة المنصورية",
        address_note: "حي الساحل قرب المدرسة",
        family_members_count: 7,
        children_count: 4,
        needed_categories: ["food_baskets", "blankets_mattresses"],
        priority: "critical",
        status: "pending",
        verification_level: "unverified",
        is_housing_habitable: false,
        has_injuries: false,
        needs_medical: false,
        created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "v-req-2",
        campaign_id: "demo",
        full_name: "عائلة عبد القادر مسعودي",
        phone: "0551778899",
        wilaya: "جيجل",
        commune: "سلمى بن زيادة",
        address_note: "قرية تافرت",
        family_members_count: 5,
        children_count: 2,
        needed_categories: ["water", "medicines_first_aid"],
        priority: "high",
        status: "pending",
        verification_level: "pending",
        is_housing_habitable: true,
        has_injuries: true,
        needs_medical: true,
        created_at: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    points = [
      {
        id: "v-point-1",
        campaign_id: "demo",
        name: "نقطة تجميع باب الواد - العاصمة",
        wilaya: "الجزائر",
        commune: "باب الواد",
        address: "ساحة الساعات الثلاث",
        phone: "0550998877",
        opening_hours: "09:00 - 19:00",
        accepted_categories: ["food_baskets", "blankets_mattresses"],
        status: "open",
        verification_level: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    hubs = [
      {
        id: "v-hub-1",
        campaign_id: "demo",
        name: "مقر الكشافة الإسلامية للإيواء - العوانة",
        wilaya: "جيجل",
        commune: "العوانة",
        phone: "034556677",
        opening_hours: "24/24",
        is_shelter: true,
        status: "open",
        verification_level: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }

  const totalPending = points.length + hubs.length + requests.length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">طابور التحقق والمراجعة الميدانية</h1>
        <p className="text-xs text-muted">
          {totalPending === 0
            ? "لا توجد عناصر بانتظار التحقق حاليًا — جميع النقاط والمراكز والطلبات موثقة."
            : `يوجد ${totalPending} عنصر بانتظار مراجعة مشرفي غرفة العمليات للتوثيق الميداني.`}
        </p>
      </div>

      <VerificationWorkbench
        initialPoints={points}
        initialHubs={hubs}
        initialRequests={requests}
      />
    </div>
  );
}
