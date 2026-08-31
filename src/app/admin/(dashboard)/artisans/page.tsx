import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ExportArtisansCsvButton } from "./export-csv-button";
import { ArtisansList } from "./artisans-list";

export const metadata: Metadata = { title: "الحرفيون المتطوعون", robots: { index: false } };

const statusOrder = { pending: 0, verified: 1, rejected: 2 };

export default async function AdminArtisansPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("artisan_volunteers")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = (data ?? []).slice().sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  const pendingCount = rows.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">الحرفيون المتطوعون</h1>
          <p className="text-sm text-muted-foreground">
            {pendingCount === 0
              ? "لا يوجد حرفيون بانتظار التحقق حاليًا."
              : `${pendingCount} حرفيًا بانتظار المراجعة والتحقق.`}
          </p>
        </div>
        <ExportArtisansCsvButton rows={rows} />
      </div>

      <ArtisansList rows={rows} />
    </div>
  );
}
