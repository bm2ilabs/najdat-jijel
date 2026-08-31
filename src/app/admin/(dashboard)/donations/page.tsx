import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ExportDonationsCsvButton } from "./export-csv-button";
import { DonationsList } from "./donations-list";

export const metadata: Metadata = { title: "المساعدات", robots: { index: false } };

export default async function AdminDonationsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("donations")
    .select("*, donation_items(quantity, unit, categories(slug, name_ar)), collection_points(name)")
    .order("created_at", { ascending: false });

  const rows = data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">المساعدات المسجَّلة</h1>
          <p className="text-sm text-muted-foreground">ما سجّله المتبرعون من مواد، وحالة كل عملية.</p>
        </div>
        <ExportDonationsCsvButton rows={rows} />
      </div>

      <DonationsList rows={rows} />
    </div>
  );
}
