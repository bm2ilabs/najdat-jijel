import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ExportTransportCsvButton } from "./export-csv-button";
import { TransportList } from "./transport-list";

export const metadata: Metadata = { title: "النقل", robots: { index: false } };

export default async function AdminTransportPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("transport_offers")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">عروض النقل</h1>
          <p className="text-sm text-muted-foreground">السائقون والمركبات المتاحة لنقل المساعدات.</p>
        </div>
        <ExportTransportCsvButton rows={rows} />
      </div>

      <TransportList rows={rows} />
    </div>
  );
}
