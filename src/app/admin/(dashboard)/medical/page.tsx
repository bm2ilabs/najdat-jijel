import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ExportMedicalCsvButton } from "./export-csv-button";
import { MedicalList } from "./medical-list";

export const metadata: Metadata = { title: "الأطقم الطبية والبيطرية", robots: { index: false } };

const statusOrder = { pending: 0, verified: 1, rejected: 2 };

export default async function AdminMedicalPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("medical_volunteers")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = (data ?? []).slice().sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  const pendingCount = rows.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">الأطقم الطبية والبيطرية</h1>
          <p className="text-sm text-muted-foreground">
            {pendingCount === 0
              ? "لا يوجد متطوعون بانتظار التحقق حاليًا."
              : `${pendingCount} متطوعًا بانتظار المراجعة والتحقق.`}
          </p>
        </div>
        <ExportMedicalCsvButton rows={rows} />
      </div>

      <MedicalList rows={rows} />
    </div>
  );
}
