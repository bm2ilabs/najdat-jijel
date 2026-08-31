import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ExportVolunteersCsvButton } from "./export-csv-button";
import { VolunteersList } from "./volunteers-list";

export const metadata: Metadata = {
  title: "المتطوعون الميدانيون",
  robots: { index: false },
};

const statusOrder = { pending: 0, verified: 1, deployed: 2, inactive: 3 };

export default async function AdminVolunteersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("field_volunteers")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = (data ?? [])
    .slice()
    .sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  const pendingCount = rows.filter((r) => r.status === "pending").length;
  const deployedCount = rows.filter((r) => r.status === "deployed").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">المتطوعون الميدانيون</h1>
          <p className="text-sm text-muted-foreground">
            {pendingCount > 0
              ? `${pendingCount} متطوعًا بانتظار المراجعة والاعتماد (${deployedCount} في الميدان حالياً).`
              : `إجمالي ${rows.length} متطوع مسجّل (${deployedCount} في الميدان حالياً).`}
          </p>
        </div>
        <ExportVolunteersCsvButton rows={rows} />
      </div>

      <VolunteersList rows={rows} />
    </div>
  );
}
