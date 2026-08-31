import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getAllCategories, getAllReliefHubs } from "@/lib/data/admin";
import { EmptyState } from "@/components/shared/empty-state";
import { RecordTransactionDialog } from "./record-transaction-dialog";
import { ExportInventoryCsvButton } from "./export-csv-button";
import { InventoryList } from "./inventory-list";

export const metadata: Metadata = { title: "المخزون", robots: { index: false } };

export default async function AdminInventoryPage() {
  const supabase = await createClient();
  const [{ data: items }, hubs, categories] = await Promise.all([
    supabase
      .from("inventory_items")
      .select("*, categories(slug, name_ar), relief_hubs(name)")
      .order("updated_at", { ascending: false }),
    getAllReliefHubs(),
    getAllCategories(),
  ]);

  const rows = (items ?? []).slice().sort((a, b) => {
    const hubCmp = (a.relief_hubs?.name ?? "").localeCompare(b.relief_hubs?.name ?? "", "ar");
    if (hubCmp !== 0) return hubCmp;
    return (a.categories?.name_ar ?? "").localeCompare(b.categories?.name_ar ?? "", "ar");
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">المخزون</h1>
          <p className="text-sm text-muted-foreground">
            كل تغيير في الكمية يُسجَّل كحركة، ويولّد احتياجًا تلقائيًا عند النزول تحت الحد الأدنى.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportInventoryCsvButton rows={rows} />
          <RecordTransactionDialog hubs={hubs} categories={categories} />
        </div>
      </div>

      {hubs.length === 0 ? (
        <EmptyState title="لا توجد مراكز استقبال بعد" description="أضف مركز استقبال أولًا من قسم مراكز الاستقبال." />
      ) : (
        <InventoryList rows={rows} hubs={hubs} />
      )}
    </div>
  );
}
