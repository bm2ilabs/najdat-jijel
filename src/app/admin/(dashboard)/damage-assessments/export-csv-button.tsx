"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { damageAssessmentStatusLabels } from "@/lib/constants";
import { buildCsv, downloadCsv, type CsvColumn } from "@/lib/csv";
import type { Database } from "@/types/database";

type Assessment = Database["public"]["Tables"]["damage_assessments"]["Row"];

const columns: CsvColumn<Assessment>[] = [
  { header: "الاسم الكامل", value: (r) => r.full_name },
  { header: "الهاتف", value: (r) => r.phone },
  { header: "الحالة", value: (r) => damageAssessmentStatusLabels[r.status] },
  { header: "الولاية", value: (r) => r.wilaya },
  { header: "البلدية", value: (r) => r.commune },
  { header: "تقدير الدهان (لتر)", value: (r) => r.estimated_paint_liters ?? "" },
  { header: "التخصصات المطلوبة", value: (r) => r.required_specialties.join("؛ ") },
  { header: "تاريخ التسجيل", value: (r) => new Date(r.created_at).toLocaleString("ar-DZ") },
];

export function ExportDamageAssessmentsCsvButton({ rows }: { rows: Assessment[] }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => downloadCsv(buildCsv(rows, columns), "damage-assessments")}
      disabled={rows.length === 0}
    >
      <Download className="size-4" /> تصدير CSV
    </Button>
  );
}
