"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { medicalVerificationStatusLabels } from "@/lib/constants";
import { buildCsv, downloadCsv, type CsvColumn } from "@/lib/csv";
import type { Database } from "@/types/database";

type Volunteer = Database["public"]["Tables"]["medical_volunteers"]["Row"];

const columns: CsvColumn<Volunteer>[] = [
  { header: "الاسم الكامل", value: (r) => r.full_name },
  { header: "التخصص", value: (r) => r.specialty },
  { header: "الحالة", value: (r) => medicalVerificationStatusLabels[r.status] },
  { header: "الولاية", value: (r) => r.wilaya_code },
  { header: "البلدية", value: (r) => r.commune_id },
  { header: "الهاتف", value: (r) => r.phone ?? "" },
  { header: "رقم الرخصة", value: (r) => r.license_number ?? "" },
];

export function ExportMedicalCsvButton({ rows }: { rows: Volunteer[] }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => downloadCsv(buildCsv(rows, columns), "medical-volunteers")}
      disabled={rows.length === 0}
    >
      <Download className="size-4" /> تصدير CSV
    </Button>
  );
}
