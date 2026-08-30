import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { BeneficiariesTable } from "./beneficiaries-table";

export const metadata: Metadata = { title: "الأسر المتضررة والطلبات", robots: { index: false } };

export default async function AdminBeneficiariesPage() {
  let rows: any[] = [];

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    if (supabaseUrl && !supabaseUrl.includes("your-project-ref")) {
      const supabase = await createClient();
      const { data } = await supabase
        .from("beneficiary_requests")
        .select("*")
        .order("created_at", { ascending: false });
      rows = data ?? [];
    }
  } catch {
    // Keep demo rows
  }

  if (rows.length === 0) {
    rows = [
      {
        id: "req-1",
        campaign_id: "demo",
        full_name: "عائلة بوعلام بوزيد",
        phone: "0550112233",
        wilaya: "جيجل",
        commune: "زيامة المنصورية",
        address_note: "حي 50 مسكن، قرب المستوصف",
        family_members_count: 6,
        children_count: 3,
        needed_categories: ["food_baskets", "blankets_mattresses", "water"],
        priority: "critical",
        status: "pending",
        verification_level: "unverified",
        is_housing_habitable: false,
        has_injuries: false,
        needs_medical: true,
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "req-2",
        campaign_id: "demo",
        full_name: "عائلة سليم قادري",
        phone: "0661445566",
        wilaya: "جيجل",
        commune: "الشقفة",
        address_note: "قرية أولاد عيسى",
        family_members_count: 4,
        children_count: 2,
        needed_categories: ["baby_supplies", "food_baskets"],
        priority: "high",
        status: "under_review",
        verification_level: "pending",
        is_housing_habitable: true,
        has_injuries: true,
        needs_medical: true,
        created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "req-3",
        campaign_id: "demo",
        full_name: "عائلة رابح مجاهد",
        phone: "0770778899",
        wilaya: "جيجل",
        commune: "العنصر",
        address_note: "المدخل الغربي للبلدية",
        family_members_count: 5,
        children_count: 1,
        needed_categories: ["blankets_mattresses", "water"],
        priority: "medium",
        status: "helped",
        verification_level: "verified",
        is_housing_habitable: true,
        has_injuries: false,
        needs_medical: false,
        created_at: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">سجل الأسر المتضررة والطلبات</h1>
        <p className="text-xs text-muted">
          بيانات حساسة — لا تُعرض للعامة إطلاقًا، وتظهر هنا فقط للمشرفين وفرق التنسيق الميداني المعتمدة لمعالجة وتوجيه المساعدات.
        </p>
      </div>

      <BeneficiariesTable initialRequests={rows} />
    </div>
  );
}
