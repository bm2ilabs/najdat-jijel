"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { artisanVerificationStatusLabels } from "@/lib/constants";
import { buildCsv, downloadCsv, type CsvColumn } from "@/lib/csv";
import type { Database } from "@/types/database";

type Artisan = Database["public"]["Tables"]["artisan_volunteers"]["Row"];

const columns: CsvColumn<Artisan>[] = [
  { header: "الاسم الكامل", value: (r) => r.full_name },
  { header: "التخصص", value: (r) => r.specialty },
  { header: "الحالة", value: (r) => artisanVerificationStatusLabels[r.status] },
  { header: "الولاية", value: (r) => r.wilaya_code },
  { header: "البلدية", value: (r) => r.commune_id },
  { header: "الهاتف", value: (r) => r.phone ?? "" },
];

export function ExportArtisansCsvButton({ rows }: { rows: Artisan[] }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => downloadCsv(buildCsv(rows, columns), "artisan-volunteers")}
      disabled={rows.length === 0}
    >
      <Download className="size-4" /> تصدير CSV
    </Button>
  );
}
