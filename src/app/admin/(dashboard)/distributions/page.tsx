import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getAllCategories, getAllReliefHubs } from "@/lib/data/admin";
import { CreateDistributionDialog } from "./create-distribution-dialog";
import { ExportDistributionsCsvButton } from "./export-csv-button";
import { DistributionsList } from "./distributions-list";

export const metadata: Metadata = { title: "عمليات التوزيع", robots: { index: false } };

export default async function AdminDistributionsPage() {
  const supabase = await createClient();
  const [{ data }, hubs, categories] = await Promise.all([
    supabase
      .from("distributions")
      .select("*, categories(slug, name_ar), relief_hubs(name)")
      .order("distribution_date", { ascending: false }),
    getAllReliefHubs(),
    getAllCategories(),
  ]);

  const rows = data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">عمليات التوزيع</h1>
          <p className="text-sm text-muted-foreground">كل توزيع يخصم تلقائيًا من مخزون المركز.</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportDistributionsCsvButton rows={rows} />
          <CreateDistributionDialog hubs={hubs} categories={categories} />
        </div>
      </div>

      <DistributionsList rows={rows} hubs={hubs} />
    </div>
  );
}
