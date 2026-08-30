import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getAllCategories, getAllReliefHubs } from "@/lib/data/admin";
import { CreateDistributionDialog } from "./create-distribution-dialog";
import { DistributionsTable } from "./distributions-table";

export const metadata: Metadata = { title: "سجل عمليات التوزيع والإغاثة", robots: { index: false } };

export default async function AdminDistributionsPage() {
  let rows: any[] = [];
  const hubs = await getAllReliefHubs();
  const categories = await getAllCategories();

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    if (supabaseUrl && !supabaseUrl.includes("your-project-ref")) {
      const supabase = await createClient();
      const { data } = await supabase
        .from("distributions")
        .select("*, categories(slug, name_ar), relief_hubs(name)")
        .order("distribution_date", { ascending: false });
      rows = data ?? [];
    }
  } catch {
    // Keep demo distributions
  }

  if (rows.length === 0) {
    rows = [
      {
        id: "dist-1",
        distribution_date: new Date().toISOString().slice(0, 10),
        hub_id: "hub-1",
        category_id: "cat-1",
        quantity: 120,
        unit: "basket",
        beneficiary_family_count: 120,
        responsible_name: "تنسيقية الهلال الأحمر",
        created_at: new Date().toISOString(),
        categories: { slug: "food_baskets", name_ar: "طرود غذائية" },
        relief_hubs: { name: "مركز الاستقبال والإيواء الرئيسي - بلدية جيجل" },
      },
      {
        id: "dist-2",
        distribution_date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
        hub_id: "hub-2",
        category_id: "cat-3",
        quantity: 60,
        unit: "piece",
        beneficiary_family_count: 35,
        responsible_name: "جمعية الإحسان",
        created_at: new Date().toISOString(),
        categories: { slug: "blankets_mattresses", name_ar: "أفرشة وأغطية" },
        relief_hubs: { name: "مستودع الإغاثة الميداني - بلدية الطاهير" },
      },
    ];
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">سجل عمليات التوزيع والإغاثة</h1>
        <p className="text-xs text-muted">
          توثيق عمليات التوزيع الميداني للأسر المتضررة ومراكز الإيواء. يتم خصم الكميات الموزعة تلقائيًا وبشكل فوري من مخزون مركز الاستقبال المختار.
        </p>
      </div>

      <DistributionsTable
        initialDistributions={rows as any}
        hubs={hubs}
        actionButton={<CreateDistributionDialog hubs={hubs} categories={categories} />}
      />
    </div>
  );
}
