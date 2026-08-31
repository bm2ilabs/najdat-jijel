"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  fieldVolunteerStatusLabels,
  fieldVolunteerSkillLabels,
  fieldVolunteerMobilityLabels,
  fieldVolunteerAvailabilityLabels,
} from "@/lib/constants";
import { buildCsv, downloadCsv, type CsvColumn } from "@/lib/csv";
import type { Database } from "@/types/database";

type Volunteer = Database["public"]["Tables"]["field_volunteers"]["Row"];

const columns: CsvColumn<Volunteer>[] = [
  { header: "الاسم الكامل", value: (r) => r.full_name },
  { header: "الهاتف", value: (r) => r.phone ?? "" },
  { header: "الولاية", value: (r) => r.wilaya_code },
  { header: "البلدية", value: (r) => r.commune_id },
  {
    header: "المهارات والمجالات",
    value: (r) =>
      (r.skills ?? [])
        .map((s) => fieldVolunteerSkillLabels[s]?.ar || s)
        .join(" | "),
  },
  {
    header: "وسيلة التنقل",
    value: (r) => fieldVolunteerMobilityLabels[r.mobility]?.ar || r.mobility,
  },
  {
    header: "الجاهزية",
    value: (r) =>
      fieldVolunteerAvailabilityLabels[r.availability]?.ar || r.availability,
  },
  {
    header: "جهة الطوارئ",
    value: (r) => r.emergency_contact || "",
  },
  { header: "الحالة", value: (r) => fieldVolunteerStatusLabels[r.status] || r.status },
  { header: "ملاحظات", value: (r) => r.notes || "" },
];

export function ExportVolunteersCsvButton({ rows }: { rows: Volunteer[] }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => downloadCsv(buildCsv(rows, columns), "field-volunteers")}
      disabled={rows.length === 0}
    >
      <Download className="size-4" /> تصدير CSV
    </Button>
  );
}
