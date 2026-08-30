import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getAllCategories, getAllReliefHubs } from "@/lib/data/admin";
import { RecordTransactionDialog } from "./record-transaction-dialog";
import { InventoryView } from "./inventory-view";

export const metadata: Metadata = { title: "إدارة المخزون والمستودعات", robots: { index: false } };

export default async function AdminInventoryPage() {
  let rows: any[] = [];
  const hubs = await getAllReliefHubs();
  const categories = await getAllCategories();

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    if (supabaseUrl && !supabaseUrl.includes("your-project-ref")) {
      const supabase = await createClient();
      const { data: items } = await supabase
        .from("inventory_items")
        .select("*, categories(slug, name_ar), relief_hubs(name)")
        .order("updated_at", { ascending: false });
      rows = items ?? [];
    }
  } catch {
    // Keep demo items
  }

  if (rows.length === 0) {
    rows = [
      {
        id: "inv-1",
        hub_id: "hub-1",
        category_id: "cat-1",
        quantity: 350,
        unit: "basket",
        min_threshold: 500,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        categories: { slug: "food_baskets", name_ar: "طرود غذائية" },
        relief_hubs: { name: "مركز الاستقبال والإيواء الرئيسي - بلدية جيجل" },
      },
      {
        id: "inv-2",
        hub_id: "hub-1",
        category_id: "cat-2",
        quantity: 1200,
        unit: "box",
        min_threshold: 800,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        categories: { slug: "water", name_ar: "مياه شرب" },
        relief_hubs: { name: "مركز الاستقبال والإيواء الرئيسي - بلدية جيجل" },
      },
      {
        id: "inv-3",
        hub_id: "hub-2",
        category_id: "cat-3",
        quantity: 80,
        unit: "piece",
        min_threshold: 200,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        categories: { slug: "blankets_mattresses", name_ar: "أفرشة وأغطية" },
        relief_hubs: { name: "مستودع الإغاثة الميداني - بلدية الطاهير" },
      },
      {
        id: "inv-4",
        hub_id: "hub-2",
        category_id: "cat-4",
        quantity: 45,
        unit: "pack",
        min_threshold: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        categories: { slug: "baby_supplies", name_ar: "مستلزمات أطفال" },
        relief_hubs: { name: "مستودع الإغاثة الميداني - بلدية الطاهير" },
      },
    ];
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">إدارة المخزون والمستودعات</h1>
        <p className="text-xs text-muted">
          تتبع الأرصدة المتوفرة في كل مركز استقبال وإيواء. عند نزول المخزون تحت الحد الأدنى للأمان، يقوم النظام تلقائيًا بإنشاء احتياج ميداني عاجل.
        </p>
      </div>

      <InventoryView
        initialItems={rows}
        hubs={hubs}
        categories={categories}
        actionButton={<RecordTransactionDialog hubs={hubs} categories={categories} />}
      />
    </div>
  );
}
