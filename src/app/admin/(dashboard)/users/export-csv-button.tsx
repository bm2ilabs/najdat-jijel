"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { roleLabels } from "@/lib/constants";
import { buildCsv, downloadCsv, type CsvColumn } from "@/lib/csv";
import type { Database } from "@/types/database";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

const columns: CsvColumn<ProfileRow>[] = [
  { header: "الاسم الكامل", value: (r) => r.full_name ?? "" },
  { header: "الهاتف", value: (r) => r.phone ?? "" },
  { header: "الدور", value: (r) => roleLabels[r.role] ?? r.role },
  { header: "الولاية", value: (r) => r.wilaya ?? "" },
  { header: "تاريخ الانضمام", value: (r) => r.created_at ? new Date(r.created_at).toLocaleString("ar-DZ") : "" },
];

export function ExportUsersCsvButton({ rows }: { rows: ProfileRow[] }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => downloadCsv(buildCsv(rows, columns), "users")}
      disabled={rows.length === 0}
    >
      <Download className="size-4" /> تصدير CSV
    </Button>
  );
}

