import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { severityRank } from "@/lib/constants";
import { CreateAreaDialog } from "./create-area-dialog";
import { ExportAffectedAreasCsvButton } from "./export-csv-button";
import { AffectedAreasList } from "./affected-areas-list";

export const metadata: Metadata = { title: "المناطق المتضررة", robots: { index: false } };

export default async function AdminAffectedAreasPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("affected_areas")
    .select("*")
    .order("wilaya")
    .order("daira")
    .order("commune");

  const rows = (data ?? []).sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">المناطق المتضررة</h1>
          <p className="text-sm text-muted-foreground">
            إضافة وتحديث حالة كل منطقة وبؤرة متضررة في الميدان.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportAffectedAreasCsvButton rows={rows} />
          <CreateAreaDialog />
        </div>
      </div>

      <AffectedAreasList rows={rows} />
    </div>
  );
}
