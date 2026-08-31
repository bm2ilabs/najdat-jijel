"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { needStatusLabels, priorityLabels, unitLabels } from "@/lib/constants";
import { buildCsv, downloadCsv, type CsvColumn } from "@/lib/csv";
import type { Database } from "@/types/database";

type Need = Database["public"]["Tables"]["needs"]["Row"] & {
  categories: { slug: string; name_ar: string } | null;
};

const columns: CsvColumn<Need>[] = [
  { header: "العنوان", value: (n) => n.title ?? n.categories?.name_ar ?? "" },
  { header: "المادة", value: (n) => n.categories?.name_ar ?? "" },
  { header: "الأولوية", value: (n) => priorityLabels[n.priority] ?? n.priority },
  { header: "الحالة", value: (n) => needStatusLabels[n.status] ?? n.status },
  { header: "الولاية", value: (n) => n.wilaya },
  { header: "البلدية", value: (n) => n.commune },
  { header: "الكمية المطلوبة", value: (n) => `${n.quantity_needed} ${unitLabels[n.unit] ?? n.unit ?? ""}`.trim() },
  { header: "الكمية المتوفرة", value: (n) => `${n.quantity_available} ${unitLabels[n.unit] ?? n.unit ?? ""}`.trim() },
  { header: "تاريخ الإنشاء", value: (n) => n.created_at ? new Date(n.created_at).toLocaleString("ar-DZ") : "" },
];

export function ExportNeedsCsvButton({ rows }: { rows: Need[] }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => downloadCsv(buildCsv(rows, columns), "needs")}
      disabled={rows.length === 0}
    >
      <Download className="size-4" /> تصدير CSV
    </Button>
  );
}
